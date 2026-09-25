
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import ItemsRoutes from '../pages/Items';
import WarehouseRoutes from '../pages/Warehouse';
import PurposeRoutes from '../pages/Purpose';
import BrandRoutes from '../pages/Brand';
import UOMRoutes from '../pages/UOM';
import ItemTypeRoutes from '../pages/ItemType';
import ItemSubTypeRoutes from '../pages/ItemSubType';
import UOMTypeRoutes from '../pages/UOMType';
import GetMaterialPurchaseRoutes from '@igblsln/materialpurchase';
import { ACCESS_NAME, MODULE_NAME } from '../constants';
import { useAuth } from '@igblsln/store';

const Main = () => {
  const auth = useAuth()
  const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

  return (
    <Routes>
      {
        accessiblePages.includes(ACCESS_NAME) ?
      <Route path="/" element={<ModuleLayout navItems={routes} />}>
        <Route index element={<Navigate to="items" replace />} />
        {ItemsRoutes}
        {WarehouseRoutes}
        {PurposeRoutes}
        {UOMRoutes}
        {ItemTypeRoutes}
        {ItemSubTypeRoutes}
        {UOMTypeRoutes}
        {BrandRoutes}
        {GetMaterialPurchaseRoutes(MODULE_NAME)}
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
