import React from 'react'
import { templateFn } from '@igblsln/control';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';

const salesTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: MenuItem[] = [
    {
        label : "Menu",
        items: [
            {
                label: 'Work Category',
                icon: 'pi ml-3',
                template: salesTemplateFn("workcategory")
            },
            {
                label: 'Work Type',
                icon: 'pi ml-3',
                template: salesTemplateFn("worktype")
            },
            {
                label: 'Work Activity',
                icon: 'pi ml-3',
                template: salesTemplateFn("workactivity")
            },
        ]
    }
];

export default routes;