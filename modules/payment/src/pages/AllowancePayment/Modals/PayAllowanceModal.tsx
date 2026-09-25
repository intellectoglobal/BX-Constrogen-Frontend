import React, { useEffect, useRef, useState } from 'react'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';

import { Dropdown } from 'primereact/dropdown';
import {
  ManageLayout,
  getFormErrorMessage,
  useToast,
  ManageLayoutHandle,
  FormField,
} from '@igblsln/control';
import { Calendar } from 'primereact/calendar';
import { useGetAllEmployeesQuery, usePayAllowanceMutation } from '../api';
import {
  formatDate,
  useActiveContractorsQuery,
  useInvoiceForContractorQuery,
  AFTER_API_TIME,
  getClientProps,
  convertDateValue,
  useGetNextDocNoQuery,
  useGetModeOfPaymentsQuery,
  useGetAllCompaniesQuery,
  ViewModalBorderRadius,
  defaultDateFormat,
  useGetActiveProjectsQuery,
  useListBankQuery,
  inputNumberProps,
  useAppDispatch,
  setPromptNavigate,
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';

type Props = {
  displayModal: boolean,
  customDiscard: any,
}

interface DropdownChangeEvent {
  value: string;
  originalEvent: Event;
}

export default function PayAllowanceModal({ displayModal, customDiscard }: Props) {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const [poData, setPoData] = useState({ date : new Date() });
  const dispatch = useAppDispatch()

  const clientProps = getClientProps();

  const [selectedModeOfPay, setSelectedModeOfPay] = useState<any>('Online')


  const { data: projects } = useGetActiveProjectsQuery({}, { refetchOnMountOrArgChange: true })
  const { data: modeOfPayments, isLoading: modeOfPaymentsFetching } = useGetModeOfPaymentsQuery({})
  const { data: banks } = useListBankQuery()
  const { data: payees } = useGetAllEmployeesQuery()

  const [addContractorPayment, { isLoading: isAdding }] = usePayAllowanceMutation()

  const onSubmit = async (values: any) => {
    try {
      let body = {
        ...values,
        date: formatDate(values.date, 'yyyy-MM-dd'),
        modeofpay: selectedModeOfPay,
        type : "A"
      }
      console.log(body)
      let resp: any;
      resp = await addContractorPayment({ ...body, ...clientProps }).unwrap();
      showSuccess('Success', resp.detail);
      dispatch(setPromptNavigate({promptNavigate: false}))
      setShowingToast(true);
      setTimeout(() => {
        customDiscard()
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  dispatch(setPromptNavigate({promptNavigate: false}))

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>

      <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>

        <FormField label="Date" name="date" className="col-10 md:col-4" useExplicit control={control} errors={errors}
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

        <FormField label="Project Name"
          name="project_key"
          control={control} errors={errors}
          className="col-12 md:col-4"
          leftSpan={5}
          rightSpan={7}
          // required
          formItem={{
            component: Dropdown,
            componentProps: {
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              options: projects,
            }
          }} />

        <FormField label="Payee Name"
          name="employee"
          control={control} errors={errors}
          className="col-12 md:col-4"
          leftSpan={5}
          rightSpan={7}
          required
          formItem={{
            component: Dropdown,
            componentProps: {
              optionLabel: "first_name",
              optionValue: "id",
              filter: true,
              filterBy: "first_name",
              options: payees,
            }
          }} />

      </div>

      <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>


        <FormField label="Amount" name="amount" className="col-12 md:col-6" control={control} errors={errors}
          required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputNumber,
            componentProps: {
              ...inputNumberProps
            }
          }}
        />

        <FormField label="Payment Mode" name="payment_mode_key" className="col-12 md:col-6" control={control} errors={errors}
          required
          leftSpan={4}
          rightSpan={6}
          useExplicit
          onChange={(e: DropdownChangeEvent) => {
              const selectedOption = modeOfPayments?.find(
                (option) => option.modeofpay === e.value
              );
              setSelectedModeOfPay(selectedOption?.descr?.toLowerCase() || e.value);
            }}
          formItem={{
            component: Dropdown,
            componentProps: {
              options: modeOfPayments,
              optionLabel: 'descr',
              optionValue: 'modeofpay'
            }
          }}
        />

        {
          selectedModeOfPay != "cash" &&
          <FormField label="Account Name" name="account_key" className="col-12 md:col-6" control={control} errors={errors}
            required
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: Dropdown,
              componentProps: {
                options: banks,
                optionLabel: 'acc_name',
                optionValue: 'key'
              }
            }}
          />
        }


        <FormField label="Transaction Detail" name="transaction_detail" className="col-12 md:col-6" control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 50
            }
          }}
        />

        <FormField label="Notes" name="notes" className="col-12" control={control} errors={errors}
          leftSpan={2}
          rightSpan={9}
          formItem={{
            component: InputText,
            componentProps: {
              ...inputNumberProps
            }
          }}
        />

      </div>

    </div>)
  }



  return (
    <>
      <Dialog
        header={`Pay Allowance`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => {
          let element = document.getElementById('discard-btn')
          if (element) {
            element.click()
          } else {
            customDiscard()
          }
        }}
        draggable={false} resizable={false} closable
      >
        <ManageLayout 
          baseRoute="/payment/contractorpayment"
          bottomControl
          data={poData}
          hideHeader
          saveBtnLabel='Pay'
          customDiscard={customDiscard}
          ref={manageLayoutRef}
          isUpdating={isAdding || showingToast}
          onSubmit={onSubmit}
          renderForm={renderForm}
        />
      </Dialog>
    </>
  )
}
