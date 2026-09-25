import React, { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { ManageLayout, FormField } from '@igblsln/control';
import { useAddPaymentTermMutation, useGetPaymentTermQuery, useUpdatePaymentTermMutation } from '../paymentTermApi';
import { useGetProjectQuery } from '../../Projects/apis';
import { AFTER_API_TIME, getClientProps } from '@igblsln/store'

type Props = {}

const Manage = (props: Props) => {
  const toast = useRef<Toast>(null);
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { blockId: idString, id: projectIdString } = useParams()
  const blockId = parseInt(idString || '');
  const isNew = isNaN(blockId) || blockId <= 0;
  const projectId = parseInt(projectIdString || '');
  const baseRoute = `/projects/${projectId}/paymentterm`

  const { data, isLoading } = useGetPaymentTermQuery(blockId, {
    skip: isNew
  })
  const { data: projectData, isLoading: isPaymentFetching } = useGetProjectQuery(projectId, {
    skip: isNaN(projectId) || projectId <= 0
  })
  const [addPaymentTerm, { isLoading: isAdding }] = useAddPaymentTermMutation()
  const [updatePaymentTerm, { isLoading: isUpdating }] = useUpdatePaymentTermMutation();

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
    try {
      let resp: any;
      if (isNew) {
        resp = await addPaymentTerm({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updatePaymentTerm({ ...values, ...clientProps }).unwrap();
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
        <label className={classNames('col-2')}>Project Code</label>
        <InputText value={projectData?.id} disabled />
      </div>
      <div className="field">
        <label className={classNames('col-2')}>Project Name</label>
        <InputText style={{ width: '50%' }} value={projectData?.name} disabled />
      </div>
      <Divider />

      <FormField
        label="Payment Term"
        name="term"
        control={control}
        errors={errors}
        required
        leftSpan={3}
        rightSpan={3}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 25,
            disabled: !isNew,
          }
        }} />

      <FormField
        label="Payment Charges"
        name="termcharges"
        control={control}
        errors={errors}
        required
        leftSpan={3}
        rightSpan={5}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100
          }
        }} />
      <div style={{ position: 'absolute', bottom: '10px', width: '90%', paddingBottom: '10px' }}>
        <div className="row flex">
          <div className="col-6">
            BSP - Basic Selling Price
          </div>
          <div className="col-6">
            FMS - Interest Free maintainnance Security
          </div>
        </div>
        <div className="row flex">
          <div className="col-6">
            PLC - Preferential Location Charges
          </div>
          <div className="col-6">
            EDC - External Development Charges
          </div>
        </div>
      </div>

    </div>)
  }

  return (
    <>
      <Toast ref={toast} />
      <ManageLayout baseRoute={baseRoute} description="Payment Term" id={blockId} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage