import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { websiteRouter } from "./context";
import { agentRouter } from "./agent";
import { dashboardRouter } from "./dashboard";
import { uploadRouter } from "./upload";
import { companyRouter } from "./company";
import { orderCallRouter } from "./call";

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
});

export type AppRouter = typeof appRouter;