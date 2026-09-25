import { templateFn } from '@igblsln/control';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';

const taxTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: any = [
    {
        label: "Bank Accounts",
        items: [
            {
                label: 'Bank Accounts',
                icon: 'pi',
                template: taxTemplateFn("bank/accounts")
            },
        ]
    }
];


export default routes;