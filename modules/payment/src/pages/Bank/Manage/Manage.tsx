import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues, UseFormGetValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { ManageLayout, FormField, useToast, ListLayout, Datacolumn } from '@igblsln/control';
import { useAddBankMutation, useGetBankQuery, useUpdateBankMutation } from '../banksApi'
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps } from '@igblsln/store'
import { useDispatch } from 'react-redux';
import { setPromptNavigate } from '@igblsln/store';

type Props = {}


const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [bankName, setBankName] = useState('')
  const [accountNo, setAccountNo] = useState('')
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = idString || '';
  const isNew = !id;
  const dispatch = useDispatch();

  const clientProps = getClientProps();

  const { data, isLoading } = useGetBankQuery(id, {
    skip: isNew
  })

  const [addBank, { isLoading: isAdding }] = useAddBankMutation()
  const [updateBank, { isLoading: isUpdating }] = useUpdateBankMutation();

  useEffect(()=>{
    if(data){
      setBankName(data.bank_name)
      setAccountNo(data.acc_no)
    }
  },[data])

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let body = {
        ...values,
        acc_name : `${bankName || ''}-${accountNo || ''}`
      }
      if (isNew) {
        resp = await addBank({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateBank({ ...body, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false }))
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: UseFormGetValues<any>,) => {
    return (
      <div className='pl-8 pt-4 pb-3 grid p-fluid'>

        <FormField label="Bank Name" name="bank_name" className="col-12"
          control={control} errors={errors}
          required={"Enter Bank Name"}
          leftSpan={2}
          rightSpan={3}
          useExplicit
          onChange={(e:any)=>{
            setBankName(e.target.value)
          }}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
            }
          }} />


        <FormField label="Account No" name="acc_no" className="col-12"
          control={control} errors={errors}
          required
          leftSpan={2}
          rightSpan={3}
          useExplicit
          onChange={(e:any)=>{
            setAccountNo(e.target.value)
          }}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
              type : "number"
            }
          }} />

        <FormField label="Account Name" name="acc_name" className="col-12"
          control={control} errors={errors}
          leftSpan={2}
          rightSpan={3}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
              disabled: true,
              value: `${bankName || ''}-${accountNo || ''}`
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