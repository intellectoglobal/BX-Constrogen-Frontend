import React, { useEffect, useRef, useState } from 'react'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import {
  ManageLayout,
  useToast,
  ManageLayoutHandle,
  FormField,
} from '@igblsln/control';
import { useAddInvoiceMutation } from '../api';
import {
  formatDate,
  AFTER_API_TIME,
  getClientProps,
  useGetNextDocNoQuery,
  useGetModeOfPaymentsQuery,
  useGetAllCompaniesQuery
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';

type Props = {
  displayModal: boolean,
  customDiscard: any,
}

export default function AdditionalInvoiceDetailModal({ displayModal, customDiscard }: Props) {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [docStatus, setDocStatus] = useState<any>("S")
  const [selectedTDS, setSelectedTDS] = useState<any>('')
  const [action, setAction] = useState<any>("SAVE")
  const manageLayoutRef1 = useRef<ManageLayoutHandle>();
  const [poData, setPoData] = useState({});

  const clientProps = getClientProps();

  const { data: docData, error, isFetching: isDocDataFetched } = useGetNextDocNoQuery("PYV", { refetchOnMountOrArgChange: true })

  const [addTDSPayment, { isLoading: isAdding }] = useAddInvoiceMutation()


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
      }
      console.log(body)
      let resp: any;
      resp = await addTDSPayment({ ...body, ...clientProps }).unwrap();
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
      <>
        <div className='pl-4 pt-4'>


          <FormField label="Voucher No" name="refnumber"
            leftSpan={3}
            rightSpan={6}
            required
            control={control} errors={errors} formItem={{
              component: InputText,
              componentProps: {
                maxLength: 25
              }
            }} />

          <FormField label="Notes" name="notes"
            leftSpan={3}
            rightSpan={6}
            control={control} errors={errors} formItem={{
              component: InputText,
              componentProps: {
                maxLength: 255
              }
            }} />

        </div>
      </>

    )
  }


  return (
    <>
      <Dialog
        header={`Success`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '30vw' }}
        onHide={() => customDiscard()}
        draggable={false} resizable={false} closable
      >
        {/* <ManageLayout
          baseRoute="/payment/tdspayment"
          bottomControl
          data={poData}
          hideHeader
          customDiscard={customDiscard}
          ref={manageLayoutRef1}
          isUpdating={isAdding || showingToast}
          onSubmit={onSubmit}
          renderForm={renderForm}
          saveBtnLabel={"Ok"}
          discardBtnLabel='Skip'
        /> */}
        <h3>Invoice Generated Successfully</h3>
      </Dialog>
    </>
  )
}
