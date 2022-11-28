import Layout from "@/client/Layout";
import { useUserContext } from "@/context/user.context";
import { trpc } from "@/utils/trpc";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const Bills: NextPage = () => {
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

  const { data: bills } = trpc.patient.getAllBills.useQuery();
  const { data: billsReqs } = trpc.patient.getAllbillReqs.useQuery();

  const cancelBillMutation = trpc.patient.rejectBill.useMutation({
    onSuccess: () => {
      router.reload();
    },
    onMutate: () => {
      setLoading(true);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const donebills = bills?.filter((bill) => bill.status === "DONE");

  const pendingbills = bills?.filter((bill) => bill.status === "PENDING");

  const cancelledbills = bills?.filter((bill) => bill.status === "REJECTED");

  const donebillsReq = billsReqs?.filter((bill) => bill.status === "DONE");

  const cancelledbillsReq = billsReqs?.filter(
    (bill) => bill.status === "REJECTED"
  );

  const pendingbillsReq = billsReqs?.filter(
    (bill) => bill.status === "PENDING"
  );

  return (
    <Layout title="Bills">
      <div className="mx-auto flex w-11/12 flex-col gap-10 pt-6">
        {isOrg && (
          <>
            {pendingbillsReq?.length !== 0 && (
              <>
                <h1 className="my-10 text-3xl font-medium">Bill Requests</h1>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex flex-col gap-4">
                  {pendingbillsReq?.map((prescriptionReq) => (
                    <div
                      key={prescriptionReq.id}
                      className="flex justify-between rounded-lg border-4 border-indigo-800 bg-indigo-500/60 p-4 px-8 shadow-md"
                    >
                      <div className="flex flex-col gap-2">
                        <h1 className="text-xl font-medium">
                          {`${prescriptionReq.patient?.name} (${prescriptionReq.patient?.email})`}
                        </h1>
                        <div className="flex gap-2">
                          <p className="rounded-full bg-yellow-500 px-2 text-sm font-bold lowercase text-white">
                            {prescriptionReq.status}
                          </p>
                          <p className="rounded-full bg-purple-600 px-2 text-sm font-bold lowercase text-white">
                            {prescriptionReq.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/bills/create/${prescriptionReq.id}`}>
                          <span className="flex cursor-pointer items-center rounded-xl bg-green-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl">
                            Issue Bill
                          </span>
                        </Link>
                        <button
                          className="rounded-xl bg-red-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
                          disabled={loading}
                          onClick={(e) =>
                            cancelBillMutation.mutate({
                              billId: prescriptionReq.id,
                            })
                          }
                        >
                          Reject
                        </button>
                      </div>
                      {/* <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-medium">
                      {prescriptionReq.patient.name}
                    </h1>
                    <p className="text-gray-500">
                      {prescriptionReq.patient.age} years old
                    </p>
                  </div> */}
                      {/* <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-medium">Medicines</h1>
                    <div className="flex flex-col gap-2">
                      {prescriptionReq.medicines.map((medicine) => (
                        <div
                           */}
                    </div>
                  ))}
                </div>
              </>
            )}
            {donebillsReq?.length !== 0 && (
              <>
                <h1 className="my-10 text-3xl font-medium">Bills Sent</h1>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex flex-col gap-4">
                  {donebillsReq?.map((prescriptionReq) => (
                    <div
                      key={prescriptionReq.id}
                      className="flex justify-between rounded-lg border-4 border-indigo-800 bg-indigo-500/60 p-4 px-8 shadow-md"
                    >
                      <div className="flex flex-col gap-2">
                        <h1 className="text-xl font-medium">
                          {`${prescriptionReq.patient?.name} (${prescriptionReq.patient?.email})`}
                        </h1>
                        <div className="flex gap-2">
                          <p className="rounded-full bg-yellow-500 px-2 text-sm font-bold lowercase text-white">
                            {prescriptionReq.status}
                          </p>
                          <p className="rounded-full bg-purple-600 px-2 text-sm font-bold lowercase text-white">
                            {prescriptionReq.timestamp.toLocaleString()}
                          </p>
                        </div>
                        {/* <p>{JSON.stringify(prescriptionReq)}</p> */}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/bills/${prescriptionReq.billId}`}>
                          <span className="flex cursor-pointer items-center rounded-xl bg-green-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl">
                            View
                          </span>
                        </Link>
                      </div>
                      {/* <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-medium">
                      {prescriptionReq.patient.name}
                    </h1>
                    <p className="text-gray-500">
                      {prescriptionReq.patient.age} years old
                    </p>
                  </div> */}
                      {/* <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-medium">Medicines</h1>
                    <div className="flex flex-col gap-2">
                      {prescriptionReq.medicines.map((medicine) => (
                        <div
                           */}
                    </div>
                  ))}
                </div>
              </>
            )}
            {cancelledbillsReq?.length !== 0 && (
              <>
                <h1 className="my-10 text-3xl font-medium">Cancelled Bills</h1>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex flex-col gap-4">
                  {cancelledbillsReq?.map((prescriptionReq) => (
                    <div
                      key={prescriptionReq.id}
                      className="flex justify-between rounded-lg border-4 border-indigo-800 bg-indigo-500/60 p-4 px-8 shadow-md"
                    >
                      <div className="flex flex-col gap-2">
                        <h1 className="text-xl font-medium">
                          {`${prescriptionReq.patient?.name} (${prescriptionReq.patient?.email})`}
                        </h1>
                        <div className="flex gap-2">
                          <p className="rounded-full bg-yellow-500 px-2 text-sm font-bold lowercase text-white">
                            {prescriptionReq.status}
                          </p>
                          <p className="rounded-full bg-purple-600 px-2 text-sm font-bold lowercase text-white">
                            {prescriptionReq.timestamp.toLocaleString()}
                          </p>
                        </div>
                        {/* <p>{JSON.stringify(prescriptionReq)}</p> */}
                      </div>
                      <div className="flex gap-2">
                        <Link href={"/wallet"}>
                          <span className="flex cursor-pointer items-center rounded-xl bg-green-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl">
                            Refunded Back
                          </span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        {!isOrg && (
          <>
            {pendingbills?.length !== 0 && (
              <div>
                <h1 className="my-10 text-3xl font-medium">Requested Bills</h1>
                {pendingbills?.map((prescription) => (
                  <div key={prescription.id}>
                    <div className="flex justify-between rounded-lg border-4 border-indigo-800 bg-indigo-500/60 p-4 px-8 shadow-md">
                      <div className="flex flex-col gap-2">
                        <h1 className="text-xl font-medium">
                          {prescription.org?.name}
                        </h1>
                        <div className="flex gap-2">
                          <p className="rounded-full bg-yellow-500 px-2 text-sm font-bold lowercase text-white">
                            {prescription.status}
                          </p>
                          <p className="rounded-full bg-purple-600 px-2 text-sm font-bold lowercase text-white">
                            {prescription.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <h1 className="my-10 text-3xl font-medium">Bills</h1>
            {donebills?.length === 0 && cancelledbills?.length === 0 && (
              <p className="text-center font-medium text-gray-500">
                No bills yet
              </p>
            )}
            {donebills?.map((prescription) => (
              <div key={prescription.id}>
                <div className="flex justify-between rounded-lg border-4 border-indigo-800 bg-indigo-500/60 p-4 px-8 shadow-md">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-medium">
                      {prescription.org?.name}
                    </h1>
                    <div className="flex gap-2">
                      <p className="rounded-full bg-yellow-500 px-2 text-sm font-bold lowercase text-white">
                        {prescription.status}
                      </p>
                      <p className="rounded-full bg-purple-600 px-2 text-sm font-bold lowercase text-white">
                        {prescription.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/bills/${prescription.billId}`}>
                      <span className="flex cursor-pointer items-center rounded-xl bg-green-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl">
                        View
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {cancelledbills?.map((prescription) => (
              <div key={prescription.id}>
                <div className="flex justify-between rounded-lg border-4 border-indigo-800 bg-indigo-500/60 p-4 px-8 shadow-md">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-medium">
                      {prescription.org?.name}
                    </h1>
                    <div className="flex gap-2">
                      <p className="rounded-full bg-yellow-500 px-2 text-sm font-bold lowercase text-white">
                        {prescription.status}
                      </p>
                      <p className="rounded-full bg-purple-600 px-2 text-sm font-bold lowercase text-white">
                        {prescription.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={"/wallet"}>
                      <span className="flex cursor-pointer items-center rounded-xl bg-green-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl">
                        Refund Received
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Bills;
