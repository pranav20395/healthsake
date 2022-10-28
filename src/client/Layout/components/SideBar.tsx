import React, {FC} from "react";
import Logo from "./Logo";
import Profile from "./Profile";
import SideBarLink from "./SideBarLink";
import {signIn, signOut, useSession} from "next-auth/react";

const SideBar: FC = () => {
    const {data: sessionData} = useSession();
    return (
        <aside
            className=" flex-1 flex flex-col justify-around border-r-[1px] border-gray-600 shadow-2xl items-center bg-gray-900">
            <Logo/>
            <div className="flex flex-col gap-4 w-full pr-10">
                <SideBarLink
                    href="/dashboard"
                >
                    Dashboard
                </SideBarLink>
                <SideBarLink
                    href="/profile"
                >
                    My Profile
                </SideBarLink>
                <SideBarLink
                    href="/medicine"
                >
                    Prescriptions
                </SideBarLink>
                <SideBarLink
                    href="/calendar"
                >
                    Appointments
                </SideBarLink>
                <SideBarLink
                    href="/question"
                >
                    Help
                </SideBarLink>
                <button
                    className="text-left rounded-r-full pl-20 p-3 px-8 text-sm transition-all ease-in-out hover:bg-indigo-600 hover:text-white hover:shadow-2xl"
                    onClick={sessionData ? () => signOut() : () => signIn()}
                >
                    {sessionData ? "Logout" : "Login"}
                </button>
            </div>
            <Profile/>
        </aside>
    )
        ;
};

export default SideBar;
