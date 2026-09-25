import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useForm, Controller } from 'react-hook-form'
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { CurrencyFormatter, Datacolumn, Datatable, ListLayout, getFormErrorMessage } from '@igblsln/control';
import { useActiveContractorsQuery, useActiveProjectQuery, useActiveVendorsQuery } from '@igblsln/store';
import { classNames } from "primereact/utils";
import { TabView, TabPanel } from 'primereact/tabview';
import { useListWeeklyPurchasePaymentQuery } from '../api';
import { PAGE_NAME } from '../constants';
// import './style.scss';
import VendorPaymentModal from './Modals/VendorPaymentModal';
import ContractorPaymentModal from './Modals/ContractorPaymentModal';
import SalaryPaymentModal from './Modals/SalaryPaymentModal';
import AllowancePaymentModal from './Modals/AllowancePaymentModal';

type Props = {}

const Main = (props: Props) => {
  const { data } = useActiveVendorsQuery()
  const navigate = useNavigate()
  const [contractorsEntries, setContractorsEntries] = useState<any[]>([])
  const [vendorsEntries, setVendorsEntries] = useState<any[]>([])
  const [selectedContractor, setSelectedContractor] = useState<any>(null)
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [selectedVendorKey, setSelectedVendorKey] = useState<any>('')
  const [upperDropdown, setUpperDropdown] = useState<'week' | 'month'>('week')
  const [displayVendorPaymentModal, setDisplayVendorPaymentModal] = useState(false);
  const [displayContractorPaymentModal, setDisplayContractorPaymentModal] = useState(false);
  const [displaySalaryPaymentModal, setDisplaySalaryPaymentModal] = useState(false);
  const [displayAllowancePaymentModal, setDisplayAllowancePaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [weekId, setWeekId] = useState<any>(2);
  const [monthId, setMonthId] = useState<any>(1);
  const ref = useRef(contractorsEntries);
  const vendorsRef = useRef<any[]>([]);
  const contractorsRef = useRef<any[]>([]);
  const projectsRef = useRef<any[]>([]);
  const { data: vendors } = useActiveVendorsQuery()
  const { data: contractors } = useActiveContractorsQuery()
  const { data: projects } = useActiveProjectQuery();

  const { control, formState: { errors, isDirty }, handleSubmit, reset, clearErrors, } = useForm({});

  const { data: weeklyPayment, isFetching: isWeeklyPaymentFetching } = useListWeeklyPurchasePaymentQuery({ weeklyId: selectedVendorKey }, { skip: !selectedVendorKey })

  useEffect(() => {
    vendorsRef.current = vendors || [];
    contractorsRef.current = contractors || [];
    projectsRef.current = projects || [];
  }, [vendors, projects, contractors])

  const summaryRenderer = (descr: string, value: number) => {
    return <strong> {descr} : <CurrencyFormatter value={value || 0} /> </strong>;
  }

  const removeItem = (val: any) => {
    const updValue = ref.current.filter(x => x !== val)
    ref.current = updValue;
    setContractorsEntries(updValue);
    setSelectedContractor(null)
    setVendorsEntries(updValue);
    setSelectedVendor(null)
  }

  const actionBodyTemplate = (value: any) => {
    return <>
      {/* <Button icon="pi pi-eye" className="p-button-rounded p-button-text"></Button> */}
      <Button
        style={{ height: '35px', width: '20px', marginLeft: 20 }}
        type="button"
        onClick={() => {
          confirmDialog({
            message: 'Are you sure you want to Delete Item?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => removeItem(value),
            reject: () => { }
          });
        }}
        className="p-button-rounded p-button-text"
        icon="pi pi-trash"></Button>
    </>
  }

  const getVendorsDropdown = ({ row, column, onRowChange, onClose }: any) => {
    return <Dropdown autoFocus style={{ width: '100%' }} className="p-inputtext-sm"
      value={row[column.key]}
      optionLabel="name"
      optionValue="key"
      filter
      filterBy={"name"}
      options={vendorsRef.current}
      onChange={(e: any) => {
        let clone = { ...row }
        clone[column.key] = e.value;
        onRowChange(clone, true)
      }}
      tabIndex={-1} />
  };

  const getContractorsDropdown = ({ row, column, onRowChange, onClose }: any) => {
    return <Dropdown autoFocus style={{ width: '100%' }} className="p-inputtext-sm"
      value={row[column.key]}
      optionLabel="name"
      optionValue="key"
      filter
      filterBy={"name"}
      options={contractorsRef.current}
      onChange={(e: any) => {
        let clone = { ...row }
        clone[column.key] = e.value;
        onRowChange(clone, true)
      }}
      tabIndex={-1} />
  };

  const getProjectOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
    return <Dropdown autoFocus style={{ width: '100%' }} className="p-inputtext-sm"
      value={row[column.key]}
      optionLabel="name"
      optionValue="key"
      filter
      filterBy={"name"}
      options={projectsRef.current}
      onChange={(e: any) => {
        let clone = { ...row }
        clone[column.key] = e.value;
        onRowChange(clone, true)
      }}
      tabIndex={-1} />
  };

  const customDiscard = () => {
    setDisplayVendorPaymentModal(false)
    setDisplayContractorPaymentModal(false)
    setDisplaySalaryPaymentModal(false)
    setDisplayAllowancePaymentModal(false)
  }

  return (
    <>
      {/* <div className='flex'>
        <h3 className={classNames('m-0 my-auto')} >{PAGE_NAME}</h3>
      </div> */}
      <div className="pl-5">
        {
          upperDropdown === "week" ? (
            <div className="field">
              <label className={classNames('col-2')}>Week ID</label>
              <Dropdown
                style={{ width: '25%' }}
                value={weekId}
                onChange={(e) => setWeekId(e.target.value)}
                options={Array.from({ length: 52 }, (_, i) => i + 1)}
              />
            </div>
          ) :
            (
              <div className="field">
                <label className={classNames('col-2')}>Month ID</label>
                <Dropdown
                  style={{ width: '25%' }}
                  value={monthId}
                  onChange={(e) => setMonthId(e.target.value)}
                  options={Array.from({ length: 12 }, (_, i) => i + 1)}
                />
              </div>
            )
        }
      </div>
      <TabView onTabChange={(e) => {

        if (e.index < 2) setUpperDropdown('week');
        else setUpperDropdown('month')

        setActiveTab(e.index)
      }} activeIndex={activeTab} className='custom-tabview pl-5'>
        <TabPanel header="Vendor">
          <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`} description={PAGE_NAME} isLoading={isWeeklyPaymentFetching}
              data={vendorsEntries}
              newTable
              tableLayoutClass='h-full'
              allowFilters={false}
              actionBodyTemplate={actionBodyTemplate}
              gridProps={{
                allowAdd: true,
                OnRowsChanged: (rows: any[]) => {
                  setVendorsEntries(rows);
                  ref.current = rows;
                  setSelectedVendor(null)
                },
              }}>
              <Datacolumn
                field="vendor"
                width="25%"
                header="Vendor"
                displayValueGetter={(row, field) => {
                  if (!Array.isArray(row)) {
                    let temp = vendorsRef.current?.filter(d => d.key === row[field])
                    if (temp.length) {
                      return temp[0].name
                    }
                    else {
                      return row?.items?.descr
                    }
                  }
                }}
                editorType={getVendorsDropdown}
              />
              <Datacolumn
                field="project"
                width="25%"
                header="Company Name"
                displayValueGetter={(row, field) => {
                  if (!Array.isArray(row)) {
                    let temp = projectsRef.current?.filter(d => d.key === row[field])
                    if (temp.length) {
                      return temp[0].name
                    }
                    else {
                      return row?.items?.descr
                    }
                  }
                }}
                editorType={getProjectOptionsEditor}
              />
              <Datacolumn field="totalamt" header="Pending Amt" type="currency" defaultValue={0} summaryFormatter={({ row }: any) => summaryRenderer("Total Pending Payment", row?.totalamt)} />
              <Datacolumn field="estamt" header="Estimated Amt" type="currency" defaultValue={0} editorType={"currency"} summaryFormatter={({ row }: any) => summaryRenderer("Estimated Payment", row?.estamt)} />
              <Datacolumn
                field="invoicedetails"
                header="Invoice Details"
                type="custom"
                displayValueGetter={(row: any) =>
                  <i className="pi pi-file"
                    style={{
                      fontSize: '1.6rem',
                      display: 'flex',
                      marginTop: 5,
                      justifyContent: 'center',
                      cursor: 'pointer',
                      pointerEvents: row.vendor ? 'auto' : 'none'
                    }}
                    onClick={() => {
                      setSelectedVendor(row?.vendor)
                    }}
                  ></i>}
              />
              <Datacolumn
                field="makepayment"
                header="Make Payment"
                type="custom"
                displayValueGetter={(row: any) =>
                  <i className="pi pi-credit-card"
                    style={{
                      fontSize: '1.8rem',
                      display: 'flex',
                      marginTop: 5,
                      justifyContent: 'center',
                      cursor: 'pointer',
                      pointerEvents: row.vendor ? 'auto' : 'none'
                    }}
                    onClick={() => {
                      // navigate(`/payment/vendorpayment/new`, { state: { vendor: row.vendor } })
                      setSelectedVendor(row.vendor)
                      setDisplayVendorPaymentModal(true)
                    }}
                  ></i>}
              />
            </ListLayout>
          </div>
          {
            selectedVendor &&
            <>
              <div style={{ marginTop: 30, justifyContent: 'center' }} className='flex'>
                <h3 className={classNames('m-0 my-auto')} >{"Pending Invoice Details"}</h3>
              </div>
              <div className="col-8" style={{ height: 'calc(100% - 183px)', minHeight: 200, margin: "auto" }}>
                <ListLayout baseRoute={`/weeklypayment`} description={PAGE_NAME} isLoading={isWeeklyPaymentFetching}
                  data={[]}
                  newTable
                  tableLayoutClass='h-full'
                  allowFilters={false}
                  actionBodyTemplate={actionBodyTemplate}
                  gridProps={{
                    allowAdd: false,
                  }}>
                  <Datacolumn field="date" header="Invoice Date" type="text" defaultValue={""} />
                  <Datacolumn field="no" header="Invoice No" type="text" defaultValue={""} />
                  <Datacolumn field="amt" header="Invoice Amount" type="text" defaultValue={""} />
                  <Datacolumn field="project" header="Project Name" type="text" defaultValue={""} />
                </ListLayout>
              </div>
            </>
          }

        </TabPanel>
        <TabPanel header="Contractor">

          <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`} description={PAGE_NAME} isLoading={isWeeklyPaymentFetching}
              data={contractorsEntries}
              newTable
              tableLayoutClass='h-full'
              allowFilters={false}
              actionBodyTemplate={actionBodyTemplate}
              gridProps={{
                allowAdd: true,
                OnRowsChanged: (rows: any[]) => {
                  setContractorsEntries(rows);
                  ref.current = rows;
                  setSelectedContractor(null)
                },
                // getBottomSummaryRows: (rows: any) => {
                //   return [{
                //     estamt: rows.map((x: any) => parseFloat(x.estamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0),
                //     totalamt: rows.map((x: any) => parseFloat(x.totalamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0),
                //   }];
                // }
              }}>
              <Datacolumn
                field="contractor"
                width="25%"
                header="Contractor"
                displayValueGetter={(row, field) => {
                  if (!Array.isArray(row)) {
                    let temp = contractorsRef.current?.filter(d => d.key === row[field])
                    if (temp.length) {
                      return temp[0].name
                    }
                    else {
                      return row?.items?.descr
                    }
                  }
                }}
                editorType={getContractorsDropdown}
              />
              <Datacolumn
                field="project"
                width="25%"
                header="Company Name"
                displayValueGetter={(row, field) => {
                  if (!Array.isArray(row)) {
                    let temp = projectsRef.current?.filter(d => d.key === row[field])
                    if (temp.length) {
                      return temp[0].name
                    }
                    else {
                      return row?.items?.descr
                    }
                  }
                }}
                editorType={getProjectOptionsEditor}
              />
              <Datacolumn field="totalamt" header="Pending Amt" type="currency" defaultValue={0} summaryFormatter={({ row }: any) => summaryRenderer("Total Pending Payment", row?.totalamt)} />
              <Datacolumn field="estamt" header="Estimated Amt" type="currency" defaultValue={0} editorType={"currency"} summaryFormatter={({ row }: any) => summaryRenderer("Estimated Payment", row?.estamt)} />
              <Datacolumn
                field="invoicedetails"
                header="Invoice Details"
                type="custom"
                displayValueGetter={(row: any) =>
                  <i className="pi pi-file"
                    style={{
                      fontSize: '1.6rem',
                      display: 'flex',
                      marginTop: 5,
                      justifyContent: 'center',
                      cursor: 'pointer',
                      pointerEvents: row.contractor ? 'auto' : 'none'
                    }}
                    onClick={() => {
                      setSelectedContractor(row?.contractor)
                    }}
                  ></i>}
              />
              <Datacolumn
                field="makepayment"
                header="Make Payment"
                type="custom"
                displayValueGetter={(row: any) =>
                  <i className="pi pi-credit-card"
                    style={{
                      fontSize: '1.8rem',
                      display: 'flex',
                      marginTop: 5,
                      justifyContent: 'center',
                      cursor: 'pointer',
                      pointerEvents: row.contractor ? 'auto' : 'none'
                    }}
                    onClick={() => {
                      // navigate(`/payment/contractorpayment/new`, { state: { contractor: row.contractor } })
                      setSelectedContractor(row.contractor)
                      setDisplayContractorPaymentModal(true)
                    }}
                  ></i>}
              />
            </ListLayout>
          </div>
          {
            selectedContractor &&
            <>
              <div style={{ marginTop: 30, justifyContent: 'center' }} className='flex'>
                <h3 className={classNames('m-0 my-auto')} >{"Pending Invoice Details"}</h3>
              </div>
              <div className="col-8" style={{ height: 'calc(100% - 183px)', minHeight: 200, margin: "auto" }}>
                <ListLayout baseRoute={`/weeklypayment`} description={PAGE_NAME} isLoading={isWeeklyPaymentFetching}
                  data={[]}
                  newTable
                  tableLayoutClass='h-full'
                  allowFilters={false}
                  actionBodyTemplate={actionBodyTemplate}
                  gridProps={{
                    allowAdd: false,
                  }}>
                  <Datacolumn field="date" header="Invoice Date" type="text" defaultValue={""} />
                  <Datacolumn field="no" header="Invoice No" type="text" defaultValue={""} />
                  <Datacolumn field="amt" header="Invoice Amount" type="text" defaultValue={""} />
                  <Datacolumn field="project" header="Project Name" type="text" defaultValue={""} />
                </ListLayout>
              </div>
            </>
          }

        </TabPanel>
        <TabPanel header="Salary/Allowance">
          <TabView activeIndex={0} className='pl-5'>

            <TabPanel header="Salary">
              <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
                <ListLayout baseRoute={`/weeklypayment`} description={PAGE_NAME} isLoading={isWeeklyPaymentFetching}
                  data={contractorsEntries}
                  newTable
                  tableLayoutClass='h-full'
                  allowFilters={false}
                  actionBodyTemplate={actionBodyTemplate}
                  gridProps={{
                    allowAdd: true,
                    OnRowsChanged: (rows: any[]) => {
                      setContractorsEntries(rows);
                      ref.current = rows;
                      setSelectedContractor(null)
                    },
                  }}>
                  <Datacolumn field="date" header="Date" type="date" defaultValue={""} />
                  <Datacolumn
                    field="staff"
                    width="25%"
                    header="Staff Name"
                    displayValueGetter={(row, field) => {
                      if (!Array.isArray(row)) {
                        let temp = contractorsRef.current?.filter(d => d.key === row[field])
                        if (temp.length) {
                          return temp[0].name
                        }
                        else {
                          return row?.items?.descr
                        }
                      }
                    }}
                    editorType={getContractorsDropdown}
                  />
                  <Datacolumn
                    field="company"
                    width="25%"
                    header="Company Name"
                    displayValueGetter={(row, field) => {
                      if (!Array.isArray(row)) {
                        let temp = projectsRef.current?.filter(d => d.key === row[field])
                        if (temp.length) {
                          return temp[0].name
                        }
                        else {
                          return row?.items?.descr
                        }
                      }
                    }}
                    editorType={getProjectOptionsEditor}
                  />

                  <Datacolumn field="totalamt" header="Amount" type="currency" defaultValue={0} summaryFormatter={({ row }: any) => summaryRenderer("Total Pending Payment", row?.totalamt)} />

                  <Datacolumn
                    field="makepayment"
                    header="Make Payment"
                    type="custom"
                    displayValueGetter={(row: any) =>
                      <i className="pi pi-credit-card"
                        style={{
                          fontSize: '1.8rem',
                          display: 'flex',
                          marginTop: 5,
                          justifyContent: 'center',
                          cursor: 'pointer',
                          // pointerEvents: row.contractor ? 'auto' : 'none'
                        }}
                        onClick={() => {
                          setDisplaySalaryPaymentModal(true)
                        }}
                      ></i>}
                  />
                </ListLayout>
              </div>
            </TabPanel>

            <TabPanel header="Allowance">
              <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
                <ListLayout baseRoute={`/weeklypayment`} description={PAGE_NAME} isLoading={isWeeklyPaymentFetching}
                  data={contractorsEntries}
                  newTable
                  tableLayoutClass='h-full'
                  allowFilters={false}
                  actionBodyTemplate={actionBodyTemplate}
                  gridProps={{
                    allowAdd: true,
                    OnRowsChanged: (rows: any[]) => {
                      setContractorsEntries(rows);
                      ref.current = rows;
                      setSelectedContractor(null)
                    },
                  }}>
                  <Datacolumn field="date" header="Date" type="date" defaultValue={""} />
                  <Datacolumn
                    field="staff"
                    width="25%"
                    header="Staff Name"
                    displayValueGetter={(row, field) => {
                      if (!Array.isArray(row)) {
                        let temp = contractorsRef.current?.filter(d => d.key === row[field])
                        if (temp.length) {
                          return temp[0].name
                        }
                        else {
                          return row?.items?.descr
                        }
                      }
                    }}
                    editorType={getContractorsDropdown}
                  />
                  <Datacolumn
                    field="company"
                    width="25%"
                    header="Company Name"
                    displayValueGetter={(row, field) => {
                      if (!Array.isArray(row)) {
                        let temp = projectsRef.current?.filter(d => d.key === row[field])
                        if (temp.length) {
                          return temp[0].name
                        }
                        else {
                          return row?.items?.descr
                        }
                      }
                    }}
                    editorType={getProjectOptionsEditor}
                  />

                  <Datacolumn field="totalamt" header="Amount" type="currency" defaultValue={0} summaryFormatter={({ row }: any) => summaryRenderer("Total Pending Payment", row?.totalamt)} />

                  <Datacolumn
                    field="makepayment"
                    header="Make Payment"
                    type="custom"
                    displayValueGetter={(row: any) =>
                      <i className="pi pi-credit-card"
                        style={{
                          fontSize: '1.8rem',
                          display: 'flex',
                          marginTop: 5,
                          justifyContent: 'center',
                          cursor: 'pointer',
                          // pointerEvents: row.contractor ? 'auto' : 'none'
                        }}
                        onClick={() => {
                          setDisplayAllowancePaymentModal(true)
                        }}
                      ></i>}
                  />
                </ListLayout>
              </div>
            </TabPanel>

          </TabView>
        </TabPanel>
        <TabPanel header="GST">
          GST
        </TabPanel>
        <TabPanel header="TDS">
          TDS
        </TabPanel>
      </TabView>


      <VendorPaymentModal displayModal={displayVendorPaymentModal} vendorId={selectedVendor} customDiscard={customDiscard} />
      <ContractorPaymentModal displayModal={displayContractorPaymentModal} contractorId={selectedVendor} customDiscard={customDiscard} />
      <SalaryPaymentModal displayModal={displaySalaryPaymentModal} staffId={selectedVendor} customDiscard={customDiscard} />
      <AllowancePaymentModal displayModal={displayAllowancePaymentModal} staffId={selectedVendor} customDiscard={customDiscard} />

    </>
  );
}

export default Main