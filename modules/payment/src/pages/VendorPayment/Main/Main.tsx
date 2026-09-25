import React, { useEffect, useState, useRef } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, getPreviousYears, getMonthsFor, useActiveVendorsQuery, useAppDispatch, setPaymentMenu } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';;
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
  var months = getMonthsFor(selectedYear)
  const [selectedMonth, setSelectedMonth] = useState<any>(null)

  useEffect(() => {
    months = getMonthsFor(selectedYear)
    setSelectedMonth(months[months.length - 1].value)
  }, [selectedYear])



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
  const { data: vendorPaymentInvoice, refetch: refetchPayInvoices } = useListVendorPaymentInvoiceQuery({ page: page, size: size })
  const { data: vendorPaymentVoucher, refetch: refetchVouchers } = useListVendorPaymentVoucherQuery({
    page: page, size: size, year: selectedYear, month: selectedMonth
  }, {
    skip: !selectedYear || !selectedMonth,
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
          <div className="flex">
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