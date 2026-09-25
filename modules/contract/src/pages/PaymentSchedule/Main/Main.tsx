import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { useDeletePaymentScheduleMutation, useListPaymentScheduleQuery } from '../api';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListPaymentScheduleQuery({ page: page, size: size }, { refetchOnMountOrArgChange: true })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeletePaymentScheduleMutation()
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
    >
      <Datacolumn field="template_name" header="Template Name" filteringType='text' />
      <Datacolumn field="description" header="Description" filteringType='text' />
      <Datacolumn field="contract_type" header="Contract Type" filteringType='text' />
    </ListLayout>
  );
}

export default Main