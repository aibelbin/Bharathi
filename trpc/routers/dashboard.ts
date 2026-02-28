import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { user, callLog, userCompanyMessages, company, context } from "@/db/schema";
import { eq, desc, and, count, asc, sql } from "drizzle-orm";
import { generateText, stepCountIs } from "ai";
import { groq } from "@ai-sdk/groq";
import { withSupermemory } from "@supermemory/tools/ai-sdk";
import { userAgentPrompt } from "@/lib/prompts";

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

  getOverviewStats: protectedProcedure.query(async ({ ctx }) => {
    const companyId = ctx.auth!.user.id;

    // Total messages
    const [totalMsgResult] = await db
      .select({ count: count() })
      .from(userCompanyMessages)
      .where(eq(userCompanyMessages.companyId, companyId));

    // Agent messages
    const [agentMsgResult] = await db
      .select({ count: count() })
      .from(userCompanyMessages)
      .where(
        and(
          eq(userCompanyMessages.companyId, companyId),
          eq(userCompanyMessages.isAgent, true)
        )
      );

    // User messages
    const [userMsgResult] = await db
      .select({ count: count() })
      .from(userCompanyMessages)
      .where(
        and(
          eq(userCompanyMessages.companyId, companyId),
          eq(userCompanyMessages.isAgent, false)
        )
      );

    // Total users
    const [userCountResult] = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.companyId, companyId));

    // Company cost & tokens
    const [companyData] = await db
      .select({
        cost: company.cost,
        totalToken: company.totalToken,
      })
      .from(company)
      .where(eq(company.id, companyId))
      .limit(1);

    return {
      totalMessages: totalMsgResult?.count ?? 0,
      agentMessages: agentMsgResult?.count ?? 0,
      userMessages: userMsgResult?.count ?? 0,
      totalUsers: userCountResult?.count ?? 0,
      totalTokens: parseInt(companyData?.totalToken ?? "0", 10),
      totalCost: parseFloat(companyData?.cost ?? "0"),
    };
  }),

  getRecentUsers: protectedProcedure.query(async ({ ctx }) => {
    const companyId = ctx.auth!.user.id;

    const recentUsers = await db
      .select()
      .from(user)
      .where(eq(user.companyId, companyId))
      .orderBy(desc(user.createdAt))
      .limit(5);

    return recentUsers;
  }),

  getUserMessages: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const companyId = ctx.auth!.user.id;

      const messages = await db
        .select()
        .from(userCompanyMessages)
        .where(
          and(
            eq(userCompanyMessages.userId, input.userId),
            eq(userCompanyMessages.companyId, companyId)
          )
        )
        .orderBy(asc(userCompanyMessages.createdAt));

      return messages;
    }),

  getUserCount: protectedProcedure.query(async ({ ctx }) => {
    const companyId = ctx.auth!.user.id;

    const [result] = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.companyId, companyId));

    return { count: result?.count ?? 0 };
  }),

  deleteUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const companyId = ctx.auth!.user.id;

      // Verify the user belongs to the authenticated company
      const [targetUser] = await db
        .select()
        .from(user)
        .where(and(eq(user.id, input.userId), eq(user.companyId, companyId)))
        .limit(1);

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found or does not belong to your company.",
        });
      }

      await db
        .delete(user)
        .where(and(eq(user.id, input.userId), eq(user.companyId, companyId)));

      return { success: true };
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

  sendMessage: protectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      message: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const companyId = ctx.auth!.user.id;

      // Verify the user belongs to this company
      const [targetUser] = await db
        .select()
        .from(user)
        .where(and(eq(user.id, input.userId), eq(user.companyId, companyId)))
        .limit(1);

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found or does not belong to your company.",
        });
      }

      // Save user message
      await db.insert(userCompanyMessages).values({
        companyId,
        userId: input.userId,
        message: input.message,
        isAgent: false,
      });

      // Get company details + context for the prompt
      const companyResult = await db
        .select({
          name: company.name,
          companyContext: context.description,
        })
        .from(company)
        .leftJoin(context, eq(company.id, context.companyId))
        .where(eq(company.id, companyId))
        .limit(1);

      const companyName = companyResult[0]?.name ?? "Company";
      const companyContext = companyResult[0]?.companyContext ?? "";

      // Generate agent response (user-agent, no tools)
      const modelWithMemory = withSupermemory(
        groq("openai/gpt-oss-120b"),
        `${companyId}:${input.userId}`,
        { addMemory: "always" }
      );

      const { text } = await generateText({
        model: modelWithMemory,
        system: userAgentPrompt(companyName, companyContext),
        prompt: input.message,
        stopWhen: stepCountIs(15),
      });

      // Save agent response
      await db.insert(userCompanyMessages).values({
        companyId,
        userId: input.userId,
        message: text,
        isAgent: true,
      });

      return { response: text };
    }),
});
