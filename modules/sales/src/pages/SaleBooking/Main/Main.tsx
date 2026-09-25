import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { useDeleteSaleBookingMutation, useListSaleBookingQuery } from '../saleBookingApi';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListSaleBookingQuery({ page: page, size: size })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteSaleBookingMutation()
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
      baseRoute="/sales/salebooking"
      description="Sale Booking"
      isLoading={isLoading || isDeleting}
      data={data?.results}
      deleteAction={deleteAction}
      showHeader
      newTable
    >
      <Datacolumn field="number" header="Booking No" filteringType='number' />
      <Datacolumn field="date" header="Booking Date" filteringType='date' />
      <Datacolumn field="customer.name" header="Customer" filteringType='text' />
      <Datacolumn field="project.name" header="Project" filteringType='text' />
      <Datacolumn field="unit.descr" header="Unit" filteringType='number' />
      <Datacolumn field="status.descr" header="Status" filteringType='text' />
    </ListLayout>
  );
}

export default Main