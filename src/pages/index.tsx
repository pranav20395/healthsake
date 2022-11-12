import type { NextPage } from "next";
import React from "react";

import CustomLink from "@/client/components/button";
import IntroLayout from "@/client/Layout/intro";

const Home: NextPage = () => {
  return (
    <IntroLayout title="Home">
      <h1 className="text-2xl font-semibold text-gray-300">
        Welcome to HealthSake Portal!
      </h1>
      <div className="flex flex-col gap-6">
        <div className="flex w-full flex-col gap-4">
          <h2 className="text-lg font-medium text-gray-300">User</h2>
          <div className="flex items-center gap-2">
            <CustomLink href="/account/login" text="Login" />
            <CustomLink href="/account/register" text="Register" />
          </div>
        </div>
        <div className="flex w-full flex-col gap-4">
          <h2 className="text-lg font-medium text-gray-300">Organisation</h2>
          <div className="flex items-center gap-2">
            <CustomLink href="/org/login" text="Login" />
            <CustomLink href="/org/register" text="Register" />
          </div>
        </div>
      </div>
    </IntroLayout>
  );
};

export default Home;
