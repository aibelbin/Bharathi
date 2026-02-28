import { z } from "zod";
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
