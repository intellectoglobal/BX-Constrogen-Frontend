//@ts-nocheck1
import React, { useEffect, useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery, useActiveContractorsQuery, ViewModalBorderRadius, useAppDispatch, setPaymentMenu, getPreviousYears, getMonthsFor, useUnitsForProjectQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { useDeleteSaleReceiptMutation, useListReceiveSaleInvoiceQuery, useListSaleReceiptQuery } from '../apis';
import CreateModal from '../Modals/CreateModal';
import ViewModal from '../Modals/ViewModal';

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
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [displayViewModal, setDisplayViewModal] = useState<any>(false)
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any>({})
  const [selectedReceipt, setSelectedReceipt] = useState<any>({})
  const [showCreateDirectInvoiceModal, setShowCreateDirectInvoiceModal] = useState<boolean>(false)

  const { data: saleReceipts, isFetching: isSaleReceiptLoading } = useListSaleReceiptQuery({ page: page, size: size, project: selectedProjectKey, unit: selectedUnit }, {
    // skip: !selectedMonth,
    refetchOnMountOrArgChange: true
  })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteSaleReceiptMutation()
  const deleteAction = (id: number) => {
    deleteDataAction(id).unwrap();
  }
  const { data, isFetching: isLoading } = useListReceiveSaleInvoiceQuery({ page: page, size: size, project: selectedProjectKey, unit: selectedUnit })
  const { data: allProjects } = useActiveProjectQuery()
  const { data: allUnits } = useUnitsForProjectQuery({ projectId: selectedProjectKey }, { refetchOnMountOrArgChange: true });


  useEffect(() => {
    dispatch(setPaymentMenu('receive'));
    return () => {
      dispatch(setPaymentMenu(''));
    };
  }, [dispatch]);

  useEffect(() => {
    if (allProjects) {
      console.log(allProjects)
      setSelectedProjectKey(allProjects[0]?.key)
    }
  }, [allProjects])

  useEffect(() => {
    if (allUnits) {
      console.log(allUnits)
      setSelectedUnit(allUnits[0]?.key)
    }
  }, [allUnits])

  const customDiscard = () => {
    setShowCreateDirectInvoiceModal(false);
    setDisplayViewModal(false)
  }

  return (
    <>

      <Divider />

      <div style={{ display: 'flex' }}>
        <div className="field col-6">
          <label className={'col-4'}>Project Name</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectKey}
            onChange={(e) => {
              setSelectedProjectKey(e.value)
            }}
            filter
            filterBy='name'
            options={allProjects}
            placeholder='Select Project'
          />
        </div>
        <div className="field col-6">
          <label className={'col-4'}>Unit Name</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"descr"}
            optionValue={"key"}
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.value)
            }}
            options={allUnits}
            placeholder='Select Unit'
          />
        </div>
      </div>

      <TabView
        className='custom-tabview'
      >

        <TabPanel header="Receive Sale Invoice">
          <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`} description={"Pending Payments"} isLoading={isLoading}
              data={data?.results}
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
                field="customer_name"
                width="20%"
                header="Customer Name"
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
                      setSelectedInvoice(row)
                      setShowCreateDirectInvoiceModal(true)
                    }}
                  >
                    Receive
                  </Button>
                }
              />

            </ListLayout>
          </div>
        </TabPanel>

        <TabPanel header="Sale Receipt">
          {/* <div className="flex">
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
          </div> */}

          <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`} description={"Pending Payments"} isLoading={isLoading}
              pagination={{
                pageSize: size,
                loading: isLoading,
                currentPage: page,
                total: 0,
                onChange: (page, size) => {
                  setPage(page);
                  setSize(size)
                }
              }}
              data={saleReceipts?.results}
              newTable
              showHeader
              hideAddButton
              tableLayoutClass='h-full'
              allowFilters={false}
              hideActionColumn
            >
              <Datacolumn
                field="date"
                header="Receipt Date"
              />
              <Datacolumn
                field="receipt_number"
                header="Receipt ID"
              />
              <Datacolumn
                field="customer_name"
                header="Customer Name"
              />
              <Datacolumn
                field="amount"
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
                      setSelectedReceipt(row)
                      setDisplayViewModal(true)
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
        showCreateDirectInvoiceModal &&
        <CreateModal
          displayModal={showCreateDirectInvoiceModal}
          customDiscard={customDiscard}
          invoiceData={selectedInvoice}
        />
      }

      {
        displayViewModal &&
        <ViewModal data={selectedReceipt} displayModal={displayViewModal} customDiscard={customDiscard} />
      }
    </>

  );
}

export default Main