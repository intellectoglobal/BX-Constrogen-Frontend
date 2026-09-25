
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import VendorInvoiceRoutes from '../pages/VendorInvoice';
import ContractorInvoiceRoutes from '../pages/ContractorInvoice';
import GSTInvoiceRoutes from '../pages/GSTInvoice';
import TDSInvoiceRoutes from '../pages/TDSInvoice';
import SalaryInvoiceRoutes from '../pages/SalaryInvoice';
import { ACCESS_NAME, MODULE_NAME } from '../constants';
import { useAuth } from '@igblsln/store';

const Main = () => {
  const auth = useAuth()
  const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

  return (
    <Routes>
      {
        // accessiblePages.includes(ACCESS_NAME) ?
        true ?
          <Route path="/" element={<ModuleLayout navItems={routes} />}>
            <Route index element={<Navigate to="vendorinvoice" replace />} />
            {VendorInvoiceRoutes}
            {ContractorInvoiceRoutes}
            {GSTInvoiceRoutes}
            {TDSInvoiceRoutes}
            {SalaryInvoiceRoutes}
            <Route path=":invoice/comming-soon" element={<ComingSoon />} />
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
