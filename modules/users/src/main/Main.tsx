import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import UserRoutes from '../pages/Users';
import RoleRoutes from '../pages/Roles';
import { PAGE_ROUTE } from '../pages/Users/constants';
import { useAuth } from '@igblsln/store';
import CompanyRoutes from '../pages/Company';
import ClientRoutes from '../pages/Client';
import BankRoutes from '../pages/Bank';
import StaffRoutes from '../pages/Staff';
import PayslipRoutes from '../pages/Payslip';
import { ACCESS_NAME } from '../constants';

const Main = () => {
  const auth = useAuth()
  const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

  return (
    <Routes>
      {
        // true ?
        auth.user?.role[0]?.name?.toLowerCase().includes("admin") ?
          <Route path="/" element={<ModuleLayout navItems={routes} />}>
            <Route index element={<Navigate to={PAGE_ROUTE} replace />} />
            {UserRoutes}
            {RoleRoutes}
            {CompanyRoutes}
            {ClientRoutes}
            {BankRoutes}
            {StaffRoutes}
            {PayslipRoutes}
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
