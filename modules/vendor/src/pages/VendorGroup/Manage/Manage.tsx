import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { ManageLayout, FormField, useToast } from '@igblsln/control';
import { useAddVendorGroupMutation, useGetVendorGroupQuery, useUpdateVendorGroupMutation } from '../vendorGroupApi';
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

  const { data, isLoading } = useGetVendorGroupQuery(id, {
    skip: isNew
  })
  const [addVendorGroup, { isLoading: isAdding }] = useAddVendorGroupMutation()
  const [updateVendorGroup, { isLoading: isUpdating }] = useUpdateVendorGroupMutation();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (isNew) {
        resp = await addVendorGroup({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateVendorGroup({ ...values, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate("/vendor/vendorgroup")
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-8'>
      {/* <FormField
        label="Group Code"
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
        label="Group Description"
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
      <ManageLayout baseRoute="/vendor/vendorgroup" description="Material Vendor Group" id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage