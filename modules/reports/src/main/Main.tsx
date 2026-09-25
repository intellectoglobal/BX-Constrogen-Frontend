import {
  ComingSoon,
  ModuleLayout,
  NoMatch,
  Restricted,
} from "@igblsln/control";
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import getReportsRoutes from "./routes";
import ProjectsExpenseRoutes from "../pages/ProjectExpense"
import ProjectStockRoutes from "../pages/ProjectStock"
import VendorInvoiceWithGSTRoutes from '../pages/VendorInvoiceWithGST';
import VendorInvoiceWithoutGSTRoutes from '../pages/VendorInvoiceWithoutGST';
import CustomerPaymentReceiptsRoutes from '../pages/CustomerPaymentReceipts';
import ContractorPaymentVoucherRoutes from '../pages/ContractorPaymentVoucher';
import SupplierPaymentVoucherRoutes from '../pages/SupplierPaymentVoucher';
import ContractorTDSReport from '../pages/ContractorTDSReport';
import PayrollVoucherRoutes from '../pages/PayrollVoucher';
import ExportReportsRoutes from '../pages/ExportReports';

const Main = () => {
  const location = useLocation()
  const navItems = getReportsRoutes(location.pathname)
  return (
    <Routes>
      {true ? (
        <Route
          path="/"
          element={<ModuleLayout panelMenu navItems={navItems} />}
        >
          <Route index />
          {VendorInvoiceWithGSTRoutes}
          {VendorInvoiceWithoutGSTRoutes}
          {CustomerPaymentReceiptsRoutes}
          {ContractorPaymentVoucherRoutes}
          {SupplierPaymentVoucherRoutes}
          {ContractorTDSReport}
          {PayrollVoucherRoutes}
          {ExportReportsRoutes}
          {ProjectsExpenseRoutes}
          {ProjectStockRoutes}
          <Route path=":page/comming-soon" element={<ComingSoon />} />
          <Route path="*" element={<NoMatch relative />} />
        </Route>
      ) : (
        <Route path="/" element={<ModuleLayout navItems={[]} />}>
          <Route path="*" element={<Restricted relative />} />
        </Route>
      )}
    </Routes>
  );
};

export default Main;
