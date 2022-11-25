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
