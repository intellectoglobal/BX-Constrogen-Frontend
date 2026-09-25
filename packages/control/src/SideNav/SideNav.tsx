import React from 'react';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';


type Props = {
    width?: string;
    className?: string;
    items: MenuItem[]
}

const SideNav = ({ items, className = "body-static-height" }: Props) => {

    return (
        <div className={className}>
            <Menu model={items} style={{ width: '100%' }} className="pl-2" />
        </div>
    )
}

export default SideNav