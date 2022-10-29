import * as trpc from "@trpc/server";
import {hash} from "argon2";
import {orgSignUpSchema, otpSchema, otpVerifySchema, signUpSchema} from "@/utils/validation/auth";
import {publicProcedure, router} from "@/server/trpc";
import {sendEmail} from "@/utils/mailer";

export const appRouter = router({
    userSignUp: publicProcedure
        .input(signUpSchema)
        .mutation(async (req) => {
            const {input, ctx} = req;
            // const {email, password, username} = await signUpSchema.parseAsync(input);
            const {fname, lname, email, password} = input;

            const exists = await ctx.prisma.user.findFirst({
                where: {email},
            });

            if (exists) {
                throw new trpc.TRPCError({
                    code: "CONFLICT",
                    message: "User already exists.",
                });
            }

            const hashedPassword = await hash(password);

            const name = fname + " " + lname;

            const individual = await ctx.prisma.individual.create({
                data: {
                    role: "USER",
                }
            });

            const result = await ctx.prisma.user.create({
                data: {name, email, password: hashedPassword, type: "INDIVIDUAL", indID: individual.id},
            });

            return {
                status: 201,
                message: "Account created successfully",
                result: result.email,
            };
        }),
    orgSignUp: publicProcedure
        .input(orgSignUpSchema)
        .mutation(async (req) => {
            const {input, ctx} = req;
            // const {email, password, username} = await signUpSchema.parseAsync(input);
            const {name, description, email, password} = input;

            const exists = await ctx.prisma.user.findFirst({
                where: {email},
            });

            if (exists) {
                throw new trpc.TRPCError({
                    code: "CONFLICT",
                    message: "User already exists.",
                });
            }

            const hashedPassword = await hash(password);

            const org = await ctx.prisma.organisation.create({
                data: {
                    description
                }
            });

            const result = await ctx.prisma.user.create({
                data: {name, email, password: hashedPassword, type: "ORGANISATION", orgId: org.id},
            });

            return {
                status: 201,
                message: "Account created successfully",
                result: result.email,
            };
        }),
    sendOTP: publicProcedure
        .input(otpSchema)
        .mutation(async (req) => {
            const {input, ctx} = req;
            const {email} = input;

            // todo check if email exists only when logging in
            // //Check if user is registered
            // const userExists = await ctx.prisma.user.findFirst({
            //     where: {email},
            // });
            //
            // if (!userExists) {
            //     throw new trpc.TRPCError({
            //         code: "NOT_FOUND",
            //         message: "User not found.",
            //     });
            // }

            // Check if user has otp already
            const exists = await ctx.prisma.oneTimeToken.findFirst({
                where: {email},
            });

            if (!exists) {
                // Generate OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();

                // Save OTP
                await ctx.prisma.oneTimeToken.create({
                    data: {email, otp},
                });

                // Send OTP to email
                await sendEmail({email, otp});

                return {
                    status: 200,
                    message: "OTP sent successfully",
                    result: email,
                };
            }

            if (exists.expires > new Date()) {
                throw new trpc.TRPCError({
                    code: "CONFLICT",
                    message: "OTP already sent to this email.",
                });
            }

            if (exists.expires <= new Date()) {
                //delete prev OTP
                await ctx.prisma.oneTimeToken.delete({
                    where: {id: exists.id},
                });

                // Generate OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();

                // Save OTP
                await ctx.prisma.oneTimeToken.create({
                    data: {email, otp},
                });

                // Send OTP to email
                await sendEmail({email, otp});

                return {
                    status: 200,
                    message: "OTP sent successfully",
                    result: email,
                };
            }


        }),
    checkOTP: publicProcedure
        .input(otpVerifySchema)
        .mutation(async (req) => {
            const {input, ctx} = req;
            const {email, otp} = input;
            // todo schedule cron job to delete otp after 5 minutes

            const exists = await ctx.prisma.oneTimeToken.findFirst({
                where: {email, otp},
            });

            if (!exists) {
                throw new trpc.TRPCError({
                    code: "NOT_FOUND",
                    message: "Invalid OTP",
                });
            }

            if (exists.expires < new Date()) {
                throw new trpc.TRPCError({
                    code: "NOT_FOUND",
                    message: "OTP expired. Try again.",
                });
            }

            // delete otp from db
            await ctx.prisma.oneTimeToken.delete({
                where: {id: exists.id},
            });

            return {
                status: 200,
                message: "OTP verified successfully",
                result: email,
            };
        }),
});

// export type definition of API
export type AppRouter = typeof appRouter;