import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from "primereact/utils";
import { useDeletePurchaseOrderMutation, useListPurchaseOrderQuery } from '../apis';
import ViewModal from '../ViewModal';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data: projects } = useActiveProjectQuery()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<any>(null)
  const [selectedPO, setSelectedPO] = useState<any>(null)
  const [allProjects, setAllProjects] = useState<any>([])
  const { data, isFetching: isLoading } = useListPurchaseOrderQuery({ page: page, size: size, project: selectedProjectKey, status: selectedStatus })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeletePurchaseOrderMutation()
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

  const customDiscard = () => {
    setShowModal(false)
  }

  return (
    <>
      <Divider />


      <div style={{ display: 'flex' }}>
        <div className="field col-4">
          <label className={'col-4'}>Account Name</label>
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
          <label className={'col-4'}>From Date</label>
          <Calendar
            style={{ width: '60%' }}
            showIcon
          />
        </div>
        <div className="field col-4">
          <label className={'col-4'}>To Date</label>
          <Calendar
            style={{ width: '60%' }}
            showIcon
          />
        </div>

        {/* <div className="field col-6">
          <div className="field">
            <label className={'col-3'}>Status of PO</label>
            <Dropdown
              style={{ width: '30%' }}
              value={selectedStatus}
              placeholder='All'
              onChange={(e) => {
                setSelectedStatus(e.value)
              }}
              optionLabel={"descr"}
              optionValue={"key"}
              options={[
                {
                  key: null,
                  descr: "All"
                },
                {
                  key: "S",
                  descr: "Saved"
                },
                {
                  key: "U",
                  descr: "Submitted"
                },
                {
                  key: "C",
                  descr: "Cancelled"
                }
              ]}
            />
          </div>
        </div> */}
      </div>

      <ListLayout
        // enableView
        // onViewClick={(key: any) => {
        //   console.log(key)
        //   setSelectedPO(key)
        //   setShowModal(true)
        // }}
        pagination={{
          pageSize: size,
          loading: isLoading,
          currentPage: page,
          total: data?.count,
          onChange: (page, size) => {
            setPage(page);
            setSize(size)
          }
        }}
        baseRoute="/payment/debit"
        description="Debit Transaction"
        isLoading={isLoading || isDeleting}
        data={data?.results}
        newTable
        showHeader
        hideAddButton
        hideActionColumn
        deleteAction={deleteAction}
      >
        <Datacolumn field="date" header="Date" filteringType='date' />
        <Datacolumn field="amount" header="Amount" type='currency' filteringType='currency' />
        <Datacolumn field="vendor.name" header="Payee Type" filteringType='text' />
        <Datacolumn field="vendor.name" header="Payee Name" filteringType='text' />
        {/* <Datacolumn field="status.descr" header="Mode Of Payment" filteringType='text' /> */}
        <Datacolumn field="status.descr" header="Receipt No" filteringType='text' />
      </ListLayout>

      <ViewModal displayModal={showModal} poId={selectedPO} customDiscard={customDiscard} />
    </>

  );
}

export default Main