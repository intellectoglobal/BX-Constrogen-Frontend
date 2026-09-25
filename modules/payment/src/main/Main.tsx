
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { ComingSoon, ModuleLayout, NoMatch, Restricted } from '@igblsln/control';
import routes from './routes';
import VendorPaymentRoutes from '../pages/VendorPayment';
import ContractorPaymentRoutes from '../pages/ContractorPayment';
import TDSPaymentRoutes from '../pages/TDSPayment';
import ProjectDetailsRoutes from '../pages/ProjectDetails';
import WeeklyPaymentRoutes from '../pages/WeeklyPayment';
import PaymentAllocationRoutes from '../pages/PaymentAllocation';
import PaymentSheetRoutes from '../pages/PaymentSheet';
import TDSChallanRoutes from '../pages/TDSChallan';
import GSTPaymentRoutes from '../pages/GSTPayment';
import AllowancePaymentRoutes from '../pages/AllowancePayment';
import SaleReceiptRoutes from '../pages/SaleReceipt';
import ExpensesRoutes from '../pages/Expenses';
import ExpenseTypeRoutes from '../pages/ExpenseType';
import MiscellaneousReceiptRoutes from '../pages/MiscellaneousReceipt';
import TransactionHistoryRoutes from '../pages/TransactionHistory';
import VendorPaymentHistoryRoutes from '../pages/VendorPaymentHistory';
import ContractorPaymentHistoryRoutes from '../pages/ContractorPaymentHistory';
import BankAccountsRoutes from '../pages/Bank'
import CreditRoutes from '../pages/Credit';
import DebitRoutes from '../pages/Debit';
import ExpenseVendorRoutes from '../pages/ExpenseVendor';
import { useAuth } from '@igblsln/store';
import { ACCESS_NAME } from '../constants';

const Main = () => {
  const auth = useAuth()
  const accessiblePages = auth.user?.role[0]?.access?.map((d: any) => d.name) || []

  return (
    <Routes>
      {
        accessiblePages.includes(ACCESS_NAME) ?
          <Route path="/" element={<ModuleLayout panelMenu navItems={routes} />}>
            {/* <Route index element={<Navigate to="vendorpayment" replace />} /> */}
            <Route index />
            {VendorPaymentRoutes}
            {ContractorPaymentRoutes}
            {ProjectDetailsRoutes}
            {WeeklyPaymentRoutes}
            {PaymentSheetRoutes}
            {TDSChallanRoutes}
            {TDSPaymentRoutes}
            {GSTPaymentRoutes}
            {AllowancePaymentRoutes}
            {SaleReceiptRoutes}
            {MiscellaneousReceiptRoutes}
            {CreditRoutes}
            {DebitRoutes}
            {PaymentAllocationRoutes}
            {TransactionHistoryRoutes}
            {VendorPaymentHistoryRoutes}
            {ContractorPaymentHistoryRoutes}
            {ExpensesRoutes}
            {ExpenseTypeRoutes}
            {ExpenseVendorRoutes}
            {BankAccountsRoutes}
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
