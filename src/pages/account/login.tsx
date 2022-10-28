import Link from "next/link";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {signIn} from "next-auth/react";
import {useCallback} from "react";
// import {hash} from "argon2";
import IntroLayout from "../../client/Layout/intro";
import {ILogin, loginSchema} from "@/utils/validation/auth";
import {authedNoEntry} from "@/utils/authedNoEntry";

export const getServerSideProps = authedNoEntry(async (ctx) => {
    return {props: {}};
});

function Register() {
    const {register, handleSubmit, formState: {errors}} = useForm<ILogin>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = useCallback(async (data: ILogin) => {
        // const pwd = data.password;
        // data.password = await hash(pwd);
        await signIn("credentials", {...data, callbackUrl: "/dashboard"});
    }, []);

    return (
        <IntroLayout title="User Login">
            <h1 className="font-semibold text-2xl">Login</h1>
            {/* Account Registration Form */}
            <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
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
                    className="rounded-xl p-3 px-8 text-sm transition-all ease-in-out bg-indigo-600 hover:shadow-2xl"
                    type="submit">Login
                </button>
                <Link href="/account/register"><span
                    className="text-gray-500 text-sm cursor-pointer text-center">Don&apos;t have an account?</span></Link>
            </form>
        </IntroLayout>
    );
}

export default Register;