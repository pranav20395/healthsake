import {FC} from "react";

interface SideBarLinkProps {
    href: string;
    children: string;

}

const SideBarLink: FC<SideBarLinkProps> = ({href, children}) => {
    return (
        <a
            className="rounded-r-full pl-20 p-3 px-8 text-sm transition-all ease-in-out hover:bg-indigo-600 hover:text-white hover:shadow-2xl"
            href={href}
        >
            {children}
        </a>
    );
};

export default SideBarLink;
