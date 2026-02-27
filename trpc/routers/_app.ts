import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { websiteRouter } from "./context";
import { agentRouter } from "./agent";
import { dashboardRouter } from "./dashboard";
import { uploadRouter } from "./upload";
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
});

export type AppRouter = typeof appRouter;