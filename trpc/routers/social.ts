import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { socialAccounts } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { redis } from "@/lib/redis";
import { instagram_getAccessToken } from "@/platform/instagram/core";
import { facebook_getAccessToken } from "@/platform/facebook/core";

export const socialRouter = createTRPCRouter({
  getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    const companyId = ctx.auth?.user?.id;
    if (!companyId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const result = await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.companyId, companyId));

    if (!result || result.length === 0) {
      return {
        facebook: false,
        instagram: false,
      };
    }

    return {
      facebook: !!result[0].facebookAccessToken,
      instagram: !!result[0].instagramAccessToken,
    };
  }),

  disconnectFacebook: protectedProcedure.mutation(async ({ ctx }) => {
    const companyId = ctx.auth?.user?.id;
    if (!companyId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    await db
      .update(socialAccounts)
      .set({ facebookAccessToken: null })
      .where(eq(socialAccounts.companyId, companyId));

    return { success: true };
  }),

  disconnectInstagram: protectedProcedure.mutation(async ({ ctx }) => {
    const companyId = ctx.auth?.user?.id;
    if (!companyId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    await db
      .update(socialAccounts)
      .set({ instagramAccessToken: null })
      .where(eq(socialAccounts.companyId, companyId));

    return { success: true };
  }),

  getFacebookAuthUrl: protectedProcedure.mutation(async ({ ctx }) => {
    const companyId = ctx.auth?.user?.id;
    if (!companyId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const { facebook_generateAuthUrl } = await import("@/platform/facebook/core");
    const authUrl = await facebook_generateAuthUrl(companyId);
    return { url: authUrl };
  }),

  getInstagramAuthUrl: protectedProcedure.mutation(async ({ ctx }) => {
    const companyId = ctx.auth?.user?.id;
    if (!companyId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const { instagram_generateAuthUrl } = await import("@/platform/instagram/core");
    const authUrl = await instagram_generateAuthUrl(companyId);
    console.log("instagram authourl", authUrl);
    return { url: authUrl };
  }),

  instagramCallback: publicProcedure
    .input(
      z.object({
        code: z.string(),
        state: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const companyId = await redis.get<string>(input.state);
      if (!companyId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const token = await instagram_getAccessToken(input.code);
      if (!token.access_token) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const existing = await db.select().from(socialAccounts).where(eq(socialAccounts.companyId, companyId));
      if (existing.length > 0) {
        await db.update(socialAccounts).set({
          instagramAccessToken: token.access_token,
        }).where(eq(socialAccounts.companyId, companyId));
      } else {
        await db.insert(socialAccounts).values({
          companyId,
          instagramAccessToken: token.access_token,
        });
      }
    }),

  facebookCallback: publicProcedure
    .input(
      z.object({
        code: z.string(),
        state: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const companyId = await redis.get<string>(input.state);
      if (!companyId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const { token, pages } = await facebook_getAccessToken(input.code);
      if (!token.access_token) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      if (pages.length) {
        const pageAccessToken = pages[0].access_token;
        const existing = await db.select().from(socialAccounts).where(eq(socialAccounts.companyId, companyId));
        if (existing.length > 0) {
          await db.update(socialAccounts).set({
            facebookAccessToken: pageAccessToken,
          }).where(eq(socialAccounts.companyId, companyId));
        } else {
          await db.insert(socialAccounts).values({
            companyId,
            facebookAccessToken: pageAccessToken,
          });
        }
      }
    }),
});
