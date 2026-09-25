import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import routes2 from './routes2';
import CustomerRoutes from '../pages/Customers';
import SaleBookingRoutes from '../pages/SaleBooking';
import SaleAgreementRoutes from '../pages/SaleAgreement';
import SaleInvoiceRoutes from '../pages/SaleInvoice';
import ConstructionAgreementRoutes from '../pages/ConstructionAgreement';
import CustomerPaymentScheduleRoutes from '../pages/CustomerPaymentSchedule';
import { PAGE_ROUTE } from '../pages/Customers/constants';
import { useAuth } from '@igblsln/store';
import { ACCESS_NAME } from '../constants';

const Main = () => {
  const auth = useAuth()
  const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

  return (
    <Routes>
      {/* <Route path="/" element={<ModuleLayout navItems={routes2} />}>
        <Route index />
        {CustomerRoutes}
      </Route> */}
      {
        accessiblePages.includes(ACCESS_NAME) ?
          <Route path="/" element={<ModuleLayout navItems={routes} />}>
            <Route index />
            {SaleBookingRoutes}
            {SaleAgreementRoutes}
            {SaleInvoiceRoutes}
            {ConstructionAgreementRoutes}
            {CustomerRoutes}
            {CustomerPaymentScheduleRoutes}
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
