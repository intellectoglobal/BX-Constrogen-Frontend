import React from 'react'
import { templateFn } from '@igblsln/control';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';

const moduleTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: MenuItem[] = [
    {
        label: 'Projects',
        items: [
            {
                label: 'Project Details',
                icon: 'pi ml-3',
                template: moduleTemplateFn("project")
            },
            {
                label: 'Unit Detail',
                icon: 'pi ml-3',
                template: moduleTemplateFn("unit")
            },
            // {
            //     label: 'Image Detail',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("images")
            // },
            // {
            //     label: 'Project Status',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("projectstatus")
            // },
            // {
            //     label: 'Project Type',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("projecttype")
            // },
            // {
            //     label: 'Task',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("task")
            // },
            // {
            //     label: 'Daily Progress',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("dailyprogress")
            // },
            {
                label: 'Availability',
                icon: 'pi ml-3',
                template: moduleTemplateFn("availability")
            },

        ]
    },
    // {
    //     label: 'Expenses',
    //     items: [
    //         {
    //             label: 'Project Expense',
    //             icon: 'pi ml-3',
    //             template: moduleTemplateFn("expense")
    //         },
    //         {
    //             label: 'Project Stock',
    //             icon: 'pi ml-3',
    //             template: moduleTemplateFn("stock")
    //         },
    //     ]
    // },
    // {
    //     label: 'Work',
    //     items: [
    //         {
    //             label: 'Work Info',
    //             icon: 'pi ml-3',
    //             template: moduleTemplateFn("workinfo")
    //         }
    //     ]
    // },
];

const routes1: MenuItem[] = [
    {
        label: 'Project',
        className: 'biq-dropdown-panelmenu',
        id: 'project',
        url : '/#/projects/project',
        // template: moduleTemplateFn("project"),
        items: [
            // {
            //     label: 'Info',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("info")
            // },
            {
                label: 'Block',
                icon: 'pi ml-3',
                template: moduleTemplateFn("block")
            },
            {
                label: 'Floor',
                icon: 'pi ml-3',
                template: moduleTemplateFn("floor")
            },
            {
                label: 'Unit',
                icon: 'pi ml-3',
                template: moduleTemplateFn("unit")
            },
            {
                label: 'Availability',
                icon: 'pi ml-3',
                template: moduleTemplateFn("availability")
            },
            {
                label: 'Design',
                className: 'biq-dropdown-panelmenu color',
                id: 'project-design',
                items: [
                    {
                        label: 'Elevation Diagram',
                        icon: 'pi ml-3',
                        template: moduleTemplateFn("elevation-diagram")
                    },
                    {
                        label: 'Floor & 3D Plan',
                        icon: 'pi ml-3',
                        template: moduleTemplateFn("floor-plan")
                    }
                ]
            },
        ]
    },
];

export default routes;