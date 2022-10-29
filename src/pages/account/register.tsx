import Link from "next/link";
import {NextPage} from "next";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useCallback, useState} from "react";
import {useRouter} from "next/router";

import IntroLayout from "../../client/Layout/intro";
import {IOtpFrontendVerify, ISignUp, otpFrontendVerifySchema, signUpSchema} from "@/utils/validation/auth";
import {trpc} from "@/utils/trpc";
import {authedNoEntry} from "@/utils/authedNoEntry";

export const getServerSideProps = authedNoEntry(async (ctx) => {
    return {props: {}};
});

const Register: NextPage = () => {
    const [otpEnv, setOtpEnv] = useState(false);
    const [regData, setRegData] = useState<ISignUp>();
    const [loggingErrors, setLoggingErrors] = useState<string>("");

    const router = useRouter();
    const {register, handleSubmit, formState: {errors}} = useForm<ISignUp>({
        resolver: zodResolver(signUpSchema),
    });

    const {register: reg, handleSubmit: hanSubmit, formState: {errors: errs}} = useForm<IOtpFrontendVerify>({
        resolver: zodResolver(otpFrontendVerifySchema),
    });

    const otpMutation = trpc.sendOTP.useMutation()
    const otpVerifyMutation = trpc.checkOTP.useMutation()
    const mutation = trpc.userSignUp.useMutation()

    const onOTP = useCallback(
        async (data: IOtpFrontendVerify) => {
            if (regData !== undefined) {
                try {
                    await otpVerifyMutation.mutateAsync({email: regData?.email, otp: data.otp})
                    try {
                        await mutation.mutate(regData)
                        await router.push("/account/login");
                    } catch (cause) {
                        console.log(cause)
                    }

                } catch (cause) {
                    console.log(cause)
                }
            }
        },
        [regData, otpVerifyMutation, mutation, router]
    );

    const onSubmit = useCallback(
        async (data: ISignUp) => {
            try {
                await otpMutation.mutate({email: data.email});
                setRegData(data);
                setOtpEnv(true);
            } catch (cause) {
                console.log(cause)
            }
        },
        [otpMutation]
    );

    return (
        <IntroLayout title="User Registration">
            <h1 className="font-semibold text-2xl">Register Account</h1>
            {/* Account Registration Form */}
            {!otpEnv ? (<form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
                    <label className="flex flex-col gap-2 text-sm">
                        First Name:
                        <input className="py-2 px-2 rounded-lg text-black" type="text" {...register("fname")}/>
                        {errors.fname && <p className="text-xs text-red-500">{errors.fname?.message}</p>}
                    </label>
                    <label className="flex flex-col gap-2 text-sm">
                        Last Name:
                        <input className="py-2 px-2 rounded-lg text-black" type="text" {...register("lname")}/>
                        {errors.lname && <p className="text-xs text-red-500">{errors.lname?.message}</p>}
                    </label>
                    <label className="flex flex-col gap-2 text-sm">
                        Email:
                        <input className="py-2 px-2 rounded-lg text-black" type="email" {...register("email")}/>
                        {errors.email && <p className="text-xs text-red-500">{errors.email?.message}</p>}
                    </label>
                    <label className="flex flex-col gap-2 text-sm">
                        Password:
                        <input className="py-2 px-2 rounded-lg text-black"
                               type="password" {...register("password")}/>
                        {errors.password && <p className="text-xs text-red-500">{errors.password?.message}</p>}
                    </label>
                    <button
                        className="rounded-xl p-3 px-8 text-sm transition-all ease-in-out bg-indigo-600 hover:shadow-2xl disabled:bg-indigo-900"
                        disabled={mutation.isLoading} type="submit">Register
                    </button>
                    {mutation.error &&
                        <p className="text-sm text-red-600 bg-red-200 p-2 rounded-lg border-2 border-red-500">Something went
                            wrong! {mutation.error.message}</p>}
                    <Link href="/account/login"><span className="text-gray-500 text-sm cursor-pointer text-center">Already have an account?</span></Link>
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

export default Register;