import * as z from "zod";

export const fileGetDetailsSchema = z.object({
  fileId: z.string(),
});

export const fileUploadSchema = z.object({
  name: z.string(),
  type: z.enum(["pdf", "img"]),
  size: z.number(),
  url: z.string(),
});

export const verifyFile = z.object({
  url: z.string(),
  type: z.string(),
  ownerId: z.string(),
  size: z.string(),
  path: z.string(),
  hexhash: z.string(),
});

export const deployFile = z.object({
  fileId: z.string(),
});

export const uploadFileToBlock = z.object({
  fileId: z.string(),
});
