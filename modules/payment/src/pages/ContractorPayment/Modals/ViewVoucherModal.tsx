import React from 'react'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import {
  ManageLayout,
  useToast,
  FormField,
  ListLayout,
  Datacolumn,
} from '@igblsln/control';
import { useGetContractorPaymentQuery } from '../contractorPaymentApi';
import {
  ViewModalBorderRadius
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';

type Props = {
  displayModal: boolean,
  id: any;
  customDiscard: any,
}

export default function ContractorPaymentModal({ displayModal, id, customDiscard }: Props) {

  const { data, isLoading } = useGetContractorPaymentQuery(id, {
    refetchOnMountOrArgChange: true
  })

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>

      <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>

        <FormField label="Date" name="contract_voucher_dt" className="col-12 md:col-6" useExplicit control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
            }
          }} />

        <FormField label="Account Name" name="acc_name" className="col-12 md:col-6" control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 50
            }
          }} />

        <FormField label="Payment Mode" name="payment_mode" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 50
            }
          }}
        />

        <FormField label="Transaction Detail" name="transaction_detail" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 50
            }
          }}
        />

        <FormField label="Amount" name="total_amount" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 50
            }
          }}
        />

        <FormField label="Notes" name="notes" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 255,
              disabled: true
            }
          }}
        />

      </div>

      <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>


        <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
          <h3 className={'m-0 my-auto'} >{"Invoice Detail"}</h3>
          <ListLayout description=""
            data={data?.contract_voucher_detail || []}
            newTable
            showHeader
            hideAddButton
            hideActionColumn
            tableLayoutClass='h-full'
            allowFilters={false}
            gridProps={{
              allowAdd: false,
            }}>
            <Datacolumn className='disabled' field="invoice_no" header="Invoice No" type="text" />
            <Datacolumn className='disabled' field="invoice_date" header="Invoice Date" type="text" />
            <Datacolumn className='disabled' field="project_name" header="Project Name" type="text" />
            <Datacolumn className='disabled' field="invoice_amount" header="Invoice Amount" type="currency" />
            <Datacolumn className='disabled' field="paid_amount" header="Paid Amount" type="currency" />
            <Datacolumn className='disabled' field="pending_amount" header="Pending Amount" type="currency" />
          </ListLayout>
        </div>
      </div>

    </div>)
  }

  return (
    <>
      <Dialog
        header={`View Voucher - ${data?.voucher_number || ''}`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        draggable={false} resizable={false} closable
      >
        <ManageLayout
          baseRoute="/payment/contractorpayment"
          id={id}
          bottomControl
          data={data}
          hideHeader
          viewMode
          isLoading={isLoading}
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
