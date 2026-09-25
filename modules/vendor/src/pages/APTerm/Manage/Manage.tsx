import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { ManageLayout, useToast, FormField } from '@igblsln/control';
import { useAddAPTermMutation, useGetAPTermQuery, useUpdateAPTermMutation } from '../apTermApi';
import { AFTER_API_TIME, getClientProps } from '@igblsln/store'

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast()
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;

  const clientProps = getClientProps();

  const { data, isLoading } = useGetAPTermQuery(id, {
    skip: isNew
  })
  const [addAPTerm, { isLoading: isAdding }] = useAddAPTermMutation()
  const [updateAPTerm, { isLoading: isUpdating }] = useUpdateAPTermMutation();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (isNew) {
        resp = await addAPTerm({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateAPTerm({ ...values, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate("/vendor/apterm")
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-8'>
      {/* <FormField
        label="Term Code"
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
        label="Term Description"
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
        label="Term Days"
        name="days"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={3}
        formItem={{
          component: InputText,
          componentProps: {
            type: 'number',
            max: 999
          }
        }} />
    </div>)
  }

  return (
    <>
      <ManageLayout baseRoute="/vendor/apterm" description="AP Term" id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage