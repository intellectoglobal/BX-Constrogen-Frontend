import React, { useRef, useState } from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import {
  ManageLayout,
  useToast,
  ManageLayoutHandle,
  FormField,
} from '@igblsln/control';
import { useAddReceiveSaleInvoiceMutation, useGetSourceOfFundsQuery } from '../apis';
import {
  AFTER_API_TIME,
  getClientProps,
  useGetNextDocNoQuery,
  useGetModeOfPaymentsQuery,
  useListBankQuery,
  convertDateValue,
  defaultDateFormat,
  inputNumberProps,
  useAppDispatch,
  setPromptNavigate,
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';

type Props = {
  displayModal: boolean,
  customDiscard: any,
  invoiceData: any
}

interface DropdownChangeEvent {
  value: string;
  originalEvent: Event;
}

export default function CreateDirectInvoiceModal({
  displayModal,
  customDiscard,
  invoiceData
}: Props) {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const [formData, setFormData] = useState<any>({
    date: convertDateValue(new Date(), true)
  })
  const dispatch = useAppDispatch()

  const clientProps = getClientProps();


  const [selectedModeOfPay, setSelectedModeOfPay] = useState<any>(null)
  const { data: modeOfPayments } = useGetModeOfPaymentsQuery({})
  const { data: banks } = useListBankQuery()
  const { data: sourceOfFunds } = useGetSourceOfFundsQuery()

  const { data: docData } = useGetNextDocNoQuery("SR", { refetchOnMountOrArgChange: true })

  const [addInvoice, { isLoading: isAdding }] = useAddReceiveSaleInvoiceMutation()


  const onSubmit = async (values: any) => {
    try {
      if (values?.amount > invoiceData?.pending_amount) {
        showError("Amount Exceeds the Pending Amount", `Max Allowed for this invoice is ₹.${invoiceData?.pending_amount}`);
        return true;
      }
      let body = {
        ...values,
        project_id: invoiceData?.project_id,
        invoice_id: invoiceData?.key,
        receipt_number: docData?.next_doc_id,
        amount: parseInt(values?.amount),
        docid: "SR",
      }
      let resp: any;
      resp = await addInvoice({ ...body, ...clientProps }).unwrap();
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

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: any, setValue: UseFormSetValue<any>) => {
    return (
      <div>
        <div style={{ border: '2px solid gray', padding: '5px 20px' }}>
          <div className="flex">
            <FormField
              label="Invoice No"
              name="invoice_no"
              className="col-12 md:col-6 pl-0"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true,
                  value: invoiceData?.invoice_id
                }
              }} />
            <FormField
              label="Customer Name"
              name="customer_name"
              className="col-12 md:col-6 pl-0"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true,
                  value: invoiceData?.customer_name
                }
              }} />



          </div>

          <div className="flex">
            <FormField
              label="Project Name"
              name="project_name"
              className="col-12 md:col-6 pl-0"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true,
                  value: invoiceData?.project_name
                }
              }} />
            <FormField
              label="Unit Name"
              name="unit_name"
              className="col-12 md:col-6 pl-0"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true,
                  value: invoiceData?.unit_name
                }
              }} />


          </div>

          <div className="flex">
            <FormField
              label="Invoice Amount (₹)"
              name="invoice_amount"
              className="col-12 md:col-6 pl-0"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true,
                  value: invoiceData?.invoice_amount
                }
              }} />
            <FormField
              label="Pending Amount (₹)"
              name="pending_amount"
              className="col-12 md:col-6 pl-0"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true,
                  value: invoiceData?.pending_amount
                }
              }} />


          </div>

          <div className="flex">
            <FormField label="Date" name="date" useExplicit control={control} errors={errors}
              leftSpan={4}
              rightSpan={6}
              required
              className="col-12 md:col-6"
              convertValue={convertDateValue}
              formItem={{
                component: Calendar,
                componentProps: {
                  showIcon: true,
                  dateFormat: defaultDateFormat
                }
              }} />


          </div>
        </div>

        <div style={{ border: '2px solid gray', margin: '10px auto' }}>
          <div className='pl-4 pt-4 grid p-fluid h-full'>

            <FormField
              label="Source of Fund"
              name="source_of_fund_id"
              className="col-12 md:col-6 pl-0"
              required
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={6}
              formItem={{
                component: Dropdown,
                componentProps: {
                  showClear: true,
                  optionLabel: "name",
                  optionValue: "key",
                  filter: true,
                  filterBy: "name",
                  options: sourceOfFunds,
                }
              }} />

            <FormField label="Amount" name="amount"
              leftSpan={4}
              rightSpan={6}
              required
              useExplicit
              className="col-12 md:col-6"
              control={control} errors={errors} formItem={{
                component: InputNumber,
                componentProps: {
                  ...inputNumberProps
                }
              }} />

            <FormField
              label="Mode of Payment"
              name="payment_mode_id"
              className="col-12 md:col-6 pl-0"
              required
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={6}
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
              }} />

            {
              selectedModeOfPay != "cash" &&
              <FormField label="Account Name" name="account_id" className="col-12 md:col-6 pl-0" control={control} errors={errors}
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

            <FormField label="Transaction Detail" name="transaction_detail"
              leftSpan={4}
              rightSpan={6}
              // required
              className="col-12 md:col-6 pl-0"
              control={control} errors={errors} formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 255,
                }
              }} />



            <FormField label="Notes" name="notes"
              leftSpan={4}
              rightSpan={6}
              // required
              className="col-12 md:col-6 pl-0"
              control={control} errors={errors} formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 255,
                }
              }} />

          </div>
        </div>

      </div>

    )
  }


  return (
    <>
      <Dialog
        header={`Create Sale Receipt`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => {
          let element = document.getElementById('discard-btn')
          if (element){
            element.click()
          } else{
            customDiscard()
          }
        }}
        draggable={false} resizable={false} closable
      >
        <ManageLayout
          baseRoute="/payment/vendorpayment"
          bottomControl
          data={formData}
          hideHeader
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
