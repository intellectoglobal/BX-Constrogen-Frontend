import React, { useState } from 'react'
import { Outlet } from "react-router-dom";
import { Splitter, SplitterPanel } from 'primereact/splitter';
import SideNav from '../SideNav';
import PanelMenu from '../PanelMenu';
import Loader from '../Loader';
import { MenuItem } from 'primereact/menuitem';
import { Sidebar } from 'primereact/sidebar';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Button } from 'primereact/button';
import { currentPaymentMenu, useAppSelector } from '@igblsln/store';

type Props = {
    navItems: MenuItem[],
    panelMenu?: Boolean
}

function expandNavItems(items: MenuItem[], targetId: string): MenuItem[] {
    return items.map((item: MenuItem) => {
        let newItem: MenuItem = { ...item };

        // If this item's ID matches the target, expand it
        if (newItem.id === targetId) {
            newItem.expanded = true;
        }

        // If it has nested items, recurse
        if (newItem.items && newItem.items.length > 0) {
            newItem.items = expandNavItems(newItem.items as MenuItem[], targetId);

            // Optional: auto-expand parents if a child is expanded
            if (newItem.items.some((child: MenuItem) => child.expanded)) {
                newItem.expanded = true;
            }
        }

        return newItem;
    });
}

const ModuleLayout = ({ navItems, panelMenu = false }: Props) => {
    const paymentMenu = useAppSelector(currentPaymentMenu);
    let customNavItems = [...navItems]; 
    
    if (panelMenu) {
        customNavItems = expandNavItems(navItems, paymentMenu)
        console.log(customNavItems)
    }
    
    const [visibleLeftPane, setVisibleLeftPane] = useState(false);
    return (
        <Splitter style={{ height: 'calc(100vh - 58px)' }} >
            <ScrollPanel className="block lg:hidden left-scroll-panel">
                <Button icon="pi pi-angle-right" className="p-button-rounded p-button-outlined left-pane-expand-button" aria-label="Expand"
                    onClick={() => setVisibleLeftPane(!visibleLeftPane)} />
                <Sidebar visible={visibleLeftPane} onHide={() => setVisibleLeftPane(false)} style={{ top: 55, width: '17rem' }}>
                    {
                        panelMenu ?
                            <PanelMenu items={customNavItems} className="side-nav-static-height" /> :
                            <SideNav items={customNavItems} className="side-nav-static-height" />
                    }
                </Sidebar>
            </ScrollPanel>
            <SplitterPanel size={20} minSize={20} className="hidden lg:block">
                {
                    panelMenu ?
                        <PanelMenu items={customNavItems} /> :
                        <SideNav items={customNavItems} />
                }

            </SplitterPanel>
            <SplitterPanel size={80} minSize={60}>
                <div className='card body-static-height'>
                    <React.Suspense fallback={<Loader />}>
                        <Outlet />
                    </React.Suspense>
                </div>
            </SplitterPanel>
        </Splitter>
    )
}

export default ModuleLayout