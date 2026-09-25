import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues, UseFormGetValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { ManageLayout, FormField, useToast } from '@igblsln/control';
import { useAddCustomerPaymentScheduleMutation, useGetCustomerPaymentScheduleQuery, useUpdateCustomerPaymentScheduleMutation } from '../api';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps, setPromptNavigate, useAppDispatch} from '@igblsln/store'
import ManageTable from './ManageTable';

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false);
  const [tableChanged, setTableChanged] = useState(false);
  const dispatch = useAppDispatch()

  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;

  const clientProps = getClientProps();

  const { data, isLoading } = useGetCustomerPaymentScheduleQuery(id, {
    skip: isNew
  })
  const [tableData, setTableData] = useState<any[]>([]);
  const [addPaymentSchedule, { isLoading: isAdding }] = useAddCustomerPaymentScheduleMutation()
  const [updatePaymentSchedule, { isLoading: isUpdating }] = useUpdateCustomerPaymentScheduleMutation();

  useEffect(()=>{
    if(data){
      setTableData(data?.payment_schedule_template_detail || [])
    }
  },[data])

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let body = {
        ...clientProps,
        ...values,
        payment_schedule_template_detail : tableData
      }
      console.log(body);
      // return;
      if (isNew) {
        resp = await addPaymentSchedule(body).unwrap();
      } else {
        resp = await updatePaymentSchedule(body).unwrap();
      }
      showSuccess('Success', resp.detail);
      dispatch(setPromptNavigate({promptNavigate: false}))
      setShowingToast(true);
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      console.log(error)
      showError(error?.data?.message || "An Error Occured", "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: UseFormGetValues<any>) => {
    return (<div
      className='pl-8'>

      <FormField
        label="Template Name"
        name="template_name"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100
          }
        }} />

      <FormField
        label="Description"
        name="description"
        control={control}
        errors={errors}
        leftSpan={2}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100,
          }
        }} />

      <div className="col-10" style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
        <ManageTable
          data={tableData}
          isLoading={isLoading}
          onTableChange={(value: boolean) => !tableChanged && setTableChanged(value)}
          onChange={(value: any[]) => setTableData(value)}
        />
      </div>


    </div>)
  }

  return (
    <>
      <ManageLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isItemsTableChanged={tableChanged}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage