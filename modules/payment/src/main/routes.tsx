import React from 'react'
import { templateFn } from '@igblsln/control';
import { MenuItem } from 'primereact/menuitem';
import { MODULE_NAME } from '../constants';

const moduleTemplateFn = (page: string, isCommingSoon?: boolean) => {
    return templateFn(`/${MODULE_NAME}/${page}` + (isCommingSoon ? '/comming-soon' : ''))
}

const routes1: MenuItem[] = [
    {
        // label: 'Transction',
        items: [
            {
                label: 'Vendor Payment',
                icon: 'pi ml-3',
                template: moduleTemplateFn("vendorpayment")
            },
            {
                label: 'Contractor Payment',
                icon: 'pi ml-3',
                template: moduleTemplateFn("contractorpayment")
            },
            {
                label: 'TDS Payment',
                icon: 'pi ml-3',
                template: moduleTemplateFn("tdspayment")
            },
            {
                label: 'GST Payment',
                icon: 'pi ml-3',
                template: moduleTemplateFn("gstpayment")
            },
            {
                label: 'Salary/Allowance Payment',
                icon: 'pi ml-3',
                template: moduleTemplateFn("allowancepayment")
            },
            {
                label: 'Project Details',
                icon: 'pi ml-3',
                template: moduleTemplateFn("projectdetails")
            },
            // {
            //     label: 'Payment Allocation Sheets',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("weeklypayment")
            // },
            {
                label: 'Payment Sheets',
                icon: 'pi ml-3',
                template: moduleTemplateFn("paymentsheet")
            },
            {
                label: 'TDS Challan',
                icon: 'pi ml-3',
                template: moduleTemplateFn("tdschallan")
            },
        ]
    }
];


const routes: MenuItem[] = [
    {
        label: 'Payments',
        className : 'biq-dropdown-panelmenu-disabled'
    },
    {
        label: 'Make Payment',
        className: 'biq-dropdown-panelmenu',
        id: 'make',
        items: [
            {
                label: 'Vendor',
                icon: 'pi ml-3',
                template: moduleTemplateFn("vendorpayment")
            },
            {
                label: 'Contractor',
                icon: 'pi ml-3',
                template: moduleTemplateFn("contractorpayment")
            },
            {
                label: 'Salary And Allowance',
                icon: 'pi ml-3',
                template: moduleTemplateFn("allowancepayment")
            },            
            // {
            //     label: 'TDS',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("tdspayment")
            // },
            // {
            //     label: 'GST',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("gstpayment")
            // }
        ]
    },
    {
        label: 'Receive Payment',
        className: 'biq-dropdown-panelmenu',
        id: 'receive',
        items: [
            {
                label: 'Sales',
                icon: 'pi ml-3',
                template: moduleTemplateFn("salereceipt")
            },
            // {
            //     label: 'Service',
            //     icon: 'pi ml-3',
            //     template: moduleTemplateFn("miscellaneousreceipt")
            // },
        ]
    },
    {
        label: 'Extra Expenses',
        icon: 'pi ml-3',
        template: moduleTemplateFn("expenses")
    },
    {
        label: 'Expense Type',
        icon: 'pi ml-3',
        template: moduleTemplateFn("expensetype")
    },
    // {
    //     label: 'Bank Account',
    //     icon: 'pi ml-3',
    //     template: moduleTemplateFn("bank/accounts")
    // },
    {
        label:'Bank Account',
        className: 'biq-dropdown-panelmenu',
        items: [
            {
                label: 'Bank Accounts',
                icon: 'pi ml-3',
                template: moduleTemplateFn("bank/accounts")
            }
        ]
    },
    // {
    //     label: 'Payment History',
    //     className: 'biq-dropdown-panelmenu',
    //     id: "paymenthistory",
    //     items: [
    //         {
    //             label: 'Vendor',
    //             icon: 'pi ml-3',
    //             template: moduleTemplateFn("vendorpaymenthistory")
    //         },
    //         {
    //             label: 'Contractor',
    //             icon: 'pi ml-3',
    //             template: moduleTemplateFn("contractorpaymenthistory")
    //         },
    //     ]
    // },
    // {
    //     label: 'Account Transaction',
    //     className: 'biq-dropdown-panelmenu',
    //     id: "acctransaction",
    //     items: [
    //         {
    //             label: 'Debit',
    //             icon: 'pi ml-3',
    //             template: moduleTemplateFn("debit")
    //         },
    //         {
    //             label: 'Credit',
    //             icon: 'pi ml-3',
    //             template: moduleTemplateFn("credit")
    //         },

    //     ]
    // },
    // {
    //     label: 'Payment Allocation Sheets',
    //     icon: 'pi ml-3',
    //     template: moduleTemplateFn("paymentallocation")
    // },
    // {
    //     label: 'Transaction History',
    //     icon: 'pi ml-3',
    //     template: moduleTemplateFn("transactionhistory")
    // },
];

export default routes;