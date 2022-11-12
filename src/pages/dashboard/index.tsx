import type {NextPage} from "next";
import Layout from "../../client/Layout";
import React, {useState} from "react";
import {useRouter} from "next/router";
import {trpc} from "@/utils/trpc";
import {useUserContext} from "@/context/user.context";
import Link from "next/link";

const Home: NextPage = () => {
    const router = useRouter();

    const ctxUser = useUserContext();

    if (!ctxUser) {
        router.push('/');
    }

    if (!ctxUser.verified) {
        if (ctxUser.type === "INDIVIDUAL") {
            router.push('/account/verify');
        } else if (ctxUser.type === "ORGANIZATION" || ctxUser.type === "ORGANISATION") {
            router.push('/org/verify');
        }
    }

    if (ctxUser.type === "ADMIN") {
        const {
            data: pendingUsers,
        } = trpc.user.allUsersPendingVerification.useQuery();

        const {
            data: verifiedUsers,
        } = trpc.user.allApprovedUsers.useQuery();

        const {
            data: rejectedUsers,
        } = trpc.user.allRejectedUsers.useQuery();

        return <Layout title={"Dashboard"}>
            <div className="flex flex-col w-11/12 mx-auto pt-6 text-blue-500 gap-10">
                <h1 className="text-4xl text-gray-200 font-medium my-10">Welcome, {ctxUser.name}</h1>
                {ctxUser.type === "ADMIN" && <div className="flex flex-col gap-4">
                    <h2 className="text-2xl text-gray-200 font-medium">Admin Panel</h2>
                    <h3 className="text-xl text-gray-200 font-medium">Pending Users</h3>
                    <div className="flex flex-col gap-4">
                        {pendingUsers && pendingUsers.result.map((user: any) => {
                            if (user.status === "PENDING") {
                                return (
                                    <a href={"http://localhost:3000/user/" + (user.id)} key={user.id}
                                       className="flex flex-col gap-2 p-6 rounded-2xl border-2 border-gray-100 bg-gray-700 text-indigo-300">
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
                                    </a>
                                )
                            }
                            if (user.status === "APPROVED") {
                                return (
                                    <div key={user.id}
                                         className="flex flex-col gap-2 p-6 rounded-2xl border-2 border-green-100 bg-green-700 text-indigo-300">
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
                                    </div>
                                )
                            }
                            if (user.status === "REJECTED") {
                                return (
                                    <div key={user.id}
                                         className="flex flex-col gap-2 p-6 rounded-2xl border-2 border-red-100 bg-red-700 text-indigo-300">
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
                                    </div>
                                )
                            }
                            return <></>
                        })}
                    </div>
                    <h3 className="text-xl text-gray-200 font-medium">Approved Users</h3>
                    <div className="flex flex-col gap-4">
                        {verifiedUsers && verifiedUsers.result.map((user: any) => {
                            if (user.status === "PENDING") {
                                return (
                                    <a href={"http://localhost:3000/user/" + (user.id)} key={user.id}
                                       className="flex flex-col gap-2 p-6 rounded-2xl border-2 border-gray-100 bg-gray-700 text-indigo-300">
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
                                    </a>
                                )
                            }
                            if (user.status === "APPROVED") {
                                return (
                                    <a href={"http://localhost:3000/user/" + (user.id)} key={user.id}
                                       className="flex flex-col gap-2 p-6 rounded-2xl border-2 border-green-100 bg-green-700 text-indigo-300 items-start">
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
                                    </a>
                                )
                            }
                            if (user.status === "REJECTED") {
                                return (
                                    <a href={"http://localhost:3000/user/" + (user.id)} key={user.id}
                                       className="flex flex-col gap-2 p-6 rounded-2xl border-2 border-red-100 bg-red-700 text-indigo-300">
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
                                    </a>
                                )
                            }
                            return <></>
                        })}
                    </div>
                    <h3 className="text-xl text-gray-200 font-medium">Rejected Users</h3>
                    <div className="flex flex-col gap-4">
                        {rejectedUsers && rejectedUsers.result.map((user: any) => {
                            if (user.status === "PENDING") {
                                return (
                                    <a href={"http://localhost:3000/user/" + (user.id)} key={user.id}
                                       className="flex flex-col gap-2 p-6 rounded-2xl border-2 border-gray-100 bg-gray-700 text-indigo-300">
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
                                    </a>
                                )
                            }
                            if (user.status === "APPROVED") {
                                return (
                                    <a href={"http://localhost:3000/user/" + (user.id)} key={user.id}
                                       className="flex flex-col gap-2 p-6 rounded-2xl border-2 border-green-100 bg-green-700 text-indigo-300">
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
                                    </a>
                                )
                            }
                            if (user.status === "REJECTED") {
                                return (
                                    <a href={"http://localhost:3000/user/" + (user.id)} key={user.id}
                                       className="flex flex-col gap-2 p-6 rounded-2xl border-2 border-red-100 bg-red-700 text-indigo-300">
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
                                    </a>
                                )
                            }
                            return <></>
                        })}
                    </div>
                </div>}
            </div>
        </Layout>;
    } else {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [query, setQuery] = useState("")
        const {
            data: allHealthCareAndOrganisations,
        } = trpc.user.allHealthCareAndOrganisations.useQuery();

        const data = allHealthCareAndOrganisations?.result;

        return <Layout title={"Dashboard"}>
            <div className="flex flex-col w-11/12 mx-auto pt-6 text-blue-500 gap-10">
                <h1 className="text-4xl text-gray-200 font-medium my-10">Welcome, {ctxUser.name}</h1>
                {/*Search Bar*/}
                <label className="flex gap-4 text-xl w-2/3 mx-auto items-center">
                    Search:
                    <input className="py-2 px-4 rounded-lg text-black w-full text-lg" type="text"
                           placeholder="Healthcare professionals and Organizations"
                           onChange={event => setQuery(event.target.value)}/>
                </label>
                {/*Search Results*/}
                <div className={"flex flex-col gap-4 items-center " + (query === "" ? "hidden" : "")}>
                    {data && (data.filter(user => {
                        if (query === '') {
                            return user;
                        } else if (user.name.toLowerCase().includes(query.toLowerCase())) {
                            return user;
                        }
                    }).map((user: any) => (
                        <a href={"http://localhost:3000/user/" + (user.id)} key={user.id}
                           className="w-2/3 flex flex-col gap-2 p-6 rounded-2xl border-2 border-gray-100 bg-gray-700 text-indigo-300">
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

                                            <Link target={"_blank"}
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
                        </a>
                    )))
                    }
                </div>
            </div>
        </Layout>
    }
};

export default Home;
