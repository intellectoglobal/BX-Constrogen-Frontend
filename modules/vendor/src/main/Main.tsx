
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import VendorTypeRoutes from '../pages/VendorType';
import VendorGroupRoutes from '../pages/VendorGroup';
import APTermRoutes from '../pages/APTerm';
import VendorRoutes from '../pages/Vendor';
import VendorInvoiceRoutes from '../pages/VendorInvoice';
import { useAuth } from '@igblsln/store';
import { ACCESS_NAME } from '../constants';

const Main = () => {
  const auth = useAuth()
  const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

  return (
    <Routes>
      {
        accessiblePages.includes(ACCESS_NAME) ?
      <Route path="/" element={<ModuleLayout navItems={routes} />}>
        <Route index element={<Navigate to="vendor" replace />} />
        {VendorTypeRoutes}
        {VendorGroupRoutes}
        {APTermRoutes}
        {VendorRoutes}
        {VendorInvoiceRoutes}
        <Route path=":purchase/comming-soon" element={<ComingSoon />} />
        <Route path="*" element={<NoMatch relative />} />
        </Route>
          :
          <Route path="/" element={<ModuleLayout navItems={routes} />}>
            <Route path="*" element={<Restricted relative />} />
          </Route>
      }
    </Routes>

  );
}

export default Main;
