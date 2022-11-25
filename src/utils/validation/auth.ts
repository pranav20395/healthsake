import * as z from "zod";

const logSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(12),
});

export const signUpSchema = logSchema.extend({
  fname: z.string().max(20),
  lname: z.string().max(20),
  otp: z.string().min(6).max(6),
});

export const orgSignUpSchema = logSchema.extend({
  name: z.string().max(20),
  description: z.string().max(200),
  otp: z.string().min(6).max(6),
});

export const loginSchema = logSchema.extend({
  type: z.enum(["USER", "ORGANISATION"]),
});

export const otpSchema = z.object({
  email: z.string().email(),
});

export const otpFrontendVerifySchema = z.object({
  otp: z.string().min(6).max(6),
});

export const otpVerifySchemaWithLogin = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
  password: z.string().min(8).max(12),
});

export const otpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
});

export type ILogin = z.infer<typeof loginSchema>;
export type ISignUp = z.infer<typeof signUpSchema>;
export type OSignUp = z.infer<typeof orgSignUpSchema>;
export type IOtp = z.infer<typeof otpSchema>;
export type IOtpVerify = z.infer<typeof otpVerifySchema>;
export type IOtpFrontendVerify = z.infer<typeof otpFrontendVerifySchema>;
