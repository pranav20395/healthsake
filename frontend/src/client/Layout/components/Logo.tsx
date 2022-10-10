import { FC } from "react";
import stethoscope from "./../../../assets/icons/stethoscope.svg";
const Logo: FC = () => {
    return (
        <a href="/" className="flex flex-col justify-center gap-4">
            <img src={stethoscope} alt="stethoscope" className="h-24" />
            <h1 className=" font-bold text-2xl">HealthSake</h1>
        </a>
    );
};

export default Logo;
