import { initTRPC } from "@trpc/server";
import { Context } from "@/server/context";
import superjson from "superjson";
import { signUpOTPSchema } from "@/utils/validation/auth";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Base router and procedure helpers
export const router = t.router;

const logger = t.middleware(async ({ input, ctx, path, type, next }) => {
  let username = "Unauthenticated User";
  if (ctx.user) {
    username = `${ctx.user.name} (${ctx.user.email})`;
  }
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;

  let value = `fail (${durationMs}ms)`;

  if (result.ok) {
    value = `success (${durationMs}ms)`;
  }

  if (type !== "query") {
    const logs = await ctx.prisma.log.create({
      data: {
        type: `${username}`,
        action: `${type}@${path}`,
        value,
      },
    });

    console.log(`${username} ${type}@${path} ${value}`);
  }

  return result;
});

export const publicProcedure = t.procedure.use(logger);
