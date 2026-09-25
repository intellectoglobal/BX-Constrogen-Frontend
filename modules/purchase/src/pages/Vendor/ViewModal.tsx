import React, { useEffect, useState } from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import {
  ManageLayout,
  FormField,
  Datacolumn,
  ListLayout
} from '@igblsln/control';
import { useGetVendorQuery } from './apis';
import { Dialog } from 'primereact/dialog';
import { ViewModalBorderRadius, useGetAllItemTypesQuery, useGetAllVendorTypeQuery } from '@igblsln/store';

type Props = {
  displayModal: boolean,
  vendorId: any;
  customDiscard: any,
}

export default function ViewModal({ displayModal, vendorId, customDiscard }: Props) {

  const { data, isFetching } = useGetVendorQuery(vendorId, {
    refetchOnMountOrArgChange: true
  })

  const { data: vendorTypes } = useGetAllVendorTypeQuery()
  const { data: itemTypes, isFetching: itemTypeFetching } = useGetAllItemTypesQuery()
  const [selectedItemTypes, setSelectedItemTypes] = useState<any[] | undefined>([]);


  useEffect(() => {
    if (data && itemTypes) {
      let temp1 = data?.itemtypes?.map((d: any) => parseInt(d?.item_type_key))
      let temp2 = itemTypes?.filter(d => temp1.includes(d.key))
      setSelectedItemTypes(temp2)
    }
  }, [data, itemTypes])

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className='pl-4 pt-4 grid p-fluid h-full'>
        <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>

          <FormField
            label="Material Vendor Name"
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

          {/* <FormField
            label="Material Vendor Type"
            name="vendtyp_key"
            className="col-12 md:col-6"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionLabel: "descr",
                optionValue: "key",
                filter: true,
                filterBy: "descr",
                options: vendorTypes
              }
            }} /> */}

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
            className="col-12 md:col-6 m-auto"
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

          <FormField label="Item Type"
            name="itemtype_keys"
            className="col-12 md:col-6"
            control={control} errors={errors}
            isLoading={itemTypeFetching}
            useExplicit
            leftSpan={3}
            rightSpan={4}
            formItem={{
              component: MultiSelect,
              componentProps: {
                value: selectedItemTypes,
                optionLabel: "descr",
                // onChange: (e: any) => setSelectedItemTypes(e.value),
                options: itemTypes,
                display: "chip",
                placeholder: "Select Item Types",
                className: "w-full md:w-20rem"
              }
            }}
          />

          <FormField
            label="Phone No"
            name="contactphoneno"
            className="col-12 md:col-4"
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
            className="col-12 md:col-4"
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
            name="contactname"
            className="col-12 md:col-4"
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
        header={`View Material Vendor`}
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
          id={vendorId}
          bottomControl
          data={data}
          hideHeader
          disableInput
          customDiscard={customDiscard}
          isLoading={isFetching}
          onSubmit={() => { }}
          renderForm={renderForm}
        />
      </Dialog>
    </>
  )
}
