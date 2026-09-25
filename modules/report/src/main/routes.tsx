import { templateFn } from '@igblsln/control';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';

const taxTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: any = [
    {
        label: 'Audit Reports',
        className : 'biq-dropdown-panelmenu-disabled'
    },
    {
        label: 'Download Monthly Reports',
        icon: 'pi ml-3',
        template: taxTemplateFn("exportreports")
    },
    {
        label: 'View Monthly Reports',
        className: 'biq-dropdown-panelmenu',
        id: 'view',
        items: [
            {
                label: 'GST Invoices',
                icon: 'pi ml-3',
                template: taxTemplateFn("vendorinvoicewithgst")
            },
            {
                label: 'Non-GST Invoices',
                icon: 'pi ml-3',
                template: taxTemplateFn("vendorinvoicewithoutgst")
            },
            {
                label: 'Customer Payments',
                icon: 'pi ml-3',
                template: taxTemplateFn("customerpaymentreceipts")
            },
            {
                label: 'Contractor Payments',
                icon: 'pi ml-3',
                template: taxTemplateFn("contractorpaymentvoucher")
            },
            {
                label: 'Supplier Payments',
                icon: 'pi ml-3',
                template: taxTemplateFn("supplierpaymentvoucher")
            },
            {
                label: 'Contractor TDS',
                icon: 'pi ml-3',
                template: taxTemplateFn("contractortdsreport")
            },
            {
                label: 'Payroll',
                icon: 'pi ml-3',
                template: taxTemplateFn("payrollvoucher")
            },
        ]
    },
];

export default routes;