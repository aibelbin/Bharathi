import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq } from "drizzle-orm";
import { company } from '@/db/schema';
import { db } from '@/db';

export const companyRouter = createTRPCRouter({
  companyDetails: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.auth?.user?.id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const result = await db
        .select()
        .from(company)
        .where(eq(company.id, userId));

      if (!result || result.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return result[0];
    }),
})