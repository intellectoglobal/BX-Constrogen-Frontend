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
        items: [
            {
                label: 'Customer',
                icon: 'pi ml-3',
                template: salesTemplateFn(PAGE_ROUTE)
            }
        ]
    }
];

export default routes;