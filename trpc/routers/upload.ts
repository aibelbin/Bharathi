// server/api/routers/upload.ts

import { createTRPCRouter, publicProcedure } from "../init";
import { z } from "zod";
import { s3 } from "@/lib/s3";

export const uploadRouter = createTRPCRouter({

  getUploadUrl: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
      })
    )
    .mutation(async ({ input }: { input: { fileName: string; fileType: string } }) => {

      const key =
        crypto.randomUUID() + "-" + input.fileName;

      const result = await s3.getUploadUrl(
        key,
        input.fileType
      );

      return result;
    }),

});