import React, { useState } from 'react';
import { Column } from 'primereact/column';
import { ListLayout } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { headerStyle } from '@igblsln/themes';

import { useDeleteCostCodeMutation, useListCostCodeQuery } from '../costCodeApi';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListCostCodeQuery({ page: page, size: size })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteCostCodeMutation()
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
      baseRoute="/projects/costcode"
      description="Cost Code"
      isLoading={isLoading || isDeleting}
      data={data?.results}
      deleteAction={deleteAction}>
      <Column headerStyle={headerStyle} field="id" header="Code Code" sortable filter dataType="numeric" style={{ minWidth: '8rem' }} />
      <Column headerStyle={headerStyle} field="descr" header="Code Description" sortable filter style={{ minWidth: '12rem' }} />
      <Column headerStyle={headerStyle} field="cost_category.descr" header="Category Description" sortable filter style={{ minWidth: '12rem' }} />
    </ListLayout>
  );
}

export default Main