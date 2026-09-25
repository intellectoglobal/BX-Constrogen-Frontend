import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tooltip } from 'primereact/tooltip';
import { ManageLayout, FormField, useToast, ListLayout, Datacolumn } from '@igblsln/control';
import { useAddStaffMutation, useGetStaffQuery, useListStaffQuery, useUpdateStaffMutation } from '../staffApi';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps } from '@igblsln/store'
import { useListClientQuery } from '../../Client/clientApi';

type Props = {}


const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = idString || '';
  const isNew = !id;

  const clientProps = getClientProps();

  const { data, isLoading } = useGetStaffQuery(id, {
    skip: isNew
  })

  const { data: clients, isLoading: clientsFetching } = useListClientQuery({})

  const [addStaff, { isLoading: isAdding }] = useAddStaffMutation()
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();


  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let body = {
        ...values,
      }
      if (isNew) {
        resp = await addStaff({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateStaff({ ...body, ...clientProps }).unwrap();
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

        <FormField label="Staff Name" name="name" className="col-12"
          control={control} errors={errors}
          required={"Enter Staff Name"}
          leftSpan={2}
          rightSpan={3}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
            }
          }} />

          
        <FormField label="Mobile Number" name="mobileno" className="col-12"
          control={control} errors={errors}
          required
          leftSpan={2}
          rightSpan={3}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
            }
          }} />

        <FormField
          label="Address"
          name="addr"
          control={control}
          errors={errors}
          className="col-12"
          leftSpan={2}
          rightSpan={3}
          formItem={{
            component: InputTextarea,
            componentProps: {
              maxLength: 100,
            }
          }} />

        <FormField label="PAN No" name="panno" className="col-12"
          control={control} errors={errors}
          required
          leftSpan={2}
          rightSpan={3}
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