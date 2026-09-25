import { templateFn } from '@igblsln/control';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';

const moduleTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: MenuItem[] = [
    {
        label : 'Templates',
        items: [
            {
                label: 'Contract Service Template',
                icon: 'pi ml-3',
                template: moduleTemplateFn("contractservices")
            },
            {
                label: 'Payment Schedule Template',
                icon: 'pi ml-3',
                template: moduleTemplateFn("paymentschedules")
            },
            {
                label: 'Customer Payment Schedule',
                icon: 'pi ml-3',
                template: moduleTemplateFn("customerpaymentschedule")
            },
            {
                label: 'Item Kit Template',
                icon: 'pi ml-3',
                template: moduleTemplateFn("itemkit")
            },

        ]
    }
];

export default routes;