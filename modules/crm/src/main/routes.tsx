import React from 'react'
import { templateFn } from '@igblsln/control';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';

const salesTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: MenuItem[] = [
    {
        label: "Leads",
        items: [
                        {
                label: 'Leads',
                icon: 'pi ml-3',
                template: salesTemplateFn("leads")
            },
            {
                label: 'Follow Ups',
                icon: 'pi ml-3',
                template: salesTemplateFn("followups")
            },
            {
                label: 'Site Visits',
                icon: 'pi ml-3',
                template: salesTemplateFn("sitevisits")
            },
            {
                label: 'Active Follow-Up',
                icon: 'pi ml-3',
                template: salesTemplateFn("activefollowup")
            },
            {
                label: 'Junk Leads',
                icon: 'pi ml-3',
                template: salesTemplateFn("junkleads")
            },
        ]
    },
    {
        label : "Menu",
        items: [
            {
                label: 'Dashboard',
                icon: 'pi ml-3',
                template: salesTemplateFn("dashboard")
            },
            {
              label: 'Properties',
              icon: 'pi ml-3',
              template: salesTemplateFn('properties'),
            },
            // {
            //   label: 'Follow Up Stages',
            //   icon: 'pi ml-3',
            //   template: salesTemplateFn('followupstages'),
            // },
            // {
            //   label: 'Budget Ranges',
            //   icon: 'pi ml-3',
            //   template: salesTemplateFn('budgets'),
            // },
            // {
            //   label: 'Occupancies',
            //   icon: 'pi ml-3',
            //   template: salesTemplateFn('occupancies'),
            // },
            // {
            //   label: 'Occupancy Sub Types',
            //   icon: 'pi ml-3',
            //   template: salesTemplateFn('occupancysubtypes'),
                  // },
        ]
    }
];

export default routes;
