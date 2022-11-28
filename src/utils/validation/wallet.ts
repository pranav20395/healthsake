import { z } from "zod";

export const spendWallet = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  otp: z.string().min(6, "OTP must be 6 characters long"),
  userId: z.string(),
});

export const insurebillWallet = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  otp: z.string().min(6, "OTP must be 6 characters long"),
  userId: z.string(),
  billId: z.string(),
});

export const topUpWallet = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  receipt: z.string(),
});
