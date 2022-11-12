import {initTRPC} from '@trpc/server';
import {Context} from "@/server/context";
import superjson from 'superjson';

const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

// Base router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;