import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { ManageLayout, useToast, FormField } from '@igblsln/control';
import { useAddUOMTypesMutation, useGetUOMTypesQuery, useUpdateUOMTypesMutation } from '../uomTypeApi';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps } from '@igblsln/store'

type Props = {}


const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;

  const clientProps = getClientProps();

  const { data, isLoading } = useGetUOMTypesQuery(id, {
    skip: isNew
  })
  const [addUOMTypes, { isLoading: isAdding }] = useAddUOMTypesMutation()
  const [updateUOMTypes, { isLoading: isUpdating }] = useUpdateUOMTypesMutation();


  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (isNew) {
        resp = await addUOMTypes({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateUOMTypes({ ...values, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className='pl-8 pt-4 pb-3 grid p-fluid'>

        {/* <FormField label="UOM Type Code" name="id" className="col-12"
          control={control} errors={errors}
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

        <FormField label="UOM Type Description" name="descr" className="col-12"
          control={control} errors={errors}
          required={"Enter Description"}
          leftSpan={3}
          rightSpan={5}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
            }
          }} />

      </div>
    )
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