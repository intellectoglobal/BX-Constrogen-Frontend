import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from "primereact/utils";
import { useDeletePurchaseOrderMutation, useListPurchaseOrderQuery } from '../apis';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data: projects } = useActiveProjectQuery()
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<any>(null)
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


  return (
    <>
      <Divider />

      <div style={{ display: 'flex' }}>

        <div className="field col-6">
          <label className={'col-4'}>Financial Year</label>
          <Dropdown
            style={{ width: '60%' }}
            options={[2024, 2023, 2022, 2021, 2020]}
            defaultValue={2024}
            placeholder={'2024'}
          />
        </div>
        <div className="field col-6">
          <label className={'col-4'}>Month</label>
          <Dropdown
            style={{ width: '60%' }}
            options={[]}
          />
        </div>
      </div>

      <ListLayout
        // enableView
        // onViewClick={(key: any) => {
        //   console.log(key)
        //   setSelectedPO(key)
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
        <Datacolumn field="vendor.name" header="Contract No" filteringType='text' />
        <Datacolumn field="vendor.name" header="Contractor Name" filteringType='text' />
        <Datacolumn field="status.descr" header="Project Name" filteringType='text' />
        <Datacolumn field="amount" header="Amount" type='currency' filteringType='currency' />
        <Datacolumn field="status.descr" header="Voucher No" filteringType='text' />
      </ListLayout>

    </>

  );
}

export default Main