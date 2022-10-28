import Link from "next/link";
import React, {FC} from "react";

interface buttonProps {
    text: string;
    href: string;
}

const CustomLink: FC<buttonProps> = ({text, href}) => {
    return (<Link href={href}><span
            className="cursor-pointer rounded-xl p-3 px-8 text-sm transition-all ease-in-out bg-indigo-600 hover:shadow-2xl">{text}</span></Link>
    )
}

export default CustomLink;