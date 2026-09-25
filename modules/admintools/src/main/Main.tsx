
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import WorkCategory from '../pages/WorkCategory';
import WorkType from "../pages/WorkType";
import WorkActivity from "../pages/WorkActivity"
import { PAGE_ROUTE } from '../pages/WorkCategory/constants';
import { useAuth } from '@igblsln/store';


const Main = () => {
  const auth = useAuth()
  const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

  return (
    <Routes>
      {
        true ?
          // accessiblePages.includes(ACCESS_NAME) ?
          <Route path="/" element={<ModuleLayout navItems={routes} />}>
            <Route index element={<Navigate to={PAGE_ROUTE} replace />} />
            {WorkCategory}
            {WorkType}
            {WorkActivity}
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
