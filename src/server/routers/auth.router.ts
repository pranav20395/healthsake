import { hash } from "argon2";
import * as trpc from "@trpc/server";

import { publicProcedure, router } from "@/server/trpc";
import { orgOTPSignUpSchema, signUpOTPSchema } from "@/utils/validation/auth";

export const authRouter = router({
  registerUser: publicProcedure.input(signUpOTPSchema).mutation(async (req) => {
    const { input, ctx } = req;
    const { fname, lname, email, password, otp } =
      await signUpOTPSchema.parseAsync(input);

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

      const wallet = await ctx.prisma.wallet.create({
        data: {
          balance: 0,
        },
      });

      const result = await ctx.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          type: "INDIVIDUAL",
          individual: {
            connect: {
              id: individual.id,
            },
          },
          wallet: {
            connect: {
              id: wallet.id,
            },
          },
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
  registerOrg: publicProcedure
    .input(orgOTPSignUpSchema)
    .mutation(async (req) => {
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

      const wallet = await ctx.prisma.wallet.create({
        data: {
          balance: 100000,
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
          wallet: {
            connect: {
              id: wallet.id,
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
