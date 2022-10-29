import NextAuth, {type NextAuthOptions} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {verify} from "argon2";

import {prisma} from "@/db/prisma";
import {loginSchema} from "@/utils/validation/auth";

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: {label: "Email", type: "email"},
                password: {label: "Password", type: "password"},
                type: {label: "Type", type: "enum", options: ["INDIVIDUAL", "ORGANISATION"]},
            },
            authorize: async (credentials, request) => {
                const creds = await loginSchema.parseAsync(credentials);

                const user = await prisma.user.findUnique({
                    where: {
                        email: creds.email,
                    },
                });

                if (!user) {
                    return null;
                }

                const isValidPassword = await verify(user.password, creds.password);

                if (!isValidPassword) {
                    return null;
                }

                console.log(user);

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };

                // const user = await prisma.user.findFirst({
                //     where: {email: creds.email},
                // });
                //
                // if (!user) {
                //     return null;
                // }
                //
                // const isValidPassword = await verify(user.password, creds.password);
                //
                // if (!isValidPassword) {
                //     return null;
                // }
                //
                // if(creds.type === "INDIVIDUAL"){
                //     const individual = await prisma.individual.findFirst({
                //         where: {id: user.indID},
                //     });
                //     const name = individual.fname + " " + individual.lname;
                // } else {
                //     const organisation = await prisma.organisation.findFirst({
                //         where: {id: user.orgID},
                //     });
                //     const name = organisation.name;
                // }
                //
                // return {
                //     id: user.id,
                //     name: name,
                //     email: user.email,
                //     type: creds.type,
                // }
            },
        }),
    ],
    callbacks: {
        jwt: async ({token, user}) => {
            user && (token.user = user);
            return token;
        },
        session: async ({session, token}) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            session.user = token.user;
            return session;
        },
    },
    jwt: {
        // todo change the secret
        secret: "super-secret",
        maxAge: 24 * 30 * 60, // 1 day
    },
    pages: {
        signIn: "/account/login",
        newUser: "/account/register",
    },
};

export default NextAuth(authOptions);
