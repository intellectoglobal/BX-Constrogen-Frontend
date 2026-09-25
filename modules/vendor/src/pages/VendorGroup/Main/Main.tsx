import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { useDeleteVendorGroupMutation, useListVendorGroupQuery } from '../vendorGroupApi';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListVendorGroupQuery({ page: page, size: size })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteVendorGroupMutation()
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
      baseRoute="/vendor/vendorgroup"
      description="Material Vendor Group"
      isLoading={isLoading || isDeleting}
      data={data?.results}
      deleteAction={deleteAction}
      newTable
      showHeader
    >
      <Datacolumn field="id" header="Group Code" filteringType='number' />
      <Datacolumn field="descr" header="Group Description" filteringType='text' />
    </ListLayout>
  );
}

export default Main