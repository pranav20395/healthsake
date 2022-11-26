import { FC } from "react";
import { trpc } from "@/utils/trpc";

const Profile: FC = () => {
  const { data, isLoading } = trpc.user.profile.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className="flex w-5/6 flex-row items-center justify-center">
      <h1 className="text-md text-center font-bold opacity-50">
        {data?.result.name}
      </h1>
    </section>
  );
};

export default Profile;
