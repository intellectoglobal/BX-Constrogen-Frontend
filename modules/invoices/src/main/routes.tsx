import React from 'react'
import { templateFn } from '@igblsln/control';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';

const moduleTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: MenuItem[] = [
    {
        // label: 'Transction',
        items: [
            {
                label: 'Vendor Invoice',
                icon: 'pi ml-3',
                template: moduleTemplateFn("vendorinvoice")
            },
            {
                label: 'Contractor Invoice',
                icon: 'pi ml-3',
                template: moduleTemplateFn("contractorinvoice")
            },
            // {
            //     label: 'GST',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("gstinvoice")
            // },
            // {
            //     label: 'TDS',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("tdsinvoice")
            // },
            // {
            //     label: 'Salary/Allowance',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("salaryinvoice")
            // },

        ]
    },
];

export default routes;