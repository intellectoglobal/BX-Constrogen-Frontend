import React, { useState } from 'react';
import { ListLayout, Datacolumn, CreateButton } from '@igblsln/control';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { PAGE_SIZE, useGetAllItemTypesQuery } from '@igblsln/store';
import { useDeleteItemTypesMutation, useListItemTypesQuery } from '../itemTypesApi';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [selected, setSelected] = useState(null)
  const { data, isFetching: isLoading } = useListItemTypesQuery({ page: page, size: size, type: selected })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteItemTypesMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();
  const {data : allItemTypes} = useGetAllItemTypesQuery()
  return (
    <>
      <Divider />

      <div style={{ display: 'flex' }}>
        <div className="field col-6">
          <label className={'col-4'}>Item Type</label>
          <Dropdown
            style={{ width: '60%' }}
            value={selected}
            onChange={(e) => {
              setSelected(e.value)
            }}
            showClear
            filter
            filterBy='descr'
            options={allItemTypes}
            placeholder='All'
            optionLabel='descr'
            optionValue='key'
          />
        </div>

        <CreateButton col={4} to={"/inventory/itemtypes/new"} label='Material Item Type' />

      </div>


      <div className="col-12 ">

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
          hideAddButton
          baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
          description={PAGE_NAME}
          isLoading={isLoading || isDeleting}
          data={data?.results}
          deleteAction={deleteAction}
          newTable
          showHeader
        >
          <Datacolumn field="id" header="ItemType Code" filteringType='number' />
          <Datacolumn field="descr" header="ItemType Description" filteringType='text' />
        </ListLayout>
      </div>
    </>
  );
}

export default Main