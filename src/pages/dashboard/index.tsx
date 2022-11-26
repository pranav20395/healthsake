import type { NextPage } from "next";
import Layout from "../../client/Layout";
import React, { FC, useState } from "react";
import router, { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import { useUserContext } from "@/context/user.context";
import Link from "next/link";
import { UserProps } from "@/types/user";

type UserDisplayProps = {
  user: UserProps;
};

const UserDisplayComponent: FC<UserDisplayProps> = ({ user }) => {
  let bgColor = "bg-gray-700";
  let statusColor = "bg-yellow-500";

  if (user.status === "PENDING") {
    bgColor = "bg-gray-700";
    statusColor = "bg-yellow-500";
  }
  if (user.status === "APPROVED") {
    bgColor = "bg-green-900";
    statusColor = "bg-green-500";
  }
  if (user.status === "REJECTED") {
    bgColor = "bg-red-700/80";
    statusColor = "bg-red-500";
  }

  const ctxUser = useUserContext();

  const changeStatus = trpc.admin.changeUserStatus.useMutation({
    onSuccess: () => router.push("/dashboard"),
  });

  const approveUser = () => {
    changeStatus.mutate({
      userId: user.id,
      userStatus: "APPROVED",
      userVerified: true,
    });
  };

  const rejectUser = () => {
    changeStatus.mutate({
      userId: user.id,
      userStatus: "REJECTED",
      userVerified: false,
    });
  };

  return (
    <a
      href={`/user/${user.id}`}
      key={user.id}
      className={
        "border-gray-10 flex justify-between rounded-2xl border-2 p-6 text-indigo-400 " +
        bgColor
      }
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <div
            className={
              "rounded-full bg-yellow-500 px-2 text-sm font-bold lowercase text-white " +
              statusColor
            }
          >
            {user.status}
          </div>
          {user.type === "INDIVIDUAL" ? (
            <div className="rounded-full bg-cyan-500 px-2 text-sm font-bold lowercase text-white">
              {user.individual?.role}
            </div>
          ) : (
            <></>
          )}
          {user.type === "ORGANIZATION" ? (
            <div className="rounded-full bg-purple-500 px-2 text-sm font-bold lowercase text-white">
              {user.organisation?.role}
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="flex flex-row gap-2">
          <div className="font-medium text-white">Name:</div>
          <div>{user.name}</div>
        </div>
        <div className="flex flex-row gap-2">
          <div className="font-medium text-white">Email:</div>
          <div>{user.email}</div>
        </div>
      </div>
      {user.status === "PENDING" && ctxUser.type === "ADMIN" && (
        <div className="flex flex-col gap-2">
          <button
            className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
            onClick={approveUser}
          >
            Approve
          </button>
          <button
            className="rounded-xl bg-red-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
            onClick={rejectUser}
          >
            Deny
          </button>
        </div>
      )}
      {user.status === "APPROVED" &&
        ctxUser.type === "ADMIN" &&
        user.type !== "ADMIN" && (
          <div className="flex flex-row gap-2">
            <button
              className="rounded-xl bg-red-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
              onClick={rejectUser}
            >
              Remove
            </button>
          </div>
        )}
      {user.status === "REJECTED" && ctxUser.type === "ADMIN" && (
        <button
          className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
          onClick={approveUser}
        >
          Approve
        </button>
      )}
    </a>
  );
};

const Home: NextPage = () => {
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [query, setQuery] = useState("");

  const { data: allHealthCareAndOrganisations } =
    trpc.user.allHealthCareAndOrganisations.useQuery();

  const data = allHealthCareAndOrganisations?.result;

  if (ctxUser.type === "ADMIN") {
    const { data: pendingUsers } =
      trpc.admin.allUsersPendingVerification.useQuery();

    const { data: verifiedUsers } = trpc.admin.allApprovedUsers.useQuery();

    const { data: rejectedUsers } = trpc.admin.allRejectedUsers.useQuery();

    const { data: userLogs } = trpc.admin.getLogs.useQuery();

    console.log(userLogs);

    return (
      <Layout title={"Dashboard"}>
        <div className="mx-auto flex w-11/12 flex-col gap-10 pt-6 text-blue-500">
          <h1 className="my-10 text-4xl font-medium text-gray-200">
            Welcome, {ctxUser.name}
          </h1>
          {/*Admin Page*/}
          {ctxUser.type === "ADMIN" && (
            <div className=" flex flex-col gap-4">
              <h2 className="text-2xl font-medium text-gray-200">
                Admin Panel
              </h2>
              <div className="flex w-full justify-between gap-4">
                <div className="flex h-[70vh] w-1/2 flex-col gap-4 overflow-auto 2xl:w-2/5">
                  <h3 className="text-xl font-medium text-gray-200">
                    Approval Requesting Users
                  </h3>
                  <div className="flex flex-col gap-4">
                    {pendingUsers &&
                      pendingUsers.result.map((user: any) => {
                        if (user.status === "PENDING") {
                          return (
                            <UserDisplayComponent key={user.id} user={user} />
                          );
                        }
                        return <></>;
                      })}
                  </div>
                  <h3 className="text-xl font-medium text-gray-200">
                    Active Users
                  </h3>
                  <div className="flex flex-col gap-4">
                    {verifiedUsers &&
                      verifiedUsers.result.map((user: any) => {
                        if (user.status === "APPROVED") {
                          return (
                            <UserDisplayComponent key={user.id} user={user} />
                          );
                        }
                        return <></>;
                      })}
                  </div>
                  <h3 className="text-xl font-medium text-gray-200">
                    Banned Users
                  </h3>
                  <div className="flex flex-col gap-4">
                    {rejectedUsers &&
                      rejectedUsers.result.map((user: any) => {
                        if (user.status === "REJECTED") {
                          return (
                            <UserDisplayComponent key={user.id} user={user} />
                          );
                        }
                        return <></>;
                      })}
                  </div>
                </div>
                <div className="flex w-5/12 flex-col gap-2">
                  <h3 className="text-xl font-medium text-gray-200">
                    User Activity Log
                  </h3>
                  <div className="flex h-[70vh] flex-col gap-4 overflow-auto rounded-lg border-2 border-white bg-black p-4 text-sm">
                    {userLogs &&
                      userLogs.map((log) => {
                        return (
                          <div className="flex flex-col gap-1" key={log.id}>
                            <div className="font-medium text-green-600">
                              <div>{log.timestamp.toLocaleString()}</div>
                            </div>
                            <div className="flex flex-row gap-2">
                              <div className="font-medium text-white">
                                User:
                              </div>
                              <div>{log.type}</div>
                            </div>
                            <div className="flex flex-row gap-2">
                              <div className="font-medium text-white">
                                Action:
                              </div>
                              <div>{log.action}</div>
                            </div>
                            <div className="flex flex-row gap-2">
                              <div className="font-medium text-white">
                                Status:
                              </div>
                              <div>{log.value}</div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={"Dashboard"}>
      <div className="mx-auto flex w-11/12 flex-col gap-10 pt-6 text-blue-500">
        <h1 className="my-10 text-4xl font-medium text-gray-200">
          Welcome, {ctxUser.name}
        </h1>
        <div className="relative mx-auto w-2/3">
          {/*Search Bar*/}
          <label className="flex items-center gap-4 text-xl">
            Search:
            <input
              className="w-full rounded-lg py-2 px-4 text-lg text-black"
              type="text"
              placeholder="Healthcare professionals and Organizations"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {/*Search Results*/}
          <div
            className={
              "absolute right-0 mt-2 flex w-full flex-col items-center" +
              (query === "" ? "hidden" : "")
            }
          >
            {data &&
              data
                .filter((user) => {
                  if (query === "") {
                    return null;
                  } else if (
                    user.name.toLowerCase().includes(query.toLowerCase())
                  ) {
                    return user;
                  }
                })
                .map((user: any) => (
                  <a
                    href={`/user/${user.id}`}
                    key={user.id}
                    className="flex w-full flex-col gap-2 border-2 border-gray-200 bg-gray-500 p-6 text-indigo-600"
                  >
                    <div className="flex flex-row gap-2">
                      <div className="font-medium text-black">Name:</div>
                      <div>{user.name}</div>
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="font-medium text-black">Email:</div>
                      <div>{user.email}</div>
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="font-medium text-black">Status:</div>
                      <div>{user.status}</div>
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="font-medium text-black">Type:</div>
                      <div>{user.type}</div>
                    </div>
                    {user.type === "INDIVIDUAL" ? (
                      <>
                        <div className="flex flex-row gap-2">
                          <div className="font-medium text-black">Role:</div>

                          <div>{user.individual?.role}</div>
                        </div>
                        <div className="flex flex-row gap-2">
                          <div className="font-medium text-black">Image:</div>

                          <Link
                            target={"_blank"}
                            href={user.individual?.image || ""}
                          >
                            {user.individual?.image || ""}
                          </Link>
                        </div>
                        <div className="flex flex-row gap-2">
                          <div className="font-medium text-black">
                            Identity Proof:
                          </div>

                          <Link
                            target={"_blank"}
                            href={user.individual?.identity || ""}
                          >
                            {user.individual?.identity || ""}
                          </Link>
                        </div>
                        <div className="flex flex-row gap-2">
                          <div className="font-medium text-black">
                            Address Proof:
                          </div>

                          <Link
                            target={"_blank"}
                            href={user.individual?.address || ""}
                          >
                            {user.individual?.address || ""}
                          </Link>
                        </div>

                        {user.individual?.role === "HEALTHCARE" && (
                          <div className="flex flex-row gap-2">
                            <div className="font-medium text-black">
                              Health License:
                            </div>

                            <Link
                              target={"_blank"}
                              href={user.individual?.healthLicense || ""}
                            >
                              {user.individual?.healthLicense || ""}
                            </Link>
                          </div>
                        )}
                      </>
                    ) : (
                      <></>
                    )}
                    {user.type === "ORGANIZATION" ? (
                      <>
                        <div className="flex flex-row gap-2">
                          <div className="font-medium text-black">Role:</div>
                          <div>{user.organisation?.role}</div>
                        </div>
                        <div className="flex flex-row gap-2">
                          <div className="font-medium text-black">Image1:</div>
                          <Link
                            target={"_blank"}
                            href={user.organisation?.image1 || ""}
                          >
                            {user.organisation?.image1 || ""}
                          </Link>
                        </div>
                        <div className="flex flex-row gap-2">
                          <div className="font-medium text-black">Image2:</div>
                          <Link
                            target={"_blank"}
                            href={user.organisation?.image2 || ""}
                          >
                            {user.organisation?.image2 || ""}
                          </Link>
                        </div>
                        <div className="flex flex-row gap-2">
                          <div className="font-medium text-black">License:</div>
                          <Link
                            target={"_blank"}
                            href={user.organisation?.license || ""}
                          >
                            {user.organisation?.license || ""}
                          </Link>
                        </div>
                        <div className="flex flex-row gap-2">
                          <div className="font-medium text-black">Permit:</div>
                          <Link
                            target={"_blank"}
                            href={user.organisation?.permit || ""}
                          >
                            {user.organisation?.permit || ""}
                          </Link>
                        </div>
                        <div className="flex flex-row gap-2">
                          <div className="font-medium text-black">
                            Location:
                          </div>
                          <Link
                            target={"_blank"}
                            href={user.organisation?.location || ""}
                          >
                            {user.organisation?.location || ""}
                          </Link>
                        </div>
                        <div className="flex flex-row gap-2">
                          <div className="font-medium text-black">Phone:</div>
                          <div>{user.organisation?.phone}</div>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </a>
                ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
