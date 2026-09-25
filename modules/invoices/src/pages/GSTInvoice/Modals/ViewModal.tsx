//@ts-nocheck1
import React from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
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
        header={`View Invoice`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        closeOnEscape
        draggable={false} resizable={false} closable
      >
        {/* <ManageLayout
          baseRoute="/payment/gstpayment"
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
        <div className="flex col-12">
          <div className="col-6" style={{ fontSize: 20 }}>
            <strong>Ajantha Hardwares</strong>
            {/* <div>717, New Street</div>
            <div>T.Nagar, Chennai</div>
            <div>Tamil Nadu - 600017</div> */}
          </div>
          <div className="col-6">
          </div>
        </div>
        <ListLayout baseRoute={`/purchase`} description={''}
          data={[
            {},
            {},
            {},
            {},
            {},
            {},
            {},
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
          
          <Datacolumn field="sub_type" header="Item Sub Type" type="text" />
          <Datacolumn field="descr" header="Item Descr" type="text" />
          <Datacolumn field="model_no" header="Brand Name" type="text" />
          <Datacolumn field="model_no" header="Model" type="text" />
          <Datacolumn field="qty" header="Quantity" type="number" />
          <Datacolumn field="qty" header="UOM" type="number" />
          <Datacolumn field="netamt" header="Amount" type="currency" defaultValue={0} />
        </ListLayout>
        {/* <div className="col-12" style={{ fontSize: 20, marginTop : 20 }}>
          <strong>Declaration</strong>
          <div>We declare that this invoice the actual price of the goods</div>
          <div>described and that all particulars are true and correct</div>
        </div> */}
        {/* <div className="flex col-12">
          <div className="col-7" style={{ fontSize: 20 }}>
            <strong>TERMS AND CONDITIONS</strong>
            <div>1. Goods once sold cannot be returned</div>
            <div>2. Interest of 24% will be charged if bill is not settled in 15 days</div>
          </div>
          <div className="col-5" style={{ fontSize: 20 }}>
            <strong>Company's Bank Details</strong>
            <div>Bank Details : Axis Bank</div>
            <div>Acc No       : 047283649264</div>
            <div>Branch       : T.Nagar, Chennai</div>
          </div>
        </div> */}
      </Dialog>
    </>
  )
}
