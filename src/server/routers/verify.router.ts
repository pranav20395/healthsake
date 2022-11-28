import {
  orgSchemaForVerification,
  patientSchemaForVerification,
} from "@/utils/validation/verify";
import { publicProcedure, router, t } from "../trpc";
import * as trpc from "@trpc/server";

const submitForVerification = t.middleware(async ({ ctx, next }) => {
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

  if (!user || user.status !== "CREATED") {
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

const verifyProcedure = publicProcedure.use(submitForVerification);

export const verifyRouter = router({
  userSubmitForVerification: verifyProcedure
    .input(patientSchemaForVerification)
    .mutation(async (req) => {
      const { input, ctx } = req;

      const admin = await ctx.prisma.user.findFirst({
        where: {
          email: "admin@healthsake.io",
        },
      });

      const { role, address, identity, profileImage, healthLicense } =
        patientSchemaForVerification.parse(input);

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

      if (!user.indID) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const ind = await ctx.prisma.individual.findUnique({
        where: {
          id: user.indID,
        },
      });

      if (!ind) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }

      if (role === "PATIENT") {
        const patientUpdate = await ctx.prisma.individual.update({
          where: {
            id: ind.id,
          },
          data: {
            address: {
              create: {
                file: {
                  create: {
                    path: address.path,
                    type: address.type,
                    size: address.size,
                    url: address.url,
                    owner: {
                      connect: {
                        id: admin?.id,
                      },
                    },
                    ReadAccessUsers: {
                      create: {
                        user: {
                          connect: {
                            id: ctx.user.id,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            identity: {
              create: {
                file: {
                  create: {
                    path: identity.path,
                    type: identity.type,
                    size: identity.size,
                    url: identity.url,
                    owner: {
                      connect: {
                        id: admin?.id,
                      },
                    },
                    ReadAccessUsers: {
                      create: {
                        user: {
                          connect: {
                            id: ctx.user.id,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            role: "PATIENT",
            image: {
              create: {
                file: {
                  create: {
                    path: profileImage.path,
                    type: profileImage.type,
                    size: profileImage.size,
                    url: profileImage.url,
                    owner: {
                      connect: {
                        id: profileImage.ownerId,
                      },
                    },
                    ReadAccessUsers: {
                      create: {
                        user: {
                          connect: {
                            id: admin?.id,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!patientUpdate) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "Patient not found",
          });
        }

        const userUpdate = await ctx.prisma.user.update({
          where: {
            id: ctx.user.id,
          },
          data: {
            status: "PENDING",
          },
        });

        return {
          status: 200,
          message: "Patient created successfully",
        };
      } else if (role === "HEALTHCARE") {
        if (!healthLicense) {
          throw new trpc.TRPCError({
            code: "BAD_REQUEST",
            message: "Health license is required",
          });
        }

        const docUpdate = await ctx.prisma.individual.update({
          where: {
            id: ind.id,
          },
          data: {
            address: {
              create: {
                file: {
                  create: {
                    path: address.path,
                    type: address.type,
                    size: address.size,
                    url: address.url,
                    isPublic: true,
                    owner: {
                      connect: {
                        id: admin?.id,
                      },
                    },
                    ReadAccessUsers: {
                      create: {
                        user: {
                          connect: {
                            id: ctx.user.id,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            identity: {
              create: {
                file: {
                  create: {
                    path: identity.path,
                    type: identity.type,
                    size: identity.size,
                    url: identity.url,
                    isPublic: true,
                    owner: {
                      connect: {
                        id: admin?.id,
                      },
                    },
                    ReadAccessUsers: {
                      create: {
                        user: {
                          connect: {
                            id: ctx.user.id,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            role: "HEALTHCARE",
            image: {
              create: {
                file: {
                  create: {
                    path: profileImage.path,
                    type: profileImage.type,
                    size: profileImage.size,
                    url: profileImage.url,
                    isPublic: true,
                    owner: {
                      connect: {
                        id: profileImage.ownerId,
                      },
                    },
                    ReadAccessUsers: {
                      create: {
                        user: {
                          connect: {
                            id: admin?.id,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            license: {
              create: {
                file: {
                  create: {
                    path: healthLicense.path,
                    type: healthLicense.type,
                    size: healthLicense.size,
                    url: healthLicense.url,
                    isPublic: true,
                    owner: {
                      connect: {
                        id: admin?.id,
                      },
                    },
                    ReadAccessUsers: {
                      create: {
                        user: {
                          connect: {
                            id: ctx.user.id,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!docUpdate) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "Patient not found",
          });
        }

        const userUpdate = await ctx.prisma.user.update({
          where: {
            id: ctx.user.id,
          },
          data: {
            status: "PENDING",
          },
        });

        return {
          status: 200,
          message: "Patient created successfully",
        };
      }
    }),
  orgSubmitForVerification: verifyProcedure
    .input(orgSchemaForVerification)
    .mutation(async (req) => {
      const { input, ctx } = req;

      const admin = await ctx.prisma.user.findFirst({
        where: {
          email: "admin@healthsake.io",
        },
      });

      const { address, permit, image1, image2, license, phone, role } =
        orgSchemaForVerification.parse(input);

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

      if (!user.orgId) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const org = await ctx.prisma.organisation.findUnique({
        where: {
          id: user.orgId,
        },
      });

      if (!org) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Organisation not found",
        });
      }

      const orgUpdate = await ctx.prisma.organisation.update({
        where: {
          id: org.id,
        },
        data: {
          images: {
            create: [
              {
                file: {
                  create: {
                    path: image1.path,
                    type: image1.type,
                    size: image1.size,
                    url: image1.url,
                    isPublic: true,
                    owner: {
                      connect: {
                        id: ctx.user.id,
                      },
                    },
                  },
                },
              },
              {
                file: {
                  create: {
                    path: image2.path,
                    type: image2.type,
                    size: image2.size,
                    url: image2.url,
                    isPublic: true,
                    owner: {
                      connect: {
                        id: ctx.user.id,
                      },
                    },
                  },
                },
              },
            ],
          },
          address: {
            create: {
              file: {
                create: {
                  path: address.path,
                  type: address.type,
                  size: address.size,
                  url: address.url,
                  isPublic: true,
                  owner: {
                    connect: {
                      id: admin?.id,
                    },
                  },
                },
              },
            },
          },
          permit: {
            create: {
              file: {
                create: {
                  path: permit.path,
                  type: permit.type,
                  size: permit.size,
                  url: permit.url,
                  isPublic: true,
                  owner: {
                    connect: {
                      id: admin?.id,
                    },
                  },
                },
              },
            },
          },
          license: {
            create: {
              file: {
                create: {
                  path: license.path,
                  type: license.type,
                  size: license.size,
                  url: license.url,
                  isPublic: true,
                  owner: {
                    connect: {
                      id: admin?.id,
                    },
                  },
                },
              },
            },
          },
          phone,
          role,
        },
      });

      if (!orgUpdate) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Organisation not found",
        });
      }

      const userUpdate = await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          status: "PENDING",
        },
      });

      if (role === "PHARMACY") {
        const pharm = await ctx.prisma.pharmacy.create({
          data: {
            user: {
              connect: {
                id: ctx.user.id,
              },
            },
          },
        });

        if (!pharm) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "Something went wrong",
          });
        }
      }

      return {
        status: 200,
        message: "Organisation created successfully",
      };
    }),
});
