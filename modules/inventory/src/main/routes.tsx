import React from 'react'
import { templateFn } from '@igblsln/control';
import { PAGE_ROUTE as MP_PAGE_ROUTE } from '@igblsln/materialpurchase';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';

const inventoryTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: MenuItem[] = [
    {
        label: 'Items',
        items: [
            {
                label: 'Material Items',
                icon: 'pi ml-3',
                template: inventoryTemplateFn("items")
            },
            {
                label: 'Material Item Sub Type',
                icon: 'pi ml-3',
                template: inventoryTemplateFn("itemsubtypes")
            },
            {
                label: 'Material Item Type',
                icon: 'pi ml-3',
                template: inventoryTemplateFn("itemtypes")
            },
            {
                label: 'UOM',
                icon: 'pi ml-3',
                template: inventoryTemplateFn("uoms")
            },
            {
                label: 'Purpose',
                icon: 'pi ml-3',
                template: inventoryTemplateFn("purposes")
            },
            {
                label: 'Brand',
                icon: 'pi ml-3',
                template: inventoryTemplateFn("brand")
            },
        ]
    }
];

export default routes;