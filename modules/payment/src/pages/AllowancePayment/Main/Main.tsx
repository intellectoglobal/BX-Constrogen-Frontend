import React, { useEffect, useState, useRef } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, formatDate, useActiveProjectQuery, useActiveContractorsQuery, useAppDispatch, setPaymentMenu, getPreviousYears, getMonthsFor } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { useListSalariesQuery, useDeleteSalaryMutation, useListAllowancesQuery, useDeleteAllowanceMutation } from '../api';
import { TabView, TabPanel } from 'primereact/tabview';
import PaySalaryModal from '../Modals/PaySalaryModal';
import PayAllowanceModal from '../Modals/PayAllowanceModal';


type Props = {}

const Main = (props: Props) => {
  const [selectedContractor, setSelectedContractor] = useState<any>(null)
  const [displayPayAllowanceModal, setDisplayPayAllowanceModal] = useState(false);
  const [displayPaySalaryModal, setDisplayPaySalaryModal] = useState(false);

  const [salaryPage, setSalaryPage] = useState(1)
  const [salarySize, setSalarySize] = useState(PAGE_SIZE)
  const [allowancePage, setAllowancePage] = useState(1)
  const [allowanceSize, setAllowanceSize] = useState(PAGE_SIZE)

  const dispatch = useAppDispatch()

  const years = getPreviousYears(5)
  const [selectedYear, setSelectedYear] = useState<any>(years[0])
  var months = getMonthsFor(selectedYear)
  const [selectedMonth, setSelectedMonth] = useState<any>(null)

  const { data: salaries } = useListSalariesQuery({ page: salaryPage, size: salarySize, month: selectedMonth, year: selectedYear }, { refetchOnMountOrArgChange: true, skip: !selectedMonth || !selectedYear })
  const { data: allowances } = useListAllowancesQuery({ page: allowancePage, size: allowanceSize, month: selectedMonth, year: selectedYear }, { refetchOnMountOrArgChange: true, skip:!selectedMonth || !selectedYear })

  const [deleteSalaryAction] = useDeleteSalaryMutation()
  const deleteSalary = (id: number) => {
    deleteSalaryAction(id).unwrap();
  }

  const [deleteAllowanceAction] = useDeleteAllowanceMutation()
  const deleteAllowance = (id: number) => {
    deleteAllowanceAction(id).unwrap();
  }

  useEffect(() => {
    months = getMonthsFor(selectedYear)
    setSelectedMonth(months[months.length - 1].value)
  }, [selectedYear])

  useEffect(() => {
    dispatch(setPaymentMenu('make'));
    return () => {
      dispatch(setPaymentMenu(''));
    };
  }, [dispatch]);



  const customDiscard = () => {
    setDisplayPaySalaryModal(false)
    setDisplayPayAllowanceModal(false)
  }


  return (
    <>
      <Divider />
      <TabView
        className='custom-tabview'
      >
        <TabPanel header="Pay Salary">
          <div style={{ display: 'flex' }}>
            <div className="field col-4">
              <label className={'col-4'}>Financial Year</label>
              <Dropdown
                style={{ width: '60%' }}
                options={years}
                onChange={(e) => setSelectedYear(e.value)}
                value={selectedYear}
                placeholder={'Select an Year'}
              />
            </div>
            <div className="field col-4">
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
            <div className="field col-4">
              <Button
                // disabled={!selectedRows.length}
                onClick={() => {
                  setDisplayPaySalaryModal(true)
                }} label="Pay Salary" className="ml-8" />
            </div>
          </div>
          <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/allowancepayment`} description={"Salary Payments"}
              data={salaries?.results}
              newTable
              showHeader
              hideAddButton
              tableLayoutClass='h-full'
              allowFilters={false}
              hideActionColumn
              pagination={{
                pageSize: salarySize,
                loading: false,
                currentPage: salaryPage,
                total: salaries?.count,
                onChange: (page, size) => {
                  setSalaryPage(page);
                  setSalarySize(size)
                }
              }}
            >
              <Datacolumn
                field="date"
                header="Date"
              />
              <Datacolumn
                field="payee_name"
                header="Payee Name"
              />
              <Datacolumn field="amount" header="Amount" type="currency" defaultValue={0} />
              <Datacolumn
                field="project"
                header="Project"
              />
              <Datacolumn
                field="delete"
                width={"15%"}
                header="Delete"
                type="custom"
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => {
                      confirmDialog({
                        message: 'Are you sure you want to Delete Item?',
                        header: 'Confirmation',
                        icon: 'pi pi-exclamation-triangle',
                        accept: () => deleteSalary(row?.key),
                        reject: () => { }
                      });
                    }}
                  >
                    Delete
                  </Button>
                }
              />

            </ListLayout>
          </div>
        </TabPanel>

        <TabPanel header="Pay Allowance">
          <div style={{ display: 'flex' }}>
            <div className="field col-4">
              <label className={'col-4'}>Financial Year</label>
              <Dropdown
                style={{ width: '60%' }}
                options={years}
                onChange={(e) => setSelectedYear(e.value)}
                value={selectedYear}
                placeholder={'Select an Year'}
              />
            </div>
            <div className="field col-4">
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
            <div className="field col-4">
              <Button
                onClick={() => {
                  setDisplayPayAllowanceModal(true)
                }} label="Pay Allowance" className="ml-8" />
            </div>
          </div>
          <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/allowancepayment`} description={"Allowance Payments"}
              data={allowances?.results}
              newTable
              showHeader
              hideAddButton
              tableLayoutClass='h-full'
              allowFilters={false}
              hideActionColumn
              pagination={{
                pageSize: allowanceSize,
                loading: false,
                currentPage: allowancePage,
                total: allowances?.count,
                onChange: (page, size) => {
                  setAllowancePage(page);
                  setAllowanceSize(size)
                }
              }}
            >
              <Datacolumn
                field="date"
                header="Date"
              />
              <Datacolumn
                field="payee_name"
                header="Payee Name"
              />
              <Datacolumn field="amount" header="Amount" type="currency" defaultValue={0} />
              <Datacolumn
                field="project"
                header="Project"
              />
              <Datacolumn
                field="delete"
                width={"15%"}
                header="Delete"
                type="custom"
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => {
                      confirmDialog({
                        message: 'Are you sure you want to Delete Item?',
                        header: 'Confirmation',
                        icon: 'pi pi-exclamation-triangle',
                        accept: () => deleteAllowance(row?.key),
                        reject: () => { }
                      });
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

      {
        displayPaySalaryModal &&
        <PaySalaryModal displayModal={displayPaySalaryModal} customDiscard={customDiscard} />
      }
      {
        displayPayAllowanceModal &&
        <PayAllowanceModal displayModal={displayPayAllowanceModal} customDiscard={customDiscard} />
      }
    </>

  );
}

export default Main
