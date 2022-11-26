import { publicProcedure, router, t } from "@/server/trpc";
import * as trpc from "@trpc/server";
import {
  updateProfileSchema,
  userDetailsSchema,
} from "@/utils/validation/verify";

const isApprovedUser = t.middleware(async ({ ctx, next }) => {
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

  if (!user || user.status !== "APPROVED") {
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

export const approvedUserProcedure = publicProcedure.use(isApprovedUser);

export const userRouter = router({
  profile: approvedUserProcedure.query(async (req) => {
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
        const ind = await ctx.prisma.individual.findUnique({
          where: {
            id: user.indID,
          },
        });

        if (!ind) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "Individual not found",
          });
        }

        const { password, ...userDetails } = user;

        let address = await ctx.prisma.addressProof.findUnique({
          where: {
            id: ind.addressId!,
          },
        });

        if (!address) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const addrFileDetails = await ctx.prisma.fileStorage.findUnique({
          where: {
            id: address.fileId,
          },
          select: {
            ownerId: true,
            url: true,
          },
        });

        address = {
          ...address,
          ...addrFileDetails,
        };

        let identity = await ctx.prisma.identityProof.findUnique({
          where: {
            id: ind.identityId!,
          },
        });

        if (!identity) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const identityFileDetails = await ctx.prisma.fileStorage.findUnique({
          where: {
            id: identity.fileId,
          },
          select: {
            ownerId: true,
            url: true,
          },
        });

        identity = {
          ...identity,
          ...identityFileDetails,
        };

        let license: any = {};

        if (ind.licenseId) {
          license = await ctx.prisma.license.findUnique({
            where: {
              id: ind.licenseId!,
            },
          });

          if (!license) {
            throw new trpc.TRPCError({
              code: "NOT_FOUND",
              message: "User not found",
            });
          }

          const licenseFileDetails = await ctx.prisma.fileStorage.findUnique({
            where: {
              id: license.fileId,
            },
            select: {
              ownerId: true,
              url: true,
            },
          });

          license = {
            ...license,
            ...licenseFileDetails,
          };
        }

        let img = await ctx.prisma.image.findUnique({
          where: {
            id: ind.imageId!,
          },
        });

        if (!img) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const imgFileDetails = await ctx.prisma.fileStorage.findUnique({
          where: {
            id: img.fileId,
          },
          select: {
            ownerId: true,
            url: true,
          },
        });

        img = {
          ...img,
          ...imgFileDetails,
        };

        const updatedInd = {
          ...ind,
          address: address,
          identity: identity,
          license,
          image: img,
        };

        return {
          status: 200,
          message: "User found",
          result: {
            ...userDetails,
            individual: updatedInd,
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

        let address = await ctx.prisma.addressProof.findUnique({
          where: {
            id: org.addressId!,
          },
        });

        if (!address) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const addrFileDetails = await ctx.prisma.fileStorage.findUnique({
          where: {
            id: address.fileId,
          },
          select: {
            ownerId: true,
            url: true,
          },
        });

        address = {
          ...address,
          ...addrFileDetails,
        };

        let permit = await ctx.prisma.permit.findUnique({
          where: {
            id: org.permitId!,
          },
        });

        if (!permit) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const permitFileDetails = await ctx.prisma.fileStorage.findUnique({
          where: {
            id: permit.fileId,
          },
          select: {
            ownerId: true,
            url: true,
          },
        });

        permit = {
          ...permit,
          ...permitFileDetails,
        };

        let license = await ctx.prisma.license.findUnique({
          where: {
            id: org.licenseId!,
          },
        });

        if (!license) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const licenseFileDetails = await ctx.prisma.fileStorage.findUnique({
          where: {
            id: license.fileId,
          },
          select: {
            ownerId: true,
            url: true,
          },
        });

        license = {
          ...license,
          ...licenseFileDetails,
        };

        const images = await ctx.prisma.image.findMany({
          where: {
            orgId: org.id,
          },
        });

        const imageFileDetails = await Promise.all(
          images.map(async (image) => {
            const imageFile = await ctx.prisma.fileStorage.findUnique({
              where: {
                id: image.fileId,
              },
              select: {
                ownerId: true,
                url: true,
              },
            });

            return {
              ...image,
              ...imageFile,
            };
          })
        );

        const updatedOrg = {
          ...org,
          addressProof: address,
          permit,
          license,
          imageFileDetails,
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
  userDetails: approvedUserProcedure
    .input(userDetailsSchema)
    .query(async (req) => {
      const { input, ctx } = req;

      const { userId } = userDetailsSchema.parse(input);

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

        let address = await ctx.prisma.addressProof.findUnique({
          where: {
            id: ind.addressId!,
          },
        });

        if (!address) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const addrFileDetails = await ctx.prisma.fileStorage.findUnique({
          where: {
            id: address.fileId,
          },
          select: {
            ownerId: true,
            url: true,
          },
        });

        address = {
          ...address,
          ...addrFileDetails,
        };

        let identity = await ctx.prisma.identityProof.findUnique({
          where: {
            id: ind.identityId!,
          },
        });

        if (!identity) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const identityFileDetails = await ctx.prisma.fileStorage.findUnique({
          where: {
            id: identity.fileId,
          },
          select: {
            ownerId: true,
            url: true,
          },
        });

        identity = {
          ...identity,
          ...identityFileDetails,
        };

        let license: any = {};

        if (ind.licenseId) {
          license = await ctx.prisma.license.findUnique({
            where: {
              id: ind.licenseId!,
            },
          });

          if (!license) {
            throw new trpc.TRPCError({
              code: "NOT_FOUND",
              message: "User not found",
            });
          }

          const licenseFileDetails = await ctx.prisma.fileStorage.findUnique({
            where: {
              id: license.fileId,
            },
            select: {
              ownerId: true,
              url: true,
            },
          });

          license = {
            ...license,
            ...licenseFileDetails,
          };
        }

        let img = await ctx.prisma.image.findUnique({
          where: {
            id: ind.imageId!,
          },
        });

        if (!img) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const imgFileDetails = await ctx.prisma.fileStorage.findUnique({
          where: {
            id: img.fileId,
          },
          select: {
            ownerId: true,
            url: true,
          },
        });

        img = {
          ...img,
          ...imgFileDetails,
        };

        const updatedInd = {
          ...ind,
          address: address,
          identity: identity,
          license,
          image: img,
        };

        return {
          status: 200,
          message: "User found",
          result: {
            ...user,
            individual: updatedInd,
          },
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

        let address = await ctx.prisma.addressProof.findUnique({
          where: {
            id: org.addressId!,
          },
        });

        if (!address) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const addrFileDetails = await ctx.prisma.fileStorage.findUnique({
          where: {
            id: address.fileId,
          },
          select: {
            ownerId: true,
            url: true,
          },
        });

        address = {
          ...address,
          ...addrFileDetails,
        };

        let permit = await ctx.prisma.permit.findUnique({
          where: {
            id: org.permitId!,
          },
        });

        if (!permit) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const permitFileDetails = await ctx.prisma.fileStorage.findUnique({
          where: {
            id: permit.fileId,
          },
          select: {
            ownerId: true,
            url: true,
          },
        });

        permit = {
          ...permit,
          ...permitFileDetails,
        };

        let license = await ctx.prisma.license.findUnique({
          where: {
            id: org.licenseId!,
          },
        });

        if (!license) {
          throw new trpc.TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const licenseFileDetails = await ctx.prisma.fileStorage.findUnique({
          where: {
            id: license.fileId,
          },
          select: {
            ownerId: true,
            url: true,
          },
        });

        license = {
          ...license,
          ...licenseFileDetails,
        };

        const images = await ctx.prisma.image.findMany({
          where: {
            orgId: org.id,
          },
        });

        const imageFileDetails = await Promise.all(
          images.map(async (image) => {
            const imageFile = await ctx.prisma.fileStorage.findUnique({
              where: {
                id: image.fileId,
              },
              select: {
                ownerId: true,
                url: true,
              },
            });

            return {
              ...image,
              ...imageFile,
            };
          })
        );

        const updatedOrg = {
          ...org,
          addressProof: address,
          permit,
          license,
          imageFileDetails,
        };

        return {
          status: 200,
          message: "User found",
          result: {
            ...user,
            organisation: updatedOrg,
          },
        };
      }

      return {
        status: 200,
        message: "User found",
        result: user,
      };
    }),
  allHealthCareAndOrganisations: approvedUserProcedure.query(async (req) => {
    const { ctx } = req;

    const users = await ctx.prisma.user.findMany({
      where: {
        status: "APPROVED",
        userVerified: true,
      },
    });

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      if (user) {
        if (user.type === "INDIVIDUAL" && user.indID) {
          const ind = await ctx.prisma.individual.findFirst({
            where: {
              id: user.indID,
            },
          });

          if (ind && ind.role === "HEALTHCARE") {
            users[i] = {
              ...user,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              individual: ind,
            };
          } else {
            // remove user[i] from array
            users.splice(i, 1);
            i--;
          }
        } else if (
          (user.type === "ORGANISATION" || user.type === "ORGANIZATION") &&
          user.orgId
        ) {
          const org = await ctx.prisma.organisation.findUnique({
            where: {
              id: user.orgId,
            },
          });
          if (org) {
            users[i] = {
              ...user,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              organisation: org,
            };
          } else {
            // remove user[i] from array
            users.splice(i, 1);
          }
        } else if (user.type === "ADMIN") {
          users.splice(i, 1);
          i--;
        }
      }
    }

    return {
      status: 200,
      message: "Users found",
      result: users,
    };
  }),
  updateProfile: approvedUserProcedure
    .input(updateProfileSchema)
    .mutation(async (req) => {
      const { input, ctx } = req;

      const { name } = updateProfileSchema.parse(input);

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

      const userUpdate = await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          name: name,
        },
      });

      return {
        status: 200,
        message: "Profile updated successfully",
      };
    }),
});
