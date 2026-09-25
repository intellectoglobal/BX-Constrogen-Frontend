//@ts-nocheck1
import React, { useState } from 'react'
import { Dropdown } from 'primereact/dropdown';
import {
  ListLayout,
  Datacolumn,
} from '@igblsln/control';
import { Dialog } from 'primereact/dialog';
import { useGetAllSaleAgreementPaymentTemplatesQuery, useGetItemKitsForParamsQuery, useGetItemTypesForVendorQuery } from '@igblsln/store';

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

  const {data : itemKits} = useGetAllSaleAgreementPaymentTemplatesQuery()
  
  const renderField = (row: any, field: string) => (
    <div
      style={{ cursor: 'pointer' }}
      onClick={() => {
        let temp = row?.payment_schedule_template_detail?.map((d:any) => {
          const {key,...rest} = d
          return {
            ...rest
          }
        })
        setTableData(temp || [])
        customDiscard()
      }}
    >
      {row[field] || ''}
    </div>
  )
  
  return (
    <>
      <Dialog
        header={`Load From Payment Template`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '50vw' }}
        onHide={() => customDiscard()}
        closeOnEscape
        draggable={false} resizable={false} closable
      >


        <ListLayout
          data={itemKits}
          newTable
          tableLayoutClass='h-full'
          allowFilters={false}
          hideActionColumn
          gridProps={{
            allowAdd: false,
          }}>
          <Datacolumn field="template_name" header="Item Kit Name" type="text" displayValueGetter={renderField}/>
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
