import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn, CreateButton } from '@igblsln/control';
import { useLocation } from 'react-router-dom';
import { PAGE_SIZE, useGetAllItemTypesQuery, useGetItemSubTypeForItemTypeQuery } from '@igblsln/store';
import { useDeleteItemsMutation, useListItemsQuery } from '../itemsApi';
import { MODULE_NAME } from '../../../constants';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { useListItemTypesQuery } from '../../ItemType/itemTypesApi';
import { useListUOMsQuery } from '../../UOM/UOMsApi';
import { ProgressSpinner } from 'primereact/progressspinner';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [filter, setFilter] = useState({})

  const filterFromState = JSON.parse(useLocation()?.state || '{}')

  const [selectedItemType, setSelectedItemType] = useState(filterFromState?.itemType || null)
  const [selectedItemSubType, setSelectedItemSubType] = useState(filterFromState?.itemSubType || null)
  const [allItemTypes, setAllItemTypes] = useState<any>([])
  const [allItemSubTypes, setAllItemSubTypes] = useState<any>([])
  const { data: UOMs, isLoading: UOMsFetching } = useListUOMsQuery({ page: 1, size: 1000 });
  const { data: itemTypes } = useGetAllItemTypesQuery()
  const { data: itemSubTypes, isFetching: itemSubTypeFetching } = useGetItemSubTypeForItemTypeQuery(selectedItemType, { skip: !selectedItemType })
  // const { data, isFetching: isLoading } = useListItemsQuery({ page: page, size: size, type : selectedItemType, filter: JSON.stringify(filter) })
  const { data, isFetching: isLoading } = useListItemsQuery({ page: page, size: size, type: selectedItemType, subtype: selectedItemSubType })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteItemsMutation()
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

  useEffect(() => {
    setAllItemSubTypes([
      {
        key: null,
        descr: 'All'
      },
      ...itemSubTypes || []
    ])
  }, [itemSubTypes])

  const getSpecParams = (data: any) => {
    if (data) {
      return data?.specifications?.map((d:any) => d.subtype_spec_descr).join(",")
    }
  }

  const getUOMs = (data: any) => {
    // if (data) {
    //   let temp1 = data?.uoms?.map((d: any) => parseInt(d.item_uom_key)) || []
    //   let temp2 = UOMs?.results?.filter(d => temp1?.includes(d.key))?.map(d => d.descr).join(',')
    //   return temp2
    // }
    return data?.uoms_desc?.join(", ")
  }

  return (
    <>
      <Divider />
      <div className="flex" style={{ width: '100%' }}>
        <div className="field col-5">
          <label className={'col-4'}>Material Item Type</label>
          <Dropdown
            style={{ width: '60%' }}
            value={selectedItemType}
            onChange={(e) => {
              setSelectedItemType(e.value)
            }}
            showClear
            options={allItemTypes}
            placeholder='All'
            optionLabel='descr'
            filter
            filterBy='descr'
            optionValue='key'
          />
        </div>
        <div className="field flex col-5">
          <label className={'col-4'}>Material Item Sub Type</label>
          <div style={{ display: 'flex', flexDirection: 'column', paddingTop: 0, width: '60%' }}>
            <Dropdown
              value={selectedItemSubType}
              onChange={(e) => {
                setSelectedItemSubType(e.value)
              }}
              disabled={!!!selectedItemType}
              options={allItemSubTypes}
              showClear
              filter
              filterBy='descr'
              placeholder='All'
              optionLabel='descr'
              optionValue='key'
            />
            {
              !!!selectedItemType && <small>Select an Material Item Type to Enable</small>
            }
          </div>

        </div>
        <CreateButton to={`/${MODULE_NAME}/${PAGE_ROUTE}/new`} label='Material Item' col={2} />
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
            stateValue={{
              itemType : selectedItemType,
              itemSubType : selectedItemSubType
            }}
            filterOptions={{
              onChange: (filter: any) => setFilter(filter)
            }}
            addParams={{ itemtype: selectedItemType, itemsubtype: selectedItemSubType }}
            baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
            hideAddButton
            description={PAGE_NAME}
            isLoading={isLoading || isDeleting}
            data={data?.results}
            deleteAction={deleteAction}
            newTable
            showHeader
          >
            <Datacolumn field="id" header="Material Item Code" filteringType='number' />
            <Datacolumn field="descr" header="Material Item Description" filteringType='text' />
            <Datacolumn field="spec_param" header="Spec Param" displayValueGetter={getSpecParams} filteringType='text' />
            <Datacolumn field="uom_keys" header="UOM" displayValueGetter={getUOMs} filteringType='text' />
          </ListLayout> :
          <ProgressSpinner className='ig-grid-loader' />
      }

    </>

  );
}

export default Main