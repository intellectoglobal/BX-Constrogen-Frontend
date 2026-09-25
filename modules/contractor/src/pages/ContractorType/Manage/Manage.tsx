import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { ManageLayout, FormField, useToast } from '@igblsln/control';
import { useAddContractorTypeMutation, useGetContractorTypeQuery, useUpdateContractorTypeMutation } from '../contractorTypeApi';
import { AFTER_API_TIME, getClientProps } from '@igblsln/store'
import { useDispatch } from 'react-redux';
import { setPromptNavigate } from '@igblsln/store'

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast()
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const dispatch = useDispatch();

  const clientProps = getClientProps();

  const { data, isLoading } = useGetContractorTypeQuery(id, {
    skip: isNew
  })
  const [addContractorType, { isLoading: isAdding }] = useAddContractorTypeMutation()
  const [updateContractorType, { isLoading: isUpdating }] = useUpdateContractorTypeMutation();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (isNew) {
        resp = await addContractorType({ ...values, ...clientProps, contractor : "Y" }).unwrap();
      } else {
        resp = await updateContractorType({ ...values, ...clientProps, contractor : "Y" }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false }))
      setTimeout(() => {
        navigate("/contract/contractortype")
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
        label="Contractor Type Description"
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
      <ManageLayout baseRoute="/contract/contractortype" description="Contractor Type" id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage