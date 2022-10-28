import * as trpc from "@trpc/server";
import {hash} from "argon2";
import {signUpSchema} from "@/utils/validation/auth";
import {publicProcedure, router} from "@/server/trpc";

export const appRouter = router({
    signUp: publicProcedure
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

            const result = await ctx.prisma.user.create({
                data: {fname, lname, email, password: hashedPassword},
            });

            return {
                status: 201,
                message: "Account created successfully",
                result: result.email,
            };
        }),
});

// export type definition of API
export type AppRouter = typeof appRouter;