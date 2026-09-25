
import React from 'react';
import { Routes, Route } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import VendorInvoiceWithGSTRoutes from '../pages/VendorInvoiceWithGST';
import VendorInvoiceWithoutGSTRoutes from '../pages/VendorInvoiceWithoutGST';
import CustomerPaymentReceiptsRoutes from '../pages/CustomerPaymentReceipts';
import ContractorPaymentVoucherRoutes from '../pages/ContractorPaymentVoucher';
import SupplierPaymentVoucherRoutes from '../pages/SupplierPaymentVoucher';
import ContractorTDSReport from '../pages/ContractorTDSReport';
import PayrollVoucherRoutes from '../pages/PayrollVoucher';
import ExportReportsRoutes from '../pages/ExportReports';
import { useAuth } from '@igblsln/store';

const Main = () => {
  const auth = useAuth()
  const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

  return (
    <Routes>
      {
        // accessiblePages.includes(ACCESS_NAME) ?
        true ?
          // <Route path="/" element={<ModuleLayout panelMenu navItems={routes} />}>
          <Route path="/" element={<ModuleLayout panelMenu navItems={routes} />}>
            <Route index />
            {VendorInvoiceWithGSTRoutes}
            {VendorInvoiceWithoutGSTRoutes}
            {CustomerPaymentReceiptsRoutes}
            {ContractorPaymentVoucherRoutes}
            {SupplierPaymentVoucherRoutes}
            {ContractorTDSReport}
            {PayrollVoucherRoutes}
            {ExportReportsRoutes}
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
