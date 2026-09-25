import React from 'react'
import { templateFn } from '@igblsln/control';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';

const moduleTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: MenuItem[] = [
    {
        label: 'Vendors',
        items: [
            {
                label: 'Material Vendors',
                icon: 'pi ml-3',
                template: moduleTemplateFn("vendor")
            },
            // {
            //     label: 'Material Vendor Type',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("vendortype")
            // },
        ]
    }
];

export default routes;