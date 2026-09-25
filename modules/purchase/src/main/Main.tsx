
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import PurchaseTemplateRoutes from '../pages/PurchaseTemplate';
import PurchaseOrderRoutes from '../pages/PurchaseOrder';
import VendorInvoiceRoutes from '../pages/VendorInvoice';
import CustomerPurchaseRoutes from '../pages/CustomerPurchase';
import GetMaterialPurchaseRoutes from '@igblsln/materialpurchase';
import VendorRoutes from '../pages/Vendor';
import ItemsRoutes from '../pages/Items';
import ItemRateCardRoutes from '../pages/ItemRateHistory'
import PurposeRoutes from '../pages/Purpose';
import BrandRoutes from '../pages/Brand';
import UOMRoutes from '../pages/UOM';
import ItemTypeRoutes from '../pages/ItemType';
import ItemSubTypeRoutes from '../pages/ItemSubType';
import ItemKitTemplateRoutes from '../pages/ItemKit';
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
            <Route index element={<Navigate to="purchaseorder" replace />} />
            {PurchaseTemplateRoutes}
            {PurchaseOrderRoutes}
            {VendorInvoiceRoutes}
            {VendorRoutes}
            {CustomerPurchaseRoutes}
            {ItemsRoutes}
            {ItemRateCardRoutes}
            {PurposeRoutes}
            {BrandRoutes}
            {UOMRoutes}
            {ItemTypeRoutes}
            {ItemSubTypeRoutes}
            {ItemKitTemplateRoutes}
            {GetMaterialPurchaseRoutes(MODULE_NAME)}
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
