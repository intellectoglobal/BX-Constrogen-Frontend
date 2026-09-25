import React, { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { NumericFormat } from 'react-number-format';
import { ManageLayout, getFormErrorMessage, FormField } from '@igblsln/control';
import { useAddPriceChangeMutation, useGetPriceChangeQuery, useListPriceChangeQuery, useUpdatePriceChangeMutation } from '../priceChangeApi';
import { useGetProjectQuery } from '../../Projects/apis';
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
  const baseRoute = `/projects/${projectId}/pricechange`

  const [effPrice, setEffPrice] = useState<any>('')

  const { data, isLoading } = useGetPriceChangeQuery(blockId, {
    skip: isNew
  })
  const { data: projectData, isLoading: isProjectFetching } = useGetProjectQuery(projectId, {
    skip: isNaN(projectId) || projectId <= 0
  })

  const { data: priceChangeData, isLoading: isStatusChangeFetching } = useListPriceChangeQuery({ projectId: projectData?.key }, { skip: !projectData?.key })

  const [addPriceChange, { isLoading: isAdding }] = useAddPriceChangeMutation()
  const [updatePriceChange, { isLoading: isUpdating }] = useUpdatePriceChangeMutation();

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

  const onSubmit = async (values: any) => {
    let data = {
      ...values,
      prev_effdate: formatDate(values.prev_effdate, 'yyyy-MM-dd'),
      effdate: formatDate(values.effdate, 'yyyy-MM-dd'),
      effprice: effPrice
    }
    try {
      let resp: any;
      if (isNew) {
        resp = await addPriceChange({ ...data, ...clientProps }).unwrap();
      } else {
        resp = await updatePriceChange({ ...data, ...clientProps }).unwrap();
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
            id={field.name}
            disabled
            showIcon
            {...field}
            value={isNew && priceChangeData?.results.length ? new Date(priceChangeData?.results[0]?.effdate) : new Date(data?.effdate)}
            style={{ width: '25%' }}
            dateFormat="dd-MM-yy"
            className={classNames({ 'p-invalid': fieldState.invalid })}
          />
        )} />
      </div>
      <div className="field">
        <label htmlFor={isNew ? "prev_effprice" : "effprice"} className={classNames('col-3', { 'p-error': errors.prev_effprice })}>Previous Effective Price</label>
        <Controller name={isNew ? "prev_effprice" : "effprice"} control={control} rules={{}} render={({ field, fieldState }) => (
          <NumericFormat
            id={field.name}
            disabled
            thousandSeparator={true}
            {...field}
            style={{ width: '25%' }}
            value={isNew && priceChangeData?.results.length ? priceChangeData?.results[0]?.effprice : data?.effprice}
            className={classNames('p-inputtext p-component')}
          />
        )} />
      </div>
      <div className="field">
        <label htmlFor="effdate" className={classNames('col-3', { 'p-error': errors.effdate })}>Effective Date*</label>
        <Controller defaultValue={isNew ? new Date() : new Date(data?.effdate)} name="effdate" control={control} rules={{ required: ' This is required.' }} render={({ field, fieldState }) => (
          <Calendar
            id={field.name}
            {...field}
            showIcon
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
        label="Effective Price"
        name="effprice"
        className='ml-2'
        control={control}
        errors={errors}
        leftSpan={3}
        rightSpan={3}
        required={!effPrice}
        formItem={{
          component: NumericFormat,
          componentProps: {
            thousandSeparator: true,
            labelClassName: 'mr-n1',
            className: 'p-inputtext p-component',
            onValueChange: (e: any) => {
              setEffPrice(e.value)
            }
          }
        }} />
      {/* <div className="field">
        <label htmlFor="effprice" className={classNames('col-3', { 'p-error': errors.effprice })}>Effective Price*</label>
        <Controller name="effprice" control={control} rules={{ required: { value: !effPrice, message: 'This is required.' } }} render={({ field }) => (
          <NumericFormat
            id={field.name}
            thousandSeparator={true}
            {...field}
            style={{ width: '25%' }}
            onValueChange={(e) => {
              setEffPrice(e.value)
            }}
            className={classNames('p-inputtext p-component')}
          />
        )} />
        {getFormErrorMessage(errors?.effprice?.message)}
      </div> */}
      <div className="field flex">
        <label htmlFor="notes" className={classNames('col-3', { 'p-error': errors.notes })}>Notes</label>
        <Controller name="notes" control={control} rules={{}} render={({ field, fieldState }) => (
          <InputTextarea id={field.name} style={{ width: '40%' }} {...field} className={classNames({ 'p-invalid': fieldState.invalid })} />
        )} />
        {getFormErrorMessage(errors?.notes?.message)}
      </div>

    </div>)
  }

  return (
    <>
      <Toast ref={toast} />
      <ManageLayout baseRoute={baseRoute} description="Price Change" id={blockId} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage