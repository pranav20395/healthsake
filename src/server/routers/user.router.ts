import {publicProcedure, router} from "@/server/trpc";
import {orgSignUpSchema, signUpSchema} from "@/utils/validation/auth";
import * as trpc from "@trpc/server";
import {hash} from "argon2";
import {serialize} from "cookie";
import {
    approveUserSchema,
    orgSchemaForVerification,
    patientSchemaForVerification,
    updateProfileSchema,
    userDetailsSchema
} from "@/utils/validation/verify";

export const userRouter = router({
    registerUser: publicProcedure
        .input(signUpSchema)
        .mutation(async (req) => {
            const {input, ctx} = req;
            const {fname, lname, email, password} = await signUpSchema.parseAsync(input);

            const exists = await ctx.prisma.user.findFirst({
                where: {email},
            });

            if (exists) {
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
                    }
                });

                const result = await ctx.prisma.user.create({
                    data: {name, email, password: hashedPassword, type: "INDIVIDUAL", indID: individual.id},
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
        .input(orgSignUpSchema)
        .mutation(async (req) => {
            const {input, ctx} = req;
            // const {email, password, username} = await signUpSchema.parseAsync(input);
            const {name, description, email, password} = input;

            const exists = await ctx.prisma.user.findFirst({
                where: {email},
            });

            if (exists) {
                throw new trpc.TRPCError({
                    code: "CONFLICT",
                    message: "User already exists.",
                });
            }

            const hashedPassword = await hash(password);

            const org = await ctx.prisma.organisation.create({
                data: {
                    description
                }
            });

            const result = await ctx.prisma.user.create({
                data: {name, email, password: hashedPassword, type: "ORGANISATION", orgId: org.id},
            });

            return {
                status: 201,
                message: "Account created successfully",
                result: result.email,
            };
        }),
    me: publicProcedure
        .query(async (req) => {
            const {ctx} = req;

            if (!ctx.user) {
                return null;
            }

            return ctx.user;
        }),
    verifyRealUser: publicProcedure
        .query(async (req) => {
            const {ctx} = req;

            if (!ctx.user) {
                return null;
            }

            return ctx.user;
        }),
    profile: publicProcedure
        .query(async (req) => {
            const {ctx} = req;

            if (!ctx.user) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            try {
                const user = await ctx.prisma.user.findUnique({
                    where: {
                        id: ctx.user.id
                    }
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
                        result: user
                    }
                }

                if (user.type === "INDIVIDUAL" && user.indID) {
                    const individual = await ctx.prisma.individual.findUnique({
                        where: {
                            id: user.indID
                        }
                    });

                    const {password, ...userDetails} = user;

                    return {
                        status: 200,
                        message: "User found",
                        result: {
                            ...userDetails,
                            individual
                        }
                    };
                }

                if ((user.type === "ORGANISATION" || user.type === "ORGANIZATION") && user.orgId) {
                    const org = await ctx.prisma.organisation.findUnique({
                        where: {
                            id: user.orgId
                        }
                    });

                    const {password, ...userDetails} = user;

                    return {
                        status: 200,
                        message: "User found",
                        result: {
                            ...userDetails,
                            org
                        }
                    };
                }
            } catch (e) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
        }),
    logout: publicProcedure
        .mutation(async (req) => {
            const {ctx} = req;

            if (!ctx.user) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            try {
                ctx.res.setHeader('Set-Cookie', serialize('token', '', {maxAge: -1, path: '/'}))

                return {
                    status: 200,
                    message: "Logged out successfully",
                    result: null
                };
            } catch (e) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
        }),
    userSubmitForVerification: publicProcedure
        .input(patientSchemaForVerification)
        .mutation(async (req) => {
            const {input, ctx} = req;

            if (!ctx.user) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const {role, address, identity, profileImage, healthLicense} = patientSchemaForVerification.parse(input);

            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.user.id
                }
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
                    id: user.indID
                }
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
                        id: ind.id
                    },
                    data: {
                        address,
                        identity,
                        role: "PATIENT",
                        image: profileImage,
                    }
                });

                if (!patientUpdate) {
                    throw new trpc.TRPCError({
                        code: "NOT_FOUND",
                        message: "Patient not found",
                    });
                }

                const userUpdate = await ctx.prisma.user.update({
                    where: {
                        id: ctx.user.id
                    },
                    data: {
                        status: "PENDING"
                    }
                });

                return {
                    status: 200,
                    message: "Patient created successfully",
                };
            } else if (role === "HEALTHCARE") {

                const docUpdate = await ctx.prisma.individual.update({
                    where: {
                        id: ind.id
                    },
                    data: {
                        address,
                        identity,
                        role: "HEALTHCARE",
                        image: profileImage,
                        healthLicense
                    }
                });

                if (!docUpdate) {
                    throw new trpc.TRPCError({
                        code: "NOT_FOUND",
                        message: "Patient not found",
                    });
                }

                const userUpdate = await ctx.prisma.user.update({
                    where: {
                        id: ctx.user.id
                    },
                    data: {
                        status: "PENDING"
                    }
                });

                return {
                    status: 200,
                    message: "Patient created successfully",
                };
            }

        }),
    orgSubmitForVerification: publicProcedure
        .input(orgSchemaForVerification)
        .mutation(async (req) => {
            const {input, ctx} = req;

            if (!ctx.user) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const {location, permit, image1, image2, license, phone, role} = orgSchemaForVerification.parse(input);

            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.user.id
                }
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
                    id: user.orgId
                }
            });

            if (!org) {
                throw new trpc.TRPCError({
                    code: "NOT_FOUND",
                    message: "Organisation not found",
                });
            }

            const orgUpdate = await ctx.prisma.organisation.update({
                where: {
                    id: org.id
                },
                data: {
                    image1,
                    image2,
                    location,
                    permit,
                    license,
                    phone,
                    role
                }
            });

            if (!orgUpdate) {
                throw new trpc.TRPCError({
                    code: "NOT_FOUND",
                    message: "Organisation not found",
                });
            }

            const userUpdate = await ctx.prisma.user.update({
                where: {
                    id: ctx.user.id
                },
                data: {
                    status: "PENDING"
                }
            });

            return {
                status: 200,
                message: "Organisation created successfully",
            };

        }),
    allUsersPendingVerification: publicProcedure
        .query(async (req) => {
            const {ctx} = req;

            if (!ctx.user) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const admin = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.user.id
                }
            });

            if (!admin) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const users = await ctx.prisma.user.findMany({
                where: {
                    status: "PENDING"
                }
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
                            id: user.indID
                        }
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
                        individual: ind
                    }
                } else if ((user.type === "ORGANISATION" || user.type === "ORGANIZATION") && user.orgId) {
                    const org = await ctx.prisma.organisation.findUnique({
                        where: {
                            id: user.orgId
                        }
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
                        organisation: org
                    }
                }
            }

            return {
                status: 200,
                message: "Users found",
                result: users
            };
        }),
    allApprovedUsers: publicProcedure
        .query(async (req) => {
            const {ctx} = req;

            if (!ctx.user) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const admin = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.user.id
                }
            });

            if (!admin) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const users = await ctx.prisma.user.findMany({
                where: {
                    status: "APPROVED"
                }
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
                            id: user.indID
                        }
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
                        individual: ind
                    }
                } else if ((user.type === "ORGANISATION" || user.type === "ORGANIZATION") && user.orgId) {
                    const org = await ctx.prisma.organisation.findUnique({
                        where: {
                            id: user.orgId
                        }
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
                        organisation: org
                    }
                }
            }

            return {
                status: 200,
                message: "Users found",
                result: users
            };
        }),
    allRejectedUsers: publicProcedure
        .query(async (req) => {
            const {ctx} = req;

            if (!ctx.user) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const admin = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.user.id
                }
            });

            if (!admin) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const users = await ctx.prisma.user.findMany({
                where: {
                    status: "REJECTED"
                }
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
                            id: user.indID
                        }
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
                        individual: ind
                    }
                } else if ((user.type === "ORGANISATION" || user.type === "ORGANIZATION") && user.orgId) {
                    const org = await ctx.prisma.organisation.findUnique({
                        where: {
                            id: user.orgId
                        }
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
                        organisation: org
                    }
                }
            }

            return {
                status: 200,
                message: "Users found",
                result: users
            };
        }),
    changeUserStatus: publicProcedure
        .input(approveUserSchema)
        .mutation(async (req) => {
            const {input, ctx} = req;

            if (!ctx.user) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const {userId, userStatus, userVerified} = approveUserSchema.parse(input);

            const admin = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.user.id
                }
            });

            if (!admin) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: userId
                }
            });

            if (!user) {
                throw new trpc.TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            const userUpdate = await ctx.prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    status: userStatus,
                    userVerified: userVerified
                }
            });

            return {
                status: 200,
                message: "User status changed successfully",
            };
        }),
    userDetails: publicProcedure
        .input(userDetailsSchema)
        .query(async (req) => {
            const {input, ctx} = req;

            if (!ctx.user) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const {userId} = userDetailsSchema.parse(input);

            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: userId
                }
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
                        id: user.indID
                    }
                });

                if (!ind) {
                    throw new trpc.TRPCError({
                        code: "NOT_FOUND",
                        message: "User not found",
                    });
                }

                return {
                    status: 200,
                    message: "User found",
                    result: {
                        ...user,
                        individual: ind
                    }
                }
            } else if ((user.type === "ORGANISATION" || user.type === "ORGANIZATION") && user.orgId) {
                const org = await ctx.prisma.organisation.findUnique({
                    where: {
                        id: user.orgId
                    }
                });
                if (!org) {
                    throw new trpc.TRPCError({
                        code: "NOT_FOUND",
                        message: "User not found",
                    });
                }

                return {
                    status: 200,
                    message: "User found",
                    result: {
                        ...user,
                        organisation: org
                    }
                }
            }

            return {
                status: 200,
                message: "User found",
                result: user
            }
        }),
    allHealthCareAndOrganisations: publicProcedure
        .query(async (req) => {
            const {ctx} = req;

            if (!ctx.user) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const users = await ctx.prisma.user.findMany({
                where: {
                    status: "APPROVED",
                    userVerified: true
                }
            });

            for (let i = 0; i < users.length; i++) {
                const user = users[i];

                if (user) {

                    if (user.type === "INDIVIDUAL" && user.indID) {

                        const ind = await ctx.prisma.individual.findFirst({
                            where: {
                                id: user.indID,
                            }
                        });

                        if (ind && ind.role === "HEALTHCARE") {
                            users[i] = {
                                ...user,
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                individual: ind
                            }
                        } else {
                            // remove user[i] from array
                            users.splice(i, 1);
                            i--;
                        }
                    } else if ((user.type === "ORGANISATION" || user.type === "ORGANIZATION") && user.orgId) {
                        const org = await ctx.prisma.organisation.findUnique({
                            where: {
                                id: user.orgId
                            }
                        });
                        if (org) {
                            users[i] = {
                                ...user,
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                organisation: org
                            }

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
                result: users
            };
        }),
    updateProfile: publicProcedure
        .input(updateProfileSchema)
        .mutation(async (req) => {
            const {input, ctx} = req;

            if (!ctx.user) {
                throw new trpc.TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const {name} = updateProfileSchema.parse(input);

            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.user.id
                }
            });

            if (!user) {
                throw new trpc.TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            const userUpdate = await ctx.prisma.user.update({
                where: {
                    id: ctx.user.id
                },
                data: {
                    name: name
                }
            });

            return {
                status: 200,
                message: "Profile updated successfully",
            }
        }),
});