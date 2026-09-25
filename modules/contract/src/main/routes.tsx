import React from 'react'
import { templateFn } from '@igblsln/control';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';
import { PAGE_ROUTE } from '../pages/Contract/constants';

const contractorTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: MenuItem[] = [
    {
        label: 'Contracts',
        items: [
            // {
            //     label: 'Contractors',
            //     icon: 'pi ml-3',
            //     template: contractorTemplateFn(PAGE_ROUTE)
            // },
            // {
            //     label: 'Contractor Type',
            //     icon: 'pi ml-3',
            //     template: contractorTemplateFn('contractortype')
            // },
            {
                label: 'Contract Agreements',
                icon: 'pi ml-3',
                template: contractorTemplateFn('contractagreement')
            },
            {
                label: 'Contractor Invoices',
                icon: 'pi ml-3',
                template: contractorTemplateFn('contractorinvoice')
            },
            {
                label: 'Contractor',
                icon: 'pi ml-3',
                template: contractorTemplateFn('contractor')
            },
            {
                label: 'Contractor Type',
                icon: 'pi ml-3',
                template: contractorTemplateFn('contractortype')
            },
            //Asked by Prem
            // {
            //     label: 'Contractor Group',
            //     icon: 'pi ml-3',
            //     template: contractorTemplateFn('contractorgroup')
            // },
            // {
            //     label: 'Contract',
            //     icon: 'pi ml-3',
            //     template: contractorTemplateFn('contract')
            // },
            // {
            //     label: 'Contract Invoice',
            //     icon: 'pi ml-3',
            //     template: contractorTemplateFn('contractinvoice')
            // },
            // {
            //     label: 'AP Term',
            //     icon: 'pi ml-3',
            //     template: contractorTemplateFn('apterm')
            // },
        ]
    },
    {
        label : 'Templates',
        items: [
            {
                label: 'Contractor Service',
                icon: 'pi ml-3',
                template: contractorTemplateFn("contractservices")
            },
            {
                label: 'Payment Schedule',
                icon: 'pi ml-3',
                template: contractorTemplateFn("paymentschedules")
            },
        ]
    }
];

export default routes;