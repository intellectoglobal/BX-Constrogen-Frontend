import React from 'react'
import { templateFn } from '@igblsln/control';
import { PAGE_ROUTE as MP_PAGE_ROUTE } from '@igblsln/materialpurchase';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';

const moduleTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: MenuItem[] = [
    {
        label: 'Purchase',
        items: [
            {
                label: 'Purchase Orders',
                icon: 'pi ml-3',
                template: moduleTemplateFn("purchaseorder")
            },
            {
                label: 'Vendor Invoices',
                icon: 'pi ml-3',
                template: moduleTemplateFn("vendorinvoice")
            },
            {
                label: 'Customer Purchase',
                icon: 'pi ml-3',
                template: moduleTemplateFn("customerpurchase")
            },
            // {
            //     label: 'Goods Registers',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("goodsregisters")
            // },
            // {
            //     label: 'Goods Registers',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn(MP_PAGE_ROUTE)
            // }

        ]
    },
    {
        label:'Vendors',
        className: 'biq-dropdown-panelmenu',
        items: [
            {
                label: 'Material Vendors',
                icon: 'pi ml-3',
                template: moduleTemplateFn("vendor")
            }
        ]
    },
    {
        label: 'Items',
        className: 'big-dropdown-panelmenu',
        items: [
            {
                label: 'Material Items',
                icon: 'pi ml-3',
                template: moduleTemplateFn("items")
            },
            {
                label: 'Material Item Rate Card',
                icon: 'pi ml-3',
                template: moduleTemplateFn("itemratecard")
            },
            {
                label: 'Material Item Sub Type',
                icon: 'pi ml-3',
                template: moduleTemplateFn("itemsubtypes")
            },
            {
                label: 'Material Item Type',
                icon: 'pi ml-3',
                template: moduleTemplateFn("itemtypes")
            },
            {
                label: 'UOM',
                icon: 'pi ml-3',
                template: moduleTemplateFn("uoms")
            },
            {
                label: 'Purpose',
                icon: 'pi ml-3',
                template: moduleTemplateFn("purposes")
            },
            {
                label: 'Brand',
                icon: 'pi ml-3',
                template: moduleTemplateFn("brand")
            },
        ]
    },
    {
        label : 'Templates',
        items: [
            {
                label: 'Item Kit Template',
                icon: 'pi ml-3',
                template: moduleTemplateFn("itemkit")
            },

        ]
    }
];

export default routes;