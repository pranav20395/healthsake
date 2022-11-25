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

    try {
      ctx.res.setHeader(
        "Set-Cookie",
        serialize("token", "", { maxAge: -1, path: "/" })
      );

      // return refresh page
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    } catch (e) {
      throw new trpc.TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }
  }),
});
