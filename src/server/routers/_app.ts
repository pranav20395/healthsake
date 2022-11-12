import {router} from "@/server/trpc";
import {userRouter} from "@/server/routers/user.router";
import {otpRouter} from "@/server/routers/otp.router";

export const appRouter = router({
    user: userRouter,
    otp: otpRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;