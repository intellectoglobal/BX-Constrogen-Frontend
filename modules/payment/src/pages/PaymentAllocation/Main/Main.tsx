import React, { useState, useRef, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Datacolumn, ListLayout } from '@igblsln/control';
import { classNames } from "primereact/utils";
import { TabView, TabPanel } from 'primereact/tabview';
import { useListVendorPayment1Query, useListContractorPayment1Query } from '../api';
// // import './style.scss';
import VendorPaymentModal from './Modals/VendorPaymentModal';
import ContractorPaymentModal from './Modals/ContractorPaymentModal';


type Props = {}

const Main = (props: Props) => {
  const [contractorsEntries, setContractorsEntries] = useState<any[]>([])
  const [vendorsEntries, setVendorsEntries] = useState<any[]>([])
  const [selectedVendorRows, setSelectedVendorRows] = useState<any[]>([])
  const [selectedContractorRows, setSelectedContractorRows] = useState<any[]>([])
  const [displayVendorPaymentModal, setDisplayVendorPaymentModal] = useState(false);
  const [displayContractorPaymentModal, setDisplayContractorPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [weekId, setWeekId] = useState<any>(2);
  const vendorRef = useRef(vendorsEntries);
  const contractorRef = useRef(contractorsEntries);

  const { data: vendorPayments, isFetching: isVendorPaymentFetching } = useListVendorPayment1Query({})
  const { data: contractorPayments, isFetching: isContractorPaymentFetching } = useListContractorPayment1Query({})

  useEffect(() => {
    if (vendorPayments) {
      setVendorsEntries(vendorPayments.results)
      vendorRef.current = vendorPayments.results
    }
  }, [vendorPayments])

  useEffect(() => {
    if (contractorPayments) {
      setContractorsEntries(contractorPayments.results)
      contractorRef.current = contractorPayments.results
    }
  }, [contractorPayments])

  const customDiscard = () => {
    setDisplayVendorPaymentModal(false)
    setDisplayContractorPaymentModal(false)
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

  useEffect(() => {
    setSelectedVendorRows(vendorsEntries.filter(d => !!d.selected))
  }, [vendorsEntries])

  useEffect(() => {
    setSelectedContractorRows(contractorsEntries.filter(d => !!d.selected))
  }, [contractorsEntries])

  return (
    <>
      {/* <div className='flex'>
        <h3 className={classNames('m-0 my-auto')} >{PAGE_NAME}</h3>
      </div> */}
      <TabView onTabChange={(e) => {
        setActiveTab(e.index)
      }} activeIndex={activeTab} className='custom-tabview pl-5'>
        <TabPanel header="Vendor">
          <div className="pl-5">
            <div className="field">
              <label className={classNames('col-2')}>Week ID</label>
              <Dropdown
                style={{ width: '25%' }}
                value={weekId}
                onChange={(e) => setWeekId(e.target.value)}
                options={Array.from({ length: 52 }, (_, i) => i + 1)}
              />
            </div>

          </div>
          <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`}
              description={"Vendor Payment"}
              hideAddButton
              showHeader
              isLoading={isVendorPaymentFetching}
              data={vendorsEntries}
              newTable
              tableLayoutClass='h-full'
              allowFilters={false}
              hideActionColumn
              topRightElem={(
                <>
                  <Button disabled={!selectedVendorRows.length}
                    onClick={() => {
                      if (window.confirm("Approve Selected Payments?")) {
                        alert("Done!")
                      }
                    }} label="Approve" className="mr-3" />
                  <Button label="Reset" onClick={() => setVendorsEntries(vendorPayments?.results || [])} className="p-button-warning" />
                </>
              )}
              gridProps={{
                allowAdd: false,
                OnRowsChanged: (rows: any[]) => {
                  setVendorsEntries(rows);
                  vendorRef.current = rows;
                },
              }}>
              <Datacolumn
                field="name"
                width="30%"
                header="Vendor Name"
              />
              <Datacolumn field="totalamt" header="Pending Amount" type="currency" defaultValue={100} />
              <Datacolumn field="estamt" header="Allocated Amount" type="currency" defaultValue={50} />
              <Datacolumn width={"10%"} field="selected" defaultValue={false} header="" type="checkbox" editorType={getCheckboxEditor} />

            </ListLayout>
          </div>
        </TabPanel>
        <TabPanel header="Contractor">
          <div className="pl-5">
            <div className="field">
              <label className={classNames('col-2')}>Week ID</label>
              <Dropdown
                style={{ width: '25%' }}
                value={weekId}
                onChange={(e) => setWeekId(e.target.value)}
                options={Array.from({ length: 52 }, (_, i) => i + 1)}
              />
            </div>

          </div>
          <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
            <ListLayout baseRoute={`/weeklypayment`}
              description={"Contractor Payment"}
              hideAddButton
              showHeader
              isLoading={isContractorPaymentFetching}
              data={contractorsEntries}
              newTable
              tableLayoutClass='h-full'
              allowFilters={false}
              hideActionColumn
              topRightElem={(
                <>
                  <Button disabled={!selectedContractorRows.length}
                    onClick={() => {
                      if (window.confirm("Approve Selected Payments?")) {
                        alert("Done!")
                      }
                    }} label="Approve" className="mr-3" />
                  <Button label="Reset" onClick={() => setContractorsEntries(contractorPayments?.results || [])} className="p-button-warning" />
                </>
              )}
              gridProps={{
                allowAdd: false,
                OnRowsChanged: (rows: any[]) => {
                  setContractorsEntries(rows);
                  contractorRef.current = rows;
                },
              }}>
              <Datacolumn
                field="name"
                width="30%"
                header="Contractor Name"
              />
              <Datacolumn field="totalamt" header="Pending Amount" type="currency" defaultValue={100} />
              <Datacolumn field="estamt" header="Allocated Amount" type="currency" defaultValue={50} />
              <Datacolumn width={"10%"} field="selected" defaultValue={false} header="" type="checkbox" editorType={getCheckboxEditor} />

            </ListLayout>
          </div>
        </TabPanel>
      </TabView>

      {/* 
      <VendorPaymentModal displayModal={displayVendorPaymentModal} vendorId={selectedVendor} customDiscard={customDiscard} />
      <ContractorPaymentModal displayModal={displayContractorPaymentModal} contractorId={selectedVendor} customDiscard={customDiscard} /> */}

    </>
  );
}

export default Main