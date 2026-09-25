import { templateFn } from '@igblsln/control';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';

const taxTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routesBkp: any = [
    {
        label: 'Tax',
        className: 'biq-dropdown-panelmenu',
        items: [
            {
                label: 'Purchase GST',
                icon: 'pi ml-3',
                template: taxTemplateFn("purchasegst")
            },
            {
                label: 'Sales GST',
                icon: 'pi ml-3',
                template: taxTemplateFn("salesgst")
            },
            {
                label: 'Purchase TDS',
                icon: 'pi ml-3',
                template: taxTemplateFn("purchasetds")
            },
            {
                label: 'Sale TDS',
                icon: 'pi ml-3',
                template: taxTemplateFn("saletds")
            },
        ]
    },
    // {
    //     label: 'TDS',
    //     className: 'biq-dropdown-panelmenu',
    //     items: [
    //         {
    //             label: 'Purchase TDS',
    //             icon: 'pi ml-3',
    //             template: taxTemplateFn("purchasetds")
    //         },
    //         {
    //             label: 'Sale TDS',
    //             icon: 'pi ml-3',
    //             template: taxTemplateFn("saletds")
    //         },
    //     ]
    // },
    // {
    //     label: 'Bank Accounts',
    //     icon: 'pi',
    //     template: taxTemplateFn("bank")
    // },
];

const routes: any = [
    {
        items: [
            {
                label: 'GST',
                icon: 'pi ml-3',
                template: taxTemplateFn("gstmonthlychallan")
            },
            {
                label: 'TDS',
                icon: 'pi ml-3',
                template: taxTemplateFn("tdsmonthlyinvoice")
            },
            {
                label: 'Bank Accounts',
                icon: 'pi ml-3',
                template: taxTemplateFn("bank")
            },
        ]
    }

];

export default routesBkp;