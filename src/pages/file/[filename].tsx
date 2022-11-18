import Layout from "@/client/Layout";
import { useUserContext } from "@/context/user.context";
import { useRouter } from "next/router";

const FileName = () => {
  const router = useRouter();
  const ctxUser = useUserContext();

  if (!ctxUser) {
    router.push("/");
    return <></>;
  }

  const { filename } = router.query;

  if (!filename) {
    return <p>Loading..</p>;
  }

  const fileLink = `/api/file?filename=${filename}`;

  return (
    <Layout title={filename}>
      <div className="flex h-screen items-center justify-around gap-10 px-16">
        <h1 className="w-1/2 text-lg font-bold">
          Filename: <span className="text-md font-normal">{filename}</span>
        </h1>
        <iframe src={fileLink} width="800" height="1000" />
      </div>
    </Layout>
  );
};

export default FileName;
