import React, { FC, useCallback } from "react";
import Logo from "./Logo";
import Profile from "./Profile";
import SideBarLink from "./SideBarLink";
import { useUserContext } from "@/context/user.context";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

const SideBar: FC = () => {
  const sessionData = useUserContext();

  const router = useRouter();

  const logout = trpc.authedUsers.logout.useMutation({
    onSuccess: () => {
      router.reload();
      router.push("/");
    },
  });

  const onSubmit = useCallback(() => {
    logout.mutateAsync();
  }, [logout]);

  return (
    <aside className=" flex flex-1 flex-col items-center justify-around border-r-[1px] border-gray-600 bg-gray-900 shadow-2xl">
      <Logo />
      <div className="flex w-full flex-col gap-4 pr-10">
        <SideBarLink href="/dashboard">Dashboard</SideBarLink>
        {sessionData.type !== "ADMIN" && (
          <>
            <SideBarLink href="/profile">Profile</SideBarLink>
            <SideBarLink href="/prescriptions">Prescriptions</SideBarLink>
            <SideBarLink href="/pharmacy">Pharmacy</SideBarLink>
            <SideBarLink href="/bills">Bills</SideBarLink>
            <SideBarLink href="/wallet">Wallet</SideBarLink>
          </>
        )}
        {sessionData.type === "ADMIN" && (
          <>
            <SideBarLink href="/available-meds">
              Available Medicines
            </SideBarLink>
          </>
        )}
        <button
          className="rounded-r-full p-3 px-8 pl-20 text-left text-sm transition-all ease-in-out hover:bg-indigo-600 hover:text-white hover:shadow-2xl"
          onClick={() => onSubmit()}
        >
          {sessionData ? "Logout" : "Login"}
        </button>
      </div>
      <Profile />
    </aside>
  );
};

export default SideBar;
