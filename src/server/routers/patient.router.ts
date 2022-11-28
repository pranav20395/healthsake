import {
  alreadyConsultated,
  cancelConsultation,
  prescribeMedicine,
  requestConsultation,
} from "@/utils/validation/consultation";
import * as trpc from "@trpc/server";
import { router, t } from "../trpc";
import { approvedUserProcedure } from "./user.router";
import { walletRouter } from "./wallet.router";

const isPatient = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  const patient = await ctx.prisma.user.findUnique({
    where: {
      id: ctx.user.id,
    },
  });

  if (!patient || !patient.indID) {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "Patient not found/not approved",
    });
  }

  const patientProfile = await ctx.prisma.individual.findUnique({
    where: {
      id: patient.indID,
    },
  });

  if (!patientProfile || patientProfile.role !== "PATIENT") {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "Patient not found/not approved",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

const isDoctor = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  const doctor = await ctx.prisma.user.findUnique({
    where: {
      id: ctx.user.id,
    },
  });

  if (!doctor || !doctor.indID) {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "Patient not found/not approved",
    });
  }

  const doctorProfile = await ctx.prisma.individual.findUnique({
    where: {
      id: doctor.indID,
    },
  });

  if (!doctorProfile || doctorProfile.role !== "HEALTHCARE") {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "Patient not found/not approved",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const patientProcedure = approvedUserProcedure.use(isPatient);
export const doctorProcedure = approvedUserProcedure.use(isDoctor);

export const patientRouter = router({
  isPatient: patientProcedure.query(async (req) => {
    return true;
  }),
  isDoctor: doctorProcedure.query(async (req) => {
    return true;
  }),
  alreadyConsultated: patientProcedure
    .input(alreadyConsultated)
    .query(async (req) => {
      const { input, ctx } = req;
      const { doctorId } = await alreadyConsultated.parseAsync(input);

      const doctor = await ctx.prisma.user.findUnique({
        where: {
          id: doctorId,
        },
      });

      if (!doctor) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found",
        });
      }

      const consulationRequest = await ctx.prisma.consulationRequest.findFirst({
        where: {
          patientId: ctx.user.id,
          doctorId,
          status: "PENDING",
        },
      });

      if (!consulationRequest) {
        return {
          status: false,
        };
      }

      return {
        status: true,
      };
    }),
  requestConsultation: patientProcedure
    .input(requestConsultation)
    .mutation(async (req) => {
      const { ctx } = req;
      const { doctorId, transactionId } = req.input;

      const patient = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
        include: {
          wallet: true,
        },
      });

      if (!patient) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found/not approved",
        });
      }

      const doctor = await ctx.prisma.user.findUnique({
        where: {
          id: doctorId,
        },
        include: {
          wallet: true,
        },
      });

      if (!doctor || !doctor.indID) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found",
        });
      }

      const doctorProfile = await ctx.prisma.individual.findUnique({
        where: {
          id: doctor.indID,
        },
      });

      if (doctorProfile?.role !== "HEALTHCARE") {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found",
        });
      }

      const transaction = await ctx.prisma.transaction.findUnique({
        where: {
          id: transactionId,
        },
      });

      if (
        !transaction ||
        transaction.sendWalletId !== patient.wallet?.id ||
        transaction.recvWalletId !== doctor.wallet?.id ||
        transaction.verify
      ) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      const verifyTransaction = await ctx.prisma.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          verify: true,
        },
      });

      if (!verifyTransaction) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      const consulationRequest = await ctx.prisma.consulationRequest.findFirst({
        where: {
          patientId: ctx.user.id,
          doctorId,
          status: "PENDING",
        },
      });

      if (consulationRequest) {
        const docCtx = ctx.user;
        docCtx.id = doctorId;
        docCtx.name = doctor.name;
        docCtx.email = doctor.email;
        const walletCaller = walletRouter.createCaller({
          user: docCtx,
          req: ctx.req,
          res: ctx.res,
          prisma: ctx.prisma,
        });

        walletCaller.spendWallet({
          amount: 200,
          otp: "sdlkfj",
          userId: ctx.user.id,
        });

        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message:
            "Already requested! If any money debited, it will be refunded",
        });
      }

      const consultation = await ctx.prisma.consulationRequest.create({
        data: {
          doctorId,
          patientId: ctx.user.id,
          transactionId,
        },
      });

      return consultation;
    }),
  getAllConsultations: patientProcedure.query(async (req) => {
    const { ctx } = req;
    const consultations = await ctx.prisma.consulationRequest.findMany({
      where: {
        patientId: ctx.user.id,
      },
    });

    // doctor details
    const doctorIds = consultations.map((c) => c.doctorId);
    const doctors = await ctx.prisma.user.findMany({
      where: {
        id: {
          in: doctorIds,
        },
      },
    });

    const doctorDetails = doctors.map((d) => {
      return {
        id: d.id,
        name: d.name,
        email: d.email,
      };
    });

    const consultationDetails = consultations.map((c) => {
      const doctor = doctorDetails.find((d) => d.id === c.doctorId);
      return {
        ...c,
        doctor,
      };
    });

    return consultationDetails;
  }),
  getConsultationDetails: doctorProcedure
    .input(cancelConsultation)
    .query(async (req) => {
      const { ctx } = req;
      const { consultationId } = req.input;
      const consultation = await ctx.prisma.consulationRequest.findUnique({
        where: {
          id: consultationId,
        },
      });

      if (!consultation) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Consultation not found",
        });
      }

      const doctor = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
      });

      if (!doctor) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found",
        });
      }

      const patient = await ctx.prisma.user.findUnique({
        where: {
          id: consultation.patientId,
        },
      });

      if (!patient) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }

      return {
        ...consultation,
        patient,
        doctor,
      };
    }),
  getAllConsultationReqs: doctorProcedure.query(async (req) => {
    const { ctx } = req;
    const consultations = await ctx.prisma.consulationRequest.findMany({
      where: {
        doctorId: ctx.user.id,
      },
    });

    // get patient details from patient id
    const patientIds = consultations.map((c) => c.patientId);
    const patients = await ctx.prisma.user.findMany({
      where: {
        id: {
          in: patientIds,
        },
      },
    });

    const patientDetails = patients.map((p) => {
      return {
        id: p.id,
        name: p.name,
        email: p.email,
      };
    });

    const consultationDetails = consultations.map((c) => {
      const patient = patientDetails.find((p) => p.id === c.patientId);
      return {
        ...c,
        patient,
      };
    });

    return consultationDetails;
  }),
  rejectConsultation: doctorProcedure
    .input(cancelConsultation)
    .mutation(async (req) => {
      const { ctx } = req;
      const { consultationId } = req.input;

      const consultation = await ctx.prisma.consulationRequest.update({
        where: {
          id: consultationId,
        },
        data: {
          status: "REJECTED",
        },
      });

      const walletCaller = walletRouter.createCaller({
        user: ctx.user,
        req: ctx.req,
        res: ctx.res,
        prisma: ctx.prisma,
      });

      const refund = walletCaller.spendWallet({
        amount: 200,
        otp: "sdlkfj",
        userId: consultation.patientId,
      });

      if (!refund) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Refund failed",
        });
      }

      return consultation;
    }),
  prescribeMedicine: doctorProcedure
    .input(prescribeMedicine)
    .mutation(async (req) => {
      const { ctx } = req;
      const { consultationId, med } = req.input;
      const consultation = await ctx.prisma.consulationRequest.findUnique({
        where: {
          id: consultationId,
        },
      });

      if (!consultation) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Consultation not found",
        });
      }

      const doctor = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
      });

      if (!doctor) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found",
        });
      }

      const patient = await ctx.prisma.user.findUnique({
        where: {
          id: consultation.patientId,
        },
      });

      if (!patient) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }

      console.log({
        ...consultation,
        patient,
        doctor,
        med,
      });

      return true;
    }),
});
