import {useRouter} from 'next/router'
import Layout from "@/client/Layout";
import {trpc} from "@/utils/trpc";
import Link from "next/link";
import React from "react";
import {useUserContext} from "@/context/user.context";

const Post = () => {
    const router = useRouter()
    const ctxUser = useUserContext();

    if (!ctxUser) {
        router.push('/');
    }

    const {userId} = router.query

    if (!userId) {
        return <p>Loading..</p>
    }

    const {data} = trpc.user.userDetails.useQuery({userId: userId.toString()});

    let user: any = {}
    if (data) {
        user = data.result;
    }

    if (ctxUser.type !== "ADMIN") {
        if (user.type === "INDIVIDUAL" && user.individual.role === "PATIENT") {
            router.push('/dashboard');
        }
    }

    const changeStatus = trpc.user.changeUserStatus.useMutation({onSuccess: () => router.push('/dashboard')});

    const approveUser = () => {
        changeStatus.mutate({userId: user.id, userStatus: "APPROVED", userVerified: true});
    };

    const rejectUser = () => {
        changeStatus.mutate({userId: user.id, userStatus: "REJECTED", userVerified: false});
    };

    {
        if (user.status === "PENDING") {
            return (
                <Layout title={"userId"}>
                    <div key={user.id}
                         className="m-12 flex flex-col gap-2 p-6 rounded-2xl border-2 border-gray-100 bg-gray-700 text-indigo-300">
                        <div className="flex flex-row gap-2">
                            <div className="font-medium text-white">Name:</div>
                            <div>{user.name}</div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="font-medium text-white">Email:</div>
                            <div>{user.email}</div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="font-medium text-white">Status:</div>
                            <div>{user.status}</div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="font-medium text-white">Type:</div>
                            <div>{user.type}</div>
                        </div>
                        {user.type === "INDIVIDUAL"
                            ? <>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Role:</div>
                                    <div>{user.individual?.role}</div>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Image:</div>
                                    <Link target={"_blank"}
                                          href={user.individual?.image || ""}>{user.individual?.image || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Identity Proof:</div>
                                    <Link target={"_blank"}
                                          href={user.individual?.identity || ""}>{user.individual?.identity || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Address Proof:</div>
                                    <Link target={"_blank"}
                                          href={user.individual?.address || ""}>{user.individual?.address || ""}</Link>
                                </div>
                                {user.individual?.role === "HEALTHCARE" &&
                                    <div className="flex flex-row gap-2">
                                        <div className="font-medium text-white">Health License:</div>
                                        <Link
                                            target={"_blank"}
                                            href={user.individual?.healthLicense || ""}>{user.individual?.healthLicense || ""}</Link>
                                    </div>}
                            </> : <></>}
                        {(user.type === "ORGANIZATION" || user.type === "ORGANISATION")
                            ? <>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Role:</div>
                                    <div>{user.organisation?.role}</div>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Image1:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.image1 || ""}>{user.organisation?.image1 || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Image2:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.image2 || ""}>{user.organisation?.image2 || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">License:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.license || ""}>{user.organisation?.license || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Permit:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.permit || ""}>{user.organisation?.permit || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Location:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.location || ""}>{user.organisation?.location || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Phone:</div>
                                    <div>{user.organisation?.phone}</div>
                                </div>
                            </> : <></>}
                        {ctxUser.type === "ADMIN" && (<div className="flex flex-row gap-2 mt-4">
                            <button

                                className="text-white rounded-xl p-3 px-8 text-sm transition-all ease-in-out bg-indigo-600 hover:shadow-2xl disabled:bg-indigo-900"
                                onClick={approveUser}>
                                Approve
                            </button>
                            <button

                                className="text-white rounded-xl p-3 px-8 text-sm transition-all ease-in-out bg-red-600 hover:shadow-2xl disabled:bg-indigo-900"
                                onClick={rejectUser}
                            >Deny
                            </button>
                        </div>)}
                    </div>
                </Layout>
            )
        }
        if (user.status === "APPROVED") {
            return (
                <Layout title={"userId"}>
                    <div
                        className="m-12 flex flex-col gap-2 p-6 rounded-2xl border-2 border-green-100 bg-green-700 text-indigo-300 items-start">
                        <div className="flex flex-row gap-2">
                            <div className="font-medium text-white">Name:</div>
                            <div>{user.name}</div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="font-medium text-white">Email:</div>
                            <div>{user.email}</div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="font-medium text-white">Status:</div>
                            <div>{user.status}</div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="font-medium text-white">Type:</div>
                            <div>{user.type}</div>
                        </div>
                        {user.type === "INDIVIDUAL"
                            ? <>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Role:</div>
                                    <div>{user.individual?.role}</div>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Image:</div>
                                    <Link target={"_blank"}
                                          href={user.individual?.image || ""}>{user.individual?.image || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Identity Proof:</div>
                                    <Link target={"_blank"}
                                          href={user.individual?.identity || ""}>{user.individual?.identity || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Address Proof:</div>
                                    <Link target={"_blank"}
                                          href={user.individual?.address || ""}>{user.individual?.address || ""}</Link>
                                </div>
                                {user.individual?.role === "HEALTHCARE" &&
                                    <div className="flex flex-row gap-2">
                                        <div className="font-medium text-white">Health License:</div>
                                        <Link
                                            target={"_blank"}
                                            href={user.individual?.healthLicense || ""}>{user.individual?.healthLicense || ""}</Link>
                                    </div>}
                            </> : <></>}
                        {user.type === "ORGANIZATION"
                            ? <>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Role:</div>
                                    <div>{user.organisation?.role}</div>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Image1:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.image1 || ""}>{user.organisation?.image1 || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Image2:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.image2 || ""}>{user.organisation?.image2 || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">License:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.license || ""}>{user.organisation?.license || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Permit:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.permit || ""}>{user.organisation?.permit || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Location:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.location || ""}>{user.organisation?.location || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Phone:</div>
                                    <div>{user.organisation?.phone}</div>
                                </div>
                            </> : <></>}
                        {ctxUser.type === "ADMIN" && user.type !== "ADMIN" && (<button
                            className="text-white rounded-xl p-3 px-8 text-sm transition-all ease-in-out bg-red-600 hover:shadow-2xl disabled:bg-indigo-900"
                            onClick={rejectUser}
                        >Remove
                        </button>)}
                    </div>
                </Layout>
            )
        }
        if (user.status === "REJECTED") {
            return (
                <Layout title={"userId"}>
                    <div
                        className="m-12 flex flex-col gap-2 p-6 rounded-2xl border-2 border-red-100 bg-red-700 text-indigo-300">
                        <div className="flex flex-row gap-2">
                            <div className="font-medium text-white">Name:</div>
                            <div>{user.name}</div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="font-medium text-white">Email:</div>
                            <div>{user.email}</div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="font-medium text-white">Status:</div>
                            <div>{user.status}</div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="font-medium text-white">Type:</div>
                            <div>{user.type}</div>
                        </div>
                        {user.type === "INDIVIDUAL"
                            ? <>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Role:</div>
                                    <div>{user.individual?.role}</div>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Image:</div>
                                    <Link target={"_blank"}
                                          href={user.individual?.image || ""}>{user.individual?.image || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Identity Proof:</div>
                                    <Link target={"_blank"}
                                          href={user.individual?.identity || ""}>{user.individual?.identity || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Address Proof:</div>
                                    <Link target={"_blank"}
                                          href={user.individual?.address || ""}>{user.individual?.address || ""}</Link>
                                </div>
                                {user.individual?.role === "HEALTHCARE" &&
                                    <div className="flex flex-row gap-2">
                                        <div className="font-medium text-white">Health License:</div>
                                        <Link
                                            target={"_blank"}
                                            href={user.individual?.healthLicense || ""}>{user.individual?.healthLicense || ""}</Link>
                                    </div>}
                            </> : <></>}
                        {user.type === "ORGANIZATION"
                            ? <>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Role:</div>
                                    <div>{user.organisation?.role}</div>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Image1:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.image1 || ""}>{user.organisation?.image1 || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Image2:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.image2 || ""}>{user.organisation?.image2 || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">License:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.license || ""}>{user.organisation?.license || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Permit:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.permit || ""}>{user.organisation?.permit || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Location:</div>
                                    <Link target={"_blank"}
                                          href={user.organisation?.location || ""}>{user.organisation?.location || ""}</Link>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="font-medium text-white">Phone:</div>
                                    <div>{user.organisation?.phone}</div>
                                </div>
                            </> : <></>}
                        <div className="flex flex-row gap-2 mt-4">
                            {ctxUser.type === "ADMIN" && (<button
                                className="text-white rounded-xl p-3 px-8 text-sm transition-all ease-in-out bg-indigo-600 hover:shadow-2xl disabled:bg-indigo-900"
                                onClick={approveUser}>
                                Approve
                            </button>)}
                        </div>
                    </div>
                </Layout>
            )
        }
        return <></>
    }
}

export default Post