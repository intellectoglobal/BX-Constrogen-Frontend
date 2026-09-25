import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { useDeleteBankMutation, useListAllBankQuery } from '../banksApi';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListAllBankQuery({ page: page, size: size }, { refetchOnMountOrArgChange: true })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteBankMutation()
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
      baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
      description={PAGE_NAME}
      isLoading={isLoading || isDeleting}
      data={data?.results}
      deleteAction={deleteAction}
      newTable
      showHeader
      // navKey={'id'}
      // delKey={'id'}
    >
      <Datacolumn field="id" header="Bank Code" filteringType='number' />
      <Datacolumn field="bank_name" header="Bank Name" filteringType='text' />
      <Datacolumn field="acc_no" header="Account No" filteringType='text' />
      <Datacolumn field="acc_name" header="Account Name" filteringType='text' />
    </ListLayout>
  );
}

export default Main