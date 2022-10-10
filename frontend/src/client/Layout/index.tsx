import React, { PropsWithChildren } from "react";
import { FC } from "react";
import SideBar from "./components/SideBar";

const Layout: FC<PropsWithChildren> = ({ children }) => {
    return (
        <section className="h-screen font-poppins">
            <main className="flex h-screen">
                <SideBar />
                <section className="bg-[#f3f3f3] w-4/5">{children}</section>
            </main>
        </section>
    );
};

export default Layout;
