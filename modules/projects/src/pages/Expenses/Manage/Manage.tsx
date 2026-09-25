import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { ManageLayout, useToast, FormField } from '@igblsln/control';
import { useGetExpenseQuery, useAddExpenseMutation, useUpdateExpenseMutation } from '../apis';
import { AFTER_API_TIME, convertDateValue, defaultDateFormat, getClientProps, useActiveProjectQuery, useGetModeOfPaymentsQuery, useListBankQuery } from '@igblsln/store'

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast()
  const [showingToast, setShowingToast] = useState(false)
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const { data: modeOfPayments } = useGetModeOfPaymentsQuery({})
  const { data: banks } = useListBankQuery()


  const clientProps = getClientProps();
  const { data: projects } = useActiveProjectQuery()

  const { data, isLoading } = useGetExpenseQuery(id, {
    skip: isNew
  })

  const dataFromLocation: any = useLocation().state;

  const navigate = useNavigate();

  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation()
  const [addExpense, { isLoading: isAdding }] = useAddExpenseMutation()

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let body = {
        ...values,
      }
      console.log(body)
      if (isNew) {
        resp = await addExpense({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateExpense({ ...body, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate("/projects/expenses")
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }


  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className="flex">
        <div className='pl-8 col-10'>

          <FormField label="Project" name="project_key"
            className="col-12 md:col-6" control={control} errors={errors}
            required
            leftSpan={4}
            rightSpan={8}
            formItem={{
              component: Dropdown,
              componentProps: {
                options: projects,
                disabled: true,
                optionLabel: 'name',
                optionValue: 'key'
              }
            }}
          />

          <FormField label="Date" name="date"
            className="col-12 md:col-6"
            useExplicit control={control} errors={errors}
            convertValue={convertDateValue}
            required={"Select a Date"}
            leftSpan={4}
            rightSpan={8}
            formItem={{
              component: Calendar,
              componentProps: {
                showIcon: true,
                dateFormat: defaultDateFormat
              }
            }} />

          <FormField label="Amount" name="amount"
            leftSpan={4}
            rightSpan={8}
            className="col-12 md:col-6"
            control={control} errors={errors} formItem={{
              component: InputText,
              componentProps: {
                maxLength: 25
              }
            }} />

          <FormField
            label="Expense Type"
            name="expense_type"
            className="col-12 md:col-6"
            control={control}
            errors={errors}
            // required
            leftSpan={4}
            rightSpan={8}
            formItem={{
              component: Dropdown,
              componentProps: {
                options: [],
                optionLabel: 'name',
                optionValue: 'key'
              }
            }} />

          <FormField label="Account Name" name="account_id" className="col-12 md:col-6" control={control} errors={errors}
            required
            leftSpan={4}
            rightSpan={8}
            formItem={{
              component: Dropdown,
              componentProps: {
                options: banks,
                optionLabel: 'acc_name',
                optionValue: 'key'
              }
            }}
          />

          <FormField
            label="Notes"
            name="desc"
            control={control}
            errors={errors}
            required
            className="col-12 md:col-6"
            leftSpan={4}
            rightSpan={8}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100
              }
            }} />

          <FormField label="Payment Mode" name="payment_mode"
            className="col-12 md:col-6" control={control} errors={errors}
            required
            leftSpan={4}
            rightSpan={8}
            formItem={{
              component: Dropdown,
              componentProps: {
                options: modeOfPayments,
                optionLabel: 'descr',
                optionValue: 'modeofpay'
              }
            }}
          />

          <FormField
            label="Payment Description"
            name="payment_desc"
            className="col-12 md:col-6"
            control={control}
            errors={errors}
            required
            leftSpan={4}
            rightSpan={8}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100
              }
            }} />

        </div>

      </div>
    )
  }

  return (
    <>
      <ManageLayout baseRoute="/projects/expenses" description="Expense" id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        dataFromLocation={dataFromLocation}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage