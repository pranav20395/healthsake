import { publicProcedure, router } from "@/server/trpc";
import * as trpc from "@trpc/server";
import {
  deployFile,
  fileGetDetailsSchema,
  fileUploadSchema,
  verifyFile,
} from "@/utils/validation/file";
import { approvedUserProcedure } from "./user.router";
import axios from "axios";

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

  deployFile: approvedUserProcedure.input(deployFile).mutation(async (req) => {
    const { fileId } = req.input;
    const file = await req.ctx.prisma.fileStorage.findUnique({
      where: { id: fileId },
    });
    if (!file) {
      throw new Error("File not found");
    }

    const path = file.path;

    const { data } = await axios.post("/api/file/hash", { fileId, path });

    const hash = data.hex;

    const fileUpdate = await req.ctx.prisma.fileStorage.update({
      where: { id: fileId },
      data: {
        hash,
      },
    });

    if (!fileUpdate) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "File not found",
      });
    }

    return fileUpdate;
  }),

  verifyFile: approvedUserProcedure.input(verifyFile).mutation(async (req) => {
    const { url, type, ownerId, size, path, hexhash } = req.input;

    const file = await req.ctx.prisma.fileStorage.findFirst({
      where: {
        ownerId,
        path,
      },
    });

    if (!file) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "File not found",
      });
    }

    const fileId = file.id;

    const { data } = await axios.post("/api/file/hash", { fileId, path });

    const hash = data.hex;

    if (hash === file.hash) {
      return true;
    }

    return false;
  }),
});
