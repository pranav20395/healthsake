import * as z from "zod";

const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const ImageSchema = z.object({
    profileImage: z
        .any()
        .refine((files) => files?.length == 1, "Image is required.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            ".jpg, .jpeg, .png and .webp files are accepted."
        ),
});

const userFileSchema = z.object({
    identity: z
        .any()
        .refine((files) => files?.length == 1, "File is required.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
            (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
            "Only .pdf files are accepted."
        ),
    address: z
        .any()
        .refine((files) => files?.length == 1, "File is required.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
            (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
            "Only .pdf files are accepted."
        ),
});

const userFileSchemaWithHealthLicense = userFileSchema.extend({
    healthLicense: z
        .any()
        .refine((files) => files?.length == 1, "Image is required.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
            (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
            "Only .pdf files are accepted."
        ),
});

export const patientVerifySchema = ImageSchema.merge(userFileSchema).extend({
    role: z.literal("PATIENT"),
})

export const healthCareVerifySchema = ImageSchema.merge(userFileSchemaWithHealthLicense).extend({
    role: z.literal("HEALTHCARE"),
});

export type PatientVerifySchema = z.infer<typeof patientVerifySchema>;
export type HealthCareVerifySchema = z.infer<typeof healthCareVerifySchema>;

export const patientSchemaForVerification = z.object({
    role: z.enum(["PATIENT", "HEALTHCARE"]),
    profileImage: z.string(),
    identity: z.string(),
    address: z.string(),
    healthLicense: z.string().optional(),
});

export type PatientSchemaForVerification = z.infer<typeof patientSchemaForVerification>;

export const approveUserSchema = z.object({
    userId: z.string(),
    userVerified: z.boolean(),
    userStatus: z.enum(["APPROVED", "REJECTED"]),
});

export type ApproveUserSchema = z.infer<typeof approveUserSchema>;

export const userDetailsSchema = z.object({
    userId: z.string(),
});

export const updateProfileSchema = z.object({
    name: z.string().optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const orgVerifySchema = z.object({
    role: z.enum(["INSURANCE", "HOSPITAL", "PHARMACY"]),
    image1: z
        .any()
        .refine((files) => files?.length == 1, "Image is required.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            ".jpg, .jpeg, .png and .webp files are accepted."
        ),
    image2: z
        .any()
        .refine((files) => files?.length == 1, "Image is required.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            ".jpg, .jpeg, .png and .webp files are accepted."
        ),
    license: z
        .any()
        .refine((files) => files?.length == 1, "File is required.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
            (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
            "Only .pdf files are accepted."
        ),
    permit: z
        .any()
        .refine((files) => files?.length == 1, "File is required.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
            (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
            "Only .pdf files are accepted."
        ),
    location: z
        .any()
        .refine((files) => files?.length == 1, "File is required.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
            (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
            "Only .pdf files are accepted."
        ),
    phone: z.string().min(10).max(10),
})

export const orgSchemaForVerification = z.object({
    role: z.enum(["INSURANCE", "HOSPITAL", "PHARMACY"]),
    image1: z.string(),
    image2: z.string(),
    license: z.string(),
    permit: z.string(),
    location: z.string(),
    phone: z.string().min(10).max(10),
});

export type OrgVerifySchema = z.infer<typeof orgVerifySchema>;