
import React from 'react';
import { Routes, Route } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import bankRoutes from './bankRoute';
import PurchaseGSTRoutes from '../pages/PurchaseGST';
import SaleGSTRoutes from '../pages/SaleGST';
import PurchaseTDSRoutes from '../pages/PurchaseTDS';
import SaleTDSRoutes from '../pages/SaleTDS';
import BankRoutes from '../pages/Bank';
import { useAuth } from '@igblsln/store';

const Main = () => {
  const auth = useAuth()
  const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

  return (
    <Routes>
      <Route path="/" element={<ModuleLayout navItems={bankRoutes} />}>
        <Route index />
        {BankRoutes}
        <Route path=":page/comming-soon" element={<ComingSoon />} />
        <Route path="*" element={<NoMatch relative />} />
      </Route>
      {
        // accessiblePages.includes(ACCESS_NAME) ?
        true ?
          // <Route path="/" element={<ModuleLayout panelMenu navItems={routes} />}>
          <Route path="/" element={<ModuleLayout navItems={routes} />}>
            <Route index />
            {PurchaseGSTRoutes}
            {SaleGSTRoutes}
            {PurchaseTDSRoutes}
            {SaleTDSRoutes}
            <Route path=":page/comming-soon" element={<ComingSoon />} />
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
