import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
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
      <div className="pl-5">
        <div className="field">
          <label className={'col-2'}>Project Name</label>
          <Dropdown
            style={{ width: '30%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectKey}
            filter
            filterBy={"name"}
            onChange={(e) => {
              setSelectedProjectKey(e.value)
            }}
            options={projects}
          />
        </div>
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
        baseRoute="/payment/miscellaneousreceipt"
        description="Miscellaneous Receipt"
        isLoading={isLoading || isDeleting}
        data={data?.results}
        newTable
        showHeader
        deleteAction={deleteAction}
      >
        <Datacolumn field="date" header="Date" filteringType='date' />
        
        <Datacolumn field="number" header="Receipt No" filteringType='number' />
        <Datacolumn field="vendor.name" header="Company" filteringType='text' />
        {/* <Datacolumn field="status.descr" header="Project" filteringType='text' /> */}
      </ListLayout>

      <ViewModal displayModal={showModal} poId={selectedPO} customDiscard={customDiscard} />
    </>

  );
}

export default Main