import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { ManageLayout, useToast, ManageLayoutHandle, FormField } from '@igblsln/control';
import { useAddInvoiceMutation, useUpdateInvoiceMutation, useGetInvoiceQuery } from '../api';
import { AFTER_API_TIME, defaultDateFormat, getClientProps, useGetAllItemTypesQuery, useGetItemTypesForVendorQuery } from '@igblsln/store'
import {
  formatDate,
  convertDateValue,
  useGetNextDocNoQuery,
  useGetActiveProjectsQuery,
} from '@igblsln/store';


type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [poData, setPoData] = useState({});
  const [docStatus, setDocStatus] = useState<any>("S")
  const [action, setAction] = useState<any>("SAVE")
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageLayoutRef = useRef<ManageLayoutHandle>();

  const clientProps = getClientProps();

  const { data, isLoading } = useGetInvoiceQuery(id, {
    skip: isNew,
    refetchOnMountOrArgChange: true
  })

  // const { data: pTemplate } = useListInvoiceTemplateQuery({})

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [gridData, setGridData] = useState<any[]>([])
  const [selectedItemType, setSelectedItemType] = useState<any>(null)
  const [selectedTDS, setSelectedTDS] = useState<any>(null)
  const [addTDSInvoice, { isLoading: isTDSInvoiceAdding }] = useAddInvoiceMutation()

  const { data: docData } = useGetNextDocNoQuery("Invoice", { skip: !isNew, refetchOnMountOrArgChange: isNew })
  const { data: tdsInvoiceNo } = useGetNextDocNoQuery("VCI", { skip: isNew, refetchOnMountOrArgChange: !isNew })
  const { data: projects, isLoading: projectsFetching } = useGetActiveProjectsQuery({})
  // const { data: itemTypes, isFetching: itemTypeFetching } = useGetAllItemTypesQuery()
  const { data: itemTypes, isFetching: itemTypeFetching } = useGetItemTypesForVendorQuery(selectedTDS, { skip: !selectedTDS })


  const [addInvoiceOrder, { isLoading: isAdding }] = useAddInvoiceMutation()
  const [updateInvoiceOrder, { isLoading: isUpdating }] = useUpdateInvoiceMutation();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let body = {
        ...values,
        // number: isNew ? docData?.next_doc_id : data?.number,
        date: formatDate(values.date, 'yyyy-MM-dd'),
        loctyp: "PR",
        itemtyp_key: selectedItemType,
        docstatus: docStatus,
        action: action,
      }

      if (isNew) {
        resp = await addInvoiceOrder({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateInvoiceOrder({ ...body, ...clientProps, key: data?.key }).unwrap();
      }

      showSuccess('Success', resp.detail);

        showSuccess('Success', resp.detail);
        setTimeout(() => {
          navigate("/invoice/tdsinvoice")
        }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  useEffect(() => {
    setPoData(data || {
      ...clientProps,
      date: convertDateValue(new Date(), true),
      number: docData?.next_doc_id,
      loctyp: 'PR'
    })
    if (data) {
      setSelectedTDS(data.vend_key)
    }
  }, [data, docData])

  useEffect(() => {
    if (itemTypes) {
      console.log(itemTypes)
      setSelectedItemType(itemTypes[0]?.key)
    }
    else {
      setSelectedItemType(null)
    }
  }, [itemTypes])

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>

      <FormField label="Invoice Number" name="number" className="col-12 md:col-6" control={control} errors={errors}
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            useGrouping: false,
            disabled: true,
            // value: data?.number || docData?.next_doc_id
          }
        }} />

      <FormField label="Invoice Date" name="date" className="col-12 md:col-6" useExplicit control={control} errors={errors}
        leftSpan={4}
        rightSpan={6}
        convertValue={convertDateValue}
        formItem={{
          component: Calendar,
          componentProps: {
            showIcon: true,
            dateFormat: defaultDateFormat
          }
        }} />

      <FormField label="Project" name="proj_key" className="col-12 md:col-6" control={control} errors={errors}
        isLoading={projectsFetching}
        // required={"Select a Project"}
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
            options: projects
          }
        }} />

      <FormField label="Item Type"
        name="itemtyp_key"
        control={control} errors={errors}
        isLoading={itemTypeFetching}
        className="col-12 md:col-6"
        leftSpan={4}
        rightSpan={6}
        // required
        useExplicit
        onChange={(e: any) => {
          setSelectedItemType(e.value)
        }}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear: true,
            optionLabel: "descr",
            optionValue: "key",
            filter: true,
            // disabled : true,
            filterBy: "descr",
            options: itemTypes,
            value: selectedItemType
          }
        }} />



      <FormField label="Invoice No" name="invoice_no" className="col-12 md:col-6" control={control} errors={errors}
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


      <FormField label="Description" name="descr" className="col-12 md:col-6" control={control} errors={errors}
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

      <div className="col-12 md:col-6"></div>


    </div>)
  }

  const getSaveBtnDisableStatus = () => {
    // return false
    let disableConditions = ['U', 'R', 'C']
    return disableConditions.includes(data?.docstatus)
  }

  const getCancelBtnDisableStatus = () => {
    let disableConditions = ['R', 'C']
    return disableConditions.includes(data?.docstatus)
  }

  const getSubmitBtnDisableStatus = () => {
    // return false
    return data?.docstatus !== "S"
  }

  const onCustomSubmit = async (docStatus: any, action: any) => {
    await setDocStatus(docStatus)
    await setAction(action)
    document.getElementById('submit')?.click()
  }

  return (
    <>
      <ManageLayout
        disableSaveBtn={getSaveBtnDisableStatus()}
        baseRoute="/invoice/tdsinvoice"
        description="Invoice"
        id={id}
        data={poData}
        isUpdating={isAdding || isUpdating || isTDSInvoiceAdding}
        ref={manageLayoutRef}
        isLoading={isLoading}
        onSubmit={onSubmit}
        renderForm={renderForm}
      />
    </>
  )
}

export default Manage