import React, { useState } from 'react';
import { Column } from 'primereact/column';
import { PAGE_SIZE } from '@igblsln/store';
import { ListLayout } from '@igblsln/control';
import { headerStyle } from '@igblsln/themes';

import { useDeleteCostCategoryMutation, useListCostCategoryQuery } from '../costCategoryApi';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListCostCategoryQuery({ page: page, size: size })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteCostCategoryMutation()
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
      baseRoute="/projects/costcategory"
      description="Cost Category"
      isLoading={isLoading || isDeleting}
      data={data?.results}
      deleteAction={deleteAction}>
      <Column headerStyle={headerStyle} field="id" header="Category Code" sortable filter dataType="numeric" style={{ minWidth: '8rem' }} />
      <Column headerStyle={headerStyle} field="descr" header="Category Description" sortable filter style={{ minWidth: '12rem' }} />
    </ListLayout>
  );
}

export default Main