import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { classNames } from 'primereact/utils';
import { confirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { NumericFormat } from 'react-number-format';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';
import {
  ManageLayout,
  getFormErrorMessage,
  useToast,
  ManageLayoutHandle,
  FormField,
  ListLayout,
  Datacolumn,
  CheckboxFormatter
} from '@igblsln/control';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useAddVendorPaymentMutation, useUpdateVendorPaymentMutation, useGetVendorPaymentQuery, useUpdatePaymentAllocationMutation, useGetVendorQuery } from '../vendorPaymentApi';
import ManageItem, { ManageItemHandle } from './ManageItem'
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

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [displayModal, setDisplayModal] = useState(false);
  const [itemsTableChanged, setItemsTableChanged] = useState(false)
  const [docStatus, setDocStatus] = useState<any>("S")
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [action, setAction] = useState<any>("SAVE")
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageItemRef = useRef<ManageItemHandle>();
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const [poData, setPoData] = useState({});

  const clientProps = getClientProps();

  const { data: selectedVendorData } = useGetVendorQuery(selectedVendor, {
    skip: !selectedVendor,
    refetchOnMountOrArgChange: true
  })

  const [balanceAmount, setBalanceAmount] = useState<any>(null)
  const [selectedModeOfPay, setSelectedModeOfPay] = useState<any>('')

  const { data, isLoading } = useGetVendorPaymentQuery(id, {
    skip: isNew,
    refetchOnMountOrArgChange: true
  })

  const { data: invoices, isFetching: invoicesFetching, refetch: refetchInvoiceForVendor } = useInvoiceForVendorQuery(selectedVendor, { skip: !selectedVendor, refetchOnMountOrArgChange: true })

  const [paymentAllocation, setPaymentAllocation] = useState<any>(invoices || []);

  const { data: docData, error, isFetching: isDocDataFetched } = useGetNextDocNoQuery("PYV", { skip: !isNew, refetchOnMountOrArgChange: isNew })
  const { data: vendors, isLoading: vendorsFetching } = useActiveVendorsQuery()
  const { data: modeOfPayments, isLoading: modeOfPaymentsFetching } = useGetModeOfPaymentsQuery({})

  const { data: companies, isFetching: companiesFetching } = useGetAllCompaniesQuery()

  const [addVendorPayment, { isLoading: isAdding }] = useAddVendorPaymentMutation()
  const [updateVendorPayment, { isLoading: isUpdating }] = useUpdateVendorPaymentMutation();
  const [updatePaymentAllocation, { isLoading: isPaymentAllocUpdating }] = useUpdatePaymentAllocationMutation();

  useEffect(() => {
    if (state) {
      setSelectedVendor(state?.vendor)
    }
  }, [])

  useEffect(() => {
    if (invoices) {
      setPaymentAllocation(invoices.map(d => {
        return {
          apply: false,
          invoicedate: d.invoicedate,
          vendinv_key: d.key,
          invamt: d.invamt,
          balamt: d.balamt,
          allocamt: d.amtallocated,
          status: d?.status?.descr
        }
      }))
    }
  }, [invoicesFetching])

  useEffect(() => {
    setPoData(data || {
      ...clientProps,
      date: convertDateValue(new Date(), true),
      docid: "PYV",
      number: docData?.next_doc_id,
      loctyp: 'PR'
    })
    if (data) {
      setSelectedVendor(data.vend_key)
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
        number: isNew ? docData?.next_doc_id : data?.number,
        date: formatDate(values.date, 'yyyy-MM-dd'),
        docstatus: docStatus,
        docid: "PYV",
        chqdate: values.chqdate && formatDate(values.chqdate, 'yyyy-MM-dd'),
        action: action,
        modeofpay: selectedModeOfPay
      }
      console.log(body)
      let resp: any;
      if (isNew) {
        resp = await addVendorPayment({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateVendorPayment({ ...body, ...clientProps, key: data?.key }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate("/payment/vendorpayment")
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
                ["Cheque", "Cash", "Online", "Miscelleneous"].map((d) => (
                  <div key={d} className="field m-auto" style={{ width: '25%' }}>
                    <div className="field-radiobutton" onClick={() => {
                      setSelectedModeOfPay(d)
                    }}>
                      <RadioButton
                        name={d}
                        value={d}
                        checked={selectedModeOfPay === d}
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

        <div className="flex">
          <div className="field grid grid-nogutter p-fluid col-9" style={{ paddingLeft: 0 }}>
            <label htmlFor="vend_key" style={{ marginRight: 3 }} className={classNames('col-4', { 'p-error': errors.paidamt })}>Vendor Name*</label>
            <div className="input-field" style={{ width: '50%' }}>
              <Controller name="vend_key" control={control} rules={{ required: { value: isNew && !selectedVendor, message: 'Select a Vendor' } }} render={({ field }) => (
                <Dropdown
                  id={field.name}
                  {...field}
                  // showClear={true}
                  optionLabel={"name"}
                  optionValue={"key"}
                  filter={true}
                  onChange={(e) => {
                    setSelectedVendor(e.value)
                    if (!!!e.value) {
                      setBalanceAmount(null)
                    }
                    field.onChange(e)
                  }}
                  value={selectedVendor}
                  disabled={!!state?.vendor}
                  style={{ width: '90%', marginBottom: 0 }}
                  filterBy={"name"}
                  options={vendors}
                  className={classNames('p-inputtext p-component col-12')}
                />
              )} />
              {getFormErrorMessage(errors?.vend_key?.message)}
            </div>

          </div>
          <div className="field col-5" style={{ marginBottom: 0, display : 'none' }}>
            <FormField
              label="Pending Amount"
              name="pendingamt"
              control={control} errors={errors}
              formItem={{
                component: InputNumber,
                componentProps: {
                  disabled: true,
                  value: balanceAmount
                }
              }} />
          </div>
        </div>

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

        {/* <FormField label="Payment No" name="number" control={control} errors={errors}
          leftSpan={3}
          rightSpan={4}
          formItem={{
            component: InputText,
            componentProps: {
              useGrouping: false,
              disabled: true
            }
          }} /> */}



        {
          selectedVendor &&
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

        {/* <FormField label="Mode Of Payment"
          required
          name="modeofpay"
          control={control}
          errors={errors}
          leftSpan={3}
          rightSpan={5}
          useExplicit
          onChange={(e: any) => {
            setSelectedModeOfPay(e.value)
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "modeofpay",
              options: modeOfPayments
            }
          }} /> */}

        {/* <div className="flex">
          <div className="field grid grid-nogutter p-fluid col-9" style={{ paddingLeft: 0 }}>
            <label htmlFor="paidamt" style={{ marginRight: 3 }} className={classNames('col-4', { 'p-error': errors.paidamt })}>Paid Amount*</label>
            <div className="input-field">
              <Controller
                name="paidamt"
                control={control}
                rules={{
                  required: { value: true, message: 'Enter Paid Amount' }

                }} render={({ field }) => (
                  <NumericFormat
                    id={field.name}
                    maxLength={12}
                    thousandSeparator={true}
                    {...field}
                    style={{ width: '100%' }}
                    isAllowed={(values) => {
                      const { formattedValue, floatValue } = values;
                      //@ts-ignore
                      return formattedValue === "" || floatValue <= balanceAmount;
                    }}
                    disabled={!!!selectedVendor}
                    onValueChange={(e) => {
                      console.log(e.value)
                      field.onChange(e.value)
                    }}
                    className={classNames('p-inputtext p-component')}
                  />
                )} />
              {getFormErrorMessage(errors?.paidamt?.message)}
            </div>

          </div>
          <div className="field col-5">
            <Button
              label='Amount Allocation'
              className='p-button-plain'
              loading={invoicesFetching}
              disabled={isNew}
              style={{ display: 'none' }}
              onClick={e => {
                e.preventDefault()
                setDisplayModal(true)
              }}
            />
          </div>
        </div> */}

        {/* <FormField label="Bank Name" name="bankname"
          leftSpan={3}
          rightSpan={4}
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }} />

        <FormField label="Cheque No" name="chqno"
          leftSpan={3}
          rightSpan={4}
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }} />

        <FormField label="Cheque Date" name="chqdate" useExplicit control={control} errors={errors}
          leftSpan={3}
          rightSpan={4}
          convertValue={convertDateValue}
          formItem={{
            component: Calendar,
            componentProps: {
              showIcon: true,
              dateFormat: defaultDateFormat
            }
          }} /> */}

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

  const getCancelBtnDisableStatus = () => {
    let disableConditions = ['R', 'I', 'C']
    return disableConditions.includes(data?.docstatus)
  }

  const getSubmitBtnDisableStatus = () => {
    return data?.docstatus !== "S"
  }

  const onCustomSubmit = async (docStatus: any, action: any) => {
    await setDocStatus(docStatus)
    await setAction(action)
    document.getElementById('submit')?.click()
  }

  const onHide = () => {
    setDisplayModal(false)
  }

  const savePaymentAllocation = async (e: any) => {
    e.preventDefault()
    try {
      let body = {
        pay_key: data?.key,
        payment_allocations: manageItemRef.current?.getItems()
      }
      let resp: any;
      resp = await updatePaymentAllocation({ ...body, ...clientProps }).unwrap();
      showSuccess('Success', resp.detail);
      refetchInvoiceForVendor()
      onHide()
    } catch (error) {
      showError('An error occurred', "Something went wrong!");
    }

  }

  return (
    <>
      <Dialog
        closable
        closeOnEscape
        modal
        header="Payment Allocation"
        headerClassName="custom-modal-header"
        visible={displayModal}
        style={{ width: '75%' }}
        onHide={onHide}
      >
        <div>
          <div className="card">
            <div className="flex">
              <div className="field col-7" style={{ marginBottom: 0 }}>
                <label className={classNames('col-4')}>Vendor</label>
                <InputText style={{ width: '50%' }} value={data?.vend_key} disabled />
              </div>

              {/* <div className="field col-5" style={{ marginBottom: 0 }}>
                <label className={classNames('col-4')}>Doc Code</label>
                <InputText style={{ width: '40%' }} value={data?.docid} disabled />
              </div> */}
            </div>
            <div className="flex">
              <div className="field col-7" style={{ marginBottom: 0 }}>
                <label className={classNames('col-4')}>Payment Amount</label>
                <InputText value={data?.paidamt} disabled />
              </div>

              <div className="field col-5" style={{ marginBottom: 0 }} >
                <label className={classNames('col-4')}>Payment No</label>
                <InputText style={{ width: '40%' }} value={data?.refnumber} disabled />
              </div>
            </div>
            <div className="flex">
              <div className="field col-7" style={{ marginBottom: 0 }}>
                <label className={classNames('col-4')}>Allocated Amount</label>
                <InputText value={paymentAllocation.map((x: any) => parseFloat(x.allocamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0)} disabled />
              </div>

              <div className="field col-5" style={{ marginBottom: 0 }}>
              </div>
            </div>
            <div className="flex">
              <div className="field col-7" style={{ marginBottom: 0 }}>
                <label className={classNames('col-4')}>Remaining Amount</label>
                <InputText value={parseInt(data?.paidamt) - paymentAllocation.map((x: any) => parseFloat(x.allocamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0)} disabled />
              </div>

              <div className="field col-5" style={{ marginBottom: 0 }}>
                <React.Fragment>
                  <Button
                    label='Save'
                    style={{ paddingRight: 20 }}
                    className="p-button-warning mr-3"
                    loading={isPaymentAllocUpdating}
                    onClick={savePaymentAllocation}
                  />
                  <Button
                    label='Discard'
                    className='p-button-plain'
                    onClick={(e) => {
                      e.preventDefault()
                      onHide()
                    }}
                  />
                </React.Fragment>
              </div>
            </div>
          </div>

        </div>
        <div className="col-12">
          <ManageItem
            data={paymentAllocation}
            isLoading={isLoading}
            ref={manageItemRef}
            onChange={(data: any) => {
              !itemsTableChanged && setItemsTableChanged(true)
              setPaymentAllocation(data)
            }}
          />
        </div>


      </Dialog>
      <ManageLayout disableSaveBtn={getSaveBtnDisableStatus()}
        baseRoute="/payment/vendorpayment"
        description="Vendor Payment"
        id={id}
        bottomControl
        data={poData}
        ref={manageLayoutRef}
        isUpdating={isAdding || isUpdating || showingToast}
        // moreSubmitItems={
        //   <>
        //     <Button
        //       label='Submit'
        //       disabled={getSubmitBtnDisableStatus()}
        //       style={{ paddingRight: 20 }}
        //       className="p-button-plain ml-3 mr-3"
        //       onClick={(e) => {
        //         e.preventDefault()
        //         let isDirty = manageLayoutRef.current?.getIsDirty();
        //         if (isDirty || itemsTableChanged) {
        //           confirmDialog({
        //             message: 'Do you want to save the changes before submit?',
        //             header: 'Confirmation',
        //             icon: 'pi pi-exclamation-triangle',
        //             accept: () => onCustomSubmit("U", "SUBMIT_WITH_SAVE"),
        //             reject: () => onCustomSubmit("U", "SUBMIT_WITHOUT_SAVE")
        //           })
        //         }
        //         else {
        //           onCustomSubmit("U", "SUBMIT_WITH_SAVE")
        //         }
        //       }}
        //     />
        //     <Button
        //       label='Cancel'
        //       disabled={isNew || getCancelBtnDisableStatus()}
        //       className='p-button-plain'
        //       onClick={e => {
        //         setAction("CANCEL")
        //         setDocStatus("C")
        //         return true
        //       }}
        //     />
        //   </>
        // }
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage