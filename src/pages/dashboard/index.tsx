import type {NextPage} from "next";
import Layout from "../../client/Layout";
import React from "react";
import {requireAuth} from "@/utils/requireAuth";

export const getServerSideProps = requireAuth(async (ctx) => {
    return {props: {}};
});

const Home: NextPage = () => {
    return (
        <Layout title={"Dashboard"}>
            <div className="flex flex-col w-11/12 mx-auto pt-6 text-blue-500 gap-10">
                {/*Search Bar*/}
                <label className="flex gap-4 text-xl w-2/3 mx-auto items-center">
                    Search:
                    <input className="py-2 px-2 rounded-lg text-black w-full text-lg" type="text"
                           placeholder="Healthcare professionals and Organizations"/>
                </label>
            </div>
        </Layout>
    );
};

export default Home;
