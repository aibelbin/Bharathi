import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { user, callLog } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dashboardRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const companyId = ctx.auth!.user.id;

    const users = await db
      .select()
      .from(user)
      .where(eq(user.companyId, companyId))
      .orderBy(desc(user.createdAt));

    return users;
  }),

  getCallLogs: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      const logs = await db
        .select()
        .from(callLog)
        .where(eq(callLog.userId, input.userId))
        .orderBy(desc(callLog.createdAt));

      return logs;
    }),
});
