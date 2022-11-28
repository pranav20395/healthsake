import { z } from "zod";

export const pharmdetails = z.object({
  pharmid: z.string(),
});

export const addMedicine = z.object({
  availableMedsId: z.string(),
  price: z.number(),
  quantity: z.number(),
});

export const prescribeMedicine = z.object({
  availableMedsId: z.string(),
  frequency: z.string(),
  strength: z.string(),
  quantity: z.number(),
});

export const updateMedicine = z.object({
  price: z.number(),
  quantity: z.number(),
  id: z.string(),
});

export const addToAvailableMeds = z.object({
  image: z.string(),
  name: z.string(),
});

export const updateAvailableMeds = z.object({
  image: z.string(),
  name: z.string(),
  id: z.string(),
});

export const medicine = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  quantity: z.number(),
});

export const checkoutverify = z.object({
  medicines: z.array(medicine),
  prescriptionId: z.string(),
});

export type Medicine = z.infer<typeof medicine>;
export type PrescribeMedicine = z.infer<typeof prescribeMedicine>;
export type AddAvailMedicine = z.infer<typeof addToAvailableMeds>;
export type UpdateAvailMedicine = z.infer<typeof updateAvailableMeds>;
export type AddMedicine = z.infer<typeof addMedicine>;
export type UpdateMedicine = z.infer<typeof updateMedicine>;
