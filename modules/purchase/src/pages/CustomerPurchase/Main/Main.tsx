import React, { useState } from 'react';
import { ListLayout, Datacolumn, CreateButton } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { useDeleteCustomerPurchaseMutation, useListCustomerPurchaseQuery } from '../apis';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE);
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)

  const { data, isFetching: isLoading } = useListCustomerPurchaseQuery({ page: page, size: size, project: selectedProjectKey }, { refetchOnMountOrArgChange: true, skip: !selectedProjectKey })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteCustomerPurchaseMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  const { data: projects } = useActiveProjectQuery()


  return (
    <>
      <Divider />
      <div className="flex">
        <div className="field col-6">
          <label className={'col-4'}>Project Name</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectKey}
            filter
            placeholder='Select a Project'
            filterBy={"name"}
            onChange={(e) => {
              setSelectedProjectKey(e.value)
            }}
            options={projects}
          />
        </div>
        <CreateButton
          // disabled={!selectedProjectKey}
          to={"/purchase/customerpurchase/new"}
          label='Customer Purchases'
          state={{ project_key: selectedProjectKey }}
        />

      </div>

      <ListLayout
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
        hideAddButton
        baseRoute="/purchase/customerpurchase"
        description="Customer Purchases"
        isLoading={isLoading || isDeleting}
        data={data?.results}
        deleteAction={deleteAction}
        newTable
        emptyRowMessage={selectedProjectKey ? "No Customer Purchases for Selected Project" : "Select a Project to View it's Customer Purchases"}
        showHeader
      >
        <Datacolumn field="customer_name" header="Customer" filteringType='text' />
        <Datacolumn field="amount" header="Amount" filteringType='currency' />
        <Datacolumn field="notes" header="Notes" filteringType='text' />
       </ListLayout>
    </>

  );
}

export default Main