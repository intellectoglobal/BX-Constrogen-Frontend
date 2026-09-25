import React, { useEffect, useState, useRef } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, getPreviousYears, getMonthsFor, useActiveContractorsQuery, useAppDispatch, setPaymentMenu } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';;
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { useDeleteContractorPaymentMutation, useListContractorPaymentInvoiceQuery, useListContractorPaymentQuery, useListContractorPaymentVoucherQuery } from '../contractorPaymentApi';
import MakePaymentSingleInvoiceModal from '../Modals/MakePaymentSingleInvoiceModal';
import MakePaymentMultipleInvoiceModal from '../Modals/MakePaymentMultipleInvoiceModal';
import ViewVoucherModal from '../Modals/ViewVoucherModal';
import { TabView, TabPanel } from 'primereact/tabview';
import AllocateAmountModal from '../Modals/AllocateAmountModal';


type Props = {}

const Main = (props: Props) => {

  const dispatch = useAppDispatch()
  
  const years = getPreviousYears(5)
  const [selectedYear, setSelectedYear] = useState<any>(years[0])
  var months = getMonthsFor(selectedYear)
  const [selectedMonth, setSelectedMonth] = useState<any>(null)

  useEffect(() => {
    months = getMonthsFor(selectedYear)
    setSelectedMonth(months[months.length - 1].value)
  }, [selectedYear])
  
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [activeTab, setActiveTab] = useState(0);
  const [selectedContractor, setSelectedContractor] = useState<any>(null)
  const [allContractors, setAllContractors] = useState<any>([])
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null)
  const [selectedContractorKey, setSelectedContractorKey] = useState<any>(null)
  const [displayViewMultipleInvoiceModal, setDisplayViewMultipleInvoiceModal] = useState(false);
  const [displayViewVoucherModal, setDisplayViewVoucherModal] = useState(false);
  const [displayPayMultipleInvoiceModal, setDisplayPayMultipleInvoiceModal] = useState(false);
  const [displayPaySingleInvoiceModal, setDisplayPaySingleInvoiceModal] = useState(false);
  const [displayAllocateModal, setDisplayAllocateModal] = useState(false);
  const { data: contractors } = useActiveContractorsQuery()
  // const { data: contractorPayments, isFetching: isLoading } = useListContractorPaymentQuery({ page: page, size: size, project: selectedProjectKey, paymentfrom: paymentFrom ? formatDate(paymentFrom) : null, paymentto: paymentTo ? formatDate(paymentTo) : null })
  const { data: contractorPayments, refetch: refetchPayContractors, isFetching: isLoading } = useListContractorPaymentQuery({ page: page, size: size })
  const { data: contractorPaymentInvoice, refetch: refetchPayInvoices } = useListContractorPaymentInvoiceQuery({ page: page, size: size })
  const { data: contractorPaymentVoucher, refetch: refetchVouchers } = useListContractorPaymentVoucherQuery({ 
    page: page, size: size, year: selectedYear, month: selectedMonth 
  },{
    skip : !selectedYear || !selectedMonth,
    refetchOnMountOrArgChange : true
  })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteContractorPaymentMutation()
  const deleteAction = (id: number) => {
    deleteDataAction(id).unwrap();
    setTimeout(() => {
      refetchPayContractors()
      refetchPayInvoices()
      refetchVouchers()
    }, 1000);

  }
  const ref = useRef(contractorPayments?.results|| []);
  const contractorsRef = useRef<any[]>([]);
  const [contractorsEntries, setContractorsEntries] = useState<any[]>([])


  useEffect(() => {
    dispatch(setPaymentMenu('make'));
    return () => {
      dispatch(setPaymentMenu(''));
    };
  }, [dispatch]);


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

  const customDiscard = (refetch = false) => {
    setDisplayPaySingleInvoiceModal(false)
    setDisplayPayMultipleInvoiceModal(false)
    setDisplayViewVoucherModal(false)
    setDisplayAllocateModal(false)
    if (refetch) {
      refetchPayContractors()
      refetchPayInvoices()
      refetchVouchers()
    }

  }

  const removeItem = (val: any) => {
    const updValue = ref.current.filter((x: any) => x !== val)
    ref.current = updValue;
    setContractorsEntries(updValue)
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

  const getCheckboxEditor = ({ row, column, onRowChange, onClose }: any) => {
    return <Checkbox style={{ width: '100%', display: 'flex', margin: '10px auto', justifyContent: 'center' }}
      checked={row[column.key]}
      onChange={(e: any) => {
        onRowChange({ ...row, [column.key]: e.checked }, true)
        onClose(true)
      }}
      tabIndex={-1} />
  };

  const displayInvoiceNumbers = (row:any) => {
    return row?.invoice_id.join(", ")
  }



  return (
    <>
      <Divider />
      <TabView
        className='custom-tabview'
      >
        <TabPanel header="Pay Contractor">
          <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`} description={"Pending Payments"} isLoading={isLoading}
              data={contractorPayments?.results}
              newTable
              showHeader
              hideAddButton
              tableLayoutClass='h-full'
              allowFilters={false}
              hideActionColumn
              pagination={{
                pageSize: size,
                loading: isLoading,
                currentPage: page,
                total: contractorPayments?.count,
                onChange: (page, size) => {
                  setPage(page);
                  setSize(size)
                }
              }}
              actionBodyTemplate={actionBodyTemplate}
            >
              <Datacolumn
                field="contractor_details.name"
                width="20%"
                header="Contractor Name"
              />
              <Datacolumn
                field="contractor_details.type.descr"
                width="20%"
                header="Contract Type"
              />
              <Datacolumn field="pending_amount" header="Pending Amt" type="currency" defaultValue={0} />
              <Datacolumn field="allocated_amount" header="Allocated Amt" type="currency" defaultValue={0} />
              <Datacolumn
                width={"10%"}
                field="invoicedetails"
                header="Allocate"
                type="custom"
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => {
                      setSelectedContractor(row)
                      setSelectedContractorKey(row?.contractor_details?.key)
                      setDisplayAllocateModal(true)
                    }}
                  >
                    Allocate
                  </Button>
                }
              />
              <Datacolumn
                width={"15%"}
                field="makepayment"
                header="Make Payment"
                type="custom"
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => {
                      setSelectedContractor(row)
                      setDisplayPayMultipleInvoiceModal(true)
                    }}
                  >
                    Make
                  </Button>
                }
              />

            </ListLayout>
            {/* <div style={{
              marginRight: 'auto',
              marginTop: 10,
              display: 'flex',
            }}>
              Total Allocated Amount - Rs. 1234
            </div>
            <Button
              style={{
                marginLeft: 'auto',
                marginTop: 5,
                display: 'flex',
              }}
              label="Reset Allocation"
            /> */}
          </div>
        </TabPanel>

        <TabPanel header="Pay Invoice">
          <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`} description={"Pending Payments"} isLoading={isLoading}
              data={contractorPaymentInvoice?.results}
              // data={[
              //   {
              //     invoice_id : 1,
              //     contractor_details : {
              //       key : 2,
              //       name : "qqq",
              //       type : {
              //         descr : "www"
              //       }
              //     },
              //     pending_amt : 3
              //   }
              // ]}
              pagination={{
                pageSize: size,
                loading: isLoading,
                currentPage: page,
                total: contractorPaymentInvoice?.count,
                onChange: (page, size) => {
                  setPage(page);
                  setSize(size)
                }
              }}
              newTable
              showHeader
              hideAddButton
              tableLayoutClass='h-full'
              allowFilters={false}
              hideActionColumn
            >
              <Datacolumn
                field="invoice_id"
                header="Invoice No"
              />
              <Datacolumn
                field="invoice_date"
                header="Invoice Date"
              />
              <Datacolumn
                field="contractor_details.name"
                width="20%"
                header="Contractor Name"
              />
              <Datacolumn
                field="contractor_details.type.descr"
                width="20%"
                header="Contract Type"
              />
              <Datacolumn field="invoice_amount" header="Invoice Amt" type="currency" defaultValue={0} />
              <Datacolumn field="pending_amount" header="Pending Amt" type="currency" defaultValue={0} />
              <Datacolumn
                width={"15%"}
                field="makepayment"
                header="Make Payment"
                type="custom"
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => {
                      setSelectedContractor(row)
                      setDisplayPaySingleInvoiceModal(true)
                    }}
                  >
                    Make
                  </Button>
                }
              />

            </ListLayout>
          </div>
        </TabPanel>

        <TabPanel header="Contract Voucher">
          <div className="flex">
            {/* <div className="field col-6">
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
            </div> */}
            <div className="field col-6">
              <label className={'col-4'}>Financial Year</label>
              <Dropdown
                style={{ width: '60%' }}
                options={years}
                onChange={(e) => setSelectedYear(e.value)}
                value={selectedYear}
                placeholder={'Select an Year'}
              />
            </div>
            <div className="field col-6">
              <label className={'col-4'}>Select Month</label>
              <Dropdown
                style={{ width: '60%' }}
                value={selectedMonth}
                placeholder='Select a Month'
                options={months}
                onChange={(e) => setSelectedMonth(e.value)}
                optionLabel='name'
                optionValue='value'
              />
            </div>
          </div>

          <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`} description={"Pending Payments"} isLoading={isLoading}
              pagination={{
                pageSize: size,
                loading: isLoading,
                currentPage: page,
                total: contractorPaymentVoucher?.count,
                onChange: (page, size) => {
                  setPage(page);
                  setSize(size)
                }
              }}
              data={contractorPaymentVoucher?.results}
              // data={[
              //   {
              //     "key": 5,
              //     "contract_voucher_dt": "2024-07-08",
              //     "voucher_number": 1007,
              //     "contractor_name": "Demo Plumbers",
              //     "total_amount": 10,
              //     "payment_mode": "Offline",
              //     "notes": "ryjy rt hrth wth r"
              //   },
              //   {
              //     "key": 1,
              //     "contract_voucher_dt": "2024-07-07",
              //     "voucher_number": 1004,
              //     "contractor_name": "C One",
              //     "total_amount": 55,
              //     "payment_mode": "Online",
              //     "notes": "dddddd"
              //   }
              // ]}
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
                field="contract_voucher_dt"
                header="Voucher Date"
              />
              <Datacolumn
                field="voucher_number"
                header="Voucher ID"
              />
              <Datacolumn field='invoice_id'
                header='Invoice No'
                displayValueGetter={displayInvoiceNumbers}
              />
              <Datacolumn
                field="contractor_name"
                header="Contractor Name"
              />
              <Datacolumn
                field="total_amount"
                header="Amount"
              />
              <Datacolumn
                field="payment_mode"
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
                      setSelectedVoucher(row?.key)
                      setDisplayViewVoucherModal(true)
                    }}
                  >
                    View
                  </Button>
                }
              />
              <Datacolumn
                field="delete"
                header="Delete"
                type="custom"
                width={"10%"}
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => confirmDialog({
                      message: 'Are you sure to delete?',
                      header: 'Confirmation',
                      icon: 'pi pi-exclamation-triangle',
                      accept: () => deleteAction(row.key),
                      reject: () => { }
                    })
                    }
                  >
                    Delete
                  </Button>}
              />

            </ListLayout>
          </div>
        </TabPanel>

      </TabView>


      {
        displayAllocateModal &&
        <AllocateAmountModal displayModal={displayAllocateModal} id={selectedContractor?.contractor_details?.key} contractor={selectedContractor} customDiscard={customDiscard} />
      }

      {
        displayPaySingleInvoiceModal &&
        <MakePaymentSingleInvoiceModal displayModal={displayPaySingleInvoiceModal} id={selectedContractor?.contractor_details?.key} contractor={selectedContractor} customDiscard={customDiscard} />
      }
      {
        displayPayMultipleInvoiceModal &&
        <MakePaymentMultipleInvoiceModal displayModal={displayPayMultipleInvoiceModal} id={selectedContractor?.contractor_details?.key} contractor={selectedContractor} customDiscard={customDiscard} />
      }
      {
        displayViewVoucherModal &&
        <ViewVoucherModal displayModal={displayViewVoucherModal} id={selectedVoucher} customDiscard={customDiscard} />
      }
    </>
  );
}

export default Main