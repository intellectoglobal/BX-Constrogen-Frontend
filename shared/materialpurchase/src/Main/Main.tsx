import React, { useState } from 'react';
import { Datacolumn, ListLayout } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { useDeleteTransactionMutation, useListTransactionQuery } from '../transactionApi';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { Modules, ModuleDocId } from '../modules';

type Props = {
  moduleName: Modules;
}

const Main = ({ moduleName }: Props) => {

  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)

  let getQuery = moduleName !== 'purchase' ? { grn: ModuleDocId[moduleName], page: page, size: size } : { page: page, size: size }

  const { data, isFetching: isLoading } = useListTransactionQuery(getQuery, { refetchOnMountOrArgChange: true })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteTransactionMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  return (
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
      baseRoute={`/${moduleName}/${PAGE_ROUTE}`}
      description={PAGE_NAME}
      isLoading={isLoading || isDeleting}
      newTable
      showHeader
      data={data?.results}
      deleteAction={deleteAction}>
      {/* {moduleName === 'purchase' && <Datacolumn field="docid" header="Doc Code" filteringType='text' />} */}
      <Datacolumn field="date" header="Date" filteringType='text' />

      <Datacolumn field="number" header="GRN Number" filteringType='number' />
      <Datacolumn field="project.name" header="Project" filteringType='text' />
      <Datacolumn field="vendor.name" header="Vendor" filteringType='text' />
      <Datacolumn field="vendrefno" header="Vendor RefNo" filteringType='text' />
      <Datacolumn field="status.descr" header="GRN Status" filteringType='text' />
    </ListLayout>
  );
}

export default Main