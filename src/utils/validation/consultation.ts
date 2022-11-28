import { z } from "zod";

export const requestConsultation = z.object({
  doctorId: z.string(),
  transactionId: z.string(),
});

export const requestBill = z.object({
  orgId: z.string(),
  transactionId: z.string(),
});

export const alreadyConsultated = z.object({
  doctorId: z.string(),
});

export const alreadyRequested = z.object({
  hospId: z.string(),
});

export const cancelConsultation = z.object({
  consultationId: z.string(),
});

export const cancelbill = z.object({
  billId: z.string(),
});
export const getPrescriptionLink = z.object({
  prescriptionId: z.string(),
});

export const getBillLink = z.object({
  billId: z.string(),
});

export const prescribeMedicine = z.object({
  consultationId: z.string(),
  med: z.array(
    z.object({
      availableMedsId: z.string(),
      frequency: z.string(),
      strength: z.string(),
      quantity: z.number(),
    })
  ),
});

export const issueBill = z.object({
  billRequestId: z.string(),
  transactionId: z.string(),
});
