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
        label: 'Contractors',
        items: [
            {
                label: 'Contractors',
                icon: 'pi ml-3',
                template: contractorTemplateFn(PAGE_ROUTE)
            },
            {
                label: 'Contractor Type',
                icon: 'pi ml-3',
                template: contractorTemplateFn('contractortype')
            },
            // Asked By Senthil
            // {
            //     label: 'Contractor Invoice',
            //     icon: 'pi ml-3',
            //     template: contractorTemplateFn('contractorinvoice')
            // },
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
    }
];

export default routes;