import type {NextPage} from "next";
import Layout from "../../client/Layout";
import React from "react";
import {useSession} from "next-auth/react";
import {requireAuth} from "@/utils/requireAuth";

export const getServerSideProps = requireAuth(async (ctx) => {
    return {props: {}};
});

const Home: NextPage = () => {
    const {data} = useSession();

    return (
        <Layout title={"Dashboard"}>
            <div className="flex w-full items-center justify-center pt-6 text-2xl text-blue-500">
                {JSON.stringify(data)}
            </div>
        </Layout>
    );
};

export default Home;
