import React, {FC} from "react";
import viteLogo from "./../../../assets/vite.svg";
import {useSession} from "next-auth/react";
import Image from "next/image";

const Profile: FC = () => {
    const {data} = useSession();
    return (
        <section className="flex flex-row justify-center items-center w-5/6">
            <div className="pr-3">
                <Image
                    src={viteLogo}
                    alt="profile"
                    className="rounded-full h-8 w-8"
                />
            </div>
            <h1 className="font-bold text-md opacity-50 text-center">{data?.user?.name}</h1>
        </section>
    );
};

export default Profile;
