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
import { useAddVendorPaymentMutation, useUpdateVendorPaymentMutation, useGetVendorPaymentQuery, useUpdatePaymentAllocationMutation, useGetVendorQuery } from '../../../VendorPayment/vendorPaymentApi';
import {
  formatDate,
  useActiveVendorsQuery,
  useInvoiceForVendorQuery,
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
  vendorId: any;
  customDiscard: any,
}

export default function VendorPaymentModal({ displayModal, vendorId, customDiscard }: Props) {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [docStatus, setDocStatus] = useState<any>("S")
  const [selectedVendor, setSelectedVendor] = useState<any>(vendorId)
  const [action, setAction] = useState<any>("SAVE")
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const [poData, setPoData] = useState({});

  const clientProps = getClientProps();

  const { data: selectedVendorData } = useGetVendorQuery(vendorId, {
    skip: !vendorId,
    refetchOnMountOrArgChange: true
  })

  const [balanceAmount, setBalanceAmount] = useState<any>(null)
  const [selectedModeOfPay, setSelectedModeOfPay] = useState<any>('Online')

  const { data, isLoading } = useGetVendorPaymentQuery(vendorId, {
    refetchOnMountOrArgChange: true
  })

  const { data: invoices, isFetching: invoicesFetching, refetch: refetchInvoiceForVendor } = useInvoiceForVendorQuery(vendorId, { skip: !vendorId, refetchOnMountOrArgChange: true })

  const { data: docData, error, isFetching: isDocDataFetched } = useGetNextDocNoQuery("PYV", { refetchOnMountOrArgChange: true })
  const { data: vendors, isLoading: vendorsFetching } = useActiveVendorsQuery()
  const { data: modeOfPayments, isLoading: modeOfPaymentsFetching } = useGetModeOfPaymentsQuery({})

  const { data: companies, isFetching: companiesFetching } = useGetAllCompaniesQuery()

  const [addVendorPayment, { isLoading: isAdding }] = useAddVendorPaymentMutation()

  useEffect(() => {
    if (vendors) {
      let temp = vendors?.filter(d => d.key === vendorId)[0]?.name || ""
      setSelectedVendor(temp)
    }
  }, [vendors, vendorId])

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
    if (selectedVendorData) {
      let temp = selectedVendorData.invoice_list
        ?.map((x: any) => parseFloat(x.balamt || 0))
        .reduce((partialSum: number, a: number) => partialSum + a, 0)
      setBalanceAmount(temp)
    }
  }, [selectedVendorData])

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

        <FormField label="Vendor Name" name="vend_key"
          leftSpan={3}
          rightSpan={4}
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25,
              disabled: true,
              value: selectedVendor
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
          false && vendorId &&
          <Accordion style={{ marginBottom: 20 }}>
            <AccordionTab header="Invoice Details">
              <ListLayout
                baseRoute={`/payment/vendorpayment`}
                description={"Vendor Payment"}
                isLoading={isLoading}
                // data={selectedVendorData?.invoice_list?.filter(d => !!d.balamt)}
                data={selectedVendorData?.invoice_list}
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

        <FormField label="Bill Status"
          required
          name="bill_status"
          control={control}
          errors={errors}
          useExplicit
          leftSpan={3}
          rightSpan={4}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              options: ["Paid", "Unpaid", "Partially Paid"]
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
        header={`Make Vendor Payment`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        draggable={false} resizable={false} closable
      >
        <ManageLayout disableSaveBtn={getSaveBtnDisableStatus()}
          baseRoute="/payment/vendorpayment"
          id={vendorId}
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
