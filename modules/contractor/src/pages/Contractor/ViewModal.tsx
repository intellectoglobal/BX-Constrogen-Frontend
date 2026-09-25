import React, { useEffect, useState } from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import {
  ManageLayout,
  FormField,
} from '@igblsln/control';
import { useGetContractorQuery } from './apis';
import { Dialog } from 'primereact/dialog';
import { useGetAllItemTypesQuery, useGetAllContractorTypeQuery, ViewModalBorderRadius } from '@igblsln/store';

type Props = {
  displayModal: boolean,
  contractorId: any;
  customDiscard: any,
}

export default function ViewModal({ displayModal, contractorId, customDiscard }: Props) {

  const { data, isFetching } = useGetContractorQuery(contractorId, {
    refetchOnMountOrArgChange: true
  })



  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className='pl-4 pt-4 grid p-fluid h-full'>
        <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>

          <FormField
            label="Contractor Name"
            className="col-12 md:col-6"
            name="name"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100
              }
            }} />

          <FormField
            label="Contractor Type"
            className="col-12 md:col-6"
            name="contractor_type"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100
              }
            }} />


          <FormField
            label="State"
            className="col-12 md:col-6"
            name="state"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: InputText,
              componentProps: {

              }
            }} />

          <FormField
            label="City"
            className="col-12 md:col-6"
            name="city"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: InputText,
              componentProps: {

              }
            }} />
        </div>

        <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>

          <FormField
            label="Address Line 1"
            name="addr1"
            className="col-12"
            control={control}
            errors={errors}
            leftSpan={3}
            rightSpan={6}
            formItem={{
              component: InputTextarea,
              componentProps: {
                maxLength: 100,
              }
            }} />

          <FormField
            label="Address Line 2"
            name="addr2"
            className="col-12"
            control={control}
            errors={errors}
            leftSpan={3}
            rightSpan={6}
            formItem={{
              component: InputTextarea,
              componentProps: {
                maxLength: 100,
              }
            }} />

          <FormField
            label="GST Number"
            name="gstnumber"
            className="col-12 md:col-6"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 20
              }
            }} />

          <FormField
            label="Phone No"
            name="phoneno"
            className="col-12 md:col-6"
            rules={{
              validate: (value: any) => {
                if (value) {
                  let valid = value.match(/\d/g).length === 10;
                  if (valid)
                    return true
                  else
                    return "Enter Valid Phone Number"
                }
              }
            }}
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100,
                style: { width: '100%' },
                type: 'number'
              }
            }} />

          <FormField
            label="Landline"
            name="landline_no"
            className="col-12 md:col-6"
            rules={{
              validate: (value: any) => {
                if (value) {
                  let valid = /((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/.test(value);
                  if (valid)
                    return true
                  else
                    return "Enter Valid Landline Number"
                }
              }
            }}
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100,
                style: { width: '100%' },
                type: 'number'
              }
            }} />

          <FormField
            label="Email ID"
            name="email_id"
            className="col-12 md:col-6"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100,
                style: { width: '100%' }
              }
            }} />

        </div>
      </div>
    )
  }


  return (
    <>
      <Dialog
        header={`View Contractor`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        closeOnEscape
        draggable={false} resizable={false} closable
      >
        <ManageLayout
          baseRoute=""
          viewMode
          id={contractorId}
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
