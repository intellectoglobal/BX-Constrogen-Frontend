import React, { useEffect, useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, formatDate, useActiveContractorsQuery, useActiveProjectQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { useDeleteContractorPaymentMutation, useListContractorPaymentQuery } from '../contractorPaymentApi';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [allProjects, setAllProjects] = useState<any>([])
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [allContractors, setAllContractors] = useState<any>([])
  const [selectedContractorKey, setSelectedContractorKey] = useState<any>(null)
  const [paymentFrom, setPaymentFrom] = useState<any>(null)
  const [paymentTo, setPaymentTo] = useState<any>(null)
  const { data: projects } = useActiveProjectQuery()
  const { data: contractors, isLoading: contractorsFetching } = useActiveContractorsQuery()
  const { data, isFetching: isLoading } = useListContractorPaymentQuery({ page: page, size: size, project: selectedProjectKey, paymentfrom: paymentFrom ? formatDate(paymentFrom) : null, paymentto: paymentTo ? formatDate(paymentTo) : null })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteContractorPaymentMutation()
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

  return (
    <>
      <Divider />
      <div style={{ display: 'flex' }}>
        <div className="field col-5">
          <label className={'col-4'}>Contractor Name</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedContractorKey}
            onChange={(e) => {
              setSelectedContractorKey(e.value)
            }}
            filter
            filterBy='name'
            options={allContractors}
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
        </div>
        <div className="field col-4">
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
        addParams={{contractor : selectedContractorKey}}
        // showExport={"contractorpayment"}
        baseRoute="/payment/contractorpayment"
        description="Contractor"
        isLoading={isLoading || isDeleting}
        data={data}
        deleteAction={deleteAction}
        showHeader
        newTable
      >
        <Datacolumn field="number" header="Pay Number" filteringType='number' />
        <Datacolumn field="date" header="Pay Date" filteringType='date' />
        <Datacolumn field="contractor.name" header="Contractor" filteringType='text' />
        <Datacolumn field="refnumber" header="Ref No" filteringType='number' />
        <Datacolumn field="modeofpay" header="Mode Of Pay" filteringType='text' />
        <Datacolumn field="paidamt" header="Paid Amt" filteringType='number' />
        <Datacolumn field="status.descr" header="Status" filteringType='text' />
      </ListLayout>
    </>

  );
}

export default Main