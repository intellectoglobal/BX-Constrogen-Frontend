import { templateFn } from "@igblsln/control";
import { MODULE_NAME } from "../constants";
import { MenuItem } from "primereact/menuitem";

const ReportsTemplateFn = (page: string, isCommingSoon?: boolean) => {
  return templateFn(
    `/${MODULE_NAME}/${page}` + (isCommingSoon ? "/coming-soon" : "")
  );
};

const getReportsRoutes = (currentPath: string): MenuItem[] => {
    const isExpensesActive = currentPath === '/reports/expense' || currentPath === '/reports/stock';

  return [
    {
      label: "Audit Reports",
      className: "biq-dropdown-panelmenu-disabled",
    },
    {
      label: "Download Monthly Reports",
      icon: "pi ml-3",
      template: ReportsTemplateFn("exportreports"),
    },
    {
      label: "View Monthly Reports",
      className: "biq-dropdown-panelmenu",
      id: "view",
      items: [
        {
          label: "GST Invoices",
          icon: "pi ml-3",
          template: ReportsTemplateFn("vendorinvoicewithgst"),
        },
        {
          label: "Non-GST Invoices",
          icon: "pi ml-3",
          template: ReportsTemplateFn("vendorinvoicewithoutgst"),
        },
        {
          label: "Customer Payments",
          icon: "pi ml-3",
          template: ReportsTemplateFn("customerpaymentreceipts"),
        },
        {
          label: "Contractor Payments",
          icon: "pi ml-3",
          template: ReportsTemplateFn("contractorpaymentvoucher"),
        },
        {
          label: "Supplier Payments",
          icon: "pi ml-3",
          template: ReportsTemplateFn("supplierpaymentvoucher"),
        },
        {
          label: "Contractor TDS",
          icon: "pi ml-3",
          template: ReportsTemplateFn("contractortdsreport"),
        },
        {
          label: "Payroll",
          icon: "pi ml-3",
          template: ReportsTemplateFn("payrollvoucher"),
        },
      ],
    },
    {
      label: "Expenses",
      className: "biq-dropdown-panelmenu",
      items: [
        {
          label: "Project Expense",
          icon: "pi ml-3",
          template: ReportsTemplateFn("expense"),
        },
        {
          label: "Project Stock",
          icon: "pi ml-3",
          template: ReportsTemplateFn("stock"),
        },
      ],
      expanded: isExpensesActive
    },
  ];
};

export default getReportsRoutes;
