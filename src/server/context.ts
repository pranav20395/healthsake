// Serverside Context

import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";

import {prisma} from "@/db/prisma";
import {NextApiRequest} from "next";
import {verifyJwt} from "@/utils/jwt";

interface ContextUser {
    id: string;
    name: string;
    email: string;
    iat: string;
    exp: number;
}

export const getUserFromCookie = async (req: NextApiRequest) => {
    const cookie = req.cookies.token;

    if (!cookie) {
        return null;
    }

    try {
        return verifyJwt<ContextUser>(cookie);
    } catch (err) {
        return null;
    }
}

export async function createContext(ctx: trpcNext.CreateNextContextOptions) {
    const {req, res} = ctx;

    const user = await getUserFromCookie(req);

    return {
        req,
        res,
        prisma,
        user,
    };
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>;