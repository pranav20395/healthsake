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
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "jsmith@gmail.com",
                },
                password: {label: "Password", type: "password"},
            },
            authorize: async (credentials, request) => {
                const creds = await loginSchema.parseAsync(credentials);

                const user = await prisma.user.findFirst({
                    where: {email: creds.email},
                });

                if (!user) {
                    return null;
                }

                const isValidPassword = await verify(user.password, creds.password);

                if (!isValidPassword) {
                    return null;
                }
                const name = user.fname + " " + user.lname;

                return {
                    id: user.id,
                    email: user.email,
                    name,
                };
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
