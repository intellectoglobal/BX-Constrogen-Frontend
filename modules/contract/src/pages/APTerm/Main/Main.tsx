import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { useDeleteAPTermMutation, useListAPTermQuery } from '../apTermApi';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListAPTermQuery({ page: page, size: size })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteAPTermMutation()
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
      baseRoute="/contract/apterm" description="AP Term" isLoading={isLoading || isDeleting}
      data={data?.results}
      deleteAction={deleteAction}
      newTable
      showHeader
    >
      <Datacolumn field="id" header="Term Code" filteringType='number' />
      <Datacolumn field="descr" header="Term Description" filteringType='text' />
    </ListLayout>
  );
}

export default Main