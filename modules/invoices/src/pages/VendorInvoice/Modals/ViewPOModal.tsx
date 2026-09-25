//@ts-nocheck
import React from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import {
  ManageLayout,
  FormField,
} from '@igblsln/control';
import { useGetInvoiceQuery } from '../api';
import { Dialog } from 'primereact/dialog';

type Props = {
  displayModal: boolean,
  poId: any;
  customDiscard: any,
}

export default function ViewPOModal({ displayModal, poId, customDiscard }: Props) {

  const { data, isFetching } = useGetInvoiceQuery(poId, {
    refetchOnMountOrArgChange: true
  })

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>

      <FormField label="PO Number" name="number" className="col-12 md:col-6" control={control} errors={errors}
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            useGrouping: false,
            value: data?.number
          }
        }} />

      <FormField label="PO Date" name="date" className="col-12 md:col-6" useExplicit control={control} errors={errors}
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            value: data?.date
          }
        }} />

      <FormField label="Project" name="proj_key" className="col-12 md:col-6" control={control} errors={errors}
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            value: data?.project?.name
          }
        }} />

      <FormField label="Vendor" name="vend_key" className="col-12 md:col-6" control={control} errors={errors}
        required={"Select a Vendor"}
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            value: data?.vendor?.name
          }
        }} />

      <FormField label="Item Type"
        name="itemtyp_key"
        control={control} errors={errors}
        className="col-12 md:col-6"
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            value: data?.itemtype?.descr
          }
        }} />


      <FormField label="Description" name="descr" className="col-12 md:col-6" control={control} errors={errors}
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            value: data?.delivnotes
          }
        }}
      />

      <div className="col-12 md:col-6"></div>


    </div>)
  }


  return (
    <>
      <Dialog
        header={`View PO`}
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
          id={poId}
          bottomControl
          data={data}
          hideHeader
          customDiscard={customDiscard}
          isLoading={isFetching}
          onSubmit={() => { }}
          renderForm={renderForm}
        />
      </Dialog>
    </>
  )
}
