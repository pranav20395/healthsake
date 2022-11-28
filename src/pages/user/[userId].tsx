import { useRouter } from "next/router";
import Layout from "@/client/Layout";
import { trpc } from "@/utils/trpc";
import { useUserContext } from "@/context/user.context";
import Image from "next/image";
import CustomFileComponent, {
  fileType,
} from "@/client/components/fileComponent";
import { useState } from "react";

const UserPage = () => {
  const router = useRouter();
  const ctxUser = useUserContext();

  const [payment, setPayment] = useState(false);
  const [refund, setRefund] = useState(false);
  const [otp, setotp] = useState("");
  const [otpErrors, setOtpErrors] = useState("");
  const [errors, setErrors] = useState("");
  const [billId, setBillId] = useState("");

  if (!ctxUser) {
    router.push("/");
    return <></>;
  }

  const { userId } = router.query;

  if (!userId) {
    return <p>Loading..</p>;
  }

  const consultRequest = trpc.patient.requestConsultation.useMutation({
    onSuccess: () => {
      router.reload();
    },
    onError: (err) => setErrors(err.message),
  });

  const requestBills = trpc.patient.requestBill.useMutation({
    onSuccess: () => {
      router.reload();
    },
    onError: (err) => setErrors(err.message),
  });

  const transact = trpc.wallet.spendWallet.useMutation({
    onSuccess: (data) => {
      consultRequest.mutate({
        doctorId: userId.toString(),
        transactionId: data.transactionId,
      });
    },
    onError: (err) => {
      setErrors(err.message);
    },
  });

  const insureTransact = trpc.wallet.claimWallet.useMutation({
    onSuccess: (data) => {
      router.reload();
    },
    onError: (err) => {
      setErrors(err.message);
    },
  });

  const transactForBills = trpc.wallet.spendWallet.useMutation({
    onSuccess: (data) => {
      requestBills.mutate({
        orgId: userId.toString(),
        transactionId: data.transactionId,
      });
    },
    onError: (err) => {
      setErrors(err.message);
    },
  });

  const { data: unclaimedBills } = trpc.patient.getAllUnclaimedBills.useQuery();

  const otpMutation = trpc.otp.generate.useMutation({
    onSuccess: (data) => {
      setPayment(true);
    },
    onError: (err) => setOtpErrors(err.message),
  });

  const insureOtpMutation = trpc.otp.generate.useMutation({
    onSuccess: (data) => {
      setRefund(true);
    },
    onError: (err) => setOtpErrors(err.message),
  });

  const { data } = trpc.user.userDetails.useQuery({
    userId: userId.toString(),
  });

  const { data: isConsulated } = trpc.patient.alreadyConsultated.useQuery({
    doctorId: userId.toString(),
  });

  const { data: isRequested } = trpc.patient.alreadyRequested.useQuery({
    hospId: userId.toString(),
  });

  const { data: isPatient } = trpc.patient.isPatient.useQuery();

  if (data) {
    const user: any = data.result;

    if (ctxUser.type !== "ADMIN") {
      if (user.type === "INDIVIDUAL" && user.individual.role === "PATIENT") {
        router.push("/dashboard");
      }
      if (user.status !== "APPROVED") {
        router.push("/dashboard");
      }
    }

    return (
      <Layout title={"userId"}>
        <div className=" relative h-60 w-full object-cover">
          <Image
            src={`https://picsum.photos/seed/${userId}/1500/300`}
            alt="cover photo"
            layout="fill"
          />
        </div>

        <div className="mr-10 flex justify-between">
          <div className="mx-12 my-6 flex flex-col items-start gap-2 p-6 text-indigo-300">
            <div className="flex flex-row gap-2">
              <div className="text-2xl font-medium">{user.name}</div>
            </div>
            {ctxUser.type === "ADMIN" && (
              <>
                <div className="flex flex-row gap-2">
                  <div className="font-medium text-white">Status:</div>
                  <div>{user.status}</div>
                </div>
                <div className="flex flex-row gap-2">
                  <div className="font-medium text-white">Type:</div>
                  <div>{user.type}</div>
                </div>
              </>
            )}
            {user.type === "INDIVIDUAL" ? (
              <>
                <div className="flex flex-row gap-2">
                  <div className="rounded-full bg-cyan-500 px-2 text-sm font-bold lowercase text-white">
                    {user.individual?.role}
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <div className="font-medium text-white">Email:</div>
                  <div>{user.email}</div>
                </div>
                <div className="my-2 flex flex-row items-center gap-4">
                  <div className="font-medium text-white">Image:</div>
                  <CustomFileComponent
                    href={user.individual?.image.url || ""}
                    text={"Image"}
                    type={fileType.IMG}
                  />
                </div>
                {ctxUser.type === "ADMIN" && (
                  <>
                    <div className="my-2 flex flex-row items-center gap-4">
                      <div className="font-medium text-white">
                        Identity Proof:
                      </div>
                      <CustomFileComponent
                        href={user.individual?.identity.url || ""}
                        text={"Identity Proof"}
                        type={fileType.PDF}
                      />
                    </div>
                    <div className="my-2 flex flex-row items-center gap-4">
                      <div className="font-medium text-white">
                        Address Proof:
                      </div>
                      <CustomFileComponent
                        href={user.individual?.address.url || ""}
                        text={"Address Proof"}
                        type={fileType.PDF}
                      />
                    </div>
                  </>
                )}
                {user.individual?.role === "HEALTHCARE" && (
                  <>
                    <div className="my-2 flex flex-row items-center gap-4">
                      <div className="font-medium text-white">
                        Health License:
                      </div>
                      <CustomFileComponent
                        href={user.individual?.license.url || ""}
                        text={"License"}
                        type={fileType.PDF}
                      />
                    </div>
                    {isPatient && (
                      <>
                        <button
                          className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
                          onClick={(e) =>
                            otpMutation.mutate({ email: ctxUser.email })
                          }
                          disabled={isConsulated?.status}
                        >
                          Request for Consultation
                        </button>
                        {otpErrors && (
                          <p className="text-xs text-red-500">{otpErrors}</p>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <></>
            )}
            {user.type === "ORGANIZATION" || user.type === "ORGANISATION" ? (
              <>
                {user.organisation?.description}
                <div className="flex flex-row gap-2">
                  <div className="rounded-full bg-purple-500 px-2 text-sm font-bold lowercase text-white">
                    {user.organisation?.role}
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <div className="font-medium text-white">Email:</div>
                  <div>{user.email}</div>
                </div>
                <div className="my-2 flex flex-row items-center gap-4">
                  <div className="font-medium text-white">Images:</div>
                  <div className="flex gap-2">
                    {user.organisation.imageFileDetails.map((image: any) => (
                      <>
                        <CustomFileComponent
                          key={image.fileId}
                          href={image.url}
                          text={"Image"}
                          type={fileType.IMG}
                        />
                        <br />
                      </>
                    ))}
                  </div>
                </div>
                <div className="my-2 flex flex-row items-center gap-4">
                  <div className="font-medium text-white">License:</div>
                  <CustomFileComponent
                    href={user.organisation?.license.url || ""}
                    text={"License"}
                    type={fileType.PDF}
                  />
                </div>
                <div className="my-2 flex flex-row items-center gap-4">
                  <div className="font-medium text-white">Permit:</div>
                  <CustomFileComponent
                    href={user.organisation?.permit.url || ""}
                    text={"Permit"}
                    type={fileType.PDF}
                  />
                </div>
                <div className="my-2 flex flex-row items-center gap-4">
                  <div className="font-medium text-white">Address:</div>
                  <CustomFileComponent
                    href={user.organisation?.addressProof.url || ""}
                    text={"Address"}
                    type={fileType.PDF}
                  />
                </div>
                <div className="my-2 flex flex-row items-center gap-4">
                  <div className="font-medium text-white">Phone:</div>
                  <div>{user.organisation?.phone}</div>
                </div>
                {user.organisation?.role === "HOSPITAL" && (
                  <>
                    {isPatient && (
                      <>
                        <button
                          className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
                          onClick={(e) =>
                            otpMutation.mutate({ email: ctxUser.email })
                          }
                          disabled={isRequested?.status}
                        >
                          Request for Tests
                        </button>
                        {otpErrors && (
                          <p className="text-xs text-red-500">{otpErrors}</p>
                        )}
                      </>
                    )}
                  </>
                )}
                {user.organisation?.role === "INSURANCE" && (
                  <>
                    {isPatient && (
                      <>
                        <button
                          className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
                          onClick={(e) =>
                            insureOtpMutation.mutate({ email: ctxUser.email })
                          }
                          disabled={unclaimedBills?.length === 0}
                        >
                          Claim Refund
                        </button>
                        {otpErrors && (
                          <p className="text-xs text-red-500">{otpErrors}</p>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <></>
            )}
          </div>
          {payment && (
            <>
              {user.individual?.role === "HEALTHCARE" && (
                <>
                  <div className=" my-10 flex w-1/3 flex-col gap-4 rounded-xl bg-indigo-600/50 p-10 px-10 text-gray-200">
                    <h3 className="text-2xl font-medium">Payment Summary</h3>
                    <div className="flex flex-row gap-2">
                      <div className="font-medium text-indigo-500">Amount:</div>
                      <div>200</div>
                    </div>
                    <label className="flex flex-col gap-2 text-sm">
                      Please enter the OTP sent to your mail:
                      <input
                        className="rounded-lg py-2 px-2 text-black"
                        type="text"
                        onChange={(e) => setotp(e.target.value)}
                      />
                    </label>
                    {errors && <p className="text-xs text-red-500">{errors}</p>}
                    <button
                      className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
                      onClick={(e) =>
                        transact.mutate({
                          amount: 200,
                          otp,
                          userId: userId.toString(),
                        })
                      }
                    >
                      Pay
                    </button>
                    <button
                      className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
                      onClick={(e) => setPayment(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
              {user.organisation?.role === "HOSPITAL" && (
                <>
                  <div className=" my-10 flex w-1/3 flex-col gap-4 rounded-xl bg-indigo-600/50 p-10 px-10 text-gray-200">
                    <h3 className="text-2xl font-medium">Payment Summary</h3>
                    <div className="flex flex-row gap-2">
                      <div className="font-medium text-indigo-500">Amount:</div>
                      <div>200</div>
                    </div>
                    <label className="flex flex-col gap-2 text-sm">
                      Please enter the OTP sent to your mail:
                      <input
                        className="rounded-lg py-2 px-2 text-black"
                        type="text"
                        onChange={(e) => setotp(e.target.value)}
                      />
                    </label>
                    {errors && <p className="text-xs text-red-500">{errors}</p>}
                    <button
                      className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
                      onClick={(e) =>
                        transactForBills.mutate({
                          amount: 200,
                          otp,
                          userId: userId.toString(),
                        })
                      }
                    >
                      Pay
                    </button>
                    <button
                      className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
                      onClick={(e) => setPayment(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </>
          )}
          {refund && (
            <>
              {user.organisation?.role === "INSURANCE" && (
                <>
                  <div className=" my-10 flex w-1/3 flex-col gap-4 rounded-xl bg-indigo-600/50 p-10 px-10 text-gray-200">
                    <h3 className="text-2xl font-medium">Claim Summary</h3>
                    <div className="flex flex-row gap-2">
                      <div className="font-medium text-indigo-500">Amount:</div>
                      <div>200</div>
                    </div>
                    <label htmlFor="Bills" className="flex gap-8">
                      Bills
                      <select
                        className="rounded-xl bg-indigo-600/80 text-gray-200"
                        onChange={(e) => setBillId(e.target.value)}
                      >
                        {unclaimedBills?.map((bill: any, i) => (
                          <option key={i} value={bill.id}>
                            {`${
                              bill.organisation.name
                            } (${bill.file.createdAt.toLocaleDateString()})`}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-sm">
                      Please enter the OTP sent to your mail:
                      <input
                        className="rounded-lg py-2 px-2 text-black"
                        type="text"
                        onChange={(e) => setotp(e.target.value)}
                      />
                    </label>
                    {errors && <p className="text-xs text-red-500">{errors}</p>}
                    <button
                      className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
                      onClick={(e) =>
                        insureTransact.mutate({
                          amount: 200,
                          otp,
                          userId: userId.toString(),
                          billId: billId,
                        })
                      }
                    >
                      Get Refund
                    </button>
                    <button
                      className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
                      onClick={(e) => setPayment(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
              {user.organisation?.role === "HOSPITAL" && (
                <>
                  <div className=" my-10 flex w-1/3 flex-col gap-4 rounded-xl bg-indigo-600/50 p-10 px-10 text-gray-200">
                    <h3 className="text-2xl font-medium">Payment Summary</h3>
                    <div className="flex flex-row gap-2">
                      <div className="font-medium text-indigo-500">Amount:</div>
                      <div>200</div>
                    </div>
                    <label className="flex flex-col gap-2 text-sm">
                      Please enter the OTP sent to your mail:
                      <input
                        className="rounded-lg py-2 px-2 text-black"
                        type="text"
                        onChange={(e) => setotp(e.target.value)}
                      />
                    </label>
                    {errors && <p className="text-xs text-red-500">{errors}</p>}
                    <button
                      className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
                      onClick={(e) =>
                        transactForBills.mutate({
                          amount: 200,
                          otp,
                          userId: userId.toString(),
                        })
                      }
                    >
                      Pay
                    </button>
                    <button
                      className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
                      onClick={(e) => setPayment(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Layout>
    );
  }

  return <></>;
};

export default UserPage;
