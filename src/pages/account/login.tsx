import Link from "next/link";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {signIn} from "next-auth/react";
import {useCallback, useState} from "react";
import IntroLayout from "../../client/Layout/intro";
import {ILogin, IOtpFrontendVerify, loginSchema, otpFrontendVerifySchema} from "@/utils/validation/auth";
import {authedNoEntry} from "@/utils/authedNoEntry";
import {trpc} from "@/utils/trpc";
import {useRouter} from "next/router";

export const getServerSideProps = authedNoEntry(async (ctx) => {
    return {props: {}};
});

function Login() {
    const [otpEnv, setOtpEnv] = useState(false);
    const [logData, setLogData] = useState<ILogin>();
    const [loggingErrors, setLoggingErrors] = useState<string>("");

    const router = useRouter();

    const {register, handleSubmit, setValue, formState: {errors}} = useForm<ILogin>({
        resolver: zodResolver(loginSchema),
    });

    const {register: reg, handleSubmit: hanSubmit, formState: {errors: errs}} = useForm<IOtpFrontendVerify>({
        resolver: zodResolver(otpFrontendVerifySchema),
    });

    const otpMutation = trpc.sendOTP.useMutation()
    const otpVerifyMutation = trpc.checkOTP.useMutation()

    const onOTP = useCallback(async (data: IOtpFrontendVerify) => {
        if (logData !== undefined) {
            await otpVerifyMutation.mutateAsync({email: logData?.email, otp: data.otp})
                .then(async (res) => {
                    if (res) {
                        await signIn("credentials", {...logData, redirect: false})
                            .then((res) => {
                                    if (res?.error) {
                                        setLoggingErrors("Wrong Credentials!");
                                    } else {
                                        router.push("/dashboard");
                                    }
                                }
                            );
                    } else {
                        setLoggingErrors("Invalid OTP");
                    }
                })
        }
    }, [logData, otpVerifyMutation, router]);

    const onSubmit = useCallback(
        async (data: ILogin) => {
            await otpMutation.mutate({email: data.email});
            if (otpMutation.error === null) {
                setLogData(data);
                setOtpEnv(true);
            }

        },
        [otpMutation]
    );

    return (
        <IntroLayout title="User Login">
            <h1 className="font-semibold text-2xl">Login</h1>
            {/* Account Login Form */}
            {!otpEnv ? (<form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
                    <label className="flex flex-col gap-2 text-sm">
                        Email:
                        <input className="py-2 px-2 rounded-lg text-black" type="email" {...register("email")}/>
                        {errors.email && <p className="text-xs text-red-500">{errors.email?.message}</p>}
                    </label>
                    <label className="flex flex-col gap-2 text-sm">
                        Password:
                        <input className="py-2 px-2 rounded-lg text-black" type="password" {...register("password")}/>
                        {errors.password && <p className="text-xs text-red-500">{errors.password?.message}</p>}
                    </label>
                    <button
                        onClick={() => setValue("type", "USER")}
                        className="rounded-xl p-3 px-8 text-sm transition-all ease-in-out bg-indigo-600 hover:shadow-2xl disabled:bg-indigo-900"
                        disabled={otpMutation.isLoading} type="submit">Login
                    </button>
                    {otpMutation.error &&
                        <p className="text-sm text-red-600 bg-red-200 p-2 rounded-lg border-2 border-red-500">Something went
                            wrong! {otpMutation.error.message}</p>}
                    {loggingErrors &&
                        <p className="text-sm text-red-600 bg-red-200 p-2 rounded-lg border-2 border-red-500">Something went
                            wrong! {loggingErrors}</p>}
                    <Link href="/account/register"><span
                        className="text-gray-500 text-sm cursor-pointer text-center">Don&apos;t have an account?</span></Link>
                </form>) :
                (<form className="flex flex-col gap-6" onSubmit={hanSubmit(onOTP)}>
                    <label className="flex flex-col gap-2 text-sm">
                        Enter the OTP sent to your email:
                        <input className="py-2 px-2 rounded-lg text-black" type="text" {...reg("otp")}/>
                        {errs.otp && <p className="text-xs text-red-500">{errs.otp?.message}</p>}
                    </label>
                    <button
                        className="rounded-xl p-3 px-8 text-sm transition-all ease-in-out bg-indigo-600 hover:shadow-2xl disabled:bg-indigo-900"
                        disabled={otpMutation.isLoading} type="submit">Submit OTP
                    </button>
                    {otpVerifyMutation.error &&
                        <p className="text-sm text-red-600 bg-red-200 p-2 rounded-lg border-2 border-red-500">Something
                            went wrong! {otpVerifyMutation.error.message}</p>}
                    {loggingErrors &&
                        <p className="text-sm text-red-600 bg-red-200 p-2 rounded-lg border-2 border-red-500">Something
                            went
                            wrong! {loggingErrors}</p>}
                    <Link href="/account/register"><span
                        className="text-gray-500 text-sm cursor-pointer text-center">Don&apos;t have an account?</span></Link>
                </form>)}
        </IntroLayout>
    );
}

export default Login;