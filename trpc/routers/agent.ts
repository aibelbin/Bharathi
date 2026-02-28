import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { company, context, user, userCompanyMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { google } from '@ai-sdk/google';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { companyEmbeddings } from '@/db/schema';
import { db } from '@/db';
import { embed } from "ai";
import { socialAccounts } from "@/db/schema";

export const agentRouter = createTRPCRouter({
  // user-agent
  companyDetails: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const result = await db
        .select({
          name: company.name,
          context: context.description,
          phone: company.phone,
          isDeliverable: context.isDeliverable,
          deliveryPhone: context.deliveryPhone,
        })
        .from(company)
        .leftJoin(context, eq(company.id, context.companyId))
        .where(eq(company.id, input.id));

      if (!result || result.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        name: result[0].name,
        context: result[0].context ?? "",
        phone: result[0].phone,
        isDeliverable: result[0].isDeliverable,
        deliveryPhone: result[0].deliveryPhone,
      };
    }),
  companyName: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(company)
        .where(eq(company.id, input.id));

      if (!result || result.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return result[0].name;
    }),
  embedding: publicProcedure
    .input(
      z.object({
        content: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { embedding } = await embed({
        model: google.embeddingModel("gemini-embedding-001"),
        value: input.content,
      });
      const similarity = sql<number>`1 - (${cosineDistance(companyEmbeddings.embedding, embedding)})`;
      const relevantContent = await db
        .select({ text: companyEmbeddings.content, similarity })
        .from(companyEmbeddings)
        .where(gt(similarity, 0.6))
        .orderBy(t => desc(t.similarity))
        .limit(5);

      const context = relevantContent.map(c => c.text).join("\n\n");
      return context;
    }),

  // company-agent


  // bharathi-agent
  createCompany: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return true;
    }),

  // social accounts
  getFacebookAccessToken: publicProcedure
    .input(
      z.object({
        id: z.string().describe("The ID of the company."),
      })
    )
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(socialAccounts)
        .where(eq(socialAccounts.companyId, input.id));

      if (!result || result.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return result[0].facebookAccessToken;
    }),
  getInstagramAccessToken: publicProcedure
    .input(
      z.object({
        id: z.string().describe("The ID of the company."),
      })
    )
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(socialAccounts)
        .where(eq(socialAccounts.companyId, input.id));

      if (!result || result.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return result[0].instagramAccessToken;
    }),

  callerDetails: publicProcedure
    .input(
      z.object({
        id: z.string().describe("The ID of the caller."),
      })
    )
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(user)
        .where(eq(user.id, input.id));

      if (!result || result.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        name: result[0].name,
        phone: result[0].phone,
      };
    }),

  pushMessage: publicProcedure
    .input(
      z.object({
        userId: z.string().describe("The ID of the user."),
        companyId: z.string().describe("The ID of the company."),
        message: z.string().describe("The message to send to the company dashboard."),
      })
    )
    .mutation(async ({ input }) => {
      await db.insert(userCompanyMessages).values({
        companyId: input.companyId,
        message: input.message,
        isAgent: true,
        userId: input.userId,
      });
      return true;
    }),
});