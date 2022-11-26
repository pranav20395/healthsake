import { publicProcedure, router, t } from "../trpc";
import * as trpc from "@trpc/server";
import { serialize } from "cookie";

const isAuthedUser = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  const user = await ctx.prisma.user.findUnique({
    where: {
      id: ctx.user.id,
    },
  });

  if (!user) {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "User not found/not approved",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const authedProcedure = publicProcedure.use(isAuthedUser);

export const authedUsersRouter = router({
  logout: authedProcedure.mutation(async (req) => {
    const { ctx } = req;
    ctx.res.setHeader(
      "Set-Cookie",
      serialize("token", "", { maxAge: -1, path: "/" })
    );
    return {
      redirect: "/",
    };
  }),
  basicDetails: authedProcedure.query(async (req) => {
    const { ctx } = req;

    try {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
      });

      if (!user) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.type === "ADMIN") {
        return {
          status: 200,
          message: "Admin profile",
          result: user,
        };
      }

      if (user.type === "INDIVIDUAL" && user.indID) {
        const individual = await ctx.prisma.individual.findUnique({
          where: {
            id: user.indID,
          },
        });

        const { password, ...userDetails } = user;

        return {
          status: 200,
          message: "User found",
          result: {
            ...userDetails,
            individual,
          },
        };
      }

      if (
        (user.type === "ORGANISATION" || user.type === "ORGANIZATION") &&
        user.orgId
      ) {
        const org = await ctx.prisma.organisation.findUnique({
          where: {
            id: user.orgId,
          },
        });

        if (!org) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const updatedOrg = {
          ...org,
        };

        const { password, ...userDetails } = user;

        return {
          status: 200,
          message: "User found",
          result: {
            ...userDetails,
            updatedOrg,
          },
        };
      }
    } catch (e) {
      throw new trpc.TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }
  }),
});
