import type {GetServerSideProps, GetServerSidePropsContext} from "next";
import {useUserContext} from "@/context/user.context";

export const requireAuth =
    (func: GetServerSideProps) => async (ctx: GetServerSidePropsContext) => {

        const data = useUserContext();

        if (!data) {
            return {
                redirect: {
                    destination: "/", // logged home path
                    permanent: false,
                },
            };
        }

        return await func(ctx);
    };