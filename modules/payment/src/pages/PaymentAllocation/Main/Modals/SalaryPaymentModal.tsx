import React, { useState } from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import {
  ManageLayout,
  useToast,
  FormField,
} from '@igblsln/control';
import { useAddVendorPaymentMutation, useGetVendorPaymentQuery } from '../../../VendorPayment/vendorPaymentApi';
import {
  AFTER_API_TIME,
  getClientProps,
  convertDateValue,
  useGetAllCompaniesQuery,
  defaultDateFormat
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';

type Props = {
  displayModal: boolean,
  staffId: any;
  customDiscard: any,
}

export default function SalaryPaymentModal({ displayModal, staffId, customDiscard }: Props) {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)

  const clientProps = getClientProps();

  const { data, isLoading } = useGetVendorPaymentQuery(staffId, {})


  const { data: companies, isFetching: companiesFetching } = useGetAllCompaniesQuery()

  const [addVendorPayment, { isLoading: isAdding }] = useAddVendorPaymentMutation()


  const onSubmit = async (values: any) => {
    try {
      let body = {
        ...values,
      }
      console.log(body)
      let resp: any;
      resp = await addVendorPayment({ ...body, ...clientProps }).unwrap();
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        customDiscard()
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: any, setValue: UseFormSetValue<any>) => {
    return (
      <div className='pl-8 col-10'>


        <FormField label="Staff Name" name="staff_key"
          leftSpan={4}
          rightSpan={6}
          required
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }} />

        <FormField label="Date of Payment" name="date" useExplicit control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          required
          convertValue={convertDateValue}
          formItem={{
            component: Calendar,
            componentProps: {
              showIcon: true,
              dateFormat: defaultDateFormat
            }
          }} />

        <FormField label="Company Name" name="company_key"
          leftSpan={4}
          rightSpan={6}
          required
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }} />

        <FormField label="Amount" name="paidamt"
          leftSpan={4}
          rightSpan={6}
          required
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }} />

      </div>)
  }

  return (
    <>
      <Dialog
        header={`Make Salary Payment`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '50vw' }}
        onHide={() => customDiscard()}
        draggable={false} resizable={false} closable
      >
        <ManageLayout
          baseRoute=""
          id={staffId}
          bottomControl
          data={data}
          hideHeader
          customDiscard={customDiscard}
          isUpdating={isAdding || showingToast}
          isLoading={isLoading}
          onSubmit={onSubmit}
          renderForm={renderForm}
        />
      </Dialog>
    </>
  )
}
