import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { Divider } from 'primereact/divider'
import { Dropdown } from 'primereact/dropdown'
import { PAGE_SIZE } from '@igblsln/store';
import { useDeleteUserMutation, useListUserQuery } from '../api';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListUserQuery({ page: page, size: size }, { refetchOnMountOrArgChange: true })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteUserMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();
  return (
    <>
      <Divider />

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
        data={[]}
        deleteAction={deleteAction}
        newTable
        showHeader
        navKey={'id'}
        delKey={'id'}
      >
        <Datacolumn field="id" header="User Code" filteringType='number' />
        <Datacolumn field="user_name" header="Employee Name" filteringType='text' />
        <Datacolumn field="role" header="Role" filteringType='text' />
        <Datacolumn field="salary" header="Salary" filteringType='currency' />
        <Datacolumn field="allowance" header="Weekly Allowance(Rs)" filteringType='currency' />
      </ListLayout>
    </>

  );
}

export default Main