import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { websiteRouter } from "./context";
export const appRouter = createTRPCRouter({
  test: publicProcedure.query(async () => {
    return {
      status: "success",
    };
  }),
  context: websiteRouter,
});

export type AppRouter = typeof appRouter;