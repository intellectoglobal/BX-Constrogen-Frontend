import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn, CreateButton } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery } from '@igblsln/store';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { useDeleteContractAgreementMutation, useListContractAgreementQuery } from '../contractAgreementApi';
import { MODULE_NAME } from '../../../constants';
import { PAGE_ROUTE } from '../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [customProjectList, setCustomProjectList] = useState<any[]>([])
  const { data: projects } = useActiveProjectQuery()
  const { data, isFetching: isLoading } = useListContractAgreementQuery({ page: page, size: size, projectId: selectedProjectKey }, { refetchOnMountOrArgChange: true })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteContractAgreementMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  useEffect(() => {
    setCustomProjectList([
      { key: null, name: "All" },
      ...projects || []
    ])
  }, [projects])

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
            filterBy={"name"}
            placeholder='All'
            onChange={(e) => {
              setSelectedProjectKey(e.value)
            }}
            options={customProjectList}
          />
        </div>
        <CreateButton to={`/${MODULE_NAME}/${PAGE_ROUTE}/new`} label='Contract Agreement' />
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
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
        description={"Contract Agreement"}
        isLoading={isLoading || isDeleting}
        data={data?.results}
        deleteAction={deleteAction}
        newTable
        showHeader
        hideAddButton
      >
        <Datacolumn field="agreement_date" header="Date" filteringType='date' />
        <Datacolumn field="contractor_name" header="Contractor Name" filteringType='number' />
        <Datacolumn field="contractor_type" header="Contractor Type" filteringType='number' />
        <Datacolumn field="project_name" header="Project" filteringType='text' />
        {/* <Datacolumn field="agreement_no" header="Agreement No" filteringType='number' /> */}
        <Datacolumn field="total_amount" header="Agreement Amount" type='currency' filteringType='currency' />
        <Datacolumn field="paid_amount" header="Paid Amount" type='currency' filteringType='currency' />
        {/* <Datacolumn field="status.descr" header="Status" filteringType='text' /> */}
      </ListLayout>
    </>

  );
}

export default Main