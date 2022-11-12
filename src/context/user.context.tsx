import React, {createContext} from "react";
import {AppRouter} from "@/server/routers/_app";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type {inferRouterOutputs} from '@trpc/server';

type RouterOutput = inferRouterOutputs<AppRouter>;

type MeOutput = RouterOutput['user']['me'];

const UserContext = createContext<MeOutput>(null);

const UserContextProvider = ({children, value}: {
    children: React.ReactNode, value: MeOutput | undefined
}) => {
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

const useUserContext = () => React.useContext(UserContext);

export {UserContextProvider, useUserContext};