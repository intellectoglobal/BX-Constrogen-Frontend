import React, { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { ManageLayout, useToast, FormField } from '@igblsln/control';
import { useGetCustomerPurchaseQuery, useAddCustomerPurchaseMutation, useUpdateCustomerPurchaseMutation } from '../apis';
import { AFTER_API_TIME,  getClientProps, setPromptNavigate, useActiveCustomersQuery, useActiveProjectQuery, useAppDispatch, useGetActivePurposesQuery } from '@igblsln/store'

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast()
  const [showingToast, setShowingToast] = useState(false)
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;

  const clientProps = getClientProps();
  const { data: projects } = useActiveProjectQuery()
  const { data: customers } = useActiveCustomersQuery()
  const { data: purposes, isFetching: purposeFetching } = useGetActivePurposesQuery()
  const dispatch = useAppDispatch()

  const { data, isLoading } = useGetCustomerPurchaseQuery(id, {
    skip: isNew
  })

  const dataFromLocation: any = useLocation().state;

  const navigate = useNavigate();

  const [updateCustomerPurchase, { isLoading: isUpdating }] = useUpdateCustomerPurchaseMutation()
  const [addCustomerPurchase, { isLoading: isAdding }] = useAddCustomerPurchaseMutation()

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let body = {
        ...values,
      }
      console.log(body)
      if (isNew) {
        resp = await addCustomerPurchase({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateCustomerPurchase({ ...body, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({promptNavigate: false}));
      setTimeout(() => {
        navigate("/purchase/customerpurchase")
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }


  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className="flex">
        <div className='pl-8 col-10'>

          <FormField label="Project" name="project_key"
            className="col-12 md:col-6" control={control} errors={errors}
            required
            leftSpan={4}
            rightSpan={8}
            formItem={{
              component: Dropdown,
              componentProps: {
                options: projects,
                // disabled: true,
                optionLabel: 'name',
                optionValue: 'key'
              }
            }}
          />

          <FormField label="Customer" name="customer_key" className="col-12 md:col-6" control={control} errors={errors}
            required
            leftSpan={4}
            rightSpan={8}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionLabel: "name",
                optionValue: "key",
                filter: true,
                filterBy: "name",
                options: customers
              }
            }} />

          <FormField label="Purpose" name="purpose_key" className="col-12 md:col-6" control={control} errors={errors}
            isLoading={purposeFetching}
            leftSpan={4}
            rightSpan={8}
            formItem={{
              component: Dropdown,
              componentProps: {
                //showClear : true,
                optionLabel: "name",
                optionValue: "key",
                filter: true,
                filterBy: "name",
                options: purposes,
                // options: [],
              }
            }} />

          <FormField
            label="Item Description"
            name="item_descr"
            control={control}
            errors={errors}
            required
            className="col-12 md:col-6"
            leftSpan={4}
            rightSpan={8}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100
              }
            }} />

          <FormField
            label="Vendor"
            name="vendor"
            control={control}
            errors={errors}
            // required
            className="col-12 md:col-6"
            leftSpan={4}
            rightSpan={8}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100
              }
            }} />


          <FormField label="Amount" name="amount"
            required
            leftSpan={4}
            rightSpan={8}
            className="col-12 md:col-6"
            control={control} errors={errors} formItem={{
              component: InputText,
              componentProps: {
                maxLength: 25,
                type: 'number'
              }
            }} />

          <FormField label="Builder Budget" name="builder_budget"
            required
            leftSpan={4}
            rightSpan={8}
            className="col-12 md:col-6"
            control={control} errors={errors} formItem={{
              component: InputText,
              componentProps: {
                maxLength: 25,
                type: 'number'
              }
            }} />


          <FormField
            label="Notes"
            name="notes"
            control={control}
            errors={errors}
            // required
            className="col-12 md:col-6"
            leftSpan={4}
            rightSpan={8}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100
              }
            }} />

        </div>

      </div>
    )
  }

  return (
    <>
      <ManageLayout baseRoute="/purchase/customerpurchase" description="Customer Purchase" id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        // dataFromLocation={dataFromLocation}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage