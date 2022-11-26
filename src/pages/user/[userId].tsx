import { useRouter } from "next/router";
import Layout from "@/client/Layout";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useUserContext } from "@/context/user.context";
import Image from "next/image";

const Post = () => {
  const router = useRouter();
  const ctxUser = useUserContext();

  if (!ctxUser) {
    router.push("/");
    return <></>;
  }

  const { userId } = router.query;

  if (!userId) {
    return <p>Loading..</p>;
  }

  const { data } = trpc.user.userDetails.useQuery({
    userId: userId.toString(),
  });

  if (data) {
    const user = data.result;

    if (ctxUser.type !== "ADMIN") {
      if (user.type === "INDIVIDUAL" && user.individual.role === "PATIENT") {
        router.push("/dashboard");
      }
      if (user.status !== "APPROVED") {
        router.push("/dashboard");
      }
    }
    console.log(user);

    return (
      <Layout title={"userId"}>
        <div className=" relative h-60 w-full object-cover">
          <Image
            src="https://random.imagecdn.app/1500/300"
            alt="cover photo"
            layout="fill"
          />
        </div>

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
              <div className="flex flex-row gap-2">
                <div className="font-medium text-white">Image:</div>
                <Link target={"_blank"} href={user.individual?.image.url || ""}>
                  {user.individual?.image.url || ""}
                </Link>
              </div>
              {ctxUser.type === "ADMIN" && (
                <>
                  <div className="flex flex-row gap-2">
                    <div className="font-medium text-white">
                      Identity Proof:
                    </div>
                    <Link target={"_blank"} href={user.individual?.url || ""}>
                      {user.individual?.identity.url || ""}
                    </Link>
                  </div>
                  <div className="flex flex-row gap-2">
                    <div className="font-medium text-white">Address Proof:</div>
                    <Link
                      target={"_blank"}
                      href={user.individual?.address.url || ""}
                    >
                      {user.individual?.address.url || ""}
                    </Link>
                  </div>
                </>
              )}
              {user.individual?.role === "HEALTHCARE" && (
                <div className="flex flex-row gap-2">
                  <div className="font-medium text-white">Health License:</div>
                  <Link
                    target={"_blank"}
                    href={user.individual?.license.url || ""}
                  >
                    {user.individual?.license.url || ""}
                  </Link>
                </div>
              )}
            </>
          ) : (
            <></>
          )}
          {user.type === "ORGANIZATION" || user.type === "ORGANISATION" ? (
            <>
              <div className="flex flex-row gap-2">
                <div className="rounded-full bg-purple-500 px-2 text-sm font-bold lowercase text-white">
                  {user.organisation?.role}
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <div className="font-medium text-white">Email:</div>
                <div>{user.email}</div>
              </div>
              <div className="flex flex-row gap-2">
                <div className="font-medium text-white">Images:</div>
                <div>
                  {user.organisation.imageFileDetails.map((image: any) => (
                    <>
                      <Link key={image.fileId} href={image.url}>
                        {image.url}
                      </Link>
                      <br />
                    </>
                  ))}
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <div className="font-medium text-white">License:</div>
                <Link
                  target={"_blank"}
                  href={user.organisation?.license.url || ""}
                >
                  {user.organisation?.license.url || ""}
                </Link>
              </div>
              <div className="flex flex-row gap-2">
                <div className="font-medium text-white">Permit:</div>
                <Link
                  target={"_blank"}
                  href={user.organisation?.permit.url || ""}
                >
                  {user.organisation?.permit.url || ""}
                </Link>
              </div>
              <div className="flex flex-row gap-2">
                <div className="font-medium text-white">Address:</div>
                <Link
                  target={"_blank"}
                  href={user.organisation?.addressProof.url || ""}
                >
                  {user.organisation?.addressProof.url || ""}
                </Link>
              </div>
              <div className="flex flex-row gap-2">
                <div className="font-medium text-white">Phone:</div>
                <div>{user.organisation?.phone}</div>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </Layout>
    );
  }

  return <></>;
};

export default Post;
