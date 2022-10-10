import { FC } from "react";

interface SideBarLinkProps {
    href: string;
    children: string;
    icon: JSX.Element;
}

const SideBarLink: FC<SideBarLinkProps> = ({ href, children, icon }) => {
    return (
        <a
            className="ease-in-out transition-all hover:bg-[#545FDC] hover:text-white p-3 text-sm rounded-xl hover:shadow-2xl flex items-center gap-3"
            href={href}
        >
            {icon}
            {children}
        </a>
    );
};

export default SideBarLink;
