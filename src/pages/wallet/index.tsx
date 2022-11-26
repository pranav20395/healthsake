import Layout from "@/client/Layout";
import { useUserContext } from "@/context/user.context";
import { trpc } from "@/utils/trpc";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

function enableRazorpay() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

const Wallet: NextPage = () => {
  const router = useRouter();

  const ctxUser = useUserContext();

  const [amount, setAmount] = useState(0);

  const topUpMutation = trpc.wallet.topUpWallet.useMutation();

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

  const displayRazorpay = async () => {
    const result = await enableRazorpay();

    if (!result) {
      alert("Razorpay failed to load. Are you online?");
      return;
    }

    const details = {
      amount: (amount * 100).toString(),
    };

    const res = await fetch("api/razorpayPayment", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    });

    const data = await res.json();

    console.log(data);
    const options = {
      key: process.env.RAZORPAY_TEST_KEY,
      amount: data.amount,
      currency: data.currency,
      name: "HealthSake",
      description:
        "HealthSake is a platform that aims to provide a one-stop solution for all your health needs.",
      image: "https://svgshare.com/i/oMF.svg",
      order_id: data.id,
      handler: async function (response: any) {
        saveDetails(data.amount / 100);
      },
      prefill: {
        email: ctxUser.email,
      },
      theme: {
        color: "#6366F1",
      },
    };

    const _window = window as any;
    const paymentObject = new _window.Razorpay(options);
    paymentObject.open();
  };

  const saveDetails = async (amount: number) => {
    topUpMutation.mutateAsync({
      amount,
    });
  };

  const { data } = trpc.wallet.getWalletDetails.useQuery();
  const { data: transactions } = trpc.wallet.getWalletTransactions.useQuery();
  return (
    <Layout title="Wallet">
      <div className="mx-auto flex w-11/12 flex-col gap-10 pt-6">
        <div className="flex w-full justify-between rounded-xl bg-indigo-500 p-10">
          <div>
            <h1 className="mb-10 mt-4 text-4xl font-medium text-gray-200">
              Wallet
            </h1>
            <p>Balance: ₹ {data?.balance}</p>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <input
              type="number"
              className="rounded-lg p-1 text-black"
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <button
              className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
              onClick={displayRazorpay}
            >
              Add More Money
            </button>
          </div>
        </div>
        <div className="flex w-full flex-col gap-4">
          <h2 className="my-6 text-3xl font-medium text-gray-200">
            Transactions
          </h2>
          {transactions?.length === 0 && (
            <p className="text-center text-gray-400"> No transactions yet...</p>
          )}
          {transactions?.map((transaction) =>
            transaction.recvName === transaction.sendName ? (
              <div
                key={transaction.id}
                className="flex w-full items-center justify-between rounded-xl bg-green-600 p-4 px-8"
              >
                <p>Amount: ₹ {transaction.amount}</p>
                <p> Money added to wallet</p>
                <p className="rounded-full bg-indigo-600 p-2 px-4 text-xs font-medium">
                  {transaction.timestamp.toLocaleString()}
                </p>
              </div>
            ) : (
              <div
                key={transaction.id}
                className="flex w-full items-center justify-between rounded-xl bg-indigo-800 p-4 px-8"
              >
                <p>Amount: ₹ {transaction.amount}</p>
                <p> recv: {transaction.recvName}</p>
                <p> sent: {transaction.sendName}</p>
                <p className="rounded-full bg-indigo-600 p-2 px-4 text-xs font-medium">
                  {transaction.timestamp.toLocaleString()}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;
