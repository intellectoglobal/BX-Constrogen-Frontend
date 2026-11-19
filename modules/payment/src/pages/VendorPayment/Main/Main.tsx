import React, { useEffect, useState, useRef } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, getPreviousYears, getMonthsFor, useActiveVendorsQuery, useAppDispatch, setPaymentMenu } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { useDeleteVendorPaymentMutation, useListVendorPaymentInvoiceQuery, useListVendorPaymentQuery, useListVendorPaymentVoucherQuery } from '../vendorPaymentApi';
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
  const months = getMonthsFor(selectedYear)
  const [selectedMonth, setSelectedMonth] = useState<any>(() => {
    const initialMonths = getMonthsFor(years[0])
    return initialMonths[initialMonths.length - 1]?.value ?? null
  })
  const [invoiceName, setInvoiceName] = useState<string | undefined>()
  const [voucherName, setVoucherName] = useState<string | undefined>()
  const [invoiceFrom, setInvoiceFrom] = useState<Date | null>(null)
  const [invoiceTo, setInvoiceTo] = useState<Date | null>(null)
  const [voucherFrom, setVoucherFrom] = useState<Date | null>(null)
  const [voucherTo, setVoucherTo] = useState<Date | null>(null)
  const formatFilterDate = (date: Date | null) => date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    : undefined

  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [activeTab, setActiveTab] = useState(0);
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [allVendors, setAllVendors] = useState<any>([])
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null)
  const [selectedVendorKey, setSelectedVendorKey] = useState<any>(null)
  const [displayViewMultipleInvoiceModal, setDisplayViewMultipleInvoiceModal] = useState(false);
  const [displayViewVoucherModal, setDisplayViewVoucherModal] = useState(false);
  const [displayPayMultipleInvoiceModal, setDisplayPayMultipleInvoiceModal] = useState(false);
  const [displayPaySingleInvoiceModal, setDisplayPaySingleInvoiceModal] = useState(false);
  const [displayAllocateModal, setDisplayAllocateModal] = useState(false);

  const [paymentFrom, setPaymentFrom] = useState<any>(null)
  const [paymentTo, setPaymentTo] = useState<any>(null)
  const { data: vendors } = useActiveVendorsQuery()
  // const { data: vendorPayments, isFetching: isLoading } = useListVendorPaymentQuery({ page: page, size: size, project: selectedProjectKey, paymentfrom: paymentFrom ? formatDate(paymentFrom) : null, paymentto: paymentTo ? formatDate(paymentTo) : null })
  const { data: vendorPayments, refetch: refetchPayVendors, isFetching: isLoading } = useListVendorPaymentQuery({ page: page, size: size })
  const { data: vendorPaymentInvoice, refetch: refetchPayInvoices } = useListVendorPaymentInvoiceQuery({
    page, size, vendor_name: invoiceName,
    from_date: formatFilterDate(invoiceFrom), to_date: formatFilterDate(invoiceTo)
  })
  const { data: vendorPaymentVoucher, refetch: refetchVouchers } = useListVendorPaymentVoucherQuery({
    page, size, year: selectedYear, month: selectedMonth, vendor_name: voucherName,
    from_date: formatFilterDate(voucherFrom), to_date: formatFilterDate(voucherTo)
  }, {
    refetchOnMountOrArgChange: true
  })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteVendorPaymentMutation()
  const deleteAction = (id: number) => {
    deleteDataAction(id).unwrap();
    setTimeout(() => {
      refetchPayVendors()
      refetchPayInvoices()
      refetchVouchers()
    }, 1000);

  }
  const ref = useRef(vendorPayments?.results || []);
  const vendorsRef = useRef<any[]>([]);
  const [vendorsEntries, setVendorsEntries] = useState<any[]>([])


  useEffect(() => {
    dispatch(setPaymentMenu('make'));
    return () => {
      dispatch(setPaymentMenu(''));
    };
  }, [dispatch]);


  useEffect(() => {
    vendorsRef.current = vendors || [];
    if (vendors) {
      setAllVendors([
        {
          key: null,
          name: 'All'
        },
        ...vendors
      ])
    }
  }, [vendors])

  const customDiscard = (refetch = false) => {
    setDisplayPaySingleInvoiceModal(false)
    setDisplayPayMultipleInvoiceModal(false)
    setDisplayViewVoucherModal(false)
    setDisplayAllocateModal(false)
    if (refetch) {
      refetchPayVendors()
      refetchPayInvoices()
      refetchVouchers()
    }

  }

  const removeItem = (val: any) => {
    const updValue = ref.current.filter((x: any) => x !== val)
    ref.current = updValue;
    setVendorsEntries(updValue)
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

  // let vendorCount = 0
  // vendorPayments?.map((v) => {
  //   vendorCount+=1
  // })


  return (
    <>
      <Divider />
      <TabView
        className='custom-tabview'
      >
        <TabPanel header="Pay Vendor">
          <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`} description={"Pending Payments"} isLoading={isLoading}
              data={vendorPayments?.results}
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
                total: vendorPayments?.count,
                onChange: (page, size) => {
                  setPage(page);
                  setSize(size)
                }
              }}
              actionBodyTemplate={actionBodyTemplate}
            >
              <Datacolumn
                field="vendor_details.name"
                width="20%"
                header="Vendor Name"
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
                      setSelectedVendor(row)
                      setSelectedVendorKey(row?.vendor_details?.key)
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
                      setSelectedVendor(row)
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
          <div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: 16, overflowX: 'auto', padding: '8px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
              <span>Vendor Name</span>
              <Dropdown style={{ width: 260 }} options={vendors || []} value={invoiceName}
                optionLabel="name" optionValue="name" filter showClear placeholder="All vendors"
                onChange={(e) => { setInvoiceName(e.value || undefined); setPage(1) }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
              <span>From Date</span>
              <span style={{ position: 'relative', width: 155 }}>
                <Calendar style={{ width: '100%' }} inputStyle={{ paddingRight: 28 }}
                  value={invoiceFrom ?? undefined} dateFormat="yy-mm-dd"
                  onChange={(e) => { setInvoiceFrom((e.value as Date) || null); setPage(1) }} />
                {invoiceFrom && <button type="button" className="p-link" aria-label="Clear invoice from date"
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => { setInvoiceFrom(null); setPage(1) }}>
                  <i className="pi pi-times" aria-hidden="true" />
                </button>}
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
              <span>To Date</span>
              <span style={{ position: 'relative', width: 155 }}>
                <Calendar style={{ width: '100%' }} inputStyle={{ paddingRight: 28 }}
                  value={invoiceTo ?? undefined} dateFormat="yy-mm-dd"
                  onChange={(e) => { setInvoiceTo((e.value as Date) || null); setPage(1) }} />
                {invoiceTo && <button type="button" className="p-link" aria-label="Clear invoice to date"
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => { setInvoiceTo(null); setPage(1) }}>
                  <i className="pi pi-times" aria-hidden="true" />
                </button>}
              </span>
            </label>
          </div>
          <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`} description={"Pending Payments"} isLoading={isLoading}
              data={vendorPaymentInvoice?.results}
              // data={[
              //   {
              //     invoiceno : 1,
              //     vendor_details : {
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
                total: vendorPaymentInvoice?.count,
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
                field="invoiceno"
                header="Invoice No"
              />
              <Datacolumn
                field="invoicedate"
                header="Invoice Date"
              />
              <Datacolumn
                field="vendor_details.name"
                width="20%"
                header="Vendor Name"
              />

              <Datacolumn field="netamt" header="Net Amt" type="currency" defaultValue={0} />
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
                      setSelectedVendor(row)
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

        <TabPanel header="Vendor Voucher">
          <div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: 16, overflowX: 'auto', padding: '8px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
              <span>Financial Year</span>
              <Dropdown style={{ width: 120 }} options={years} value={selectedYear} showClear
                placeholder="Year" onChange={(e) => {
                  setSelectedYear(e.value)
                  const nextMonths = getMonthsFor(e.value)
                  setSelectedMonth(nextMonths[nextMonths.length - 1]?.value ?? null)
                  setPage(1)
                }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
              <span>Month</span>
              <Dropdown style={{ width: 140 }} options={months} value={selectedMonth} showClear
                optionLabel="name" optionValue="value" placeholder="Month"
                onChange={(e) => { setSelectedMonth(e.value); setPage(1) }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
              <span>Vendor Name</span>
              <Dropdown style={{ width: 260 }} options={vendors || []} value={voucherName}
                optionLabel="name" optionValue="name" filter showClear placeholder="All vendors"
                onChange={(e) => { setVoucherName(e.value || undefined); setPage(1) }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
              <span>From Date</span>
              <span style={{ position: 'relative', width: 155 }}>
                <Calendar style={{ width: '100%' }} inputStyle={{ paddingRight: 28 }}
                  value={voucherFrom ?? undefined} dateFormat="yy-mm-dd"
                  onChange={(e) => { setVoucherFrom((e.value as Date) || null); setPage(1) }} />
                {voucherFrom && <button type="button" className="p-link" aria-label="Clear voucher from date"
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => { setVoucherFrom(null); setPage(1) }}>
                  <i className="pi pi-times" aria-hidden="true" />
                </button>}
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
              <span>To Date</span>
              <span style={{ position: 'relative', width: 155 }}>
                <Calendar style={{ width: '100%' }} inputStyle={{ paddingRight: 28 }}
                  value={voucherTo ?? undefined} dateFormat="yy-mm-dd"
                  onChange={(e) => { setVoucherTo((e.value as Date) || null); setPage(1) }} />
                {voucherTo && <button type="button" className="p-link" aria-label="Clear voucher to date"
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => { setVoucherTo(null); setPage(1) }}>
                  <i className="pi pi-times" aria-hidden="true" />
                </button>}
              </span>
            </label>
          </div>

          <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`} description={"Pending Payments"} isLoading={isLoading}
              pagination={{
                pageSize: size,
                loading: isLoading,
                currentPage: page,
                total: vendorPaymentVoucher?.count,
                onChange: (page, size) => {
                  setPage(page);
                  setSize(size)
                }
              }}
              data={vendorPaymentVoucher?.results}
              newTable
              showHeader
              hideAddButton
              tableLayoutClass='h-full'
              allowFilters={false}
              hideActionColumn
            >
              <Datacolumn
                field="vendor_voucher_dt"
                header="Voucher Date"
              />
              <Datacolumn
                field="voucher_number"
                header="Voucher ID"
              />
              <Datacolumn field='invoiceno'
                header="Invoice No"/>
              <Datacolumn
                field="vendor_name"
                header="Vendor Name"
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
                header="View"
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
        <AllocateAmountModal displayModal={displayAllocateModal} id={selectedVendor?.vendor_details?.key} vendor={selectedVendor} customDiscard={customDiscard} />
      }

      {
        displayPaySingleInvoiceModal &&
        <MakePaymentSingleInvoiceModal displayModal={displayPaySingleInvoiceModal} id={selectedVendor?.vendor_details?.key} vendor={selectedVendor} customDiscard={customDiscard} />
      }
      {
        displayPayMultipleInvoiceModal &&
        <MakePaymentMultipleInvoiceModal displayModal={displayPayMultipleInvoiceModal} id={selectedVendor?.vendor_details?.key} vendor={selectedVendor} customDiscard={customDiscard} />
      }
      {
        displayViewVoucherModal &&
        <ViewVoucherModal displayModal={displayViewVoucherModal} id={selectedVoucher} customDiscard={customDiscard} />
      }
    </>
  );
}

export default Main