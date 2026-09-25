import React from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import {
  ManageLayout,
  FormField,
  Datacolumn,
  ListLayout
} from '@igblsln/control';
import { Dialog } from 'primereact/dialog';

type Props = {
  displayModal: boolean,
  data: any;
  customDiscard: any,
}

export default function ViewModal({ displayModal, data, customDiscard }: Props) {

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>

      <FormField label="Receipt ID" name="receipt_number" className="col-12 md:col-4" control={control} errors={errors}
        leftSpan={4}
        rightSpan={8}
        formItem={{
          component: InputText,
          componentProps: {
            // useGrouping: false,
            disabled: true,
            // value: data?.number || docData?.next_doc_id
          }
        }} />


      <FormField label="Date"
        name="date"
        className="col-12 md:col-4"
        control={control}
        errors={errors}
        leftSpan={4}
        rightSpan={8}
        formItem={{
          component: InputText,
          componentProps: {
            disabled: true,
          }
        }} />


      <FormField label="Customer Name"
        name="customer_name"
        className="col-12 md:col-4"
        control={control}
        errors={errors}
        leftSpan={4}
        rightSpan={8}
        formItem={{
          component: InputText,
          componentProps: {
            disabled: true,
          }
        }} />

      <FormField label="Amount"
        name="amount"
        className="col-12 md:col-4"
        control={control}
        errors={errors}
        leftSpan={4}
        rightSpan={8}
        formItem={{
          component: InputText,
          componentProps: {
            disabled: true,
          }
        }} />

      <FormField label="Mode Of Payment"
        name="payment_mode"
        className="col-12 md:col-4"
        control={control}
        errors={errors}
        leftSpan={4}
        rightSpan={8}
        formItem={{
          component: InputText,
          componentProps: {
            disabled: true,
          }
        }} />

      <FormField label="Transaction Detail"
        name="transaction_detail"
        className="col-12 md:col-4"
        control={control}
        errors={errors}
        leftSpan={4}
        rightSpan={8}
        formItem={{
          component: InputText,
          componentProps: {
            disabled: true,
          }
        }} />

      <FormField label="Account Name"
        name="account_name"
        className="col-12 md:col-4"
        control={control}
        errors={errors}
        leftSpan={4}
        rightSpan={8}
        formItem={{
          component: InputText,
          componentProps: {
            disabled: true,
          }
        }} />

      <FormField label="Source of Fund"
        name="source_of_fund_name"
        className="col-12 md:col-4"
        control={control}
        errors={errors}
        leftSpan={4}
        rightSpan={8}
        formItem={{
          component: InputText,
          componentProps: {
            disabled: true,
          }
        }} />

      <FormField label="Notes"
        name="notes"
        className="col-12 md:col-4"
        control={control}
        errors={errors}
        leftSpan={4}
        rightSpan={8}
        formItem={{
          component: InputText,
          componentProps: {
            disabled: true,
          }
        }} />


    </div>)
  }


  return (
    <>
      <Dialog
        header={`View Receipt`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        closeOnEscape
        draggable={false} resizable={false} closable
      >
        <ManageLayout
          baseRoute="/payment/vendorpayment"
          viewMode
          bottomControl
          data={data}
          hideHeader
          customDiscard={customDiscard}
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
