//@ts-nocheck1
import React from 'react'
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import {
  ListLayout,
  Datacolumn,
} from '@igblsln/control';
import { useGetInvoiceQuery } from '../api';
import { Dialog } from 'primereact/dialog';

type Props = {
  displayModal: boolean,
  poId: any;
  customDiscard: any,
}

export default function ViewModal({ displayModal, poId, customDiscard }: Props) {

  const { data, isFetching } = useGetInvoiceQuery(poId, {
    refetchOnMountOrArgChange: true
  })


  return (
    <>
      <Dialog
        header={`View Vendor Invoice`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        closeOnEscape
        draggable={false} resizable={false} closable
      >
        {/* <ManageLayout
          baseRoute="/payment/vendorpayment"
          viewMode
          id={poId}
          bottomControl
          data={data}
          hideHeader
          customDiscard={customDiscard}
          isLoading={isFetching}
          onSubmit={() => { }}
          renderForm={renderForm}
        /> */}
        <div style={{ display: 'flex' }}>
          <div className="field col-4">
            <label className={'col-4'}>Vendor Name</label>
            <InputText
              style={{ width: '60%' }}
              disabled
            />
          </div>
          <div className="field col-4">
            <label className={'col-4'}>Project Name</label>
            <InputText
              style={{ width: '60%' }}
              disabled
            />
          </div>
          <div className="field col-4">
            <label className={'col-4'}>Creation Method</label>
            <InputText
              style={{ width: '60%' }}
              value={"Generated from PO"}
              disabled
            />
          </div>

        </div>
        <div style={{ display: 'flex' }}>
          <div className="field col-4">
            <label className={'col-4'}>Invoice Amount</label>
            <InputText
              style={{ width: '60%' }}
              disabled
            />
          </div>
          <div className="field col-4">
            <label className={'col-4'}>TDS</label>
            <InputText
              style={{ width: '60%' }}
              disabled
            />
          </div>
          <div className="field col-4">
            <label className={'col-4'}>GST</label>
            <InputText
              style={{ width: '60%' }}
              disabled
            />
          </div>

        </div>
        <div className="flex col-12">
          <div className="col-6" style={{ fontSize: 20 }}>
            <strong>Item Detail - ABC</strong>
          </div>
          <div className="col-6" style={{ fontSize: 20 }}>
            <strong>Purchase Order No - 123</strong>
          </div>
        </div>
        <Divider />
        <ListLayout baseRoute={`/purchase`} description={''}
          data={[
            {},
            {},
            {},
            {},
            {},
          ]}
          newTable
          tableLayoutClass='h-full'
          allowFilters={false}
          hideActionColumn
          gridProps={{
            allowAdd: false,
          }}>
          
          {/* <Datacolumn field="sub_type" header="Item Sub Type" type="text" /> */}
          <Datacolumn field="descr" header="Item Description" type="text" />
          <Datacolumn field="model_no" header="Brand" type="text" />
          <Datacolumn field="model_no" header="Model" type="text" />
          <Datacolumn field="qty" header="Quantity" type="number" />
          <Datacolumn field="qty" header="UOM" type="number" />
          <Datacolumn field="netamt" header="Net Amount" type="currency" defaultValue={0} />
        </ListLayout>
        <div>
          <Button
            label='Generate Invoice'
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
        </div>
      </Dialog>
    </>
  )
}
