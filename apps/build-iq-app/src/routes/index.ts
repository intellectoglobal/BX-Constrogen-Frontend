import PurchaseModule from '@igblsln/purchase';
import ProjectsModule from '@igblsln/projects';
import InventoryModule from '@igblsln/inventory';
import SalesModule from '@igblsln/sales'
import TemplateModule from '@igblsln/template'
import ContractModule from '@igblsln/contract'
import ContractorModule from '@igblsln/contractor'
import VendorModule from '@igblsln/vendor'
import PaymentModule from '@igblsln/payment'
import CustomerModule from '@igblsln/customer'
import EstimationModule from '@igblsln/estimation'
import UsersModule from '@igblsln/users'
import ClientsModule from '@igblsln/clients'
import InvoiceModule from '@igblsln/invoice'
import TaxModule from '@igblsln/tax'
import CRMModule from '@igblsln/crm'
import ReportModule from '@igblsln/report'
import AdminToolsModule  from "@igblsln/admintools"
import ReportsModule from "@igblsln/reports"
import DashboardModule from './DashboardModule';

const routes = [
    DashboardModule,
    PurchaseModule,
    ProjectsModule,
    InventoryModule,
    SalesModule,
    TemplateModule,
    ContractModule,
    ContractorModule,
    VendorModule,
    PaymentModule,
    CustomerModule,
    UsersModule,
    EstimationModule,
    ClientsModule,
    InvoiceModule,
    TaxModule,
    CRMModule,
    ReportModule,
    AdminToolsModule,
    ReportsModule
];

export default routes;
