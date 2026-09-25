import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { Checkbox } from 'primereact/checkbox';
import { ManageLayout, useToast, FormField } from '@igblsln/control';
import { useGetContractorQuery, useGetStatesQuery, useGetCitiesQuery, useAddContractorMutation, useUpdateContractorMutation } from '../apis';
import { AFTER_API_TIME, getClientProps, useGetAllContractorTypeQuery } from '@igblsln/store'
import { useDispatch } from 'react-redux';
import { setPromptNavigate } from '@igblsln/store';

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

  const { data, isLoading } = useGetContractorQuery(id, {
    skip: isNew
  })

  const navigate = useNavigate();

  const { data: contractorTypes } = useGetAllContractorTypeQuery(undefined, { refetchOnMountOrArgChange: true })
  const { data: states } = useGetStatesQuery()
  const { data: cities } = useGetCitiesQuery(selectedState)

  const [updateContractor, { isLoading: isUpdating }] = useUpdateContractorMutation()
  const [addContractor, { isLoading: isAdding }] = useAddContractorMutation()

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let body = {
        ...values,
        pincode : values?.pincode || null,
      }
      console.log(body)
      if (isNew) {
        resp = await addContractor({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateContractor({ ...body, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false }))
      setTimeout(() => {
        navigate("/contract/contractor")
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
            label="Contractor Code"
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
            label="Contractor Name"
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
            // rules={{
            //   validate: (value: any) => {
            //     if (value) {
            //       let valid = value.match(/\d/g).length === 6;
            //       console.log(valid)
            //       if (valid)
            //         return true
            //       else
            //         return "Enter Valid PIN Code"
            //     }

            //   }
            // }}
            leftSpan={3}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 6,
                type: 'number'
              }
            }} />

          <FormField
            label="Contractor Type"
            name="contractortyp_key"
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
                options: contractorTypes
              }
            }} />

          {/* <FormField
            label="AP Term"
            required
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

          <FormField
            label="Phone No"
            name="phoneno"
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
                style: { width: '100%' }
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
            name="email_id"
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


          <div className="field" style={{ display: 'flex' }}>
            <label style={{ margin: 'auto 0px', paddingLeft: 0 }} htmlFor="inactive" className={classNames('col-3', { 'p-error': errors.inactive })}>InActive</label>
            <div style={{ margin: 'auto 0px' }}>
              <Controller defaultValue={"N"} name="inactive" control={control} render={({ field, fieldState }) => (
                <Checkbox checked={field.value} trueValue={"Y"} falseValue={"N"} id={field.name} {...field}></Checkbox>
              )} />
            </div>
          </div>

          <div className="field" style={{ display: 'flex' }}>
            <label style={{ margin: 'auto 0px', paddingLeft: 0 }} htmlFor="inhouse" className={classNames('col-3', { 'p-error': errors.inactive })}>In-House</label>
            <div style={{ margin: 'auto 0px' }}>
              <Controller defaultValue={"N"} name="inhouse" control={control} render={({ field, fieldState }) => (
                <Checkbox checked={field.value} trueValue={"Y"} falseValue={"N"} id={field.name} {...field}></Checkbox>
              )} />
            </div>
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
      <ManageLayout baseRoute="/contract/contractor" description="Contractor" id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage