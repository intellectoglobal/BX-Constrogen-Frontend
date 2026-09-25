import React, { useEffect, useRef, useState } from 'react'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { classNames } from 'primereact/utils';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import {
  ManageLayout,
  getFormErrorMessage,
  useToast,
  ManageLayoutHandle,
  FormField,
  ListLayout,
  Datacolumn,
} from '@igblsln/control';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useAddContractorPaymentMutation, useUpdateContractorPaymentMutation, useGetContractorPaymentQuery, useUpdatePaymentAllocationMutation } from '../../../ContractorPayment/contractorPaymentApi';
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
  defaultDateFormat
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';
import { useGetVendorQuery } from '../../../VendorPayment/vendorPaymentApi';

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

  const { data: selectedContractorData } = useGetVendorQuery(contractorId, {
    skip: !contractorId,
    refetchOnMountOrArgChange: true
  })

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
      console.log(contractors)
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
      let temp = selectedContractorData.invoice_list
        ?.map((x: any) => parseFloat(x.balamt || 0))
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

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: any, setValue: UseFormSetValue<any>) => {
    return (
      <div className='pl-8 col-10'>

        <div className="flex">
          <FormField
            label="Company Name"
            name="company_name"
            className="col-12 md:col-9 pl-0"
            required
            control={control}
            errors={errors}
            isLoading={companiesFetching}
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionLabel: "name",
                optionValue: "id",
                filter: true,
                filterBy: "name",
                options: companies,
              }
            }} />

          <div className="field col-5" style={{ marginBottom: 0 }}>
            <FormField label="Account Name"
              required
              name="account_name"
              control={control}
              errors={errors}
              useExplicit
              leftSpan={5}
              rightSpan={7}
              formItem={{
                component: Dropdown,
                componentProps: {
                  showClear: true,
                  optionLabel: "descr",
                  optionValue: "modeofpay",
                  options: modeOfPayments
                }
              }} />
          </div>
        </div>

        <div className="flex">
          <div className="field grid grid-nogutter p-fluid col-12" style={{ paddingLeft: 0, marginBottom: 3 }}>
            <label htmlFor="modeofpay" style={{ marginRight: 3 }} className={classNames('col-3')}>Mode of Payment</label>
            <div className="flex col-8 m-auto">
              {
                ["Online", "Cheque", "Cash", "Miscelleneous"].map((d) => (
                  <div key={d} className="field m-auto" style={{ width: '25%' }}>
                    <div className="field-radiobutton" onClick={() => {
                      setSelectedModeOfPay(d)
                    }}>
                      <RadioButton
                        name={d}
                        value={d}
                        checked={selectedModeOfPay === d}
                        // defaultChecked={d === "Online"}
                      />
                      <label style={{ cursor: 'pointer' }}>{d}</label>
                    </div>
                  </div>
                ))
              }
            </div>

          </div>
          <div className="field col-5">
          </div>
        </div>

        <FormField label="Contractor Name" name="vend_key"
          leftSpan={3}
          rightSpan={4}
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25,
              disabled: true,
              value: selectedContractor
            }
          }} />

        <FormField label="Date of Payment" name="date" useExplicit control={control} errors={errors}
          leftSpan={3}
          rightSpan={4}
          required
          convertValue={convertDateValue}
          formItem={{
            component: Calendar,
            componentProps: {
              showIcon: true,
              dateFormat: defaultDateFormat
            }
          }} />


        <FormField label="Amount" name="paidamt"
          leftSpan={3}
          rightSpan={4}
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }} />


        {
          false && contractorId &&
          <Accordion style={{ marginBottom: 20 }}>
            <AccordionTab header="Invoice Details">
              <ListLayout
                baseRoute={`/payment/contractorpayment`}
                description={"Contractor Payment"}
                isLoading={isLoading}
                // data={selectedContractorData?.invoice_list?.filter(d => !!d.balamt)}
                data={selectedContractorData?.invoice_list}
                newTable
                hideActionColumn
                tableLayoutClass='h-full'
                allowFilters={false}
              >
                <Datacolumn field="project" header="Project" type="text" />
                <Datacolumn field="invoicedate" header="Invoice Date" type="text" />
                <Datacolumn field="invamt" header="Invoice Amount" type="currency" />
                <Datacolumn field="invoiceno" header="Invoice No" type="text" />
                <Datacolumn field="select" header="Select" type="checkbox" />
                {/* <Datacolumn field="balamt" header="Balance Amount" type="currency" /> */}
              </ListLayout>
            </AccordionTab>
          </Accordion>
        }


        <FormField label="Voucher No" name="refnumber"
          leftSpan={3}
          rightSpan={4}
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }} />

        <FormField label="Description" name="notes"
          leftSpan={3}
          rightSpan={8}
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }} />


      </div>)
  }

  const getSaveBtnDisableStatus = () => {
    let disableConditions = ['U', 'R', 'I', 'C']
    return disableConditions.includes(data?.docstatus)
  }


  return (
    <>
      <Dialog
        header={`Make Contractor Payment`}
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
          customDiscard={customDiscard}
          ref={manageLayoutRef}
          isUpdating={isAdding || showingToast}
          isLoading={isLoading}
          onSubmit={onSubmit}
          renderForm={renderForm}
        />
      </Dialog>
    </>
  )
}
