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