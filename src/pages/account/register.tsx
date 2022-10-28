import Link from "next/link";
import {NextPage} from "next";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useCallback} from "react";
import {useRouter} from "next/router";
// import {hash} from "argon2";
import IntroLayout from "../../client/Layout/intro";
import {ISignUp, signUpSchema} from "@/utils/validation/auth";
import {trpc} from "@/utils/trpc";
import {authedNoEntry} from "@/utils/authedNoEntry";

export const getServerSideProps = authedNoEntry(async (ctx) => {
    return {props: {}};
});

const Register: NextPage = () => {
    const router = useRouter();
    const {register, handleSubmit, formState: {errors}} = useForm<ISignUp>({
        resolver: zodResolver(signUpSchema),
    });

    const mutation = trpc.signUp.useMutation()

    const onSubmit = useCallback(
        async (data: ISignUp) => {
            // const pwd = data.password;
            // data.password = await hash(pwd);

            mutation.mutate(data);
            await router.push("/account/login");
        },
        [mutation, router]
    );

    return (
        <IntroLayout title="User Registration">
            <h1 className="font-semibold text-2xl">Register Account</h1>
            {/* Account Registration Form */}
            <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
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
                {mutation.error && <p>Something went wrong! {mutation.error.message}</p>}
                <Link href="/account/login"><span className="text-gray-500 text-sm cursor-pointer text-center">Already have an account?</span></Link>
            </form>
        </IntroLayout>
    );
}

export default Register;