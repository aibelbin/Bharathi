import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { websiteRouter } from "./context";
import { agentRouter } from "./agent";
import { dashboardRouter } from "./dashboard";

export const appRouter = createTRPCRouter({
  test: publicProcedure.query(async () => {
    return {
      status: "success",
    };
  }),
  context: websiteRouter,
  agent: agentRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;