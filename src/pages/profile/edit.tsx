import type {NextPage} from "next";
import Layout from "../../client/Layout";
import React, {useCallback} from "react";
import {useUserContext} from "@/context/user.context";
import {useRouter} from "next/router";
import {trpc} from "@/utils/trpc";
import {UpdateProfileSchema, updateProfileSchema} from "@/utils/validation/verify";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";


const Edit: NextPage = () => {

    const router = useRouter();

    const ctxUser = useUserContext();

    if (!ctxUser) {
        router.push('/');
    }

    const {register, handleSubmit, formState: {errors}} = useForm<UpdateProfileSchema>({
        resolver: zodResolver(updateProfileSchema),
    });

    const updateMutation = trpc.user.updateProfile.useMutation({onSuccess: () => router.push('/profile')});

    const onSubmit = useCallback(async (data: UpdateProfileSchema) => {
        updateMutation.mutate(data);
    }, [updateMutation]);


    return (
        <Layout title={"Profile"}>
            <section className="flex flex-col w-full mx-auto items-start justify-center p-6 text-2xl">
                <h1 className="text-4xl text-gray-200 font-medium my-10">Editing Profile</h1>
                <form className="flex flex-col w-1/2 gap-4" onSubmit={handleSubmit(onSubmit)}>
                    <label className="text-gray-200 font-medium flex flex-col gap-2">Name
                        <input className="py-2 px-2 rounded-lg text-black" type="text" {...register("name")}/>
                    </label>
                    <button
                        className="rounded-xl p-3 px-8 text-sm transition-all ease-in-out bg-indigo-600 hover:shadow-2xl disabled:bg-indigo-900"
                        disabled={updateMutation.isLoading} type="submit">Update Profile
                    </button>
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </form>
            </section>
        </Layout>
    );
};

export default Edit;
