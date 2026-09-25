import { MenuItem } from "primereact/menuitem"
import { templateFn } from '@igblsln/control';

const moduleItems: any = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    inventory: 'Items',
    vendor: 'Vendors',
    contractor: 'Contractors',
    purchase: 'Purchase',
    contract: "Contracts",
    sales: 'Sale',
    // invoice: 'Invoices',
    // inventory: 'Inventory',
    payment: 'Payments',
    tax: 'Tax',
    clients: 'Company',    
    // estimation: 'Estimations',
    // customer: 'Customers',

    // inquiry: 'Inquiry',
    users: 'Employee',
    template: 'Templates',
    crm: 'CRM',
    admintools: "Admin Tools"
    // reports: 'Reports',
    // settings: 'Settings'
}

const modules: MenuItem[] = Object.keys(moduleItems).map(x => ({
    label: moduleItems[x],
    icon: 'p-menuitem-icon-no-margin',
    template: templateFn(`/${x}`),
}))

export default modules