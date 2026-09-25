import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { useDeleteCompanyMutation, useListCompanyQuery } from '../companiesApi';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListCompanyQuery({ page: page, size: size }, { refetchOnMountOrArgChange: true })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteCompanyMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();
  return (
    <ListLayout
      pagination={{
        pageSize: size,
        loading: isLoading,
        currentPage: page,
        total: data?.length,
        onChange: (page, size) => {
          setPage(page);
          setSize(size)
        }
      }}
      baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
      description={PAGE_NAME}
      isLoading={isLoading || isDeleting}
      data={data}
      deleteAction={deleteAction}
      newTable
      showHeader
      navKey={'id'}
      delKey={'id'}
    >
      <Datacolumn field="id" header="Company Code" filteringType='number' />
      <Datacolumn field="name" header="Company Name" filteringType='text' />
      <Datacolumn field="client" header="Client" filteringType='text' displayValueGetter={(row:any)=>row?.name}/>
      <Datacolumn field="project_status" header="Project Statuses" 
        displayValueGetter={(rowdata:any) => (rowdata?.project_status?.map((d:any) => d.descr).join(","))} 
        filteringType='text' />
    </ListLayout>
  );
}

export default Main