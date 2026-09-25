import React from 'react'
import { templateFn } from '@igblsln/control';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';
import { PAGE_ROUTE } from '../pages/Customers/constants';

const salesTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: MenuItem[] = [
    {
        label: 'Agreements',
        items: [
            // {
            //     label: 'Sale Booking',
            //     icon: 'pi ml-3',
            //     template: salesTemplateFn("salebooking")
            // },
            {
                label: 'Sale Agreement',
                icon: 'pi ml-3',
                template: salesTemplateFn("saleagreement")
            },
            // {
            //     label: 'Sale Invoice',
            //     icon: 'pi ml-3',
            //     template: salesTemplateFn("saleinvoice")
            // },
            {
                label: 'Construction Agreement',
                icon: 'pi ml-3',
                template: salesTemplateFn("constructionagreement")
            },
            // {
            //     label: 'Invoice',
            //     icon: 'pi ml-3',
            //     template: salesTemplateFn("invoice", true)
            // },
            // {
            //     label: 'Receipt',
            //     icon: 'pi ml-3',
            //     template: salesTemplateFn("receipt", true)
            // },
            // {
            //     label: 'Receipt Allocation',
            //     icon: 'pi ml-3',
            //     template: salesTemplateFn("receiptalloc", true)
            // }
        ]
    },
    {
        label: 'Sales',
        items: [
            {
                label: 'Sale Invoice',
                icon: 'pi ml-3',
                template: salesTemplateFn("saleinvoice")
            },
            // {
            //     label: 'Receipts',
            //     icon: 'pi ml-3',
            //     template: salesTemplateFn("salereceipt")
            // },
            {
                label: 'Customers',
                icon: 'pi ml-3',
                template: salesTemplateFn("customers")
            },
        ]
    },
    {
        label : 'Templates',
        items: [
            {
                label: 'Payment Schedule',
                icon: 'pi ml-3',
                template: salesTemplateFn("customerpaymentschedule")
            },

        ]
    }
    // {
    //     label: 'Configuration',
    //     items: [
    //         {
    //             label: 'Customer',
    //             icon: 'pi ml-3',
    //             template: salesTemplateFn(PAGE_ROUTE)
    //         }
    //     ]
    // }
];

export default routes;