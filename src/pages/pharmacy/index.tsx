import Layout from "@/client/Layout";
import { useUserContext } from "@/context/user.context";
import { trpc } from "@/utils/trpc";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

const Pharmacy: NextPage = () => {
  const router = useRouter();

  const ctxUser = useUserContext();

  if (ctxUser === null) {
    router.push("/");
    return <></>;
  }

  if (!ctxUser.verified) {
    if (ctxUser.type === "INDIVIDUAL") {
      router.push("/account/verify");
    } else if (
      ctxUser.type === "ORGANIZATION" ||
      ctxUser.type === "ORGANISATION"
    ) {
      router.push("/org/verify");
    }
  }

  const { data: pharmacies } = trpc.pharm.getAllPharmacies.useQuery();

  return (
    <Layout title="Pharmacy">
      <div className="mx-auto flex w-11/12 flex-col gap-10 pt-6">
        <h1 className="my-10 text-3xl font-medium">Pharmacy</h1>
        {pharmacies?.length === 0 && (
          <div className="flex flex-col items-center justify-center">
            <p className="text-center text-gray-400"> No pharmacies found</p>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {pharmacies?.map((pharm) => (
            <a
              key={pharm.id}
              className="flex flex-col gap-2 rounded-lg border-4 border-indigo-800 bg-indigo-500/60 p-4 px-8"
              href={`/pharmacy/${pharm.id}`}
            >
              <h1 className="text-xl font-medium">{pharm.user.name}</h1>
              <p className="text-sm opacity-50">#{pharm.id}</p>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Pharmacy;
