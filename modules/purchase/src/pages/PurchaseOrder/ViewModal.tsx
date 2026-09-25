import React from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import {
  ManageLayout,
  FormField,
} from '@igblsln/control';
import { useGetPurchaseOrderQuery } from './purchaseOrderApi';
import { Dialog } from 'primereact/dialog';
import ManageItem from './Manage/ManageItem';

type Props = {
  displayModal: boolean,
  poId: any;
  customDiscard: any,
}

export default function ViewModal({ displayModal, poId, customDiscard }: Props) {

  const { data, isFetching } = useGetPurchaseOrderQuery(poId, {
    refetchOnMountOrArgChange: true
  })

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>

      <FormField label="Vendor Name" name="vend_key" className="col-12 md:col-6" control={control} errors={errors}
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            value: data?.vendor?.name
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

      <FormField label="Item Type" name="item_key" className="col-12 md:col-6" control={control} errors={errors}
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            value: data?.item_type
          }
        }} />


      <div className="col-12 md:col-6"></div>
      <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
        <ManageItem
          selectedVendor={null}
          data={data?.purchs_odr_items || []}
          isLoading={isFetching}
          disableTable
          onChange={() => { }}
        />
      </div>

      {/* <FormField label="Transport (₹)" name="transport_chrgs"
        className="col-12 md:col-4"
        control={control} errors={errors}
        leftSpan={4}
        rightSpan={8}
        useExplicit
        defaultValue={0}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 50,
            type: 'number'
          }
        }}
      />

      <FormField label="Load/UnLoad (₹)" name="handling_chrgs"
        className="col-12 md:col-4"
        control={control} errors={errors}
        leftSpan={5}
        rightSpan={7}
        useExplicit
        defaultValue={0}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 50,
            type: 'number'
          }
        }}
      />

      <FormField label="Discount (₹)" name="discountamt"
        className="col-12 md:col-4"
        control={control} errors={errors}
        leftSpan={4}
        rightSpan={8}
        useExplicit
        defaultValue={0}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 50,
            type: 'number'
          }
        }}
      />

      <FormField label="Round Off"
        name="rounded_action"
        control={control} errors={errors}
        className="col-12 md:col-4"
        leftSpan={4}
        rightSpan={8}
        useExplicit
        formItem={{
          component: Dropdown,
          componentProps: {
            options: [
              {
                name: "Increment",
                value: "A"
              },
              {
                name: "Decrement",
                value: "S"
              },
              {
                name: "None",
                value: null
              },
            ],
            optionLabel: "name",
            optionValue: "value",
          }
        }} />

      <FormField label="Rounded Value (₹)" name="roundedamt"
        className="col-12 md:col-4"
        control={control} errors={errors}
        leftSpan={6}
        rightSpan={6}
        useExplicit
        defaultValue={0}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 50,
            type: 'number',
          }
        }}
      /> */}

      <FormField label="Net Amt (₹)" name="netamt"
        className="col-12 md:col-6"
        control={control} errors={errors}
        // required
        leftSpan={4}
        rightSpan={8}
        defaultValue={0}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 50,
          }
        }}
      />


    </div>)
  }


  return (
    <>
      <Dialog
        header={<div>Purchase Order No - {data?.number}</div>}
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
