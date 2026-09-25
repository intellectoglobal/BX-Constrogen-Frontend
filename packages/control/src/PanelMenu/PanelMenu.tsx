import React from 'react';
import { PanelMenu } from 'primereact/panelmenu';


type Props = {
    width?: string;
    className?: string;
    items: any[]
}

const SideNavWithPanel = ({ items, className = "body-static-height" }: Props) => {
    return (
        <div className={className}>
            <PanelMenu model={items} style={{ width: '100%' }} className="pl-2" />
        </div>
    )
}

export default SideNavWithPanel