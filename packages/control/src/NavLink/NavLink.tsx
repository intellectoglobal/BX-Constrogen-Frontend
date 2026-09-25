import React from 'react'
import {
    Link,
    useMatch,
    useResolvedPath,
    useLocation
} from "react-router-dom";
import { useAuth } from '@igblsln/store';
import { classNames } from "primereact/utils";

type Props = {
    to: string;
    item: any;
    options: any;
}

const NavLink = ({ to, item, options }: Props) => {
    const auth = useAuth()
    let resolved = useResolvedPath(to);
    let location = useLocation()
    let match = useMatch({ path: resolved.pathname, end: false });

    const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

    const shouldDisplay = () => {
        //Temporary fow new changes
        return 'block'
        if (!!item?.command) {
            if (item?.label === "Users") {
                return auth.user?.role[0]?.name?.toLowerCase().includes("admin") ? 'block' : 'none'
            }
            //As Requested on 21.09.2023 - Change the word Inventory in the main menu to Material Item
            if (item.label == "Material Item") {
                return accessiblePages.includes("Inventory") ? 'block' : 'none'
            }
            if (item.label == "PO") {
                return accessiblePages.includes("Purchases") ? 'block' : 'none'
            }
            if (item.label == "Company") {
                return accessiblePages.includes("Clients") ? 'block' : 'none'
            }
            if (item.label == "Contract Agreement") {
                return 'block' 
            }


            return accessiblePages.includes(item?.label) ? 'block' : 'none'
        }
        else return 'block'
    }

    return (
        <Link
            style={{ textDecoration: "none", display: shouldDisplay() }}
            to={to}
            onClick={item.command}
            className={classNames(options.className, ((match || location.pathname?.includes(item?.altUrls)) ? 'p-menuitem-active' : ''))} target={item.target}
        >
            <span className={classNames(options.iconClassName)}></span>
            <span className={options.labelClassName}>{item.label}</span>
        </Link>
    )
}

export const templateFn = (to: string) => (item: any, options: any) => (<NavLink item={item} options={options} to={to} />)


export default NavLink;