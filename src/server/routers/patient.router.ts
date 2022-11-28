import {
  alreadyConsultated,
  alreadyRequested,
  cancelbill,
  cancelConsultation,
  getBillLink,
  getPrescriptionLink,
  issueBill,
  prescribeMedicine,
  requestBill,
  requestConsultation,
} from "@/utils/validation/consultation";
import * as trpc from "@trpc/server";
import axios from "axios";
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
      message: "Doctor not found/not approved",
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
      message: "Doctor not found/not approved",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

const isOrg = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  const org = await ctx.prisma.user.findUnique({
    where: {
      id: ctx.user.id,
    },
  });

  if (!org || !org.orgId) {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "Org not found/not approved",
    });
  }

  const doctorProfile = await ctx.prisma.organisation.findUnique({
    where: {
      id: org.orgId,
    },
  });

  if (!doctorProfile) {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "Org not found/not approved",
    });
  }

  if (
    !(doctorProfile?.role === "HOSPITAL" || doctorProfile?.role === "PHARMACY")
  ) {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "Org not found",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const orgProcedure = approvedUserProcedure.use(isOrg);
export const patientProcedure = approvedUserProcedure.use(isPatient);
export const doctorProcedure = approvedUserProcedure.use(isDoctor);

export const patientRouter = router({
  isPatient: patientProcedure.query(async (req) => {
    return true;
  }),
  isDoctor: doctorProcedure.query(async (req) => {
    return true;
  }),
  isOrg: orgProcedure.query(async (req) => {
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
  alreadyRequested: patientProcedure
    .input(alreadyRequested)
    .query(async (req) => {
      const { input, ctx } = req;
      const { hospId } = await alreadyRequested.parseAsync(input);

      const hospital = await ctx.prisma.user.findUnique({
        where: {
          id: hospId,
        },
      });

      if (!hospital) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Hospital not found",
        });
      }

      const billRequest = await ctx.prisma.billRequest.findFirst({
        where: {
          patientId: ctx.user.id,
          orgId: hospId,
          status: "PENDING",
        },
      });

      if (!billRequest) {
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
  requestBill: patientProcedure.input(requestBill).mutation(async (req) => {
    const { ctx } = req;
    const { orgId, transactionId } = req.input;

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

    const hospital = await ctx.prisma.user.findUnique({
      where: {
        id: orgId,
      },
      include: {
        wallet: true,
      },
    });

    if (!hospital || !hospital.orgId) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "Organisation not found",
      });
    }

    const doctorProfile = await ctx.prisma.organisation.findUnique({
      where: {
        id: hospital.orgId,
      },
    });

    if (
      !(
        doctorProfile?.role === "HOSPITAL" || doctorProfile?.role === "PHARMACY"
      )
    ) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "Org not found",
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
      transaction.recvWalletId !== hospital.wallet?.id ||
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

    const billRequest = await ctx.prisma.billRequest.findFirst({
      where: {
        patientId: ctx.user.id,
        orgId,
        status: "PENDING",
      },
    });

    if (billRequest) {
      const docCtx = ctx.user;
      docCtx.id = orgId;
      docCtx.name = hospital.name;
      docCtx.email = hospital.email;
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
        message: "Already requested! If any money debited, it will be refunded",
      });
    }

    const bill = await ctx.prisma.billRequest.create({
      data: {
        orgId,
        patientId: ctx.user.id,
        transactionId,
      },
    });

    return bill;
  }),
  getAllConsultations: approvedUserProcedure.query(async (req) => {
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
  getAllBills: approvedUserProcedure.query(async (req) => {
    const { ctx } = req;
    const bills = await ctx.prisma.billRequest.findMany({
      where: {
        patientId: ctx.user.id,
      },
    });

    // doctor details
    const orgIds = bills.map((c) => c.orgId);
    const orgs = await ctx.prisma.user.findMany({
      where: {
        id: {
          in: orgIds,
        },
      },
    });

    const orgDetails = orgs.map((d) => {
      return {
        id: d.id,
        name: d.name,
        email: d.email,
      };
    });

    const billDetails = bills.map((c) => {
      const org = orgDetails.find((d) => d.id === c.orgId);
      return {
        ...c,
        org,
      };
    });

    return billDetails;
  }),
  getPatientInsuranceLogs: approvedUserProcedure.query(async (req) => {
    const { ctx } = req;
    const insuranceLogs = await ctx.prisma.insuranceLogs.findMany({
      where: {
        patientId: ctx.user.id,
      },
    });

    // org details
    const orgIds = insuranceLogs.map((c) => c.insureId);
    const orgs = await ctx.prisma.user.findMany({
      where: {
        id: {
          in: orgIds,
        },
      },
    });

    const orgDetails = orgs.map((d) => {
      return {
        id: d.id,
        name: d.name,
        email: d.email,
      };
    });

    //get bill details
    const billIds = insuranceLogs.map((c) => c.billId);
    const bills = await ctx.prisma.bill.findMany({
      where: {
        id: {
          in: billIds,
        },
      },
    });

    // get org details from bills
    const billOrgIds = bills.map((c) => c.orgId);
    const billOrgs = await ctx.prisma.user.findMany({
      where: {
        id: {
          in: billOrgIds,
        },
      },
    });

    const billOrgDetails = billOrgs.map((d) => {
      return {
        id: d.id,
        name: d.name,
        email: d.email,
      };
    });

    const insuranceLogDetails = insuranceLogs.map((c) => {
      const org = orgDetails.find((d) => d.id === c.insureId);
      const bill = bills.find((b) => b.id === c.billId);
      const billOrg = billOrgDetails.find((d) => d.id === bill?.orgId);
      return {
        ...c,
        org,
        bill,
        billOrg,
      };
    });

    return insuranceLogDetails;
  }),
  getInsuranceLogs: orgProcedure.query(async (req) => {
    const { ctx } = req;
    const insuranceLogs = await ctx.prisma.insuranceLogs.findMany({
      where: {
        insureId: ctx.user.id,
      },
    });

    // org details
    const patientIds = insuranceLogs.map((c) => c.patientId);
    const patients = await ctx.prisma.user.findMany({
      where: {
        id: {
          in: patientIds,
        },
      },
    });

    const patientDetails = patients.map((d) => {
      return {
        id: d.id,
        name: d.name,
        email: d.email,
      };
    });

    //get bill details
    const billIds = insuranceLogs.map((c) => c.billId);
    const bills = await ctx.prisma.bill.findMany({
      where: {
        id: {
          in: billIds,
        },
      },
    });

    // get org details from bills
    const billOrgIds = bills.map((c) => c.orgId);
    const billOrgs = await ctx.prisma.user.findMany({
      where: {
        id: {
          in: billOrgIds,
        },
      },
    });

    const billOrgDetails = billOrgs.map((d) => {
      return {
        id: d.id,
        name: d.name,
        email: d.email,
      };
    });

    const insuranceLogDetails = insuranceLogs.map((c) => {
      const patient = patientDetails.find((d) => d.id === c.patientId);
      const bill = bills.find((b) => b.id === c.billId);
      const billOrg = billOrgDetails.find((d) => d.id === bill?.orgId);
      return {
        ...c,
        patient,
        bill,
        billOrg,
      };
    });

    return insuranceLogDetails;
  }),
  getbillDetails: orgProcedure.input(cancelbill).query(async (req) => {
    const { ctx } = req;
    const { billId } = req.input;
    const bill = await ctx.prisma.billRequest.findUnique({
      where: {
        id: billId,
      },
    });

    if (!bill) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "bill not found",
      });
    }

    // get transaction details
    const transaction = await ctx.prisma.transaction.findUnique({
      where: {
        id: bill.transactionId!,
      },
    });

    const org = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
    });

    if (!org) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    const patient = await ctx.prisma.user.findUnique({
      where: {
        id: bill.patientId,
      },
    });

    if (!patient) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "Patient not found",
      });
    }

    return {
      ...bill,
      patient,
      org,
      transaction,
    };
  }),
  getAllbillReqs: orgProcedure.query(async (req) => {
    const { ctx } = req;
    const bills = await ctx.prisma.billRequest.findMany({
      where: {
        orgId: ctx.user.id,
      },
    });

    // get patient details from patient id
    const patientIds = bills.map((c) => c.patientId);
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

    const billDetails = bills.map((c) => {
      const patient = patientDetails.find((p) => p.id === c.patientId);
      return {
        ...c,
        patient,
      };
    });

    return billDetails;
  }),
  getPrescriptionLink: approvedUserProcedure
    .input(getPrescriptionLink)
    .query(async (req) => {
      const { ctx } = req;
      const { prescriptionId } = req.input;

      const prescription = await ctx.prisma.prescription.findUnique({
        where: {
          id: prescriptionId,
        },
      });

      if (!prescription) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Prescription not found",
        });
      }

      const file = await ctx.prisma.fileStorage.findUnique({
        where: {
          id: prescription.fileId,
        },
      });

      if (!file) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      return file.url.replace(
        "Users/jaideepguntupalli/Codespaces/fcsake/uploads/",
        ""
      );
    }),
  getBillLink: approvedUserProcedure.input(getBillLink).query(async (req) => {
    const { ctx } = req;
    const { billId } = req.input;

    const bill = await ctx.prisma.bill.findUnique({
      where: {
        id: billId,
      },
    });

    if (!bill) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "bill not found",
      });
    }

    const file = await ctx.prisma.fileStorage.findUnique({
      where: {
        id: bill.fileId,
      },
    });

    if (!file) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "File not found",
      });
    }

    return file.url.replace(
      "Users/jaideepguntupalli/Codespaces/fcsake/uploads/",
      ""
    );
  }),

  rejectConsultation: doctorProcedure
    .input(cancelConsultation)
    .mutation(async (req) => {
      const { ctx } = req;
      const { consultationId } = req.input;

      const consilt = await ctx.prisma.consulationRequest.findUnique({
        where: {
          id: consultationId,
        },
      });

      if (!consilt) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Consultation not found",
        });
      }

      if (consilt.status === "DONE") {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Consultation already done",
        });
      }

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
  rejectBill: orgProcedure.input(cancelbill).mutation(async (req) => {
    const { ctx } = req;
    const { billId } = req.input;

    const consilt = await ctx.prisma.billRequest.findUnique({
      where: {
        id: billId,
      },
    });

    if (!consilt) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "Consultation not found",
      });
    }

    if (consilt.status === "DONE") {
      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
        message: "Consultation already done",
      });
    }

    const bill = await ctx.prisma.billRequest.update({
      where: {
        id: billId,
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
      userId: bill.patientId,
    });

    if (!refund) {
      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
        message: "Refund failed",
      });
    }

    return bill;
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

      if (consultation.status === "DONE") {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Consultation not done yet",
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

      // get medicine names
      const medicineIds = med.map((m) => m.availableMedsId);
      const medicines = await ctx.prisma.medicinesAvailable.findMany({
        where: {
          id: {
            in: medicineIds,
          },
        },
      });

      const medswithNames = med.map((m) => {
        const medicine = medicines.find((med) => med.id === m.availableMedsId);
        return {
          ...m,
          name: medicine?.name,
        };
      });

      // api request to /generate-pdf
      const pdf = await axios.post(
        "http://localhost:3000/api/file/generate-pdf",
        {
          patient,
          doctor,
          medswithNames,
        }
      );

      if (!pdf) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "PDF generation failed",
        });
      }

      const file = await ctx.prisma.fileStorage.create({
        data: {
          type: "application/pdf",
          size: 0,
          path: pdf.data.path,
          url: `${process.env.BASE_URL}file/${pdf.data.path}`,
          owner: {
            connect: {
              id: patient.id,
            },
          },
          ReadAccessUsers: {
            create: {
              user: {
                connect: {
                  id: doctor.id,
                },
              },
            },
          },
        },
      });

      if (!file) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "File not created",
        });
      }

      const prescription = await ctx.prisma.prescription.create({
        data: {
          patient: {
            connect: {
              id: patient.id,
            },
          },
          doctor: {
            connect: {
              id: doctor.id,
            },
          },
          file: {
            connect: {
              id: file.id,
            },
          },
        },
      });

      if (!prescription) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Prescription failed",
        });
      }

      const consultationUpdated = await ctx.prisma.consulationRequest.update({
        where: {
          id: consultationId,
        },
        data: {
          status: "DONE",
          prescription: {
            connect: {
              id: prescription.id,
            },
          },
        },
      });

      if (!consultationUpdated) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Consultation not updated",
        });
      }

      return consultationUpdated;
    }),
  issueBill: orgProcedure.input(issueBill).mutation(async (req) => {
    const { ctx } = req;
    const { billRequestId, transactionId } = req.input;

    const billRequest = await ctx.prisma.billRequest.findUnique({
      where: {
        id: billRequestId,
      },
    });

    if (!billRequest) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "Consultation not found",
      });
    }

    if (billRequest.status === "DONE") {
      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
        message: "Consultation not done yet",
      });
    }

    const org = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
    });

    if (!org) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    const patient = await ctx.prisma.user.findUnique({
      where: {
        id: billRequest.patientId,
      },
    });

    if (!patient) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "Patient not found",
      });
    }

    // Get transaction details
    const transactionDetails = await ctx.prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transactionDetails) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "Transaction not found",
      });
    }

    // api request to /generate-pdf
    const billPdf = await axios.post(
      "http://localhost:3000/api/file/generate-bill",
      {
        patient,
        org,
        transactionDetails,
      }
    );

    if (!billPdf) {
      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
        message: "Bill PDF generation failed",
      });
    }

    const file = await ctx.prisma.fileStorage.create({
      data: {
        type: "application/pdf",
        size: 0,
        path: billPdf.data.path,
        url: `${process.env.BASE_URL}file/${billPdf.data.path}`,
        owner: {
          connect: {
            id: patient.id,
          },
        },
        ReadAccessUsers: {
          create: {
            user: {
              connect: {
                id: org.id,
              },
            },
          },
        },
      },
    });

    if (!file) {
      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
        message: "File not created",
      });
    }

    const bill = await ctx.prisma.bill.create({
      data: {
        patient: {
          connect: {
            id: patient.id,
          },
        },
        organisation: {
          connect: {
            id: org.id,
          },
        },
        file: {
          connect: {
            id: file.id,
          },
        },
      },
    });

    if (!bill) {
      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
        message: "Prescription failed",
      });
    }

    const billReqUpdated = await ctx.prisma.billRequest.update({
      where: {
        id: billRequestId,
      },
      data: {
        status: "DONE",
        bill: {
          connect: {
            id: bill.id,
          },
        },
      },
    });

    if (!billReqUpdated) {
      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
        message: "Consultation not updated",
      });
    }

    return billReqUpdated;
  }),
  getPrescriptions: patientProcedure.query(async (req) => {
    const { ctx } = req;
    const prescriptions = await ctx.prisma.prescription.findMany({
      where: {
        patientId: ctx.user.id,
      },
      include: {
        doctor: true,
        file: true,
      },
    });

    if (!prescriptions) {
      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
        message: "Prescriptions not found",
      });
    }

    return prescriptions;
  }),
  getAllUnclaimedBills: patientProcedure.query(async (req) => {
    const { ctx } = req;
    const bills = await ctx.prisma.bill.findMany({
      where: {
        patientId: ctx.user.id,
        claimed: false,
      },
      include: {
        organisation: true,
        file: true,
      },
    });

    if (!bills) {
      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
        message: "Bills not found",
      });
    }

    return bills;
  }),
});
