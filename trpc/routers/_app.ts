import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { websiteRouter } from "./context";
import { agentRouter } from "./agent";
import { dashboardRouter } from "./dashboard";
import { uploadRouter } from "./upload";
import { companyRouter } from "./company";
import { orderCallRouter } from "./call";
import { socialRouter } from "./social";
import { callRouter } from "./call";

export const appRouter = createTRPCRouter({
  test: publicProcedure.query(async () => {
    return {
      status: "success",
    };
  }),
  context: websiteRouter,
  agent: agentRouter,
  dashboard: dashboardRouter,
  upload: uploadRouter,
  company: companyRouter,
  orderCall: orderCallRouter,
  social: socialRouter,
  caller: callRouter,
});

export type AppRouter = typeof appRouter;