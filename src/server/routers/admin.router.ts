import { publicProcedure, router, t } from "../trpc";
import * as trpc from "@trpc/server";
import { approveUserSchema } from "@/utils/validation/verify";
import {
  addToAvailableMeds,
  updateAvailableMeds,
} from "@/utils/validation/pharm";
import { nanoid } from "nanoid";
import { approvedUserProcedure } from "./user.router";

const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  const admin = await ctx.prisma.user.findUnique({
    where: {
      id: ctx.user.id,
    },
  });

  if (!admin || admin.type !== "ADMIN") {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

const adminProcedure = publicProcedure.use(isAdmin);

export const adminRouter = router({
  getAvailableMeds: approvedUserProcedure.query(async (req) => {
    const { ctx } = req;
    const meds = await ctx.prisma.medicinesAvailable.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return meds;
  }),

  addToAvailableMeds: adminProcedure
    .input(addToAvailableMeds)
    .mutation(async (req) => {
      const { ctx, input } = req;
      const { name, image } = await addToAvailableMeds.parseAsync(input);

      const barcode = nanoid(10);

      const med = await ctx.prisma.medicinesAvailable.create({
        data: {
          name,
          image,
          barcode,
        },
      });

      return med;
    }),

  updateAvailableMed: adminProcedure
    .input(updateAvailableMeds)
    .mutation(async (req) => {
      const { ctx, input } = req;
      const { name, image, id } = await updateAvailableMeds.parseAsync(input);

      const med = await ctx.prisma.medicinesAvailable.update({
        where: {
          id,
        },
        data: {
          name,
          image,
        },
      });

      return med;
    }),

  getLogs: adminProcedure.query(async (req) => {
    return req.ctx.prisma.log.findMany({
      orderBy: {
        timestamp: "desc",
      },
      take: 200,
    });
  }),
  allUsersPendingVerification: adminProcedure.query(async (req) => {
    const { ctx } = req;

    const users = await ctx.prisma.user.findMany({
      where: {
        status: "PENDING",
      },
    });

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      if (!user) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.type === "INDIVIDUAL" && user.indID) {
        const ind = await ctx.prisma.individual.findUnique({
          where: {
            id: user.indID,
          },
        });
        if (!ind) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        users[i] = {
          ...user,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          individual: ind,
        };
      } else if (
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

        users[i] = {
          ...user,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          organisation: org,
        };
      }
    }

    return {
      status: 200,
      message: "Users found",
      result: users,
    };
  }),
  allApprovedUsers: adminProcedure.query(async (req) => {
    const { ctx } = req;

    const users = await ctx.prisma.user.findMany({
      where: {
        status: "APPROVED",
      },
    });

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      if (!user) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.type === "INDIVIDUAL" && user.indID) {
        const ind = await ctx.prisma.individual.findUnique({
          where: {
            id: user.indID,
          },
        });
        if (!ind) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        users[i] = {
          ...user,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          individual: ind,
        };
      } else if (
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

        users[i] = {
          ...user,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          organisation: org,
        };
      }
    }

    return {
      status: 200,
      message: "Users found",
      result: users,
    };
  }),
  allRejectedUsers: adminProcedure.query(async (req) => {
    const { ctx } = req;

    const users = await ctx.prisma.user.findMany({
      where: {
        status: "REJECTED",
      },
    });

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      if (!user) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.type === "INDIVIDUAL" && user.indID) {
        const ind = await ctx.prisma.individual.findUnique({
          where: {
            id: user.indID,
          },
        });
        if (!ind) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        users[i] = {
          ...user,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          individual: ind,
        };
      } else if (
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

        users[i] = {
          ...user,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          organisation: org,
        };
      }
    }

    return {
      status: 200,
      message: "Users found",
      result: users,
    };
  }),
  changeUserStatus: adminProcedure
    .input(approveUserSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;

      const { userId, userStatus, userVerified } =
        approveUserSchema.parse(input);

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const userUpdate = await ctx.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          status: userStatus,
          userVerified: userVerified,
        },
      });

      return {
        status: 200,
        message: "User status changed successfully",
      };
    }),
});
