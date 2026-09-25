import { templateFn } from '@igblsln/control';
import { MODULE_NAME } from '../constants';
import { PAGE_ROUTE } from '../pages/Users/constants';

const salesTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const clientTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}


const routes: any = [
    {
        label : "Employees",
        items: [
            {
                label: 'Employees',
                icon: 'pi ml-3',
                template: salesTemplateFn(PAGE_ROUTE),
            },
            {
                label: 'Roles',
                icon: 'pi ml-3',
                template: clientTemplateFn("roles"),
            },
            {
                label: 'Payslip',
                icon: 'pi ml-3',
                template: clientTemplateFn("payslip"),
            },
            // {
            //     label: 'Company',
            //     icon: 'pi ml-3',
            //     template: clientTemplateFn("companies"),
            // },
            // {
            //     label: 'Staff',
            //     icon: 'pi ml-3',
            //     template: clientTemplateFn("staff"),
            // },
            // {
            //     label: 'Bank Account',
            //     icon: 'pi ml-3',
            //     template: clientTemplateFn("bank"),
            // }
        ]
    }
];

export default routes;