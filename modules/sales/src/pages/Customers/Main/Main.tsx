import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { useDeleteCustomerMutation, useListCustomerQuery } from '../customersApi';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListCustomerQuery({ page: page, size: size })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteCustomerMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  const statusTemplate = (rowData: any) => {
    return rowData.inactive === "Y" ? "Inactive" : "Active";
  }

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
      <Datacolumn field="id" header="Customer Code" filteringType='number' />
      <Datacolumn field="name" header="Customer Name" filteringType='text' />
      <Datacolumn field="contact_no" header="Phone No" filteringType='text' />
      <Datacolumn field="email_id" header="Email" filteringType='text' />
      {/* <Datacolumn field="inactive" header="Status" filteringType='text' displayValueGetter={statusTemplate} /> */}
    </ListLayout>
  );
}

export default Main