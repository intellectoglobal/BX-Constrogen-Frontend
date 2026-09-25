import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { confirmDialog } from 'primereact/confirmdialog';
import { CurrencyFormatter, Datacolumn, Datatable, ListLayout } from '@igblsln/control';
import { useActiveContractorsQuery, useActiveProjectQuery, useActiveVendorsQuery } from '@igblsln/store';
import { classNames } from "primereact/utils";
import { TabView, TabPanel } from 'primereact/tabview';
import { useListPaymentSheetQuery } from '../paymentSheetApi';
import { PAGE_NAME } from '../constants';
// import './style.scss';

type Props = {}

const Main = (props: Props) => {
  const { data } = useActiveVendorsQuery()
  const navigate = useNavigate()
  const [contractorsEntries, setContractorsEntries] = useState<any[]>([])
  const [selectedContractor, setSelectedContractor] = useState<any>(null)
  const [selectedVendorKey, setSelectedVendorKey] = useState<any>('')
  const [weekId, setWeekId] = useState<any>(2);
  const [monthId, setMonthId] = useState<any>(1);
  const [upperDropdown, setUpperDropdown] = useState<'week' | 'month'>('week')
  const [activeTab, setActiveTab] = useState(0);
  const ref = useRef(contractorsEntries);
  const vendorsRef = useRef<any[]>([]);
  const contractorsRef = useRef<any[]>([]);
  const projectsRef = useRef<any[]>([]);
  const { data: vendors } = useActiveVendorsQuery()
  const { data: contractors } = useActiveContractorsQuery()
  const { data: projects } = useActiveProjectQuery()

  const { data: paymentSheet, isFetching: isPaymentSheetFetching } = useListPaymentSheetQuery({ sheetId: selectedVendorKey }, { skip: !selectedVendorKey })

  useEffect(() => {
    vendorsRef.current = vendors || [];
    contractorsRef.current = contractors || [];
    projectsRef.current = projects || [];
  }, [vendors, projects, contractors])

  const summaryRenderer = (descr: string, value: number) => {
    return <strong> {descr} : <CurrencyFormatter value={value || 0} /> </strong>;
  }

  return (
    <>
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

          <div className="pl-5">
            <div className="field">
              <label className={classNames('col-2')}>Vendor</label>
              <MultiSelect
                value={selectedVendorKey}
                onChange={(e) => setSelectedVendorKey(e.value)}
                options={data}
                optionLabel="id"
                display="chip"
                placeholder="Select Vendors"
                className="w-full md:w-20rem" />
            </div>
          </div>

          <div className="flex">
            <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
              <ListLayout baseRoute={`/paymentsheet`} description={PAGE_NAME} isLoading={isPaymentSheetFetching}
                data={paymentSheet}
                newTable
                tableLayoutClass='h-full'
                allowFilters={false}
                hideActionColumn
                gridProps={{
                  allowAdd: false,
                  // getBottomSummaryRows: (rows: any) => {
                  //   return [{
                  //     estamt: rows.map((x: any) => parseFloat(x.estamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0),
                  //     totalamt: rows.map((x: any) => parseFloat(x.totalamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0),
                  //   }];
                  // }
                }}>
                <Datacolumn field="date" header="Date" type="date" defaultValue={""} />
                <Datacolumn field="vendor" header="Vendor Name" type="text" defaultValue={""} />
                <Datacolumn field="gst" header="Company GST" type="text" defaultValue={""} />
                <Datacolumn field="totalamt" header="Amount" type="currency" defaultValue={0} summaryFormatter={({ row }: any) => summaryRenderer("Total Pending Payment", row?.totalamt)} />
                <Datacolumn field="modeofpay" header="Mode Of Pay" type="text" defaultValue={""} />
              </ListLayout>
            </div>
          </div>

        </TabPanel>
        <TabPanel header="Contractor">
          <div className="pl-5">
            <div className="field">
              <label className={classNames('col-2')}>Contractor</label>
              <MultiSelect
                value={selectedVendorKey}
                onChange={(e) => setSelectedVendorKey(e.value)}
                options={data}
                optionLabel="id"
                display="chip"
                placeholder="Select Contractors"
                className="w-full md:w-20rem" />
            </div>
          </div>
          <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/paymentsheet`} description={PAGE_NAME} isLoading={isPaymentSheetFetching}
              data={contractorsEntries}
              newTable
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
              <Datacolumn field="date" header="Date" type="date" defaultValue={""} />
              <Datacolumn field="contractor" header="Contractor Name" type="text" defaultValue={""} />
              <Datacolumn field="company" header="Company Name" type="text" defaultValue={""} />
              <Datacolumn field="totalamt" header="Amount" type="currency" defaultValue={0} summaryFormatter={({ row }: any) => summaryRenderer("Total Pending Payment", row?.totalamt)} />
              <Datacolumn field="modeofpay" header="Mode Of Pay" type="text" defaultValue={""} />
            </ListLayout>
          </div>
        </TabPanel>
        <TabPanel header="Salary/Allowance">
          <TabView className='pl-5'>

            <TabPanel header="Salary">
              <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
                <ListLayout baseRoute={`/weeklypayment`} description={PAGE_NAME}
                  data={contractorsEntries}
                  newTable
                  tableLayoutClass='h-full'
                  allowFilters={false}
                  hideActionColumn
                  gridProps={{
                    allowAdd: false,
                  }}>
                  <Datacolumn field="date" header="Date" type="date" defaultValue={""} />
                  <Datacolumn field="name" header="Staff Name" type="text" defaultValue={""} />
                  <Datacolumn field="compnay" header="Company Name" type="text" defaultValue={""} />
                  <Datacolumn field="totalamt" header="Amount" type="currency" defaultValue={0} summaryFormatter={({ row }: any) => summaryRenderer("Total Pending Payment", row?.totalamt)} />

                </ListLayout>
              </div>
            </TabPanel>

            <TabPanel header="Allowance">
              <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
                <ListLayout baseRoute={`/weeklypayment`} description={PAGE_NAME}
                  data={contractorsEntries}
                  newTable
                  tableLayoutClass='h-full'
                  allowFilters={false}
                  hideActionColumn
                  gridProps={{
                    allowAdd: false,
                  }}>
                  <Datacolumn field="date" header="Date" type="date" defaultValue={""} />
                  <Datacolumn field="name" header="Staff Name" type="text" defaultValue={""} />
                  <Datacolumn field="compnay" header="Company Name" type="text" defaultValue={""} />
                  <Datacolumn field="totalamt" header="Amount" type="currency" defaultValue={0} summaryFormatter={({ row }: any) => summaryRenderer("Total Pending Payment", row?.totalamt)} />

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

    </>


  );
}

export default Main