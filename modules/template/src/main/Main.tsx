
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import ContractServiceTemplateRoutes from '../pages/ContractService';
import PaymentScheduleTemplateRoutes from '../pages/PaymentSchedule';
import CustomerPaymentScheduleRoutes from '../pages/CustomerPaymentSchedule';
import ItemKitTemplateRoutes from '../pages/ItemKit';
import { PAGE_ROUTE } from '../pages/ContractService/constants';
import { useAuth } from '@igblsln/store';


const Main = () => {
  const auth = useAuth()
  const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

  return (
    <Routes>
      <Route path="/" element={<ModuleLayout navItems={routes} />}>
        <Route index element={<Navigate to={PAGE_ROUTE} replace />} />
        {ContractServiceTemplateRoutes}
        {PaymentScheduleTemplateRoutes}
        {CustomerPaymentScheduleRoutes}
        {ItemKitTemplateRoutes}
        <Route path=":page/comming-soon" element={<ComingSoon />} />
        <Route path="*" element={<NoMatch relative />} />
      </Route>

    </Routes>

  );
}

export default Main;
