import * as trpc from "@trpc/server";
import { router, t } from "@/server/trpc";
import { approvedUserProcedure } from "./user.router";
import {
  addMedicine,
  pharmdetails,
  updateMedicine,
} from "@/utils/validation/pharm";

const isPharmacy = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  const pharmacy = await ctx.prisma.pharmacy.findUnique({
    where: {
      userId: ctx.user.id,
    },
  });

  if (!pharmacy) {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "Pharmacy not found/not approved",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const pharmProcedure = approvedUserProcedure.use(isPharmacy);

export const pharmRouter = router({
  getAllPharmacies: approvedUserProcedure.query(async (req) => {
    const pharmacies = await req.ctx.prisma.pharmacy.findMany({
      where: {
        user: {
          userVerified: true,
        },
      },
      include: {
        user: true,
      },
    });
    return pharmacies;
  }),
  getAllMedicinesOfPharmacy: approvedUserProcedure
    .input(pharmdetails)
    .query(async (req) => {
      const { ctx } = req;
      const { pharmid } = req.input;
      const pharmacy = await ctx.prisma.pharmacy.findUnique({
        where: {
          id: pharmid,
        },
        include: {
          user: true,
        },
      });

      if (!pharmacy) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Pharmacy not found/not approved",
        });
      }

      const medicines = await ctx.prisma.medicine.findMany({
        where: {
          pharmacyId: pharmacy.id,
        },
      });

      return { pharmacy, medicines };
    }),
  addMedicineToPharmacy: pharmProcedure
    .input(addMedicine)
    .mutation(async (req) => {
      const { ctx } = req;
      const { availableMedsId, price, quantity } = req.input;
      const pharmacy = await ctx.prisma.pharmacy.findUnique({
        where: {
          userId: ctx.user.id,
        },
      });

      if (!pharmacy) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Pharmacy not found/not approved",
        });
      }

      const medDetails = await ctx.prisma.medicinesAvailable.findUnique({
        where: {
          id: availableMedsId,
        },
      });

      if (!medDetails) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Medicine not found/not approved",
        });
      }

      const medicine = await ctx.prisma.medicine.create({
        data: {
          image: medDetails.image,
          name: medDetails.name,
          barcode: medDetails.barcode,
          price,
          quantity,
          pharmacyId: pharmacy.id,
        },
      });

      if (!medicine) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Something went wrong",
        });
      }

      return medicine;
    }),

  updateMedicineOfPharmacy: pharmProcedure
    .input(updateMedicine)
    .mutation(async (req) => {
      const { ctx } = req;
      const { id, price, quantity } = req.input;
      const pharmacy = await ctx.prisma.pharmacy.findUnique({
        where: {
          userId: ctx.user.id,
        },
      });

      if (!pharmacy) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Pharmacy not found/not approved",
        });
      }

      const medicine = await ctx.prisma.medicine.update({
        where: {
          id: id,
        },
        data: {
          price,
          quantity,
          pharmacyId: pharmacy.id,
        },
      });

      if (!medicine) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Something went wrong",
        });
      }

      return medicine;
    }),
});
