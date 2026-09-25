import React, { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormGetValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { FormField, ManageLayout, getFormErrorMessage } from '@igblsln/control';
import { useAddCustomerMutation, useGetCitiesQuery, useGetCustomerQuery, useGetStatesQuery, useUpdateCustomerMutation } from '../customersApi';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps, setPromptNavigate, useAppDispatch } from '@igblsln/store'

type Props = {}

const Manage = (props: Props) => {
  const toast = useRef<Toast>(null);
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const [selectedState, setSelectedState] = useState<any>('')
  const dispatch = useAppDispatch()

  const clientProps = getClientProps();

  const { data, isLoading } = useGetCustomerQuery(id, {
    skip: isNew
  })

  const { data: states } = useGetStatesQuery()
  const { data: cities } = useGetCitiesQuery(selectedState)

  const [addCustomer, { isLoading: isAdding }] = useAddCustomerMutation()
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  const showSuccess = (title: string, msg: string) => {
    toast?.current?.show({ severity: 'success', summary: title, detail: msg, life: 3000 });
  }

  const showError = (title: string, msg: string) => {
    toast?.current?.show({ severity: 'error', summary: title, detail: msg, life: 3000 });
  }

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (isNew) {
        resp = await addCustomer({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateCustomer({ ...values, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      dispatch(setPromptNavigate({promptNavigate: false}))
      setShowingToast(true);
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const customCityOption = [
    {
      label: 'Add',
      items: cities || []
    }
  ]

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: UseFormGetValues<any>) => {
    return (<div className='pl-8'>

      <FormField
        label="Customer Name"
        name="name"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100
          }
        }} />

      <FormField
        label="Age"
        name="age"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 20,
            type: "number"
          }
        }} />

      <FormField
        label="Sex"
        name="sex"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: Dropdown,
          componentProps: {
            options: ["Male", "Female", "Others"]
          }
        }} />


      <FormField
        label="PAN Number"
        name="pan_no"
        control={control}
        errors={errors}
        required
        rules={{
          validate: (value: any) => {
            if (value) {
              const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
              let valid = panRegex.test(value);
              if (valid)
                return true
              else
                return "Enter Valid PAN No"
            }
          }
        }}
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 20
          }
        }} />

      <FormField
        label="GST Number"
        name="gst_no"
        control={control}
        errors={errors}
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 20
          }
        }} />

      <FormField
        label="Aadhaar Number"
        name="aadhaar_no"
        control={control}
        errors={errors}
        required
        rules={{
          validate: (value: any) => {
            if (value) {
              const aadhaarRegex = /^\d{12}$/;
              let valid = aadhaarRegex.test(value);
              if (valid)
                return true
              else
                return "Enter Valid Aadhaar No"
            }
          }
        }}
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            type: "number"
          }
        }} />

      <FormField
        label="Address Line 1"
        name="addr1"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100
          }
        }} />

      <FormField
        label="Address Line 2"
        name="addr2"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100
          }
        }} />

      <FormField
        label="State"
        name="state_key"
        control={control}
        errors={errors}
        required
        leftSpan={2}
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

      {/* <FormField
        label="City"
        name="city_key"
        control={control}
        errors={errors}
        required
        leftSpan={2}
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
        }} /> */}

      <FormField
        label="City"
        name="city_key"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear: true,
            optionGroupTemplate:
              <div
                style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: '#e6e1e1', color: 'black', lineHeight: 2.5 }}
                onClick={() => navigate('/projects/city', {
                  state: {
                    url: isNew ? "/sales/customers/new" : `/sales/customers/${data?.key}/edit`,
                    data: getValues()
                  }
                })
                }
              >
                -- Create And Edit --
              </div>
            ,
            optionLabel: "name",
            optionValue: "key",
            filter: true,
            filterBy: "name",
            optionGroupLabel: "label",
            optionGroupChildren: "items",
            options: customCityOption
          }
        }} />

      <FormField
        label="Phone No"
        name="contact_no"
        control={control}
        errors={errors}
        required
        rules={{
          validate: (value: any) => {
            if (value) {
              const regex = /^\d{10}$/;
              let valid = regex.test(value);
              if (valid)
                return true
              else
                return "Enter Valid Phone No"
            }

          }
        }}
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 10,
            type: 'number'
          }
        }} />

      <FormField
        label="Email ID"
        name="email_id"
        control={control}
        errors={errors}
        // required
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            type: 'email'
          }
        }} />

      {/* <div className="field">
        <label style={{ margin: 'auto' }} htmlFor="inactive" className={classNames('col-2', { 'p-error': errors.inactive })}>Inactive</label>
        <Controller defaultValue={"N"} name="inactive" control={control} render={({ field, fieldState }) => (
          <Checkbox checked={field.value} trueValue={"Y"} falseValue={"N"} id={field.name} {...field}></Checkbox>
        )} />
      </div> */}
    </div>)
  }

  return (
    <>
      <Toast ref={toast} />
      <ManageLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage