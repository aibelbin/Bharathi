import { z } from "zod";
import twilio from "twilio";
import { protectedProcedure, createTRPCRouter } from "../init";
import { ca } from "zod/v4/locales";

const client = twilio(
 process.env.TWILIO_ACCOUNT_SID!,
 process.env.TWILIO_AUTH_TOKEN!
);

export const orderCallRouter = createTRPCRouter({

 callDelivery: protectedProcedure
  .input(
   z.object({

    isDeliverable: z.boolean(),

    deliveryPhone: z.string(),
    companyPhone: z.string(),
    customerPhone: z.string(),

    customerName: z.string(),
    price: z.number(),
    items: z.array(
     z.object({
      name: z.string(),
      quantity: z.number(),
      
     })
    ),

    address: z.string(),

   })
  )
  .mutation(async ({ input }) => {

   if (!input.isDeliverable) {
    throw new Error("Delivery not available");
   }

   const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
   if (!twilioFrom) {
    throw new Error("Twilio 'from' phone number is not configured in environment variables.");
   }

   try {
    const itemsText = input.items
      .map(i => `${i.quantity} ${i.name}`)
      .join(", ");

    const call = await client.calls.create({
      to: input.companyPhone!,
      from: twilioFrom,
      url:
        `${process.env.PUBLIC_URL}/api/twilio/received-message` +
        `?items=${encodeURIComponent(itemsText)}` +
        `&address=${encodeURIComponent(input.address)}` +
        `&customerName=${encodeURIComponent(input.customerName)}` +
        `&customerPhone=${encodeURIComponent(input.customerPhone)}` +
        `&deliveryPhone=${encodeURIComponent(input.deliveryPhone)}` +
        `&isDeliverable=${input.isDeliverable}`
    });

    return {
      success: true,
      callSid: call.sid,
    };
   } catch (error) {
    console.error("Error making call:", error);
    throw new Error("Failed to make call");
   }
  })

});
import { createTRPCRouter, publicProcedure } from "../init";
import { user } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const callRouter = createTRPCRouter({
  /**
   * Upsert a caller (user) for a given company.
   * If a user with the same phone + companyId exists, update their name.
   * Otherwise, create a new user entry.
   * Returns the user id in both cases.
   */
  registerCaller: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        phone: z.string().min(1, "Phone number is required"),
        companyId: z.string().min(1, "Company ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, phone, companyId } = input;

      // Check if a user with this phone number already exists for the company
      const existingUser = await ctx.db.query.user.findFirst({
        where: and(eq(user.phone, phone), eq(user.companyId, companyId)),
      });

      if (existingUser) {
        // Update the name
        await ctx.db
          .update(user)
          .set({ name, updatedAt: new Date() })
          .where(eq(user.id, existingUser.id));

        return { userId: existingUser.id, isNew: false };
      }

      // Create a new user entry
      const [newUser] = await ctx.db
        .insert(user)
        .values({
          name,
          phone,
          companyId,
        })
        .returning({ id: user.id });

      return { userId: newUser.id, isNew: true };
    }),
});
