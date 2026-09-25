import React, { useEffect, useRef, useState } from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue, Controller } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { AutoComplete } from 'primereact/autocomplete';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import {
  ManageLayout,
  useToast,
  ManageLayoutHandle,
  FormField,
} from '@igblsln/control';
import { useAddSaleInvoiceMutation, useGetAllPaymentSchedulesForSaleAgreementQuery, useGetPaymentSchedulesForSaleAgreementQuery, useUpdateSaleInvoiceMutation } from '../api';
import {
  formatDate,
  AFTER_API_TIME,
  getClientProps,
  convertDateValue,
  useGetNextDocNoQuery,
  defaultDateFormat,
  tdsDropdownOptions,
  useAppDispatch,
  setPromptNavigate,
  refactorDate,
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';

type Props = {
  id?: any,
  displayModal: boolean,
  customDiscard: any,
  defaultValues: any
}

export default function CreateDirectInvoiceModal({ id, displayModal, customDiscard, defaultValues }: Props) {

  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [isTDSReceipt, setIsTDSReceipt] = useState(false)
  const [invoiceAmount, setInvoiceAmount] = useState(0)
  const [gstPercent, setGSTPercent] = useState(5)
  const [filteredGSTPercent, setFilteredGSTPercent] = useState<any[]>([])
  const [selectedPaymentSchedule, setSelectedPaymentSchedule] = useState<any>(null)
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const [formData, setFormData] = useState<any>({});
  const isNew = isNaN(id) || id <= 0;
  const dispatch = useAppDispatch()

  const clientProps = getClientProps();

  console.log("value of isnew", isNew)

  const { data: paymentSchedulesForNew } = useGetPaymentSchedulesForSaleAgreementQuery({ agreementId: defaultValues?.agreement_id }, { skip: !defaultValues?.agreement_id || !isNew, refetchOnMountOrArgChange: true })

  const { data: paymentSchedulesForExisting } = useGetAllPaymentSchedulesForSaleAgreementQuery({ agreementId: defaultValues?.agreement_id }, { skip: !defaultValues?.agreement_id || isNew, refetchOnMountOrArgChange: true })

  const paymentSchedules = isNew ? paymentSchedulesForNew : paymentSchedulesForExisting;


  const { data: docId } = useGetNextDocNoQuery("SIN", { refetchOnMountOrArgChange: true, skip: !isNew })

  useEffect(() => {
    setFormData({
      ...clientProps,
      ...defaultValues,
      invoice_date: defaultValues?.invoice_date ? refactorDate(defaultValues?.invoice_date) : convertDateValue(new Date(), true),
      docid: "SIN",
      invoice_id: defaultValues?.invoice_id || docId?.next_doc_id,
    })
    setInvoiceAmount(defaultValues?.invoice_amount || 0)
    let gstpercent = (defaultValues?.gst_amount / defaultValues?.invoice_amount) * 100
    if (!defaultValues?.is_tds_invoice) {
      setGSTPercent(gstpercent)
    } else {
      setGSTPercent(0)
      setIsTDSReceipt(true)
    }

  }, [])
  const [addVendorPayment, { isLoading: isAdding }] = useAddSaleInvoiceMutation()
  const [updateVendorPayment, { isLoading: isUpdating }] = useUpdateSaleInvoiceMutation()


  const onSubmit = async (values: any) => {
    if (defaultValues?.agreement_id && (defaultValues?.max_amount < invoiceAmount)) {
      showError("Invoice Amount Exceeds Agreement Amount", "Please Check")
      return
    }
    try {
      let body = {
        ...values,
        invoice_id: docId?.next_doc_id,
        gst_amount: gstPercent * invoiceAmount * 0.01,
        invoice_date: formatDate(values.invoice_date, 'yyyy-MM-dd'),
        invoice_amount: invoiceAmount || selectedPaymentSchedule?.amount,
        receivable_amount: invoiceAmount - ((gstPercent * invoiceAmount * 0.01) || formData.gst_amount || 0)
      }
      // console.log(body)
      let resp: any;
      if (isNew) {
        resp = await addVendorPayment({ ...body, ...clientProps }).unwrap();
      }
      else {
        resp = await updateVendorPayment({ ...body, ...clientProps }).unwrap();
      }
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
              label="Project Name"
              name="project_name"
              className="col-12 md:col-4 pl-0"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true
                }
              }} />

            <FormField
              label="Agreement No"
              name="agreement_no"
              className="col-12 md:col-4 pl-0"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true
                }
              }} />

            <FormField
              label="Invoice No"
              name="invoice_id"
              className="col-12 md:col-4 pl-0"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true
                }
              }} />
          </div>


        </div>

        <div style={{ border: '2px solid gray', margin: '10px auto' }}>
          <div className='pl-4 pt-4 grid p-fluid h-full'>

            <FormField label="Date" name="invoice_date" useExplicit control={control} errors={errors}
              leftSpan={4}
              rightSpan={8}
              required
              className="col-12 md:col-3 pl-0"
              convertValue={convertDateValue}
              formItem={{
                component: Calendar,
                componentProps: {
                  showIcon: true,
                  dateFormat: defaultDateFormat
                }
              }} />

            {/* <FormField label="TDS (₹)"
              name="tds_amount"
              leftSpan={4}
              rightSpan={8}
              className="col-12 md:col-3 pl-0"
              control={control} errors={errors}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25
                }
              }} /> */}

            <div className="field col-12 md:col-3 pl-0">
              <label style={{ margin: 'auto' }} htmlFor="is_tds_invoice" className={'col-4'}>TDS</label>
              <Controller defaultValue={false} name="is_tds_invoice" control={control} render={({ field, fieldState }) => (
                <Checkbox
                  checked={field.value}
                  trueValue={true}
                  falseValue={false}
                  id={field.name}
                  {...field}
                  onChange={e => {
                    field.onChange(e.checked)
                    setIsTDSReceipt(e.checked)
                    if (e.checked) {
                      setGSTPercent(0)
                    }
                  }}
                  className='pb-4'
                ></Checkbox>
              )} />
            </div>

            <FormField label="Import Data From Payment Schedule"
              name="payment_schedule_id"
              leftSpan={6}
              rightSpan={6}
              className="col-12 md:col-6"
              useExplicit
              onChange={(e: any) => {
                setFormData((prev: any) => {
                  console.log({
                    ...prev,
                    payment_schedule_id: e.value || null
                  })
                  return {
                    ...prev,
                    payment_schedule_id: e.value || null
                  }
                })
                let temp = paymentSchedules?.find(c => c.key === e.value)
                if (temp) {
                  setSelectedPaymentSchedule(temp)
                  setInvoiceAmount(temp?.amount)
                }
                else{
                  setSelectedPaymentSchedule(null)
                  setInvoiceAmount(0)
                }
              }}
              control={control} errors={errors} formItem={{
                component: Dropdown,
                componentProps: {
                  options: paymentSchedules,
                  optionLabel: 'payment_stage_desc',
                  optionValue: 'key',
                  showClear: true
                }
              }} />


            <FormField label="Invoice Amt"
              name="invoice_amount"
              leftSpan={5}
              rightSpan={7}
              className="col-12 md:col-4 pl-0"
              required={!selectedPaymentSchedule}
              control={control} errors={errors}
              useExplicit
              onChange={(e: any) => {
                setInvoiceAmount(e.target.value)
              }}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  type: 'number',
                  disabled: selectedPaymentSchedule,
                  value: invoiceAmount
                }
              }} />

            {
              !isTDSReceipt &&
              <FormField label="GST (%)" name="gstpercent"
                leftSpan={4}
                rightSpan={7}
                className="col-12 md:col-4"
                control={control} errors={errors}
                useExplicit
                defaultValue={gstPercent}
                onChange={(event: any) => {
                  setGSTPercent(event.value)
                }}
                formItem={{
                  component: AutoComplete,
                  componentProps: {
                    type: 'number',
                    suggestions: filteredGSTPercent,
                    value: gstPercent,
                    completeMethod: (e: any) => tdsDropdownOptions(e, setFilteredGSTPercent, [0, 5]),
                    dropdown: true
                  }
                }} />
            }

            {
              !isTDSReceipt &&
              <FormField label="GST (₹)" name="gst_amount"
                className="col-12 md:col-4"
                leftSpan={4}
                rightSpan={7}
                control={control} errors={errors}
                formItem={{
                  component: InputText,
                  componentProps: {
                    disabled: true,
                    value: ((gstPercent || 0) * (invoiceAmount || 0) * 0.01)
                  }
                }} />
            }

            {/* <FormField label="Receivable Amt(₹)" name="receivable_amount"
              className="col-12 md:col-3"
              leftSpan={6}
              rightSpan={6}
              control={control} errors={errors}
              formItem={{
                component: InputText,
                componentProps: {
                  disabled: true,
                  value: invoiceAmount - ((gstPercent * invoiceAmount * 0.01) || formData.gst_amount || 0)
                }
              }} /> */}

            <FormField label="Invoice Description"
              name="notes"
              leftSpan={2}
              rightSpan={9}
              className="col-12 pl-0"
              control={control} errors={errors}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 500
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
        header={id ? `Update Sale Invoice` : `Create Sale Invoice`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => {
          let element = document.getElementById('discard-btn')
          if(element) {
            element.click()
          } else {
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
