import { FC } from "react";
import Logo from "./Logo";
import Profile from "./Profile";
import SideBarLink from "./SideBarLink";
import dashboard from "./../../../assets/icons/dashboard.svg";
import calendar from "./../../../assets/icons/calendar.svg";
import question from "./../../../assets/icons/interrogation.svg";
import medicine from "./../../../assets/icons/medicine.svg";
import signout from "./../../../assets/icons/sign-out-alt.svg";
import user from "./../../../assets/icons/user.svg";

const SideBar: FC = () => {
    return (
        <aside className=" flex-1 flex flex-col justify-around border-r-[1px] border-[#D4DCEF] shadow-2xl px-10 items-center">
            <Logo />
            <div className="flex flex-col gap-4 w-5/6">
                <SideBarLink
                    href="/dashboard"
                    icon={<img src={dashboard} className="h-6" alt="icon"/>}
                >
                    Dashboard
                </SideBarLink>
                <SideBarLink
                    href="/user"
                    icon={<img src={user} className="h-6" alt="icon"/>}
                >
                    My Profile
                </SideBarLink>
                <SideBarLink
                    href="/medicine"
                    icon={<img src={medicine} className="h-6" alt="icon"/>}
                >
                    Prescriptions
                </SideBarLink>
                <SideBarLink
                    href="/calendar"
                    icon={<img src={calendar} className="h-6" alt="icon"/>}
                >
                    Appointments
                </SideBarLink>
                <SideBarLink
                    href="/question"
                    icon={<img src={question} className="h-6" alt="icon"/>}
                >
                    Help
                </SideBarLink>
                <SideBarLink
                    href="/sign-out"
                    icon={<img src={signout} className="h-6" alt="icon"/>}
                >
                    Logout
                </SideBarLink>
            </div>
            <Profile />
        </aside>
    );
};

export default SideBar;
