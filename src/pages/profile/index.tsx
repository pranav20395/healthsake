import type {NextPage} from "next";
import Layout from "../../client/Layout";
import React from "react";
import {useUserContext} from "@/context/user.context";
import {useRouter} from "next/router";
import {trpc} from "@/utils/trpc";
import Link from "next/link";


const Profile: NextPage = () => {

    const router = useRouter();

    const ctxUser = useUserContext();

    if (!ctxUser) {
        router.push('/');
    }

    const {data: datasd, isLoading, error} = trpc.user.profile.useQuery();

    const data: any = datasd;
    return (
        <Layout title={"Profile"}>
            <section className="flex flex-col w-full mx-auto items-start justify-center p-6 text-2xl">
                <h1 className="text-4xl text-gray-200 font-medium my-10">Profile</h1>
                {isLoading && <p>Loading...</p>}
                {error && <p>{error.message}</p>}
                <div>
                    {data ? <div>
                        <div className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Name: {data.result.name}</div>
                        <div className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Email: {data.result.email}</div>
                        <div className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Role: {data.result.type}</div>
                        {data.result.indID ?
                            <>
                                <div
                                    className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Image: {data.result.individual.image}</div>
                                <div
                                    className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Identity: {data.result.individual.identity}</div>
                                <div
                                    className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Address: {data.result.individual.address}</div>
                                {data.result.individual?.healthLicense ?
                                    <div className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Health
                                        License: {data.result.individual.healthLicense}</div> : null}
                            </> : null}
                        {data.result.orgId ?
                            <>
                                <div
                                    className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Image
                                    1: {data.result.org.image1}</div>
                                <div
                                    className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Image
                                    2: {data.result.org.image2}</div>
                                <div
                                    className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Location: {data.result.org.location}</div>
                                <div
                                    className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">License: {data.result.org.license}</div>
                                <div
                                    className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Permit: {data.result.org.permit}</div>
                                <div
                                    className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Phone: {data.result.org.phone}</div>
                            </> : null}

                    </div> : null}</div>
                <Link href={"/profile/edit"}>
                    <button
                        className="rounded-xl p-3 px-8 text-sm transition-all ease-in-out bg-indigo-600 hover:shadow-2xl disabled:bg-indigo-900"
                    >Edit Profile
                    </button>
                </Link>
            </section>
        </Layout>
    );
};

export default Profile;
