import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from "primereact/utils";
import { useDeletePurchaseOrderMutation, useListPurchaseOrderQuery } from '../apis';
import ViewModal from '../ViewModal';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

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
      {/* <div style={{ display: 'flex' }}>
        <div className="field col-6">
          <label className={'col-3'}>Project Name</label>
          <Dropdown
            style={{ width: '30%' }}
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
        <div className="field col-6">
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
        </div>
      </div> */}

      <ListLayout
        enableView
        viewOnly
        onViewClick={(key: any) => {
          console.log(key)
          setShowModal(true)
        }}
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
        baseRoute={`/payment/${PAGE_ROUTE}`}
        description={PAGE_NAME}
        isLoading={isLoading || isDeleting}
        data={data?.results || [{}]}
        newTable
        hideAddButton
        showHeader
        deleteAction={deleteAction}
      >
        <Datacolumn field="tid" header="Transaction ID" filteringType='number' />
        <Datacolumn field="amount" header="Amount" type='currency' filteringType='currency' />
        <Datacolumn field="type" header="Transaction Type" filteringType='number' />
        <Datacolumn field="invoiceid" header="Invoice / Receipt ID" filteringType='text' />
      </ListLayout>

      <ViewModal displayModal={showModal} poId={selectedPO} customDiscard={customDiscard} />
    </>

  );
}

export default Main