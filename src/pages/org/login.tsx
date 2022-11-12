import Link from "next/link";
import {useCallback, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

import IntroLayout from "../../client/Layout/intro";
import {ILogin, IOtpFrontendVerify, loginSchema, otpFrontendVerifySchema} from "@/utils/validation/auth";
import {trpc} from "@/utils/trpc";
import {useRouter} from "next/router";
import {useUserContext} from "@/context/user.context";


function Login() {
    const router = useRouter();

    const data = useUserContext();

    if (data) {
        router.push('/dashboard');
    }

    const [logData, setLogData] = useState<ILogin>();
    const [otpEnv, setOtpEnv] = useState(false);

    const {register: reg, handleSubmit: hanSubmit, formState: {errors: errs}} = useForm<IOtpFrontendVerify>({
        resolver: zodResolver(otpFrontendVerifySchema),
    });

    const {register, handleSubmit, setValue, formState: {errors}} = useForm<ILogin>({
        resolver: zodResolver(loginSchema),
    });

    const otpVerifyMutation = trpc.otp.verifyWithLogin.useMutation()
    const otpMutation = trpc.otp.generate.useMutation()

    const onSubmit = useCallback(
        async (data: ILogin) => {
            otpMutation.mutate({email: data.email});
            setLogData(data);
            setOtpEnv(true);
        },
        [otpMutation]
    );

    const onOTP = useCallback(async (data: IOtpFrontendVerify) => {
        if (logData !== undefined) {
            const res = await otpVerifyMutation.mutateAsync({email: logData?.email, otp: data.otp});
        }
    }, [logData, otpVerifyMutation]);

    return (
        <IntroLayout title="Organisation Login">
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
                        onClick={() => setValue("type", "ORGANISATION")}
                        className="rounded-xl p-3 px-8 text-sm transition-all ease-in-out bg-indigo-600 hover:shadow-2xl"
                        disabled={otpMutation.isLoading} type="submit">Login
                    </button>
                    {otpMutation.error && <p>Something went wrong! {otpMutation.error.message}</p>}
                    <Link href="/org/register"><span
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
                    {otpMutation.error && <p>Something went wrong! {otpMutation.error.message}</p>}
                    <Link href="/org/register"><span
                        className="text-gray-500 text-sm cursor-pointer text-center">Don&apos;t have an account?</span></Link>
                </form>)}
        </IntroLayout>
    );
}

export default Login;