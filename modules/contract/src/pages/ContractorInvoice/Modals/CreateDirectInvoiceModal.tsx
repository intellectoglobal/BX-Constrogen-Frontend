import React, { useEffect, useRef, useState } from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { AutoComplete } from 'primereact/autocomplete';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import {
  ManageLayout,
  useToast,
  ManageLayoutHandle,
  FormField,
} from '@igblsln/control';
import {useAddContractorInvoiceMutation, useAllPaymentSchedulesForAgreementQuery, usePaymentSchedulesForAgreementQuery, useUpdateContractInvoiceMutation } from '../contractInvoiceApi';
import {
  formatDate,
  AFTER_API_TIME,
  getClientProps,
  convertDateValue,
  useGetNextDocNoQuery,
  defaultDateFormat,
  tdsDropdownOptions,
  inputNumberProps,
  useAppDispatch,
  setPromptNavigate,
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';

type Props = {
  id?: any,
  displayModal: boolean,
  customDiscard: any,
  defaultValues: any,
  readOnly: boolean
}

export default function CreateDirectInvoiceModal({ id, displayModal, customDiscard, defaultValues, readOnly }: Props) {

  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [invoiceAmount, setInvoiceAmount] = useState(0)
  const [tdsPercent, setTDSPercent] = useState(1)
  const [filteredTDSPercent, setFilteredTDSPercent] = useState<any[]>([])
  const [selectedPaymentSchedule, setSelectedPaymentSchedule] = useState<any>(null)
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const [formData, setFormData] = useState<any>({});
  const isNew = isNaN(id) || id <= 0;
  const dispatch = useAppDispatch()

  const clientProps = getClientProps();

  const { data: paymentSchedulesForNew  } = usePaymentSchedulesForAgreementQuery({ agreementId: defaultValues?.agreement_id }, { skip: !defaultValues?.agreement_id || !isNew, refetchOnMountOrArgChange: true })

  const { data: paymentSchedulesForExisting  } = useAllPaymentSchedulesForAgreementQuery({ agreementId: defaultValues?.agreement_id }, { skip: !defaultValues?.agreement_id || isNew, refetchOnMountOrArgChange: true })

  const paymentSchedules = isNew ? paymentSchedulesForNew : paymentSchedulesForExisting;

  const { data: docId } = useGetNextDocNoQuery("CIN", { refetchOnMountOrArgChange: true, skip: !isNew })

  const refactorDate = (value:any) => {
      try {
          const [day, month, year] = value.split('-').map(Number);
          const dateObj = new Date(year, month - 1, day);
          return dateObj
      } catch (error) {
          console.log("error ::", error)
          return value
      }
  }

  useEffect(() => {
    console.log("defaultValues ::", defaultValues)
    setFormData({
      ...clientProps,
      ...defaultValues,
      invoice_date: defaultValues?.invoice_date? refactorDate(defaultValues?.invoice_date) : convertDateValue(new Date(), true),
      docid: "CIN",
      invoice_type: defaultValues?.agreement_no ? "C" : "N",
      invoice_id: defaultValues?.invoice_id || docId?.next_doc_id,
    })
    setInvoiceAmount(defaultValues?.invoice_amount || 0)
    let tdspercent = (defaultValues?.tds_amount / defaultValues?.invoice_amount) * 100
    setTDSPercent(tdspercent)
  }, [])
  const [addVendorPayment, { isLoading: isAdding }] = useAddContractorInvoiceMutation()
  const [updateVendorPayment, { isLoading: isUpdating }] = useUpdateContractInvoiceMutation()


  const onSubmit = async (values: any) => {
    if (defaultValues?.agreement_id && (defaultValues?.max_amount < invoiceAmount)) {
      showError("Invoice Amount Exceeds Agreement Amount", "Please Check")
      return
    }
    try {
      let body = {
        ...values,
        invoice_id: docId?.next_doc_id,
        tds_amount: Number((((tdsPercent || 0) * (invoiceAmount || 0) * 0.01) || 0).toFixed(2)),
        invoice_date: formatDate(values.invoice_date, 'yyyy-MM-dd'),
        invoice_amount: invoiceAmount || selectedPaymentSchedule?.amount,
        payable_amount: invoiceAmount - (Number((((tdsPercent || 0) * (invoiceAmount || 0) * 0.01) || 0)) || formData.tds_amount || 0)
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
      dispatch(setPromptNavigate({promptNavigate:false}))
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
              label="Contractor"
              name="contractor_name"
              className="col-12 md:col-6 pl-0"
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
                  disabled: true
                }
              }} />

          </div>

          <div className="flex">

            {
              id &&
              <FormField
                label="Invoice No"
                name="invoice_id"
                className="col-12 md:col-6 pl-0"
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
            }


            <FormField
              label="Agreement No"
              name="agreement_no"
              className="col-12 md:col-6 pl-0"
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
              rightSpan={6}
              required
              className="col-12 md:col-6 pl-0"
              convertValue={convertDateValue}
              formItem={{
                component: Calendar,
                componentProps: {
                  showIcon: true,
                  dateFormat: defaultDateFormat
                }
              }} />

            <FormField label="Import Data From Payment Schedule"
              name="payment_schedule_id"
              // required={"please selecte a payment schedule"}
              leftSpan={4}
              rightSpan={6}
              className="col-12 md:col-6 pl-0"
              useExplicit
              onChange={(e: any) => {
              let temp = paymentSchedules?.filter(c => c.key === e.value)
              if (temp && temp.length > 0) {
                const schedule = temp[0];
                setSelectedPaymentSchedule(schedule);

                setInvoiceAmount(schedule?.amount || 0);

                setFormData((prev: any) => ({
                  ...prev,
                  invoice_desc: schedule?.payment_stage_desc || ""
                }));

                setValue("invoice_desc", schedule?.payment_stage_desc || "");
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
              className="col-12 md:col-3 pl-0"
              // required={!selectedPaymentSchedule}
              control={control} errors={errors}
              useExplicit
              onChange={(e: any) => {
                console.log("value1 ::", e?.value)
                setInvoiceAmount(e?.value)
              }}
              formItem={{
                component: InputNumber,
                componentProps: {
                  ...inputNumberProps,
                  // maxLength: 25,
                  // type: 'number',
                  // disabled: true,
                  value: invoiceAmount
                }
              }} />

            <FormField label="TDS (%)" name="tdspercent"
              leftSpan={4}
              rightSpan={7}
              className="col-12 md:col-3"
              control={control} errors={errors}
              useExplicit
              defaultValue={tdsPercent}
              onChange={(event: any) => {
                setTDSPercent(event.value)
              }}
              formItem={{
                component: AutoComplete,
                componentProps: {
                  type: 'number',
                  suggestions: filteredTDSPercent,
                  min : 0,
                  completeMethod: (e: any) => tdsDropdownOptions(e, setFilteredTDSPercent),
                  dropdown: true
                }
              }} />

            <FormField label="TDS (₹)" name="tds_amount"
              className="col-12 md:col-3"
              leftSpan={4}
              rightSpan={7}
              control={control} errors={errors}
              formItem={{
                component: InputText,
                componentProps: {
                  disabled: true,
                  value: Number((((tdsPercent || 0) * (invoiceAmount || 0) * 0.01) || 0).toFixed(2))
                }
              }} />

            <FormField label="Payable Amt(₹)" name="payable_amount"
              className="col-12 md:col-3"
              leftSpan={6}
              rightSpan={6}
              control={control} errors={errors}
              formItem={{
                component: InputText,
                componentProps: {
                  disabled: true,
                  value: invoiceAmount - (Number((((tdsPercent || 0) * (invoiceAmount || 0) * 0.01) || 0) )|| formData.tds_amount || 0)
                }
              }} />

            <FormField label="Invoice Description"
              name="invoice_desc"
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
        header={id ? `Update Contractor Invoice` : `Create Contractor Invoice`}
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
          viewMode={readOnly}
          disableInput={readOnly}
        />
      </Dialog>
    </>
  )
}
