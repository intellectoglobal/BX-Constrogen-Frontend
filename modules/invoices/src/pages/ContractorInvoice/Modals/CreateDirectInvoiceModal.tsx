import React, { useEffect, useRef, useState } from 'react'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import {
  ManageLayout,
  useToast,
  ManageLayoutHandle,
  FormField,
} from '@igblsln/control';
import { useAddInvoiceMutation } from '../api';
import {
  formatDate,
  useActiveContractorsQuery,
  AFTER_API_TIME,
  getClientProps,
  convertDateValue,
  useGetNextDocNoQuery,
  useGetModeOfPaymentsQuery,
  useGetAllCompaniesQuery,
  defaultDateFormat
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';

type Props = {
  displayModal: boolean,
  customDiscard: any,
}

export default function CreateDirectInvoiceModal({ displayModal, customDiscard }: Props) {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [docStatus, setDocStatus] = useState<any>("S")
  const [selectedContractor, setSelectedContractor] = useState<any>('')
  const [action, setAction] = useState<any>("SAVE")
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const [poData, setPoData] = useState({});

  const clientProps = getClientProps();


  const [balanceAmount, setBalanceAmount] = useState<any>(null)
  const [selectedModeOfPay, setSelectedModeOfPay] = useState<any>('Online')

  const { data: docData, error, isFetching: isDocDataFetched } = useGetNextDocNoQuery("PYV", { refetchOnMountOrArgChange: true })

  const { data: companies, isFetching: companiesFetching } = useGetAllCompaniesQuery()

  const [addContractorPayment, { isLoading: isAdding }] = useAddInvoiceMutation()


  const onSubmit = async (values: any) => {
    try {
      let body = {
        ...values,
        number: docData?.next_doc_id,
        date: formatDate(values.date, 'yyyy-MM-dd'),
        docstatus: docStatus,
        docid: "PYV",
        chqdate: values.chqdate && formatDate(values.chqdate, 'yyyy-MM-dd'),
        action: action,
        modeofpay: selectedModeOfPay
      }
      console.log(body)
      let resp: any;
      resp = await addContractorPayment({ ...body, ...clientProps }).unwrap();
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
      <div>
        <div style={{ border: '2px solid gray', padding: '5px' }}>

        <div style={{ display: 'flex' }}>
          <div className="field col-4">
            <label className={'col-4'}>Contractor Name</label>
            <InputText
              style={{ width: '60%' }}
              disabled
            />
          </div>
          <div className="field col-4">
            <label className={'col-4'}>Project Name</label>
            <InputText
              style={{ width: '60%' }}
              disabled
            />
          </div>
          <div className="field col-4">
            <label className={'col-4'}>Invoice No</label>
            <InputText
              style={{ width: '60%' }}
              disabled
            />
          </div>

        </div>

        </div>

        <div style={{ border: '2px solid gray', margin: '10px auto' }}>
          <div className='pl-4 pt-4 grid p-fluid h-full'>


            <FormField label="Date" name="date" useExplicit control={control} errors={errors}
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


            <FormField label="Import data from Payment Schedule" name="vend_key"
              leftSpan={4}
              rightSpan={6}
              required
              className="col-12 md:col-6 pl-0"
              control={control} errors={errors} formItem={{
                component: Dropdown,
                componentProps: {
                  options : []
                }
              }} />


            <div className='flex col-12' style={{ paddingLeft: 0 }}>
              <div className='col-6'>
                <div style={{ marginBottom: 15 }}>Invoice Description</div>
                <FormField label="" name="refnumber"
                  leftSpan={1}
                  rightSpan={10}
                  control={control} errors={errors} formItem={{
                    component: InputTextarea,
                    componentProps: {
                      maxLength: 25,
                      rows: 4
                    }
                  }} />
              </div>
              <div className='col-6'>
                <FormField label="Invoice Amount" name="refnumber"
                  leftSpan={4}
                  rightSpan={6}
                  control={control} errors={errors} formItem={{
                    component: InputText,
                    componentProps: {
                      maxLength: 25
                    }
                  }} />
                <br />
                <FormField label="TDS" name="refnumber"
                  leftSpan={4}
                  rightSpan={6}
                  control={control} errors={errors} formItem={{
                    component: InputText,
                    componentProps: {
                      maxLength: 25
                    }
                  }} />
              </div>
            </div>
          </div>
        </div>

      </div>

    )
  }


  return (
    <>
      <Dialog
        header={`Create Contractor Invoice`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        draggable={false} resizable={false} closable
      >
        <ManageLayout
          baseRoute="/payment/contractorpayment"
          bottomControl
          data={poData}
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
