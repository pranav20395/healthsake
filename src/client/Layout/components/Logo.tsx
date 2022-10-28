import {FC} from "react";
import stethoscope from "./../../../assets/icons/stethoscope.svg";
import Image from "next/image";
import Link from "next/link";

const Logo: FC = () => {
    return (
        <Link href="/">
            <div className="flex flex-col items-center gap-8 cursor-pointer">
                <Image src={stethoscope} alt="stethoscope" height={192}/>
                <h1 className=" font-bold text-2xl">HealthSake</h1>
            </div>
        </Link>
    );
};

export default Logo;
