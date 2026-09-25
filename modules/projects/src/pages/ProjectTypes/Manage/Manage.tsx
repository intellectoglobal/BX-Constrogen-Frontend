import React, { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { ManageLayout, FormField } from '@igblsln/control';
import { useAddProjectTypeMutation, useGetProjectTypeQuery, useUpdateProjectTypeMutation } from '../projectTypeApi';
import { AFTER_API_TIME, getClientProps } from '@igblsln/store'

type Props = {}

const Manage = (props: Props) => {
  const toast = useRef<Toast>(null);
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;

  const clientProps = getClientProps()

  const { data, isLoading } = useGetProjectTypeQuery(id, {
    skip: isNew
  })
  const [addProjectType, { isLoading: isAdding }] = useAddProjectTypeMutation()
  const [updateProjectType, { isLoading: isUpdating }] = useUpdateProjectTypeMutation();

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
        resp = await addProjectType({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateProjectType({ ...values }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate("/projects/projecttype")
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-8'>

      {/* <FormField
        label="Type Code"
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
        label="Project Type Description"
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

    </div>)
  }

  return (
    <>
      <Toast ref={toast} />
      <ManageLayout baseRoute="/projects/projecttype" description="Project Type" id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage