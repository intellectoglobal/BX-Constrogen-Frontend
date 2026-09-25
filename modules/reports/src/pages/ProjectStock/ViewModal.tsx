import React from 'react'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import {
  ManageLayout,
  ListLayout,
  Datacolumn,
} from '@igblsln/control';
import {
  ViewModalBorderRadius
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';
import { Link, useNavigate } from 'react-router-dom';

type Props = {
  displayModal: boolean,
  data: any;
  customDiscard: any,
  filters?:any
}

export default function ViewModal({ displayModal, data, customDiscard, filters }: Props) {

  // const { data, isLoading } = useGetStockInfoQuery(id, {
  //   refetchOnMountOrArgChange: true
  // })

  const navigate = useNavigate()

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>

      {/* <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>

        <FormField label="Date" name="vendor_voucher_dt" className="col-12 md:col-4" useExplicit control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
            }
          }} />

      </div> */}

      <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>


        <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
          <ListLayout description=""
            data={data?.invoices || []}
            newTable
            showHeader
            hideAddButton
            hideActionColumn
            tableLayoutClass='h-full'
            allowFilters={false}
            >
            <Datacolumn field="date" header="Date" type="text" />
            <Datacolumn field="invoice_no" header="Invoice No" type="text" />
            <Datacolumn field="quantity" header="Quantity" type="text" />
            <Datacolumn field="uom" header="UOM" type="text" />
            <Datacolumn
              width={"15%"}
              field="load"
              header="Load"
              type="custom"
              displayValueGetter={(row: any) =>
                <Button
                  style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                  onClick={() => {
                    navigate('/purchase/vendorinvoice',{state : {
                      invoiceKey : row?.invoice_key,
                      method : 'Direct',
                      redirect : '/projects/stock',
                      filters : filters
                    }})
                  }}
                >
                  Load
                </Button>
              }
            />
          </ListLayout>
        </div>
      </div>

    </div>)
  }

  return (
    <>
      <Dialog
         header={`${data?.item_name}${data?.brand ? ` - ${data?.brand}` : ''}`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        draggable={false} resizable={false} closable
      >
        <ManageLayout
          baseRoute="/payment/vendorpayment"
          // id={id}
          bottomControl
          data={data}
          hideHeader
          viewMode
          onSubmit={() => { }}
          renderForm={renderForm}
        />
        <Button
          style={{
            margin: 'auto',
            marginTop: 10,
            display: 'flex',
            width: 150
          }}
          label="Close"
          onClick={() => customDiscard()}
        />
      </Dialog>
    </>
  )
}
