import type {NextPage} from "next";
import Layout from "../../client/Layout";
import React from "react";
import {useSession} from "next-auth/react";
import {requireAuth} from "@/utils/requireAuth";

export const getServerSideProps = requireAuth(async (ctx) => {
    return {props: {}};
});

const Profile: NextPage = () => {
    const {data} = useSession();

    return (
        <Layout title={"Profile"}>
            <section className="flex flex-col w-full mx-auto items-start justify-center p-6 text-2xl">
                <h1 className="text-4xl text-gray-200 font-medium my-10">Profile</h1>
                <div className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Name: {data?.user?.name}</div>
                <div className="border-b-2 border-b-gray-500 pb-4 mb-8 w-full">Email: {data?.user?.email}</div>
            </section>
        </Layout>
    );
};

export default Profile;
