
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import ContractRoutes from '../pages/Contract';
import ContractAgreementRoutes from '../pages/ContractAgreement';
import ContractTypeRoutes from '../pages/ContractorType';
import ContractGroupRoutes from '../pages/ContractorGroup';
import ContractorInvoiceRoutes from '../pages/ContractorInvoice';
import APTermRoutes from '../pages/APTerm';
import ContractorRoutes from '../pages/Contractor';
import ContractServiceTemplateRoutes from '../pages/ContractService';
import PaymentScheduleTemplateRoutes from '../pages/PaymentSchedule';
import { PAGE_ROUTE } from '../pages/Contract/constants';
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
        <Route index element={<Navigate to={"contractagreement"} replace />} />
        {ContractRoutes}
        {ContractTypeRoutes}
        {ContractGroupRoutes}
        {APTermRoutes}
        {ContractorInvoiceRoutes}
        {ContractAgreementRoutes}
        {ContractorRoutes}
        {ContractServiceTemplateRoutes}
        {PaymentScheduleTemplateRoutes}
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
