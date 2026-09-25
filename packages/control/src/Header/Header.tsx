import React, { useRef, useState } from 'react';
import { Menubar } from 'primereact/menubar';
import { SplitButton } from 'primereact/splitbutton';
import {
    User,
    getClientProps,
    logout,
    useAppDispatch,
    useGetAllCompaniesQuery,
    setGlobalCompany
} from '@igblsln/store'
import { Button } from 'primereact/button';
import { MenuItem } from 'primereact/menuitem';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { MegaMenu } from 'primereact/megamenu';
import { templateFn } from '../NavLink';
import { useNavigate } from 'react-router-dom';

type Props = {
    routes: MenuItem[],
    user?: User
}

const Header = ({ routes, user }: Props) => {

    const megamenu = true

    const clientProps = getClientProps();

    const navigate = useNavigate()
    const dispatch = useAppDispatch();
    const [displayModal, setDisplayModal] = useState(false);
    const { data: companies } = useGetAllCompaniesQuery()


    const toggleDarkMode = () => {
        document.body.classList.toggle('fluent-theme-dark');
    }

    const items = [
        {
            label: 'Profile',
            icon: 'pi pi-user-edit'
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => {
                dispatch(logout());
                navigate('/')
            }
        }
    ];

    const itemsLogin = [
        {
            label: 'Login',
            icon: 'pi pi-sign-out',
            command: () => {
                // window.location.hash = "/fileupload"
            }
        }
    ];

    // const leftContents = (
    //     <React.Fragment>
    //         {/* <i className="pi pi-bars p-toolbar-separator mr-2" /> */}
    //         <NavLinkButton to="/projects" label="Projects" className="mr-1" />
    //         <NavLinkButton to="/purchase" label="Purchases" className="mr-1" />
    //         <NavLinkButton to="/sales" label="Sales" className="mr-1" />
    //         <NavLinkButton to="/product" label="Products" className="mr-1" />
    //         <NavLinkButton to="/payment" label="Payments" className="mr-1" />
    //         <NavLinkButton to="/inventory" label="Inventory" className="mr-1" />
    //         <NavLinkButton to="/settings" label="Settings" className="mr-1" />
    //     </React.Fragment>
    // );

    const rightContents = (
        <React.Fragment>
            {/* <Button icon="pi pi-moon" className="mr-2" onClick={toggleDarkMode} /> */}

            <SplitButton label={`${user?.first_name} ${user?.last_name}`} icon="pi pi-user"
                model={!!user ? items : itemsLogin}></SplitButton>
        </React.Fragment>
    );

    const toggle = (e: any) => {
        // if (menu.current.toggle) {
        //     menu.current.toggle(e);
        // }
    }

    const start = <div
        style={
            {
                marginRight: '4rem',
                fontWeight: 'bold',
                fontSize: 24
            }
        }>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ margin: 'auto' }}>CONSTROGEN</div>
            <SplitButton label={`${clientProps.company_name || 'Loading...'}`}
                model={[
                    {
                        label: 'Company Settings',
                        icon: 'pi pi-user-edit'
                    },
                    {
                        label: 'Change Company',
                        icon: 'pi pi-pencil',
                        command: () => {
                            setDisplayModal(true)
                        }
                    }
                ]}></SplitButton>
        </div>

    </div>;

    const activeMegaMenu = () => {
        let hash = window.location.hash;

        // Remove the '#' character and get the actual value after it
        let path = hash.replace('#', '');
        
        let isActive = ''
        let projectPages = [
            '/projects/project',
            '/projects/unit',
            '/projects/images',
            '/projects/projectstatus',
            '/projects/dailyprogress',
            '/projects/availability',
            '/projects/projecttype',
            '/purchase/materialpurchase',
            '/projects/workinfo'
        ];
        let purchasePages = [
            '/purchase/purchaseorder',
            '/purchase/vendorinvoice',
            '/purchase/customerpurchase',
            '/purchase/vendor',
            '/purchase/items',
            '/purchase/itemratecard',
            '/purchase/itemsubtypes',
            '/purchase/itemtypes',
            '/purchase/uoms',
            '/purchase/purposes',
            'purchase/brand',
            '/purchase/itemkit'
        ];
        let contractPages = [
            '/contract/contractagreement',
            '/contract/contractorinvoice',
            '/contract/contractor',
            '/contract/contractortype',
            '/contract/contractservices',
            '/contract/paymentschedules',
        ];
        let salePages = [
            '/sales/saleagreement',
            '/sales/constructionagreement',
            '/sales/saleinvoice',
            '/sales/customers',
            '/sales/customerpaymentschedule',
        ];
        
        let financePages = [
            '/payment/vendorpayment',
            '/payment/contractorpayment',
            '/payment/allowancepayment',
            '/payment/salereceipt',
            '/payment/expenses',
            '/payment/expensetype',
            '/payment/bank/accounts',
            '/report/exportreports',
            '/report/vendorinvoicewithgst',
            '/report/vendorinvoicewithoutgst',
            '/report/customerpaymentreceipts',
            '/report/contractorpaymentvoucher',
            '/report/supplierpaymentvoucher',
            '/report/contractortdsreport',
            '/report/payrollvoucher',
            '/tax/purchasegst',
            '/tax/salesgst',
            '/tax/purchasetds',
            '/tax/saletds',
            '/payment/tdspayment',
            '/payment/gstpayment',
            '/payment/miscellaneousreceipt',
            '/payment/vendorpaymenthistory',
            '/payment/contractorpaymenthistory',
            '/payment/debit',
            '/payment/credit',
            '/payment/transactionhistory',
        ];

        let hrmPages = [
            '/users/users',
            '/users/roles',
            '/users/payslip',
        ];

        let crmPages = [
            '/crm/dashboard',
            '/crm/leads',
            '/crm/followups',
            '/crm/sitevisits',
            '/crm/properties'
        ];
     
        let reportPages = [
            '/reports/exportreports',
            '/reports/vendorinvoicewithgst',
            '/reports/vendorinvoicewithoutgst',
            '/reports/customerpaymentreceipts',
            '/reports/contractorpaymentvoucher',
            '/reports/supplierpaymentvoucher',
            '/reports/contractortdsreport',
            '/reports/payrollvoucher',
            '/reports/expense',
            '/reports/stock',
            '/report/vendorinvoicewithgst',
            '/report/vendorinvoicewithoutgst',
            '/report/customerpaymentreceipts',
            '/report/contractorpaymentvoucher',
            '/report/supplierpaymentvoucher',
            '/report/contractortdsreport',
            '/report/payrollvoucher',
        ];

        let adminToolsPages = [
            '/admintools/workcategory',
            '/admintools/worktype',
            '/admintools/workactivity',
        ];

        if (path.startsWith('/dashboard')) {
            isActive = 'dashboard';
        } else if (projectPages.some(page => path.includes(page))) {
            isActive = 'projects'
        } else if (purchasePages.some(page => path.includes(page))) {
            isActive = 'purchase'
        } else if (contractPages.some(page => path.includes(page))) {
            isActive = 'contracts'
        } else if (salePages.some(page => path.includes(page))) {
            isActive = 'sales'
        } else if (financePages.some(page => path.includes(page))) {
            isActive = 'finance'
        } else if (hrmPages.some(page => path.includes(page))) {
            isActive = 'hrm'
        } else if (crmPages.some(page => path.includes(page))) {
            isActive = 'crm'
        } else if (reportPages.some(page => path.includes(page))) {
            isActive = 'reports'
        } else if (adminToolsPages.some(page => path.includes(page))) {
            isActive = "admintools"
        }
        return isActive

    }

    const megamenuItems: MenuItem[] = [
        // Dashboard Menu
        {
            label: 'Dashboard',
            className: activeMegaMenu() === 'dashboard' ? 'active-megamenu' : '',
            command: () => navigate('/dashboard'),
        },
        // Project Menu
        {
            label: 'Projects',
            className: activeMegaMenu() == 'projects' ? 'active-megamenu' : '',
            items: [
                // project sub menu header
                [
                    {
                        label: 'Project',
                        items: [
                            {
                                label: 'Project Detail',
                                template: templateFn('/projects/project')
                            },
                            {
                                label: 'Unit Detail',
                                template: templateFn('/projects/unit')
                            },
                            // {
                            //     label: 'Image Detail',
                            //     template: templateFn('/projects/images')
                            // },
                            // {
                            //     label: 'Project Status',
                            //     template: templateFn('/projects/projectstatus')
                            // },
                            // {
                            //     label: 'Project Type',
                            //     template: templateFn('/projects/projecttype')
                            // },
                            // {
                            //     label: 'Daily Progress',
                            //     template: templateFn('/projects/dailyprogress')
                            // },
                            {
                                label: 'Availability',
                                template: templateFn('/projects/availability')
                            },
                        ]
                    }
                    // {
                    //     label: 'Work',
                    //     items: [
                    //         {
                    //             label: 'Work Info',
                    //             template: templateFn('/projects/workinfo')
                    //         },
                    //     ]
                    // },
                ],
                // project sub menu header end
                // estiamte sub menu header
                // [
                //     {
                //         label: 'Estimate',
                //         items: [
                //             {
                //                 label: 'Schedule',
                //                 template: templateFn('/projects/expense')
                //             },
                //             {
                //                 label: 'Estimates',
                //                 template: templateFn('/projects/stock')
                //             },
                //         ]
                //     }
                // ],
                // estimate sub menu header end
            ]
        },
        // Project Menu end
        // Purchase Menu
        {
            label: 'Purchase',
            className: activeMegaMenu() == 'purchase' ? 'active-megamenu' : '',
            items: [
                [
                    // purchase sub menu header
                    {
                        label: 'Purchase',
                        items: [
                            {
                                label: 'Purchase Orders',
                                template: templateFn('/purchase/purchaseorder')
                            },
                            {
                                label: 'Vendor Invoices',
                                template: templateFn('/purchase/vendorinvoice')
                            },
                            {
                                label: 'Customer Purchase',
                                template: templateFn("/purchase/customerpurchase")
                            },

                            // {
                            //     label: 'Goods Registers',
                            //     template: templateFn('/purchase/materialpurchase')
                            // },

                        ]
                    },
                    // purchase sub menu header end
                    // vendor sub menu header
                    {
                        label: 'Vendors',
                        items: [
                            {
                                label: 'Material Vendors',
                                template: templateFn("/purchase/vendor")
                            },
                            // {
                            //     label: 'Material Vendor Type',
                            //     template: templateFn("/vendor/vendortype")
                            // },
                        ]
                    }
                    // vendor sub menu header end
                ],
                // items sub menu header
                [
                    {
                        label: 'Items',
                        items: [
                            {
                                label: 'Material Items',

                                template: templateFn("/purchase/items")
                            },
                            {
                                label: 'Material Item Rate Card',

                                template: templateFn("/purchase/itemratecard")
                            },
                            {
                                label: 'Material Item Sub Type',

                                template: templateFn("/purchase/itemsubtypes")
                            },
                            {
                                label: 'Material Item Type',

                                template: templateFn("/purchase/itemtypes")
                            },
                            {
                                label: 'UOM',

                                template: templateFn("/purchase/uoms")
                            },
                            {
                                label: 'Purpose',

                                template: templateFn("/purchase/purposes")
                            },
                            {
                                label: 'Brand',

                                template: templateFn("/purchase/brand")
                            },
                        ]
                    }
                ],
                // items sub menu header end
                // templates sub menu
                [
                    {
                        label: 'Templates',
                        items: [
                            {
                                label: 'Item Kit',
                                template: templateFn('/purchase/itemkit'),
                            }
                        ]
                    },
                ],
                // templates sub menu end
            ]
        },
        // Purchase Menu end
        // Contracts Menu
        {
            label: 'Contracts',
            className: activeMegaMenu() == 'contracts' ? 'active-megamenu' : '',
            items: [
                // contracts sub menu header
                [
                    {
                        label: 'Contracts',
                        items: [
                            {
                                label: 'Contractor Agreements',
                                template: templateFn('/contract/contractagreement')
                            },
                            {
                                label: 'Contractor Invoice',
                                template: templateFn('/contract/contractorinvoice')
                            },
                            {
                                label: 'Contractors',
                                template: templateFn('/contract/contractor')
                            },
                            {
                                label: 'Contractor Type',
                                template: templateFn('/contract/contractortype')
                            }
                        ]
                    }
                ],
                // contracts sub menu header end
                // templates sub menu
                [
                    {
                        label: 'Templates',
                        items: [
                            {
                                label: 'Contractor Service',
                                template: templateFn('/contract/contractservices'),
                            },
                            {
                                label: 'Payment Schedule',
                                template: templateFn('/contract/paymentschedules'),
                            }

                        ]
                    },
                ],
                // templates sub menu end
            ]
        },
        // Contracts Menu end
        // Sales Menu
        {
            label: 'Sales',
            className: activeMegaMenu() == 'sales' ? 'active-megamenu' : '',
            items: [
                // agreeements sub menu header
                [
                    {
                        label: 'Agreements',
                        items: [
                            {
                                label: 'Sale Agreement',
                                template: templateFn('/sales/saleagreement')
                            },
                            {
                                label: 'Construction Agreement',
                                template: templateFn('/sales/constructionagreement')
                            }
                        ]
                    }
                ],
                // agreements sub menu header end
                // sales sub menu header
                [
                    {
                        label: 'Sales',
                        items: [
                            {
                                label: 'Sale Invoice',
                                template: templateFn('/sales/saleinvoice')
                            },
                            // {
                            //     label: 'Receipts',
                            //     template: templateFn('/sales/constructionagreement')
                            // },
                            {
                                label: 'Customers',
                                template: templateFn('/sales/customers')
                            },
                        ]
                    }
                ],
                // sales sub menu header end 
                // templates sub menu
                [
                    {
                        label: 'Templates',
                        items: [
                            {
                                label: 'Payment Schedule',
                                style: { width: '100%' },
                                template: templateFn('/sales/customerpaymentschedule'),
                            }
                        ]
                    },
                ],
                // templates sub menu end
            ]
        },
        // Sales Menu end
        // Finance Menu
        {
            label: 'Finance',
            className: activeMegaMenu() == 'finance' ? 'active-megamenu' : '',
            items: [
                [
                    // payements sub menu header
                    {
                        label: 'Payments',
                        items: [
                            {
                                label: 'Make Payments',
                                template: templateFn("/payment/vendorpayment")
                            },
                            {
                                label: 'Receive Payments',
                                template: templateFn("/payment/salereceipt")
                            },
                            {
                                label: 'Extra Expenses',
                                template: templateFn("/payment/expenses")
                            },
                            {
                                label: 'Expense Type',
                                template: templateFn("/payment/expensetype")
                            },
                            // {
                            //     label: 'Payment History',

                            //     template: templateFn("/payment/vendorpaymenthistory")
                            // },
                            // {
                            //     label: 'Account Transaction',
                            //     template: templateFn("/payment/debit")
                            // },
                            // {
                            //     label: 'Transaction History',

                            //     template: templateFn("/payment/transactionhistory")
                            // },
                        ]
                    },
                    // payments sub menu header end
                ],
                [
                    // tax sub menu header
                    // {
                    //     label: 'Tax',
                    //     items: [
                    //         {
                    //             label: 'Purchase GST',
                    //             template: templateFn('/tax/purchasegst')
                    //         },
                    //         {
                    //             label: 'Sales GST',
                    //             template: templateFn('/tax/salesgst')
                    //         },
                    //         {
                    //             label: 'Purchase TDS',
                    //             template: templateFn('/tax/purchasetds')
                    //         },
                    //         {
                    //             label: 'Sale TDS',
                    //             template: templateFn('/tax/saletds')
                    //         },
                    //     ]
                    // },
                    // tax sub menu header end
                    // audit reports sub menu header
                    // {
                    //     label: 'Audit Reports',
                    //     items: [
                    //         {
                    //             label: 'Download Reports',
                    //             template: templateFn('/report/exportreports')
                    //         },
                    //         {
                    //             label: 'View Reports',
                    //             template: templateFn('/report/vendorinvoicewithgst')
                    //         }
                    //     ]
                    // },
                    // audit reports sub menu header end
                    // bank account sub menu header
                    {
                        label: 'Bank Account',
                        items: [
                            {
                                label: 'Bank Accounts',
                                template: templateFn('/payment/bank/accounts')
                            },
                        ]
                    },
                    // bank account sub menu header
                ],
            ]
        },
        // Finance Menu end
        // HRM Menu
        {
            label: 'HRM',
            className: activeMegaMenu() == 'hrm' ? 'active-megamenu' : '',
            items: [
                // employee sub menu header
                [
                    {
                        label: 'Empolyee',
                        items: [
                            {
                                label: 'Employees',

                                template: templateFn('/users/users'),
                            },
                            {
                                label: 'Roles',

                                template: templateFn("/users/roles"),
                            },
                            {
                                label: 'Payslip',
                                
                                template: templateFn("/users/payslip"),
                            },
                        ]
                    },
                ],
                // employee sub menu header end
                // attendance sub menu header
                // [
                //     {
                //         label: 'Attendance',
                //         items: [
                //             {
                //                 label: 'Employee Attendance',

                //                 template: templateFn('/users/users'),
                //             },
                //             {
                //                 label: 'Labor Attendance',

                //                 template: templateFn("/users/roles"),
                //             }
                //         ]
                //     },
                // ]
                // attendance sub menu header end
            ]
        },
        // HRM Menu end
        // CRM Menu
        {
            label: 'CRM',
            className: activeMegaMenu() == 'crm' ? 'active-megamenu' : '',
            items: [
                // leads sub menu header
                [
                    {
                        label: 'Leads',
                        items: [

                            {
                                label: 'Leads',
                                template: templateFn('/crm/leads'),
                            },
                            {
                                label: 'Follow Ups',
                                template: templateFn('/crm/followups'),
                            },
                            {
                                label: 'Site Visits',
                                template: templateFn('/crm/sitevisits'),
                            },
                            {
                                label: 'Active Follow-Up',
                                template: templateFn('/crm/activefollowup'),
                            },
                            {
                                label: 'Junk Leads',
                                template: templateFn('/crm/junkleads'),
                            }
                        ]
                    }
                ],
                // leads sub menu header end
                // menu sub menu header
                [
                    {
                        label: 'Menu',
                        items: [
                            {
                                label: 'Dashboard',
                                template: templateFn('/crm/dashboard'),
                            },
                            {
                                label: 'Property',
                                template: templateFn('/crm/properties'),
                            },
                            // {
                            //   label: 'Follow Up Stages',
                            //   template: templateFn('/crm/followupstages'),
                            // },
                            // {
                            //   label: 'Budget Ranges',
                            //   template: templateFn('/crm/budgets'),
                            // },
                            // {
                            //   label: 'Occupancies',
                            //   template: templateFn('/crm/occupancies'),
                            // },
                            // {
                            //   label: 'Occupancy Sub Types',
                            //   template: templateFn('/crm/occupancysubtypes'),
                            // },
                        ]
                    }
                ]
                // menu sub menu header end
            ]
        },
        // CRM Menu end
        // Reports Menu
        {
            label: 'Reports',
            className: activeMegaMenu() == 'reports' ? 'active-megamenu' : '',
            items: [
                [
                    // audit reports sub menu header
                    {
                        label: 'Audit Reports',
                        items: [
                            {
                                label: 'Download Reports',
                                template: templateFn('/reports/exportreports')
                            },
                            {
                                label: 'View Reports',
                                template: templateFn('/reports/vendorinvoicewithgst')
                            }
                        ]
                    },
                    // audit reports sub menu header end
                    // expense sub menu header
                    {
                        label: 'Expenses',
                        items: [
                            {
                                label: 'Expense Report',
                                template: templateFn('/reports/expense')
                            },
                            {
                                label: 'Stock Report',
                                template: templateFn('/reports/stock')
                            },
                        ]
                    }
                    // expense sub menu header end
                ],
            ]
        }
        // Reports Menu end
        // Admin Tools Menu
        // {
        //     label: 'Admin Tools',
        //     className: activeMegaMenu() == 'admintools' ? 'active-megamenu' : '',
        //     items: [
        //         [
        //             {
        //                 label: 'Menu',
        //                 items: [
        //                     {
        //                         label: 'Work Category',
        //                         template: templateFn('/admintools/workcategory'),
        //                     },
        //                     {
        //                         label: 'Work Type',
        //                         template: templateFn('/admintools/worktype'),
        //                     },
        //                     {
        //                         label: 'Work Activity',
        //                         template: templateFn('/admintools/workactivity'),
        //                     }
        //                 ]
        //             },
        //         ],
        //     ]
        // },
        // Admin Tools Menu end
    ];

    return (
        <>
            {
                megamenu ?
                    <MegaMenu start={start} model={megamenuItems} end={rightContents} />
                    :
                    <Menubar model={routes.map(x => {
                        x.command = toggle;
                        return x;
                    })} end={rightContents} />
            }
            <Dialog
                header={`Change Company`}
                visible={displayModal}
                position={'top'}
                modal style={{ width: '40vw' }}
                onHide={() => setDisplayModal(false)}
                draggable={false} resizable={false}
            >
                <div style={{ padding: 15 }}>
                    <div className="field">
                        <label style={{ fontSize: 18 }} className={'col-4'}> Companies List</label>
                        <Dropdown
                            style={{ width: '60%' }}
                            // value={selectedStatus}
                            placeholder='Select a Company'
                            onChange={async (e: any) => {
                                let company = companies?.find(x => x.id === e.value)
                                await dispatch(setGlobalCompany(company))
                                await setDisplayModal(false)
                                window.location.reload()
                            }}
                            optionLabel={"name"}
                            optionValue={"id"}
                            options={user?.company || []}
                        />
                    </div>
                </div>
            </Dialog>
        </>

    )

}

export default Header;