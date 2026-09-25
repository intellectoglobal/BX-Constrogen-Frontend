import React, { useEffect, useMemo, useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'primereact/tooltip';
import { useDeleteExpenseMutation, useListExpenseForProjectQuery } from '../apis';
import ManageModal from '../Modals/ManageModal';
import { useListExpenseTypeQuery } from '../../ExpenseType/api';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(PAGE_SIZE);
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<any>(null);

  const { data: projects } = useActiveProjectQuery();
  const { data: expenseTypes } = useListExpenseTypeQuery({ page: 1, size: 1000 });

  const selectedProjectName = React.useMemo(() => {
    if (!selectedProjectKey) return '';
    const selectedKey = (selectedProjectKey as any)?.key ?? selectedProjectKey;
    const selectedKeyAsString = String(selectedKey);
    const match = projects?.find?.((p: any) => String(p?.key) === selectedKeyAsString);
    return match?.name ?? (typeof selectedProjectKey === 'object' ? selectedProjectKey?.name : '') ?? '';
  }, [selectedProjectKey, projects]);

  // Use fallback only when selected values are null
  const queryArgs = useMemo(() => ({
    page,
    size,
    project: selectedProjectKey ,
    type: selectedType ,
  }), [page, size, selectedProjectKey, selectedType, projects, expenseTypes]);



  console.log("queryArgs ::", queryArgs);
  console.log("selectedProjectKey ::", selectedProjectKey, "selectedType ::", selectedType);

  const { data, isFetching: isLoading } = useListExpenseForProjectQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
    skip: !queryArgs.page,
  });

  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteExpenseMutation();
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  // useEffect(() => {
  //   setSelectedProjectKey(projects?.[0]?.key ?? null)
  //   // setSelectedType(expenseTypes?.results?.[0]?.key ?? null)
  // }, [projects, expenseTypes])

  return (
    <>
      <Divider />
      <div className="flex">
        <div className="field col-4">
          <label className={'col-4'}>Project Name</label>
          {!!selectedProjectName && (
            <Tooltip
              mouseTrack
              mouseTrackLeft={24}
              mouseTrackTop={18}
              target="#expenses-project"
              position="bottom"
              content={selectedProjectName}
              className="my-tooltip-plain"
            />
          )}
          <Dropdown
            id="expenses-project"
            style={{ width: '60%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectKey}
            filter
            showClear
            placeholder='All'
            filterBy={"name"}
            onChange={(e) => {
              setSelectedProjectKey(e.value)
            }}
            options={projects}
          />
        </div>
        <div className="field col-4">
          <label className={'col-4'}>Expense Type</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"descr"}
            optionValue={"key"}
            value={selectedType}
            showClear
            filter
            placeholder='All'
            filterBy={"descr"}
            onChange={(e) => {
              setSelectedType(e.value)
            }}
            options={expenseTypes?.results}
          />
        </div>
        <div className="field col-4">
          <Button
            label='Add Expense'
            className='p-button-plain'
            style={{ display: 'flex', margin: 'auto' }}
            onClick={() => {
              setShowModal(true)
            }}
          />
        </div>
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
        baseRoute="/payment/expenses"
        description="Expenses"
        isLoading={isLoading || isDeleting}
        data={data?.results}
        deleteAction={deleteAction}
        customEditOnClick={(value: any) => {
          console.log(value)
          setSelectedExpense(value)
          setShowModal(true)
        }}
        newTable
        emptyRowMessage={
          !selectedProjectKey
            ? "Select a Project to View its Expenses"
            // : !selectedType
            // ? "Select an Expense Type to View the Expenses"
            : "No Expenses for the Selected Expense Type"
        }

        showHeader
      >
        <Datacolumn field="date" header="Expense Date" filteringType='text' />
        <Datacolumn field="project_name" header="Project" filteringType='text' />
        <Datacolumn field="expense_type_descr" header="Type" filteringType='text' />
        <Datacolumn field="amount" header="Amount" filteringType='currency' />
        <Datacolumn field="payment_desc" header="Description" filteringType='text' />
        <Datacolumn field="payment_mode_descr" header="Mode" filteringType='text' />
      </ListLayout>
      {
        showModal &&
        <ManageModal id={selectedExpense?.key} displayModal={showModal} customDiscard={() => { 
          setShowModal(false)
          setSelectedExpense({})}} />
      }
    </>

  );
}

export default Main