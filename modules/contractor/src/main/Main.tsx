
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import ContractRoutes from '../pages/Contract';
import ContractorRoutes from '../pages/Contractor';
import ContractTypeRoutes from '../pages/ContractorType';
import ContractGroupRoutes from '../pages/ContractorGroup';
import APTermRoutes from '../pages/APTerm';
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
        <Route index element={<Navigate to={PAGE_ROUTE} replace />} />
        {ContractRoutes}
        {ContractorRoutes}
        {ContractTypeRoutes}
        {ContractGroupRoutes}
        {APTermRoutes}
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
