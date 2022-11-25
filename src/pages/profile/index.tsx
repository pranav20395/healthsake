import type { NextPage } from "next";
import Layout from "../../client/Layout";
import React from "react";
import { useUserContext } from "@/context/user.context";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import Link from "next/link";

const Profile: NextPage = () => {
  const router = useRouter();

  const ctxUser = useUserContext();

  if (!ctxUser) {
    router.push("/");
  }

  const { data: datasd, isLoading, error } = trpc.user.profile.useQuery();

  const data: any = datasd;

  data && console.log(data.result);

  return (
    <Layout title={"Profile"}>
      <section className="mx-auto flex w-full flex-col items-start justify-center p-6 text-2xl">
        <h1 className="my-10 text-4xl font-medium text-gray-200">Profile</h1>
        {isLoading && <p>Loading...</p>}
        {error && <p>{error.message}</p>}
        <div>
          {data ? (
            <div>
              <div className="mb-8 w-full border-b-2 border-b-gray-500 pb-4">
                Name: {data.result.name}
              </div>
              <div className="mb-8 w-full border-b-2 border-b-gray-500 pb-4">
                Email: {data.result.email}
              </div>
              <div className="mb-8 w-full border-b-2 border-b-gray-500 pb-4">
                Role: {data.result.type}
              </div>
              {data.result.indID ? (
                <>
                  <div className="mb-8 w-full border-b-2 border-b-gray-500 pb-4">
                    Image: {data.result.individual.image}
                  </div>
                  <div className="mb-8 w-full border-b-2 border-b-gray-500 pb-4">
                    Identity: {data.result.individual.identity}
                  </div>
                  <div className="mb-8 w-full border-b-2 border-b-gray-500 pb-4">
                    Address: {data.result.individual.address}
                  </div>
                  {data.result.individual?.healthLicense ? (
                    <div className="mb-8 w-full border-b-2 border-b-gray-500 pb-4">
                      Health License: {data.result.individual.healthLicense}
                    </div>
                  ) : null}
                </>
              ) : null}
              {data.result.orgId ? (
                <>
                  <div className="mb-8 w-full border-b-2 border-b-gray-500 pb-4">
                    Images:{" "}
                    {data.result.updatedOrg.imageFileDetails.map(
                      (image: any) => (
                        <>
                          <Link key={image.fileId} href={image.url}>
                            <span className="cursor-pointer text-lg text-indigo-600">
                              {image.url}
                            </span>
                          </Link>
                          <br />
                        </>
                      )
                    )}
                  </div>
                  <div className="mb-8 w-full border-b-2 border-b-gray-500 pb-4">
                    Address:{" "}
                    <Link href={data.result.updatedOrg.addressProof.url}>
                      <span className="cursor-pointer text-lg text-indigo-600">
                        {data.result.updatedOrg.addressProof.url}
                      </span>
                    </Link>
                  </div>
                  <div className="mb-8 w-full border-b-2 border-b-gray-500 pb-4">
                    License:{" "}
                    <Link href={data.result.updatedOrg.license.url}>
                      <span className="cursor-pointer text-lg text-indigo-600">
                        {data.result.updatedOrg.license.url}
                      </span>
                    </Link>
                  </div>
                  <div className="mb-8 w-full border-b-2 border-b-gray-500 pb-4">
                    Permit:{" "}
                    <Link href={data.result.updatedOrg.permit.url}>
                      <span className="cursor-pointer text-lg text-indigo-600">
                        {data.result.updatedOrg.permit.url}
                      </span>
                    </Link>
                  </div>
                  <div className="mb-8 w-full border-b-2 border-b-gray-500 pb-4">
                    Phone: {data.result.updatedOrg.phone}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        <Link href={"/profile/edit"}>
          <button className="rounded-xl bg-indigo-600 p-3 px-8 text-sm transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900">
            Edit Profile
          </button>
        </Link>
      </section>
    </Layout>
  );
};

export default Profile;
