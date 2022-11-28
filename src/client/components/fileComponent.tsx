import Link from "next/link";
import React, { FC } from "react";
import imgLogo from "@/assets/img.png";
import pdfLogo from "@/assets/pdf.png";
import Image from "next/image";

export enum fileType {
  IMG,
  PDF,
}

interface fileProps {
  text: string;
  href: string;
  type: fileType;
}

const CustomFileComponent: FC<fileProps> = ({ text, href, type }) => {
  const icon = type === fileType.IMG ? imgLogo : pdfLogo;
  const height = type === fileType.IMG ? 30 : 35;
  return (
    <Link href={href}>
      <div className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-gray-500 bg-white/20 p-2 px-5 text-white backdrop-blur-xl hover:border-gray-200">
        <Image src={icon} alt="Image Logo" height={height} width={30} />
        {text}
      </div>
    </Link>
  );
};

export default CustomFileComponent;
