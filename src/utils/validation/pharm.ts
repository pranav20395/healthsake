import { z } from "zod";

export const pharmdetails = z.object({
  pharmid: z.string(),
});

export const addMedicine = z.object({
  image: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

export const updateMedicine = z.object({
  image: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  id: z.string(),
});

export type AddMedicine = z.infer<typeof addMedicine>;
export type UpdateMedicine = z.infer<typeof updateMedicine>;
