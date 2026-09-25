//@ts-nocheck1
import React, { useState } from 'react'
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import {
  ListLayout,
  Datacolumn,
} from '@igblsln/control';
import { Dialog } from 'primereact/dialog';
import { useGetAllItemTypesQuery, useGetItemKitsForParamsQuery, useGetItemTypesForVendorQuery, useGetPurposesForItemTypeQuery } from '@igblsln/store';

type Props = {
  selectedVendor: any,
  displayModal: boolean,
  customDiscard: any,
  setTableData: Function,
}



export default function LoadFromKITModal({ 
  selectedVendor,
  displayModal, 
  customDiscard,
  setTableData = () => { }, 
}: Props) {

  const { data: itemTypes } = useGetItemTypesForVendorQuery(selectedVendor, { refetchOnMountOrArgChange: true, skip: !selectedVendor })

  const [selectedItemType , setSelectedItemType] = useState<any>(null)
  const [selectedPurpose , setSelectedPurpose] = useState<any>(null)
  const { data: purposes } = useGetPurposesForItemTypeQuery(selectedItemType, { refetchOnMountOrArgChange: true, skip : !selectedItemType })
  const {data : itemKits} = useGetItemKitsForParamsQuery({itemType : selectedItemType, purpose : selectedPurpose}, {skip : !selectedItemType || !selectedPurpose})
  
  const renderField = (row: any, field: string) => (
    <div
      style={{ cursor: 'pointer' }}
      onClick={() => {
        console.log('item_kit_template_detail:', row?.item_kit_template_detail);
        let temp = row?.item_kit_template_detail?.map((d: any, index: number) => {
          const { key, ...rest } = d;
          return {
            ...rest,
            id: `kit-${row.key}-${index}`
          };
        });
        setTableData(temp || []);
        customDiscard();
      }}
    >
      {row[field] || ''}
    </div>
  )
  
  return (
    <>
      <Dialog
        header={`Load From Item Kit`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '50vw' }}
        onHide={() => customDiscard()}
        closeOnEscape
        draggable={false} resizable={false} closable
      >

        <div style={{ display: 'flex' }}>
          <div className="field col-6">
            <label className={'col-4'}>Item Type</label>
            <Dropdown
              style={{ width: '60%' }}
              options={itemTypes}
              onChange={(e) => setSelectedItemType(e.value)}
              optionLabel='descr'
              optionValue='key'
              value={selectedItemType}
              filter
              filterBy='descr'
            />
          </div>
          <div className="field col-6">
            <label className={'col-4'}>Purpose</label>
            <Dropdown
              style={{ width: '60%' }}
              options={purposes}
              onChange={(e) => setSelectedPurpose(e.value)}
              optionLabel='name'
              optionValue='key'
              value={selectedPurpose}
              filter
              filterBy='name'
            />
          </div>


        </div>

        <ListLayout baseRoute={`/purchase`} description={''}
          data={itemKits}
          newTable
          tableLayoutClass='h-full'
          allowFilters={false}
          hideActionColumn
          gridProps={{
            allowAdd: false,
          }}>
          <Datacolumn field="kit_name" header="Item Kit Name" type="text" displayValueGetter={renderField}/>
          <Datacolumn field="description" header="Description" type="text" displayValueGetter={renderField} />
          {/* <Datacolumn width={"10%"} field="selected" defaultValue={false} header="Select" type="checkbox" editorType={getCheckboxEditor} /> */}
        </ListLayout>
        {/* <div>
          <Button
            label='Load Item Kit'
            style={{
              margin: 'auto',
              marginTop: 10,
              display: 'flex',
            }}
            className='p-button-plain'
            onClick={() => {
              customDiscard(true)
            }}
          />
        </div> */}
      </Dialog>
    </>
  )
}
