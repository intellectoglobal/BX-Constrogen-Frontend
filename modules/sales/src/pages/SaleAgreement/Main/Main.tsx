import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn, CreateButton } from '@igblsln/control';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { PAGE_SIZE, useActiveProjectQuery } from '@igblsln/store';
import { useDeleteSaleAgreementMutation, useListSaleAgreementQuery } from '../saleAgreementApi';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const { data: projects } = useActiveProjectQuery()
  const { data, isFetching: isLoading } = useListSaleAgreementQuery({ page: page, size: size, projectId: selectedProjectKey },{refetchOnMountOrArgChange : true})
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteSaleAgreementMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();


  return (
    <>
      <Divider />

      <div className="flex">
        <div className="field col-6">
          <label className={'col-4'}>Project Name</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel='name'
            placeholder='All'
            optionValue='key'
            showClear
            value={selectedProjectKey}
            onChange={(e) => setSelectedProjectKey(e.target.value)}
            options={projects}
          />
        </div>
        <CreateButton to="/sales/saleagreement/new" label='Sale Agreement' />
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
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
        description={PAGE_NAME}
        isLoading={isLoading || isDeleting}
        data={data?.results}
        newTable
        showHeader
        deleteAction={deleteAction}
      >
        <Datacolumn field="agreement_date" width={"12%"} header="Agreement Date" filteringType='date' />
        <Datacolumn field="customer_name" width={"35%"} header="Customer Name" filteringType='text' />
        <Datacolumn field="unit_desc" width={"8%"} header="Unit" filteringType='text' />
        {/* <Datacolumn field="agreement_no" header="Agreement No" filteringType='number' /> */}
        <Datacolumn field="sale_amount" width={"14%"} header="Amount" type='currency' filteringType='currency' />
        <Datacolumn field="balance_amount" width={"14%"} header="Balance" type='currency' filteringType='currency' />
        {/* <Datacolumn field="booking.project.name" header="Project" filteringType='text' /> */}
        {/* <Datacolumn field="status.descr" header="Status" filteringType='text' /> */}
      </ListLayout>
    </>

  );
}

export default Main