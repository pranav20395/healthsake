import { publicProcedure, router } from "@/server/trpc";
import * as trpc from "@trpc/server";
import {
  fileGetDetailsSchema,
  fileUploadSchema,
} from "@/utils/validation/file";
import { approvedUserProcedure } from "./user.router";

export const fileRouter = router({
  // uploadFile: approvedUserProcedure
  //   .input(fileUploadSchema)
  //   .mutation(async (req) => {}),
  getDetails: approvedUserProcedure
    .input(fileGetDetailsSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;
      const { fileId } = input;

      if (!ctx.user) {
        throw new trpc.TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const loggedInUser = await ctx.prisma.user.findFirst({
        where: {
          email: ctx.user.email,
          status: "APPROVED",
          userVerified: true,
        },
      });

      if (!loggedInUser) {
        throw new trpc.TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const file = await ctx.prisma.fileStorage.findFirst({
        where: {
          id: fileId,
          ownerId: loggedInUser.id,
        },
      });

      if (!file) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      return file;
    }),
});
