import Layout from "@/client/Layout";
import { useUserContext } from "@/context/user.context";
import { trpc } from "@/utils/trpc";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const InsuranceClaims: NextPage = () => {
  const router = useRouter();

  const ctxUser = useUserContext();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const { data: isOrg } = trpc.patient.isOrg.useQuery();

  const { data: insurances } = trpc.patient.getPatientInsuranceLogs.useQuery();

  const { data: orginsurances } = trpc.patient.getInsuranceLogs.useQuery();

  return (
    <Layout title="Bills">
      <div className="mx-auto flex w-11/12 flex-col gap-10 pt-6">
        {!isOrg && (
          <>
            <h1 className="my-10 text-3xl font-medium">Insurance Logs</h1>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex flex-col gap-4">
              {insurances?.map((insurance) => (
                <div
                  key={insurance.id}
                  className="flex justify-between rounded-lg border-4 border-indigo-800 bg-indigo-500/60 p-4 px-8 shadow-md"
                >
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-medium">
                      Insurance Company:{" "}
                      {`${insurance.org?.name} (${insurance.org?.email})`}
                    </h2>
                    <h2 className="text-xl font-medium">
                      Bill Issuer:{" "}
                      {`${insurance.billOrg?.name} (${insurance.billOrg?.email})`}
                    </h2>
                    <div className="flex gap-2">
                      <p className="rounded-full bg-green-500 px-2 text-sm font-bold lowercase text-white">
                        Claimed
                      </p>
                      <p className="rounded-full bg-purple-600 px-2 text-sm font-bold lowercase text-white">
                        {insurance.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/wallet`}>
                      <span className="flex cursor-pointer items-center rounded-xl bg-green-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl">
                        View
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {isOrg && (
          <>
            <h1 className="my-10 text-3xl font-medium">Insurance Logs</h1>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex flex-col gap-4">
              {orginsurances?.map((insurance) => (
                <div
                  key={insurance.id}
                  className="flex justify-between rounded-lg border-4 border-indigo-800 bg-indigo-500/60 p-4 px-8 shadow-md"
                >
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-medium">
                      Patient:{" "}
                      {`${insurance.patient?.name} (${insurance.patient?.email})`}
                    </h2>
                    <h2 className="text-xl font-medium">
                      Bill Issuer:{" "}
                      {`${insurance.billOrg?.name} (${insurance.billOrg?.email})`}
                    </h2>
                    <div className="flex gap-2">
                      <p className="rounded-full bg-green-500 px-2 text-sm font-bold lowercase text-white">
                        Claimed
                      </p>
                      <p className="rounded-full bg-purple-600 px-2 text-sm font-bold lowercase text-white">
                        {insurance.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/wallet`}>
                      <span className="flex cursor-pointer items-center rounded-xl bg-green-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl">
                        View
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default InsuranceClaims;
