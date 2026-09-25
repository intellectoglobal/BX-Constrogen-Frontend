import { templateFn } from '@igblsln/control';
import { MODULE_NAME } from '../constants';
import { PAGE_ROUTE } from '../pages/Company/constants';

const clientTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: any = [
    {
        items: [
            // {
            //     label: 'Client',
            //     icon: 'pi ml-3',
            //     template: clientTemplateFn("client"),
            // },            
            {
                label: 'Companies',
                icon: 'pi ml-3',
                template: clientTemplateFn("companies"),
            },
            // {
            //     label: 'Staff',
            //     icon: 'pi ml-3',
            //     template: clientTemplateFn("staff"),
            // },
            {
                label: 'Bank Account',
                icon: 'pi ml-3',
                template: clientTemplateFn("bank"),
            },
        ]
    }
];

export default routes;