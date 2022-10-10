import { FC } from "react";
import viteLogo from "./../../../assets/vite.svg";

const Profile: FC = () => {
    return (
        <section className="flex flex-row justify-start items-center w-5/6">
            <img
                src={viteLogo}
                alt="profile"
                className="rounded-full h-8 w-8"
            />
            <h1 className="font-bold text-md ml-2 opacity-50">John Doe</h1>
        </section>
    );
};

export default Profile;
