import type {GetServerSideProps, GetServerSidePropsContext} from "next";
import {useUserContext} from "@/context/user.context";

export const noAuthed =
    (func: GetServerSideProps) => async (ctx: GetServerSidePropsContext) => {

        const data = useUserContext();

        if (data) {
            return {
                redirect: {
                    destination: "/dashboard", // logged home path
                    permanent: false,
                },
            };
        }
        
        return await func(ctx);
    };