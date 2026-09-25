import React, { useEffect, useRef, useState } from 'react'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import {
  ManageLayout,
  useToast,
  ManageLayoutHandle,
  FormField,
  ListLayout,
  Datacolumn,
} from '@igblsln/control';
import { useAddContractorPaymentMutation, useUpdateContractorPaymentMutation, useGetContractorPaymentQuery, useUpdatePaymentAllocationMutation } from '../api';
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
  ViewModalBorderRadius
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';

type Props = {
  displayModal: boolean,
  contractorId: any;
  customDiscard: any,
}

export default function ContractorPaymentModal({ displayModal, contractorId, customDiscard }: Props) {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [docStatus, setDocStatus] = useState<any>("S")
  const [selectedContractor, setSelectedContractor] = useState<any>(contractorId)
  const [action, setAction] = useState<any>("SAVE")
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const [poData, setPoData] = useState({});

  const clientProps = getClientProps();

  const selectedContractorData = {}
  const [balanceAmount, setBalanceAmount] = useState<any>(null)
  const [selectedModeOfPay, setSelectedModeOfPay] = useState<any>('Online')

  const { data, isLoading } = useGetContractorPaymentQuery(contractorId, {
    refetchOnMountOrArgChange: true
  })

  const { data: invoices, isFetching: invoicesFetching, refetch: refetchInvoiceForContractor } = useInvoiceForContractorQuery(contractorId, { skip: !contractorId, refetchOnMountOrArgChange: true })

  const { data: docData, error, isFetching: isDocDataFetched } = useGetNextDocNoQuery("PYV", { refetchOnMountOrArgChange: true })
  const { data: contractors, isLoading: contractorsFetching } = useActiveContractorsQuery()
  const { data: modeOfPayments, isLoading: modeOfPaymentsFetching } = useGetModeOfPaymentsQuery({})

  const { data: companies, isFetching: companiesFetching } = useGetAllCompaniesQuery()

  const [addContractorPayment, { isLoading: isAdding }] = useAddContractorPaymentMutation()

  useEffect(() => {
    if (contractors) {
      let temp = contractors?.filter(d => d.key === contractorId)[0]?.name || ""
      setSelectedContractor(temp)
    }
  }, [contractors, contractorId])

  useEffect(() => {
    setPoData(data || {
      ...clientProps,
      date: convertDateValue(new Date(), true),
      docid: "PYV",
      number: docData?.next_doc_id,
      loctyp: 'PR'
    })
    if (data) {
      setSelectedModeOfPay(data?.modeofpay)
    }
  }, [data, docData])

  useEffect(() => {
    if (selectedContractorData) {
      let temp = []?.map((x: any) => parseFloat(x.balamt || 0))
        .reduce((partialSum: number, a: number) => partialSum + a, 0)
      setBalanceAmount(temp)
    }
  }, [selectedContractorData])

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

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>

      <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>

        <FormField label="Date" name="date" className="col-12 md:col-6" useExplicit control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
            }
          }} />

        <FormField label="ID" name="id" className="col-12 md:col-6" useExplicit control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
            }
          }} />

        <FormField label="Company Name" name="proj_key" className="col-12 md:col-6" control={control} errors={errors}
          // required={"Select a Project"}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 50
            }
          }} />

        <FormField label="Account Name" name="proj_key" className="col-12 md:col-6" control={control} errors={errors}
          // required={"Select a Project"}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 50
            }
          }} />


        {/* <FormField label="Invoice Type" name="descr7" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 50
            }
          }}
        /> */}

        <FormField label="Payment Mode" name="descr2" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 50
            }
          }}
        />

        <FormField label="Transaction Detail" name="descr2" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 50
            }
          }}
        />

        <FormField label="Amount" name="descr2" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 50
            }
          }}
        />

        <FormField label="Notes" name="descr8" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 50
            }
          }}
        />

        <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
          {/* <h3 className={'m-0 my-auto'} >{"Selected Invoices To Be Paid"}</h3> */}
          <ListLayout description="Selected Invoices To Be Paid"
            data={[]}
            newTable
            showHeader
            hideAddButton
            hideActionColumn
            tableLayoutClass='h-full'
            allowFilters={false}
            gridProps={{
              allowAdd: false,
            }}>
            <Datacolumn field="date" header="Date" type="text" defaultValue={""} />
            <Datacolumn field="project" header="Vendor Name" type="text" defaultValue={1} />
            <Datacolumn field="project" header="Project Name" type="text" defaultValue={1} />
            <Datacolumn field="amount" header="TDS Paid" type="currency" defaultValue={0} />
          </ListLayout>
        </div>

      </div>

    </div>)
  }

  const getSaveBtnDisableStatus = () => {
    let disableConditions = ['U', 'R', 'I', 'C']
    return disableConditions.includes(data?.docstatus)
  }


  return (
    <>
      <Dialog
        header={`View Voucher`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        draggable={false} resizable={false} closable
      >
        <ManageLayout disableSaveBtn={getSaveBtnDisableStatus()}
          baseRoute="/payment/contractorpayment"
          id={contractorId}
          bottomControl
          data={poData}
          hideHeader
          viewMode
          saveBtnLabel='Pay'
          customDiscard={customDiscard}
          ref={manageLayoutRef}
          isUpdating={isAdding || showingToast}
          isLoading={isLoading}
          onSubmit={onSubmit}
          renderForm={renderForm}
        />
        <Button
          style={{
            margin: 'auto',
            marginTop: 10,
            display: 'flex',
            width: 150
          }}
          label="Close"
          onClick={() => customDiscard()}
        />
      </Dialog>
    </>
  )
}
