import { hash } from "argon2";
import * as trpc from "@trpc/server";

import { publicProcedure, router } from "@/server/trpc";
import { orgSignUpSchema, signUpSchema } from "@/utils/validation/auth";

export const authRouter = router({
  registerUser: publicProcedure.input(signUpSchema).mutation(async (req) => {
    const { input, ctx } = req;
    const { fname, lname, email, password, otp } =
      await signUpSchema.parseAsync(input);

    const exists = await ctx.prisma.oneTimeToken.findFirst({
      where: {
        otp,
        userEmail: email,
      },
      include: {
        user: true,
      },
    });

    if (!exists) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "Invalid OTP",
      });
    }

    if (exists.expiresAt < new Date()) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "OTP expired. Try again.",
      });
    }

    // delete otp from db
    await ctx.prisma.oneTimeToken.delete({
      where: { id: exists.id },
    });

    const userexists = await ctx.prisma.user.findFirst({
      where: { email },
    });

    if (userexists) {
      throw new trpc.TRPCError({
        code: "CONFLICT",
        message: "User already exists.",
      });
    }

    const uexists = await ctx.prisma.user.findFirst({
      where: { email },
    });

    if (uexists) {
      throw new trpc.TRPCError({
        code: "CONFLICT",
        message: "User already exists.",
      });
    }

    const hashedPassword = await hash(password);

    const name = fname + " " + lname;

    try {
      const individual = await ctx.prisma.individual.create({
        data: {
          role: "USER",
        },
      });

      const result = await ctx.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          type: "INDIVIDUAL",
          indID: individual.id,
        },
      });

      return {
        status: 201,
        message: "Account created successfully",
        result: result.email,
      };
    } catch (err) {
      throw new trpc.TRPCError({
        code: "CONFLICT",
        message: "Error creating user.",
      });
    }
  }),
  registerOrg: publicProcedure.input(orgSignUpSchema).mutation(async (req) => {
    const { input, ctx } = req;
    // const {email, password, username} = await signUpSchema.parseAsync(input);
    const { name, description, email, password, otp } = input;

    const exists = await ctx.prisma.oneTimeToken.findFirst({
      where: {
        otp,
        userEmail: email,
      },
      include: {
        user: true,
      },
    });

    if (!exists) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "Invalid OTP",
      });
    }

    if (exists.expiresAt < new Date()) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "OTP expired. Try again.",
      });
    }

    // delete otp from db
    await ctx.prisma.oneTimeToken.delete({
      where: { id: exists.id },
    });

    const oexists = await ctx.prisma.user.findFirst({
      where: { email },
    });

    if (oexists) {
      throw new trpc.TRPCError({
        code: "CONFLICT",
        message: "User already exists.",
      });
    }

    const hashedPassword = await hash(password);

    const org = await ctx.prisma.organisation.create({
      data: {
        description,
      },
    });

    const result = await ctx.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        type: "ORGANISATION",
        organisation: {
          connect: {
            id: org.id,
          },
        },
      },
    });

    return {
      status: 201,
      message: "Account created successfully",
      result: result.email,
    };
  }),
  me: publicProcedure.query(async (req) => {
    const { ctx } = req;

    if (!ctx.user) {
      return null;
    }

    return ctx.user;
  }),
  verifyRealUser: publicProcedure.query(async (req) => {
    const { ctx } = req;

    if (!ctx.user) {
      return null;
    }

    return ctx.user;
  }),
});
