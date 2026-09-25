import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn, CreateButton } from '@igblsln/control';
import { PAGE_SIZE, useGetAllItemTypesQuery } from '@igblsln/store';
import { useDeleteBrandMutation, useListBrandQuery } from '../brandApi';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { useListItemTypesQuery } from '../../ItemType/itemTypesApi';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [selectedType, setSelectedType] = useState(null)
  const [allItemTypes, setAllItemTypes] = useState<any>([])
  const { data: itemTypes } = useGetAllItemTypesQuery()
  const { data, isFetching: isLoading } = useListBrandQuery({ page: page, size: size, type : selectedType })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteBrandMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  useEffect(() => {
    setAllItemTypes([
      {
        key: null,
        descr: 'All'
      },
      ...itemTypes || []
    ])
  }, [itemTypes])

  return (
    <>
      <Divider />
      <div className="flex" style={{ width: '100%' }}>
        {/* <div className="field col-4">
          <label className={'col-4'}>Search By</label>
          <InputText
            style={{ width: '60%' }}
            // onChange={(e) => {
            //   setSelectedType(e.value)
            // }}
            placeholder='Purpose'
          />
        </div> */}
        <div className="field col-6">
          <label className={'col-4'}>Material Item Type</label>
          <Dropdown
            style={{ width: '60%' }}
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.value)
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
        <CreateButton col={4} to={`/${MODULE_NAME}/${PAGE_ROUTE}/new`} label='brand' />
      </div>
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
      >
        <Datacolumn field="name" header="Description" filteringType='text' />
        <Datacolumn field="itemtyp.descr" header="Material Item Type" filteringType='text' />
        {/* <Datacolumn field="no_of_items" header="No Of Material Items" filteringType='text' /> */}
      </ListLayout>
    </>

  );
}

export default Main