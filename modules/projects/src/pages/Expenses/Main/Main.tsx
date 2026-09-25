import React, { useEffect, useState } from 'react';
import { ListLayout, Datacolumn, CreateButton } from '@igblsln/control';
import { PAGE_SIZE, setSelectedProjectReducer, useActiveProjectQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { useDeleteExpenseMutation, useListExpenseQuery } from '../apis';
import { useDispatch, useSelector } from 'react-redux';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE);
  const dispatch = useDispatch();
  const selectedProjectKey = useSelector((state: any) => state?.common?.selectedProject)

  const { data, isFetching: isLoading } = useListExpenseQuery({ page: page, size: size, project: selectedProjectKey }, { refetchOnMountOrArgChange: true, skip: !selectedProjectKey })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteExpenseMutation()
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
              dispatch(setSelectedProjectReducer(e.value))
            }}
            options={projects}
          />
        </div>
        <CreateButton
          disabled={!selectedProjectKey}
          to={"/projects/expenses/new"}
          label='Expenses'
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
        baseRoute="/projects/expenses"
        description="Expenses"
        isLoading={isLoading || isDeleting}
        data={data?.results}
        deleteAction={deleteAction}
        newTable
        emptyRowMessage={selectedProjectKey ? "No Expenses for Selected Project" : "Select a Project to View it's Expenses"}
        showHeader
      >
        <Datacolumn field="date" header="Expense Date" filteringType='text' />
        <Datacolumn field="amount" header="Amount" filteringType='currency' />
        <Datacolumn field="desc" header="Description" filteringType='text' />
        <Datacolumn field="payment_mode_descr" header="Mode" filteringType='text' />
      </ListLayout>
    </>

  );
}

export default Main