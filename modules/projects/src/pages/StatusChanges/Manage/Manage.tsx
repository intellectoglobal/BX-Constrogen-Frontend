import React, { useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues,UseFormGetValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Calendar } from 'primereact/calendar';
import { ManageLayout, getFormErrorMessage, FormField } from '@igblsln/control';
import { useAddStatusChangeMutation, useGetStatusChangeQuery, useListStatusChangeQuery, useUpdateStatusChangeMutation } from '../statusChangeApi';
import { useGetProjectQuery, useGetProjectStatusesQuery } from '../../Projects/apis';
import { formatDate, getClientProps } from '@igblsln/store';
import { AFTER_API_TIME } from '@igblsln/store'

type Props = {}

const Manage = (props: Props) => {
  const toast = useRef<Toast>(null);
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { blockId: idString, id: projectIdString } = useParams()
  const blockId = parseInt(idString || '');
  const isNew = isNaN(blockId) || blockId <= 0;
  const projectId = parseInt(projectIdString || '');
  const baseRoute = `/projects/${projectId}/statuschange`

  const { data, isLoading } = useGetStatusChangeQuery(blockId, {
    skip: isNew
  })

  const dataFromLocation: any = useLocation().state;

  const { data: projectData, isLoading: isProjectFetching } = useGetProjectQuery(projectId, {
    skip: isNaN(projectId) || projectId <= 0
  })

  const { data: statusChangeData, isLoading: isStatusChangeFetching } = useListStatusChangeQuery({ projectId: projectData?.key }, { skip: !projectData?.key })

  const { data: projectStatuses } = useGetProjectStatusesQuery({})

  const [addStatusChange, { isLoading: isAdding }] = useAddStatusChangeMutation()
  const [updateStatusChange, { isLoading: isUpdating }] = useUpdateStatusChangeMutation();

  const showSuccess = (title: string, msg: string) => {
    toast?.current?.show({ severity: 'success', summary: title, detail: msg, life: 3000 });
  }

  const showError = (title: string, msg: string) => {
    toast?.current?.show({ severity: 'error', summary: title, detail: msg, life: 3000 });
  }

  const clientProps = {
    ...getClientProps(),
    proj_key: projectId
  };

  const customProjectStatusOption = [
    {
      label: 'Add',
      items: projectStatuses || []
    }
  ]

  const onSubmit = async (values: any) => {
    let data = {
      ...values,
      prev_effdate: formatDate(values.prev_effdate, 'yyyy-MM-dd'),
      effdate: formatDate(values.effdate, 'yyyy-MM-dd'),
    }
    try {
      let resp: any;
      if (isNew) {
        resp = await addStatusChange({ ...data, ...clientProps }).unwrap();
      } else {
        resp = await updateStatusChange({ ...data, ...clientProps }).unwrap();
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

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: UseFormGetValues<any>) => {
    return (<div className='pl-8'>

      <div className="field">
        <label className={classNames('col-3')}>Project Code</label>
        <InputText value={projectData?.id} disabled />
      </div>
      <div className="field">
        <label className={classNames('col-3')}>Project Name</label>
        <InputText style={{ width: '40%' }} value={projectData?.name} disabled />
      </div>
      <Divider />
      <div className="field">
        <label htmlFor={isNew ? "prev_effdate" : "effdate"} className={classNames('col-3', { 'p-error': errors.prev_effdate })}>Previous Effective Date</label>
        <Controller name={isNew ? "prev_effdate" : "effdate"} control={control} rules={{}} render={({ field, fieldState }) => (
          <Calendar
            showIcon
            id={field.name}
            disabled
            {...field}
            value={isNew && statusChangeData?.results.length ? new Date(statusChangeData?.results[0]?.effdate) : new Date(data?.effdate)}
            style={{ width: '25%' }}
            dateFormat="dd-MM-yy"
            className={classNames({ 'p-invalid': fieldState.invalid })}
          />
        )} />
      </div>
      <div className="field">
        <label htmlFor={isNew ? "prev_projstatus_key" : "projstatus_key"} className={classNames('col-3', { 'p-error': errors.prev_projstatus_key })}>Previous Effective Status</label>
        <Controller name={isNew ? "prev_projstatus_key" : "projstatus_key"} control={control} rules={{}} render={({ field, fieldState }) => (
          <Dropdown
            disabled
            id={field.name}
            {...field}
            style={{ width: '40%' }}
            value={isNew && statusChangeData?.results.length ? statusChangeData?.results[0].projstatus_key : field.value}
            className={classNames({ 'p-invalid': fieldState.invalid })}
            options={customProjectStatusOption}
            optionGroupTemplate={<div style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: 'lightgray' }} onClick={() => navigate('/projects/project-status')}>--Add And Edit--</div>}
            optionValue={"key"}
            optionGroupLabel="label"
            optionLabel="descr"
            optionGroupChildren="items"
          />
        )} />
      </div>
      <div className="field">
        <label htmlFor="effdate" className={classNames('col-3', { 'p-error': errors.effdate })}>Effective Date*</label>
        <Controller defaultValue={isNew ? new Date() : new Date(data?.effdate)} name="effdate" control={control} rules={{ required: ' This is required.' }} render={({ field, fieldState }) => (
          <Calendar
            id={field.name}
            showIcon
            {...field}
            disabled={!isNew}
            value={isNew ? new Date(field.value) : new Date(data?.effdate)}
            style={{ width: '25%' }}
            dateFormat="dd-MM-yy"
            className={classNames({ 'p-invalid': fieldState.invalid })}
          />
        )} />
        {getFormErrorMessage(errors?.effdate?.message)}
      </div>
      <FormField
        label="Effective Status"
        name="projstatus_key"
        control={control}
        errors={errors}
        required
        className='ml-2'
        leftSpan={3}
        rightSpan={4}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear : true,
            optionGroupTemplate:
              <div
                style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: '#e6e1e1', color: 'black', lineHeight: 2.5 }}
                onClick={() => navigate('/projects/project-status', {
                  state: {
                    url: isNew ? `/projects/${projectId}/statuschange/new` : `/projects/${projectId}/statuschange/${data?.key}/edit`,
                    data: getValues()
                  }
                })
                }
              >
                -- Create And Edit --
              </div>
            ,
            optionLabel: "descr",
            optionValue: "key",
            filter: true,
            filterBy: "descr",
            labelClassName: 'mr-n1',
            optionGroupLabel: "label",
            optionGroupChildren: "items",
            options: customProjectStatusOption
          }
        }} />
      {/* <div className="field">
        <label htmlFor="projstatus_key" className={classNames('col-3', { 'p-error': errors.projstatus_key })}>Effective Status*</label>
        <Controller name="projstatus_key" control={control} rules={{ required: 'Status is required.' }} render={({ field, fieldState }) => (
          <Dropdown
            id={field.name}
            {...field}
            style={{ width: '40%' }}
            className={classNames({ 'p-invalid': fieldState.invalid })}
            options={customProjectStatusOption}
            optionGroupTemplate={
              <div
                style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: '#e6e1e1', color: 'black', lineHeight: 2.5 }}
                onClick={() => navigate('/projects/project-status', {
                  state: {
                    url: isNew ? `/projects/${projectId}/statuschange/new` : `/projects/${projectId}/statuschange/${data?.key}/edit`,
                    data: getValues()
                  }
                })
                }
              >
                -- Create And Edit --
              </div>
            }
            optionValue={"key"}
            optionGroupLabel="label"
            optionLabel="descr"
            optionGroupChildren="items"
          />)
        } />
        {getFormErrorMessage(errors?.projstatus_key?.message)}
      </div> */}

    </div>)
  }

  return (
    <>
      <Toast ref={toast} />
      <ManageLayout
        baseRoute={baseRoute}
        description="Status Change"
        id={blockId}
        data={data}
        dataFromLocation={dataFromLocation}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage