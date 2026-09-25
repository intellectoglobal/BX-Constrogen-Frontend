import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { useDeleteContractMutation, useListContractQuery } from '../contractApi';
import { MODULE_NAME } from '../../../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListContractQuery({ page: page, size: size }, { refetchOnMountOrArgChange: true })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteContractMutation()
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
      baseRoute={`/${MODULE_NAME}/contract`}
      description={"Contracts"}
      isLoading={isLoading || isDeleting}
      data={data?.results}
      deleteAction={deleteAction}
      newTable
      showHeader
    >
      <Datacolumn field="contractno" header="Contract No" filteringType='number' />
      <Datacolumn field="contractdate" header="Contract Date" filteringType='date' />
      <Datacolumn field="vendor.name" header="Contractor" filteringType='text' />
      <Datacolumn field="project.name" header="Project" filteringType='text' />
      <Datacolumn field="status.descr" header="Status" filteringType='text' />
    </ListLayout>
  );
}

export default Main