import React, { useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { ManageLayout, FormField } from '@igblsln/control';
import { useAddProjectBlockMutation, useGetProjectBlockQuery, useUpdateProjectBlockMutation } from '../blockApi';
import { AFTER_API_TIME, getClientProps, useGetProjectQuery,  } from '@igblsln/store'

type Props = {}

const Manage = (props: Props) => {
  const toast = useRef<Toast>(null);
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { blockId: idString, id: projectIdString } = useParams()
  const blockId = parseInt(idString || '');
  const isNew = isNaN(blockId) || blockId <= 0;
  const projectId = parseInt(projectIdString || '');
  const searchQuery = useLocation().search

  const baseRoute = searchQuery === '?direct' ? `/projects/unit?bkp=${projectId}` : `/projects/${projectId}/unit`

  const clientProps = getClientProps()

  const { data, isLoading } = useGetProjectBlockQuery(blockId, {
    skip: isNew
  })

  const { data: projectData } = useGetProjectQuery(projectId, {
    skip: isNaN(projectId) || projectId <= 0
  })

  const [addProjectBlock, { isLoading: isAdding }] = useAddProjectBlockMutation()
  const [updateProjectBlock, { isLoading: isUpdating }] = useUpdateProjectBlockMutation();

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
        resp = await addProjectBlock({ ...values, ...clientProps, proj_key: projectId }).unwrap();
      } else {
        resp = await updateProjectBlock({ ...values, ...clientProps, proj_key: projectId }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate(baseRoute)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-8'>

      <div className="field">
        <label className={'col-2'}>Project Code</label>
        <InputText value={projectData?.id} disabled />
      </div>
      <div className="field">
        <label className={'col-2'}>Project Name</label>
        <InputText style={{ width: '50%' }} value={projectData?.name} disabled />
      </div>
      <Divider />

      <FormField
        label="Bock Name"
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
      <ManageLayout baseRoute={baseRoute} description="Block" id={blockId} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage