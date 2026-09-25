import React from 'react'
import { templateFn } from '@igblsln/control';
import { classNames } from "primereact/utils";
import { MODULE_NAME } from '../constants';

const estimationTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes: any = [
    {
        label: 'Structure',
        className: 'biq-dropdown-panelmenu',
        items: [
            {
                label: 'Accessories',
                icon: 'pi ml-3',
                template: estimationTemplateFn("accesories", true)
            },
            {
                label: 'Basement',
                icon: 'pi ml-3',
                template: estimationTemplateFn("basement", true)
            },
            {
                label: 'Brickwork',
                icon: 'pi ml-3',
                template: estimationTemplateFn("brickwork", true)
            },
            {
                label: 'Column',
                icon: 'pi ml-3',
                template: estimationTemplateFn("column", true)
            },
            {
                label: 'Plastering',
                icon: 'pi ml-3',
                template: estimationTemplateFn("plastering", true)
            },
            {
                label: 'Roof',
                icon: 'pi ml-3',
                template: estimationTemplateFn("roof", true)
            },
            {
                label: 'Staircase',
                icon: 'pi ml-3',
                template: estimationTemplateFn("staricase", true)
            },
            {
                label: 'Tank Details',
                icon: 'pi ml-3',
                template: estimationTemplateFn("tankdetails", true)
            },
            {
                label: 'Terrace',
                icon: 'pi ml-3',
                template: estimationTemplateFn("terrace", true)
            },
        ]
    },
    {
        label: 'Material Pack',
        icon: 'pi ml-3',
        className: 'biq-panelmenu',
        template: estimationTemplateFn('fractionalmaterial'),
        altUrls : "/estimation/wholematerial"
    },
    {
        label: 'Rod Pack',
        icon: 'pi ml-3',
        className: classNames('biq-panelmenu'),
        template: estimationTemplateFn('fractionalrod'),
        altUrls : "/estimation/wholerod"
    },
    // {
    //     label: 'Whole Rod Pack',
    //     icon: 'pi ml-3',
    //     className : 'biq-panelmenu',
    //     template: estimationTemplateFn('wholerod')
    // },
    {
        label: 'Components',
        className: 'biq-dropdown-panelmenu',
        items: [
            {
                label: 'Beam',
                icon: 'pi ml-3',
                template: estimationTemplateFn("beam")
            },
            // {
            //     label: 'Column Body',
            //     icon: 'pi ml-3',
            //     template: estimationTemplateFn("columnbody")
            // },
            {
                label: 'Footing',
                icon: 'pi ml-3',
                template: estimationTemplateFn("columnfooting")
            },
            {
                label: 'Cupboard',
                icon: 'pi ml-3',
                template: estimationTemplateFn("cupboard")
            },
            {
                label: 'Tank',
                icon: 'pi ml-3',
                template: estimationTemplateFn("generictank")
            },
            {
                label: 'Kitchen Stage',
                icon: 'pi ml-3',
                template: estimationTemplateFn("kitchenstage")
            },
            // {
            //     label: 'Lift Footing',
            //     icon: 'pi ml-3',
            //     template: estimationTemplateFn("liftfooting")
            // },
            {
                label: 'Lintel',
                icon: 'pi ml-3',
                template: estimationTemplateFn("lintelbeam")
            },
            // {
            //     label: 'Pile',
            //     icon: 'pi ml-3',
            //     template: estimationTemplateFn("pile")
            // },
            // {
            //     label: 'Pile Cap',
            //     icon: 'pi ml-3',
            //     template: estimationTemplateFn("pilecap")
            // },
            {
                label: 'Slab',
                icon: 'pi ml-3',
                template: estimationTemplateFn("slab")
            },
            {
                label: 'Staircase Slab',
                icon: 'pi ml-3',
                template: estimationTemplateFn("staircaseslab")
            },
        ]
    },
    {
        label: 'Bill of Quantity',
        icon: 'pi ml-3',
        className: 'biq-panelmenu',
        template: estimationTemplateFn('billofquantity', true)
    },
    {
        label: 'Cost Estimation',
        icon: 'pi ml-3',
        className: 'biq-panelmenu',
        template: estimationTemplateFn('costestimation', true)
    },
];

export default routes;