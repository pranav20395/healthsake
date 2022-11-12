import "../styles/globals.css";
import type { AppType } from "next/app";
import { trpc } from "@/utils/trpc";
import { UserContextProvider } from "@/context/user.context";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  const { data, isLoading } = trpc.user.me.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <UserContextProvider value={data}>
      <Component {...pageProps} />
    </UserContextProvider>
  );
};

export default trpc.withTRPC(MyApp);
