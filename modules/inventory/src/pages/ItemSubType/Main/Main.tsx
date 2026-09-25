import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn, CreateButton } from '@igblsln/control';
import { PAGE_SIZE, useGetAllItemTypesQuery } from '@igblsln/store';
import { useDeleteItemSubTypesMutation, useListItemSubTypesQuery } from '../itemSubTypesApi';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { useListItemTypesQuery } from '../../ItemType/itemTypesApi';
import { useListUOMsQuery } from '../../UOM/UOMsApi';
import { ProgressSpinner } from 'primereact/progressspinner';

type Props = {}

const Main = (props: Props) => {

  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [selectedType, setSelectedType] = useState(null)
  const [allItemTypes, setAllItemTypes] = useState<any>([])
  const { data: UOMs, isLoading: UOMsFetching } = useListUOMsQuery({ page: 1, size: 1000 });
  const { data: itemTypes } = useGetAllItemTypesQuery()
  const { data, isFetching: isLoading } = useListItemSubTypesQuery({ page: page, size: size, type: selectedType })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteItemSubTypesMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  const getSpecParams = (data: any) => {
    if (data) {
      // console.log(data.specifications)
      return data?.specifications?.map((d:any) => d.descr).join(",")
    }
  }

  const getUOMs = (data: any) => {
    if (data) {
      let temp1 = data?.uoms?.map((d: any) => parseInt(d.item_uom_key)) || []
      let temp2 = UOMs?.results?.filter(d => temp1?.includes(d.key))?.map(d => d.descr).join(',')
      return temp2
    }
  }
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
        <CreateButton to={`/${MODULE_NAME}/${PAGE_ROUTE}/new`} label='Material Item Sub Type' />
      </div>
      {
        !UOMsFetching ?
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
            isLoading={isLoading || isDeleting || UOMsFetching}
            data={data?.results}
            deleteAction={deleteAction}
            newTable
            // showHeader
          >
            <Datacolumn field="id" header="SubType Code" filteringType='number' />
            <Datacolumn field="descr" header="SubType Description" filteringType='text' />
            <Datacolumn field="itemtyp.descr" header="Material Item Type" filteringType='text' />
            <Datacolumn field="gst" header="GST (%)" filteringType='number' defaultValue={0} />
            <Datacolumn field="spec_param" header="Spec Param" displayValueGetter={getSpecParams} filteringType='text' />
            <Datacolumn field="uom_keys" header="UOM" displayValueGetter={getUOMs} filteringType='text' />
          </ListLayout> :
          <ProgressSpinner className='ig-grid-loader' />
      }

    </>

  );
}

export default Main