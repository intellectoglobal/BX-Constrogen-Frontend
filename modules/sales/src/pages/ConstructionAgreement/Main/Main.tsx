import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { PAGE_SIZE, useActiveProjectQuery } from '@igblsln/store';
import { useDeleteConstructionAgreementMutation, useListConstructionAgreementQuery } from '../constructionAgreementApi';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const { data: projects } = useActiveProjectQuery()
  const { data, isFetching: isLoading } = useListConstructionAgreementQuery({ page: page, size: size })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteConstructionAgreementMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  return (
    <>
      {/* <Divider /> */}
      {/* <div className="pl-5">
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
      </div> */}

      {/* <div className="flex">
        <div className="field col-6">
          <label className={'col-4'}>Project Name</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel='descr'
            placeholder='All'
            optionValue='key'
            options={[]}
          />
        </div>
      </div> */}
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
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
        description={PAGE_NAME}
        isLoading={isLoading || isDeleting}
        data={data?.results}
        newTable
        showHeader
        deleteAction={deleteAction}
      >
        <Datacolumn field="agreement_date" header="Date" filteringType='date' />
         <Datacolumn field="customer_name" header="Customer Name" filteringType='text' />
         <Datacolumn field="project_name" header="Project Name" filteringType='text' />
        <Datacolumn field="agreement_no" header="Agreement No" filteringType='number' />
        <Datacolumn field="contract_amount" header="Amount" type='currency' filteringType='currency' />
        <Datacolumn field="balance_amount" header="Balance" type='currency' filteringType='currency' />
        {/* <Datacolumn field="booking.unit.descr" header="Unit" filteringType='text' />
        <Datacolumn field="status.descr" header="Status" filteringType='text' /> */}
      </ListLayout>
    </>

  );
}

export default Main