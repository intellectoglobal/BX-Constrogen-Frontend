import React, { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ManageLayout, FormField } from '@igblsln/control';
import { useAddCostCodeMutation, useGetCostCodeQuery, useUpdateCostCodeMutation } from '../costCodeApi';
import { useListCostCategoryQuery } from '../../CostCategories/costCategoryApi';
import { AFTER_API_TIME, getClientProps } from '@igblsln/store'

type Props = {}

const Manage = (props: Props) => {
  const toast = useRef<Toast>(null);
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;

  const clientProps = getClientProps();

  const { data, isLoading } = useGetCostCodeQuery(id, {
    skip: isNew
  })
  const [addCostCode, { isLoading: isAdding }] = useAddCostCodeMutation()
  const [updateCostCode, { isLoading: isUpdating }] = useUpdateCostCodeMutation();
  const { data: costCategories } = useListCostCategoryQuery({})

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
        resp = await addCostCode({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateCostCode({ ...values, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate("/projects/costcode")
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-8'>
      {/* <FormField
        label="Code"
        name="id"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={3}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 25,
            disabled: !isNew,
          }
        }} /> */}

      <FormField
        label="Description"
        name="descr"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={5}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100
          }
        }} />
        
      <FormField
        label="Cost Category"
        name="costctg_key"
        control={control}
        errors={errors}
        required
        leftSpan={4}
        rightSpan={4}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear : true,
            optionLabel: "descr",
            optionValue: "key",
            filter: true,
            filterBy: "descr",
            options: costCategories?.results
          }
        }} />
    </div>)
  }

  return (
    <>
      <Toast ref={toast} />
      <ManageLayout baseRoute="/projects/costcode" description="Cost Code" id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage