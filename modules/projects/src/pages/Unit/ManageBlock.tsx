import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { classNames } from 'primereact/utils';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { ManageLayout, useToast, FormField } from '@igblsln/control';
import { useAddProjectBlockMutation, useGetProjectBlockQuery, useUpdateProjectBlockMutation } from './blockApi';
import { AFTER_API_TIME, getClientProps, useBlocksForProjectQuery, useGetProjectQuery } from '@igblsln/store'

type Props = {}

const ManageBlock = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)

  const navigate = useNavigate();
  const { blockId: idString, id: projectIdString } = useParams()
  const blockId = parseInt(idString || '');
  const isNew = isNaN(blockId) || blockId <= 0;
  const projectId = parseInt(projectIdString || '');
  const searchQuery = useLocation().search

  const clientProps = getClientProps();

  const baseRoute = "/projects/unit"

  const dataFromLocation: any = useLocation().state;

  const { data, isLoading } = useGetProjectBlockQuery(blockId, {
    skip: isNew
  })

  const { data: projectData } = useGetProjectQuery(projectId, {
    skip: isNaN(projectId) || projectId <= 0
  })

  const [addProjectBlock, { isLoading: isAdding }] = useAddProjectBlockMutation()
  const [updateProjectBlock, { isLoading: isUpdating }] = useUpdateProjectBlockMutation();


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

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: any) => {
    return (<div className='pl-8'>

      <div className="field">
        <label className={classNames('col-2')}>Project Code</label>
        <InputText value={projectData?.id} disabled />
      </div>
      <div className="field">
        <label className={classNames('col-2')}>Project Name</label>
        <InputText style={{ width: '50%' }} value={projectData?.name} disabled />
      </div>
      <Divider />
      <div className="flex">
        <div className="col-6">

          <FormField
            label="Block Name"
            name="descr"
            control={control}
            errors={errors}
            required
            leftSpan={4}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100
              }
            }} />
        </div>
      </div>
    </div>)
  }

  return (
    <>
      <ManageLayout baseRoute={baseRoute} description="Block" id={blockId} data={data}
        dataFromLocation={dataFromLocation}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default ManageBlock