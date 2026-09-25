import React, { useEffect, useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, formatDate, useActiveProjectQuery, useActiveVendorsQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { useDeleteVendorPaymentMutation, useListVendorPaymentQuery } from '../vendorPaymentApi';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [allProjects, setAllProjects] = useState<any>([])
  const [allVendors, setAllVendors] = useState<any>([])
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedVendorKey, setSelectedVendorKey] = useState<any>(null)
  const [paymentFrom, setPaymentFrom] = useState<any>(null)
  const [paymentTo, setPaymentTo] = useState<any>(null)
  const { data: projects } = useActiveProjectQuery()
  const { data: vendors } = useActiveVendorsQuery()
  const { data, isFetching: isLoading } = useListVendorPaymentQuery({ page: page, size: size, project: selectedProjectKey, paymentfrom: paymentFrom ? formatDate(paymentFrom) : null, paymentto: paymentTo ? formatDate(paymentTo) : null })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteVendorPaymentMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

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

  return (
    <>
      <Divider />
      <div style={{ display: 'flex' }}>
        <div className="field col-4">
          <label className={'col-4'}>Vendor Name</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedVendorKey}
            onChange={(e) => {
              setSelectedVendorKey(e.value)
            }}
            filter
            filterBy='name'
            options={allVendors}
            placeholder='All'
          />
        </div>
        {/* <div className="field col-4">
          <label className={'col-4'}>Project Name</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectKey}
            onChange={(e) => {
              setSelectedProjectKey(e.value)
            }}
            options={allProjects}
            placeholder='All'
          />
        </div> */}
        {/* <div className="field col-4">
          <label className={'col-4'}>Payment From</label>
          <Calendar
            style={{ width: '60%' }}
            value={paymentFrom}
            onChange={(e) => {
              setPaymentFrom(e.value)
            }}
            maxDate={paymentTo}
            showIcon
          />
        </div>
        <div className="field col-4">
          <label className={'col-4'}>Payment To</label>
          <Calendar
            style={{ width: '60%' }}
            value={paymentTo}
            minDate={paymentFrom}
            onChange={(e) => {
              setPaymentTo(e.value)
            }}
            showIcon
          />
        </div> */}
      </div>
      <ListLayout
        pagination={{
          pageSize: size,
          loading: isLoading,
          currentPage: page,
          total: data?.length,
          onChange: (page, size) => {
            setPage(page);
            setSize(size)
          }
        }}
        addBtnLabel='Make Payment'
        // showExport={"vendorpayment"}
        addParams={{vendor : selectedVendorKey}}
        baseRoute="/payment/vendorpayment"
        description="Vendor"
        isLoading={isLoading || isDeleting}
        data={data}
        deleteAction={deleteAction}
        showHeader
        newTable
      >
        <Datacolumn field="number" header="Pay Number" filteringType='number' />
        <Datacolumn field="date" header="Pay Date" filteringType='date' />
        <Datacolumn field="vendor.name" header="Vendor" filteringType='text' />
        <Datacolumn field="refnumber" header="Ref No" filteringType='number' />
        <Datacolumn field="modeofpay" header="Mode Of Pay" filteringType='text' />
        <Datacolumn field="paidamt" header="Paid Amt" filteringType='number' />
        <Datacolumn field="status.descr" header="Status" filteringType='text' />
      </ListLayout>
    </>

  );
}

export default Main