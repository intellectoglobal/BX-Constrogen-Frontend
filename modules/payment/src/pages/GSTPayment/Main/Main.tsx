import React, { useEffect, useState, useRef } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, formatDate, useActiveProjectQuery, useActiveContractorsQuery, useAppDispatch, setPaymentMenu } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { useDeleteContractorPaymentMutation, useListContractorPaymentQuery } from '../api';
import MakePaymentSingleInvoiceModal from '../Modals/MakePaymentSingleInvoiceModal';
import MakePaymentMultipleInvoiceModal from '../Modals/MakePaymentMultipleInvoiceModal';
import ViewVoucherModal from '../Modals/ViewVoucherModal';
import { TabView, TabPanel } from 'primereact/tabview';


type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [activeTab, setActiveTab] = useState(0);
  const [selectedContractor, setSelectedContractor] = useState<any>(null)
  const [allProjects, setAllProjects] = useState<any>([])
  const [allContractors, setAllContractors] = useState<any>([])
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedContractorKey, setSelectedContractorKey] = useState<any>(null)
  const [displayViewModal, setDisplayViewModal] = useState(false);
  const [displayViewMultipleInvoiceModal, setDisplayViewMultipleInvoiceModal] = useState(false);
  const [displayViewVoucherModal, setDisplayViewVoucherModal] = useState(false);
  const [displayPayMultipleInvoiceModal, setDisplayPayMultipleInvoiceModal] = useState(false);
  const [displayPaySingleInvoiceModal, setDisplayPaySingleInvoiceModal] = useState(false);
  const [displayContractorPaymentModal, setDisplayContractorPaymentModal] = useState(false);
  const [selectedRows, setSelectedContractorRows] = useState<any[]>([])
  const [paymentFrom, setPaymentFrom] = useState<any>(null)
  const [paymentTo, setPaymentTo] = useState<any>(null)
  const { data: projects } = useActiveProjectQuery()
  const { data: contractors } = useActiveContractorsQuery()
  const { data, isFetching: isLoading } = useListContractorPaymentQuery({ page: page, size: size, project: selectedProjectKey, paymentfrom: paymentFrom ? formatDate(paymentFrom) : null, paymentto: paymentTo ? formatDate(paymentTo) : null })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteContractorPaymentMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();
  const ref = useRef(data || []);
  const contractorsRef = useRef<any[]>([]);
  const [contractorsEntries, setContractorsEntries] = useState<any[]>([])

  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(setPaymentMenu('make'));
    return () => {
      dispatch(setPaymentMenu(''));
    };
  }, [dispatch]);

  useEffect(() => {
    if (projects) {
      setAllProjects([
        {
          key: null,
          name: 'All'
        },
        ...projects
      ])
    }
  }, [projects])

  useEffect(() => {
    contractorsRef.current = contractors || [];
    if (contractors) {
      setAllContractors([
        {
          key: null,
          name: 'All'
        },
        ...contractors
      ])
    }
  }, [contractors])

  const customDiscard = () => {
    setDisplayPaySingleInvoiceModal(false)
    setDisplayPayMultipleInvoiceModal(false)
    setDisplayViewVoucherModal(false)
  }

  const removeItem = (val: any) => {
    const updValue = ref.current.filter(x => x !== val)
    ref.current = updValue;
    setContractorsEntries(updValue)
  }

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

  const getCheckboxEditor = ({ row, column, onRowChange, onClose }: any) => {
    return <Checkbox style={{ width: '100%', display: 'flex', margin: '10px auto', justifyContent: 'center' }}
      checked={row[column.key]}
      onChange={(e: any) => {
        onRowChange({ ...row, [column.key]: e.checked }, true)
        onClose(true)
      }}
      tabIndex={-1} />
  };

  return (
    <>
      <Divider />



      <TabView
        className='custom-tabview'
      >
        <TabPanel header="Pay Monthly Challan">
          <div className="field col-6">
            <label className={'col-4'}>Select Month</label>
            <Dropdown
              style={{ width: '60%' }}
              placeholder='All'
              options={[]}
            />
          </div>
          <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`} description={"Pending Payments"} isLoading={isLoading}
              data={[{
                contractor: 'ABC Contractor',
                itemtype: "Plumbing",
                totalamt: 500,
                estamt: 500,
              }]}
              newTable
              showHeader
              hideAddButton
              tableLayoutClass='h-full'
              allowFilters={false}
              hideActionColumn
              actionBodyTemplate={actionBodyTemplate}
              gridProps={{
                allowAdd: false,
                OnRowsChanged: (rows: any[]) => {
                  setContractorsEntries(rows);
                  ref.current = rows;
                  setSelectedContractor(null)
                },
              }}>
              <Datacolumn
                field="date"
                header="Date"
              />
              <Datacolumn
                field="challan"
                header="Invoice No"
              />
              <Datacolumn
                field="challan1"
                header="Project Name"
              />
              <Datacolumn
                field="challan2"
                header="Contractor Name"
              />
              <Datacolumn
                field="challan2"
                header="Unit Name"
              />
              <Datacolumn field="totalamt" header="GST To Pay" type="currency" defaultValue={0} />
              <Datacolumn width={"10%"} field="selected" defaultValue={false} header="Select" type="checkbox" editorType={getCheckboxEditor} />
              {/* <Datacolumn
                width={"15%"}
                field="makepayment"
                header="Make Payment"
                type="custom"
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => {
                      setSelectedContractor(row?.contractor)
                      setDisplayPayMultipleInvoiceModal(true)
                    }}
                  >
                    Make
                  </Button>
                }
              /> */}

            </ListLayout>
            <Button
              label='Make Payment'
              style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: 5,
                display: 'flex',
                width: 200
              }}
              onClick={() => {
                setDisplayPayMultipleInvoiceModal(true)
              }}
              className='p-button-plain'
            />
          </div>
        </TabPanel>

        <TabPanel header="GST Voucher">
          <div className="flex">
            <div className="field col-6">
              <label className={'col-4'}>From Date</label>
              <Calendar
                style={{ width: '60%' }}
                showIcon
              />
            </div>
            <div className="field col-6">
              <label className={'col-4'}>To Date</label>
              <Calendar
                style={{ width: '60%' }}
                showIcon
              />
            </div>
          </div>

          <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`} description={"Pending Payments"} isLoading={isLoading}
              data={[
                {
                  voucherid: 101,
                  contractor: "ABC Contractor",
                  invoicetype: "Plumbing",
                  amount: 15000,
                  mode: "Cash",
                  notes: "Test Voucher"
                }
              ]}
              newTable
              showHeader
              hideAddButton
              tableLayoutClass='h-full'
              allowFilters={false}
              hideActionColumn
              gridProps={{
                allowAdd: false,
                OnRowsChanged: (rows: any[]) => {
                  setContractorsEntries(rows);
                  ref.current = rows;
                  setSelectedContractor(null)
                },
              }}>
              <Datacolumn
                field="date"
                header="Date"
              />
              <Datacolumn
                field="voucherid"
                header="Voucher ID"
              />
              <Datacolumn
                field="amount"
                header="Amount"
              />
              <Datacolumn
                field="mode"
                header="Payment Mode"
              />
              <Datacolumn
                field="notes"
                header="Notes"
              />
              <Datacolumn
                width={"10%"}
                field="view"
                header=""
                type="custom"
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => {
                      setSelectedContractor(row?.contractor)
                      setDisplayViewVoucherModal(true)
                    }}
                  >
                    View
                  </Button>
                }
              />
              <Datacolumn
                width={"10%"}
                field="delete"
                header=""
                type="custom"
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => {
                      setSelectedContractor(row?.contractor)
                      setDisplayContractorPaymentModal(true)
                    }}
                  >
                    Delete
                  </Button>
                }
              />

            </ListLayout>
          </div>
        </TabPanel>

      </TabView>

      <MakePaymentSingleInvoiceModal displayModal={displayPaySingleInvoiceModal} contractorId={selectedContractor} customDiscard={customDiscard} />
      <MakePaymentMultipleInvoiceModal displayModal={displayPayMultipleInvoiceModal} contractorId={selectedContractor} customDiscard={customDiscard} />
      <ViewVoucherModal displayModal={displayViewVoucherModal} contractorId={selectedContractor} customDiscard={customDiscard} />
    </>

  );
}

export default Main