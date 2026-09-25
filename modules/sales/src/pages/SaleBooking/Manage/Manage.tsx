import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { confirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { NumericFormat } from 'react-number-format';
import { ManageLayout, getFormErrorMessage, useToast, ManageLayoutHandle, FormField } from '@igblsln/control';
import { useAddSaleBookingMutation, useUpdateSaleBookingMutation, useGetSaleBookingQuery } from '../saleBookingApi';
import {
  formatDate,
  AFTER_API_TIME,
  getClientProps,
  useGetModeOfPaymentsQuery,
  useGetNextDocNoQuery,
  useActiveCustomersQuery,
  useActiveProjectQuery,
  useAvailableUnitsForProjectQuery,
  convertDateValue,
  defaultDateFormat
} from '@igblsln/store';

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [docStatus, setDocStatus] = useState<any>("S")
  const [action, setAction] = useState<any>("SAVE")
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageLayoutRef = useRef<ManageLayoutHandle>();

  const clientProps = getClientProps();

  const [formData, setFormData] = useState({});


  const [selectedModeOfPay, setSelectedModeOfPay] = useState<any>('')
  const [selectedProject, setSelectedProject] = useState<any>(null)

  const { data, isLoading } = useGetSaleBookingQuery(id, {
    skip: isNew,
    refetchOnMountOrArgChange: true
  })

  const [selectedBookingDate, setSelectedBookingDate] = useState<any>(isNew ? new Date() : new Date(data?.date))
  const [dueDate, setDueDate] = useState<any>(new Date())

  const { data: docData} = useGetNextDocNoQuery("SLB", { skip: !isNew, refetchOnMountOrArgChange: isNew })
  const { data: projects, isLoading: projectsFetching } = useActiveProjectQuery()
  const { data: customers, isLoading: customersFetching } = useActiveCustomersQuery()
  const { data: units, isLoading: unitsFetching } = useAvailableUnitsForProjectQuery({ id: selectedProject }, { skip: !selectedProject })
  const { data: modeOfPayments} = useGetModeOfPaymentsQuery({})

  const [addSaleBooking, { isLoading: isAdding }] = useAddSaleBookingMutation()
  const [updateSaleBooking, { isLoading: isUpdating }] = useUpdateSaleBookingMutation();

  useEffect(() => {
    setFormData(data || {
      ...clientProps,
      date: convertDateValue(new Date(), true),
      docid: "SLB",
      number: docData?.next_doc_id,
      loctyp: 'PR'
    })
    if (data) {
      setSelectedBookingDate(data.date)
      setSelectedProject(data.proj_key)
    }
  }, [data, docData])

  useEffect(() => {
    let result = new Date(selectedBookingDate);
    result.setDate(result.getDate() + 30);
    setDueDate(result)
  }, [selectedBookingDate])

  const onSubmit = async (values: any) => {
    try {
      let body = {
        ...values,
        number: isNew ? docData?.next_doc_id : data?.number,
        date: formatDate(selectedBookingDate, 'yyyy-MM-dd'),
        validtodate: formatDate(dueDate, 'yyyy-MM-dd'),
        docstatus: docStatus,
        docid: "SLB",
        chqdate: values.chqdate && formatDate(values.chqdate, 'yyyy-MM-dd'),
        action: action,
      }
      let resp: any;
      if (isNew) {
        resp = await addSaleBooking({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateSaleBooking({ ...body, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate("/sales/salebooking")
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }


  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>

      <FormField label="Booking Number" name="number" className="col-12 md:col-6" control={control} errors={errors}
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            useGrouping: false,
            disabled: true,
            value: data?.number || docData?.next_doc_id
          }
        }} />

      <FormField label="Booking Date" name="date" className="col-12 md:col-6" useExplicit control={control} errors={errors}
        required
        leftSpan={4}
        rightSpan={6}
        convertValue={convertDateValue}
        onChange={(e: any) => {
          setSelectedBookingDate(e.value)
        }}
        formItem={{
          component: Calendar,
          componentProps: {
            showIcon: true,
            dateFormat: defaultDateFormat
          }
        }} />

      <FormField label="Customer" name="cust_key" className="col-12 md:col-6" control={control} errors={errors}
        isLoading={customersFetching}
        required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear : true,
            optionLabel: "name",
            optionValue: "key",
            filter: true,
            filterBy: "name",
            options: customers
          }
        }} />

      <FormField label="Project" name="proj_key" className="col-12 md:col-6" control={control} errors={errors}
        isLoading={projectsFetching}
        required={"Select a Project"}
        leftSpan={4}
        rightSpan={6}
        useExplicit
        onChange={(e:any)=>{
          setSelectedProject(e.value)
        }}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear : true,
            optionLabel: "name",
            optionValue: "key",
            filter: true,
            filterBy: "name",
            options: projects
          }
        }} />

      <FormField label="Valid Until*" name="validtodate" className="col-12 md:col-6" useExplicit control={control} errors={errors}
        // required
        leftSpan={4}
        rightSpan={6}
        convertValue={convertDateValue}
        onChange={(e: any) => {
          setDueDate(e.value)
        }}
        formItem={{
          component: Calendar,
          componentProps: {
            showIcon: true,
            dateFormat: defaultDateFormat,
            value: dueDate
          }
        }} />

      <FormField label="Unit" name="projunit_key" className="col-12 md:col-6" control={control} errors={errors}
        isLoading={unitsFetching}
        required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear : true,
            optionLabel: "descr",
            optionValue: "key",
            filter: true,
            filterBy: "descr",
            options: units
          }
        }} />

      <Divider layout='horizontal' style={{ height: 2, backgroundColor: 'gray' }} />

      <div className="flex col-12">
        <div className="field grid grid-nogutter p-fluid col-9" style={{ paddingLeft: 24 }}>
          <label htmlFor="saleamt" style={{ marginRight: 3 }} className={classNames('col-4', { 'p-error': errors.saleamt })}>Sale Amount*</label>
          <div className="input-field">
            <Controller name="saleamt" control={control} rules={{ required: { value: true, message: 'Enter Sale Amount' } }} render={({ field }) => (
              <NumericFormat
                id={field.name}
                maxLength={12}
                thousandSeparator={true}
                {...field}
                style={{ width: '100%',textAlign : 'right' }}
                onValueChange={(e) => {
                  field.onChange(parseInt(e.value))
                }}
                className={classNames('p-inputtext p-component')}
              />
            )} />
            {getFormErrorMessage(errors?.saleamt?.message)}
          </div>

        </div>

      </div>

      <div className="flex col-12">
        <div className="field grid grid-nogutter p-fluid col-9" style={{ paddingLeft: 24 }}>
          <label htmlFor="bookingamt" style={{ marginRight: 3 }} className={classNames('col-4', { 'p-error': errors.bookingamt })}>Booking Amount*</label>
          <div className="input-field">
            <Controller name="bookingamt" control={control} rules={{ required: { value: true, message: 'Enter Booking Amount' } }} render={({ field }) => (
              <NumericFormat
                id={field.name}
                maxLength={12}
                thousandSeparator={true}
                {...field}
                style={{ width: '100%',textAlign : 'right' }}
                onValueChange={(e) => {
                  field.onChange(parseInt(e.value))
                }}
                className={classNames('p-inputtext p-component')}
              />
            )} />
            {getFormErrorMessage(errors?.bookingamt?.message)}
          </div>

        </div>

      </div>

      <FormField label="Mode Of Payment"
        required
        name="modeofpay"
        control={control}
        errors={errors}
        leftSpan={3}
        rightSpan={3}
        className="pl-5 col-12"
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear : true,
            optionLabel: "descr",
            optionValue: "modeofpay",
            options: modeOfPayments,
          }
        }} />

      <FormField label="Bank Name" name="bankname"
        leftSpan={3}
        rightSpan={4}
        className="pl-5 col-12"
        control={control} errors={errors} formItem={{
          component: InputText,
          componentProps: {
            maxLength: 25
          }
        }} />

      <FormField label="Cheque No" name="chqno"
        leftSpan={3}
        rightSpan={3}
        className="pl-5 col-12"
        control={control} errors={errors} formItem={{
          component: InputText,
          componentProps: {
            maxLength: 25
          }
        }} />

      <FormField label="Cheque Date" name="chqdate" useExplicit control={control} errors={errors}
        leftSpan={3}
        rightSpan={3}
        className="pl-5 col-12"
        convertValue={convertDateValue}
        formItem={{
          component: Calendar,
          componentProps: {
            showIcon: true,
            dateFormat: defaultDateFormat
          }
        }} />

      <FormField label="Notes" name="notes"
        leftSpan={3}
        rightSpan={8}
        className="pl-5 pb-3 col-12"
        control={control} errors={errors} formItem={{
          component: InputText,
          componentProps: {
            maxLength: 255
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


  return (
    <>
      <ManageLayout disableSaveBtn={getSaveBtnDisableStatus()}
        baseRoute="/sales/salebooking"
        description="Sale Booking"
        id={id}
        data={formData}
        ref={manageLayoutRef}
        isUpdating={isAdding || isUpdating || showingToast}
        moreSubmitItems={
          <>
            <Button
              label='Submit'
              disabled={getSubmitBtnDisableStatus()}
              style={{ paddingRight: 20 }}
              className="p-button-plain ml-3 mr-3"
              onClick={(e) => {
                e.preventDefault()
                let isDirty = manageLayoutRef.current?.getIsDirty();
                if (isDirty) {
                  confirmDialog({
                    message: 'Do you want to save the changes before submit?',
                    header: 'Confirmation',
                    icon: 'pi pi-exclamation-triangle',
                    accept: () => onCustomSubmit("U", "SUBMIT_WITH_SAVE"),
                    reject: () => onCustomSubmit("U", "SUBMIT_WITHOUT_SAVE")
                  })
                }
                else {
                  onCustomSubmit("U", "SUBMIT_WITH_SAVE")
                }
              }}
            />
            <Button
              label='Cancel'
              disabled={isNew || getCancelBtnDisableStatus()}
              className='p-button-plain'
              onClick={e => {
                setDocStatus("C")
                setAction("CANCEL")
                return true
              }}
            />
          </>
        }
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage