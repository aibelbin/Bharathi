import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { company, context } from "@/db/schema";
import { eq } from "drizzle-orm";
import { google } from '@ai-sdk/google';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { companyEmbeddings } from '@/db/schema';
import { db } from '@/db';
import { embed } from "ai";

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
  createCompany: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return true;
    }),
});