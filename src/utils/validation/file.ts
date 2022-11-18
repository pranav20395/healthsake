import * as z from "zod";

export const fileGetDetailsSchema = z.object({
  filename: z.string(),
});
