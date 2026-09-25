import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { ManageLayout, FormField, useToast } from '@igblsln/control';
import { useAddCustomerMutation, useGetCitiesQuery, useGetCustomerQuery, useGetStatesQuery, useUpdateCustomerMutation } from '../customersApi';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps } from '@igblsln/store'
import { useDispatch } from "react-redux";
import { setPromptNavigate } from '@igblsln/store';

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const [selectedState, setSelectedState] = useState<any>('')
  const dispatch = useDispatch();

  const clientProps = getClientProps();

  const { data, isLoading } = useGetCustomerQuery(id, {
    skip: isNew
  })

  const { data: states } = useGetStatesQuery()
  const { data: cities } = useGetCitiesQuery(selectedState)

  const [addCustomer, { isLoading: isAdding }] = useAddCustomerMutation()
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (isNew) {
        resp = await addCustomer({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateCustomer({ ...values, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false }))
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

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-8'>

          {/* <FormField
            label="Customer Code"
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
            label="Customer Name"
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
              component: InputText,
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
              component: InputText,
              componentProps: {
                maxLength: 100,
              }
            }} />

          <FormField
            label="State"
            name="state_key"
            control={control}
            errors={errors}
            required
            leftSpan={3}
            rightSpan={4}
            useExplicit
            onChange={(e: any) => {
              setSelectedState(e.value)
            }}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear : true,
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
            required
            leftSpan={3}
            rightSpan={4}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear : true,
                optionLabel: "name",
                optionValue: "key",
                filter: true,
                filterBy: "name",
                options: cities
              }
            }} />

    </div>)
  }

  return (
    <>
      <ManageLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage