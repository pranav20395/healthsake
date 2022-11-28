import Layout from "@/client/Layout";
import { useUserContext } from "@/context/user.context";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

const BillIssuePage = () => {
  const router = useRouter();
  const ctxUser = useUserContext();

  if (!ctxUser) {
    router.push("/");
    return <></>;
  }

  const { billReqId } = router.query;

  if (!billReqId) {
    return <p>Loading..</p>;
  }

  const issueBill = trpc.patient.issueBill.useMutation();

  const { data: bill } = trpc.patient.getbillDetails.useQuery({
    billId: billReqId as string,
  });

  if (!bill) {
    return <p>Loading..</p>;
  }

  if (bill.transactionId === null) {
    return <p>Bill not paid</p>;
  }

  if (bill?.status === "DONE") {
    router.push("/bills");
    return <></>;
  }

  return (
    <Layout title="Prescribe">
      <div className="mx-auto flex w-11/12 flex-col gap-10 pt-6">
        <h1 className="my-10 text-3xl font-medium">Issue Bill</h1>
        {bill && (
          <div className="mx-auto flex w-5/6 flex-col gap-4 rounded-md border-2 border-white p-8">
            <div className="flex justify-between">
              <div className="my-2 flex flex-col gap-2">
                <h1 className="text-2xl font-semibold">{bill.org.name}</h1>
                <p className="text-sm font-medium">{bill.org.email}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xl font-medium">Date</p>
                <p className="text-sm">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-md my-2 flex flex-col gap-2">
              <p className="text-lg font-medium">Patient Details:</p>
              <p>Name: {bill.patient.name}</p>
              <p>Email: {bill.patient.email}</p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <p className="text-lg font-medium">Bill Details</p>
              <div className="flex flex-col gap-2">
                <p>Bill ID: {bill.transaction?.id}</p>
                <p>Bill Amount: {bill.transaction?.amount}</p>
                <p>Bill Status: PAID</p>
              </div>
            </div>
          </div>
        )}
        <button
          className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
          onClick={async () => {
            await issueBill.mutate({
              billRequestId: bill.id,
              transactionId: bill.transactionId!,
            });
            router.push("/bills");
          }}
        >
          Issue Bill
        </button>
      </div>
    </Layout>
  );
};

export default BillIssuePage;
