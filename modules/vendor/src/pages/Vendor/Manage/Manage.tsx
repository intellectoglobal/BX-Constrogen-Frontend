import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { ManageLayout, useToast, FormField } from '@igblsln/control';
import { useGetVendorQuery, useGetStatesQuery, useGetCitiesQuery, useAddVendorMutation, useUpdateVendorMutation } from '../apis';
import { AFTER_API_TIME, getClientProps, setPromptNavigate, useGetAllItemTypesQuery, useGetAllVendorTypeQuery } from '@igblsln/store'
import { useDispatch } from 'react-redux';

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast()
  const [showingToast, setShowingToast] = useState(false)
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const [selectedState, setSelectedState] = useState<any>('')
  const dispatch = useDispatch();

  const clientProps = getClientProps();

  const { data, isLoading } = useGetVendorQuery(id, {
    skip: isNew
  })

  const navigate = useNavigate();

  const { data: vendorTypes } = useGetAllVendorTypeQuery()
  const { data: states } = useGetStatesQuery()
  const { data: cities } = useGetCitiesQuery(selectedState)
  const { data: itemTypes, isFetching: itemTypeFetching } = useGetAllItemTypesQuery()

  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation()
  const [addVendor, { isLoading: isAdding }] = useAddVendorMutation()

  const [selectedItemTypes, setSelectedItemTypes] = useState<any[] | undefined>([]);

  useEffect(() => {
    if (data && itemTypes) {
      let temp1 = data?.itemtypes?.map((d: any) => parseInt(d?.item_type_key))
      let temp2 = itemTypes?.filter(d => temp1.includes(d.key))
      setSelectedItemTypes(temp2)
    }
  }, [data, itemTypes])

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let body = {
        ...values,
        pincode : values?.pincode || null,
        itemtypes: selectedItemTypes?.map(d => {
          return {
            item_type_key: d.key
          }
        })
      }
      // console.log(body)
      if (isNew) {
        resp = await addVendor({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateVendor({ ...body, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false}))
      setTimeout(() => {
        navigate("/vendor/vendor")
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className="flex">
        <div className='pl-8 col-10'>
          {/* <FormField
            label="Material Vendor Code"
            name="id"
            control={control}
            errors={errors}
            required
            leftSpan={3}
            rightSpan={3}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 25,
                disabled: !isNew,
              }
            }} /> */}

          <FormField
            label="Material Vendor Name"
            name="name"
            control={control}
            errors={errors}
            required
            leftSpan={3}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100
              }
            }} />

          <FormField
            label="Address Line 1"
            name="addr1"
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
            label="State"
            name="state_key"
            control={control}
            errors={errors}
            // required
            leftSpan={3}
            rightSpan={4}
            useExplicit
            onChange={(e: any) => {
              setSelectedState(e.value)
            }}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionLabel: "name",
                optionValue: "key",
                filter: true,
                filterBy: "name",
                options: states
              }
            }} />

          <FormField
            label="City"
            name="city_key"
            control={control}
            errors={errors}
            // required
            leftSpan={3}
            rightSpan={4}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionLabel: "name",
                optionValue: "key",
                filter: true,
                filterBy: "name",
                options: cities
              }
            }} />

          <FormField
            label="Pin Code"
            name="pincode"
            control={control}
            errors={errors}
            // required
            rules={{
              validate: (value: any) => {
                if (value) {
                  let valid = value?.toString()?.match(/\d/g).length === 6;
                  if (valid)
                    return true
                  else
                    return "Enter Valid PIN Code"
                }

              }
            }}
            leftSpan={3}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 6,
                type: 'number'
              }
            }} />

          {/* <FormField
            label="Material Vendor Type"
            name="vendtyp_key"
            control={control}
            errors={errors}
            required
            leftSpan={3}
            rightSpan={5}
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

          {/* <FormField
            label="AP Term"
            // required
            name="apterm_key"
            control={control}
            errors={errors}
            leftSpan={3}
            rightSpan={4}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionLabel: "descr",
                optionValue: "key",
                filter: true,
                filterBy: "descr",
                options: apTerms
              }
            }} /> */}

          {/* <FormField
            label="Mode Of Payment"
            name="modeofpay"
            control={control}
            errors={errors}
            leftSpan={3}
            rightSpan={4}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionLabel: "descr",
                optionValue: "modeofpay",
                options: modeOfPayments
              }
            }} /> */}


          <FormField
            label="GST Number"
            name="gstnumber"
            control={control}
            errors={errors}
            // required
            leftSpan={3}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 20
              }
            }} />

          <FormField
            label="PAN Number"
            name="pan_no"
            control={control}
            errors={errors}
            // required
            leftSpan={3}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 20
              }
            }} />

          <FormField label="Item Type"
            name="itemtype_keys"
            control={control} errors={errors}
            isLoading={itemTypeFetching}
            required
            useExplicit
            onChange={(e: any) => {
              setSelectedItemTypes(e.target.value)
            }}
            leftSpan={3}
            rightSpan={5}
            formItem={{
              component: MultiSelect,
              componentProps: {
                value: selectedItemTypes,
                optionLabel: "descr",
                // onChange: (e: any) => setSelectedItemTypes(e.value),
                options: itemTypes,
                display: "chip",
                disabled: isAdding || isUpdating,
                placeholder: "Select Item Types",
                className: "w-full md:w-20rem"
              }
            }}
          />

          {/* <div className="flex">
            <div className="field grid grid-nogutter p-fluid col-9" style={{ paddingLeft: 0, width :'46%', marginBottom : 0 }}>
              <FormField
                label="Phone No and Email ID"
                name="contactphoneno"
                rules={{
                  validate: (value: any) => {
                    let valid = value.match(/\d/g).length === 10;
                    if (valid)
                      return true
                    else
                      return "Enter Valid Phone Number"
                  }
                }}
                control={control}
                errors={errors}
                leftSpan={7}
                rightSpan={5}
                formItem={{
                  component: InputText,
                  componentProps: {
                    maxLength: 100,
                    style: { width: '100%' }
                  }
                }} />

            </div>
            <div className="field col-5" style={{ marginBottom: 0 }}>
              <div className="input-field">
                <Controller name="contactname" control={control} rules={{ required: 'Email ID required.' }} render={({ field, fieldState }) => (
                  <InputText style={{ width: '100%' }} id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.invalid })} />
                )} />
                {getFormErrorMessage(errors?.base_qty?.message)}
              </div>
            </div>
          </div> */}

          <FormField
            label="Phone No"
            name="contactphoneno"
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
            leftSpan={3}
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
            label="Landline No"
            name="landline_no"
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
            leftSpan={3}
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
            rules={{
              validate: (value: any) => {
                if (value) {
                  let valid = value.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                  if (valid)
                    return true
                  else
                    return "Enter Valid Email ID"
                }
              }
            }}
            control={control}
            errors={errors}
            leftSpan={3}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100,
                style: { width: '100%' }
              }
            }} />

          <div className="field">
            <label style={{ margin: 'auto', paddingLeft: 0 }} htmlFor="inactive" className={classNames('col-3', { 'p-error': errors.inactive })}>Inactive</label>
            <Controller defaultValue={"N"} name="inactive" control={control} render={({ field, fieldState }) => (
              <Checkbox checked={field.value} trueValue={"Y"} falseValue={"N"} id={field.name} {...field}></Checkbox>
            )} />
          </div>
        </div>
        {/* <div className="col-2" style={{ marginTop: 25 }}>
          <div>
            <Button label='Contact' onClick={(e) => e.preventDefault()} className='project-page-tags' style={{ width: '100%' }} />
          </div>
        </div> */}
      </div>
    )
  }

  return (
    <>
      <ManageLayout baseRoute="/vendor/vendor" description="Material Vendor" id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage