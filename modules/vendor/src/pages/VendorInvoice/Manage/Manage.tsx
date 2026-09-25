import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { ManageLayout, useToast, ManageLayoutHandle, FormField, ListLayout, Datacolumn } from '@igblsln/control';
import { useAddInvoiceMutation, useGetInvoiceQuery, useUpdateInvoiceMutation } from '../invoiceApi';
import { AFTER_API_TIME, getClientProps, useActiveVendorsQuery, useInvoiceItemsForGRNQuery, convertDateValue, useGetAllItemTypesQuery, useGetItemTypesForVendorQuery, defaultDateFormat } from '@igblsln/store'
import ManageItem, { ManageItemHandle } from './ManageItem';
import {
  formatDate,
  useGetAllAPTermQuery,
  useGetActiveProjectsQuery,
  useGetGRNNumbersQuery,
  useGetNextDocNoQuery
} from '@igblsln/store';
import ManageItem2 from './ManageItem2';

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [itemsTableChanged, setItemsTableChanged] = useState(false)
  const [docStatus, setDocStatus] = useState<any>("S")
  const [action, setAction] = useState<any>("SAVE")
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageItemRef = useRef<ManageItemHandle>();
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const [selectedVendor, setSelectedVendor] = useState<any>(null)

  const clientProps = getClientProps();

  const { data, isLoading, refetch } = useGetInvoiceQuery(id, {
    skip: isNew
  })

  const [selectedGRNNo, setSelectedGRNNo] = useState<number | null>(null)
  const [gridData, setGridData] = useState<any[]>(data?.invoice_items || [])
  const [selectedItemType, setSelectedItemType] = useState<any>(null)
  const [poData, setPoData] = useState({});
  const { data: purchaseTemplateItems, isFetching: isPurchaseTemplateItemsFetching } = useInvoiceItemsForGRNQuery({ id: selectedGRNNo }, { skip: !selectedGRNNo })

  const { data: docData } = useGetNextDocNoQuery("VIN", { skip: !isNew, refetchOnMountOrArgChange: isNew })
  const { data: vendors, isLoading: vendorsFetching } = useActiveVendorsQuery()
  const { data: projects, isLoading: projectsFetching } = useGetActiveProjectsQuery({}, { refetchOnMountOrArgChange: true })
  const { data: apTerms, isLoading: apTermsFetching } = useGetAllAPTermQuery()
  const { data: grnNumbers, isLoading: grnNumbersFetching } = useGetGRNNumbersQuery({}, { refetchOnMountOrArgChange: true })

  const [selectedAPTermDays, setSelectedAPTermDays] = useState<any>(isNew ? 0 : data?.apterm_days)
  const [selectedInvoiceDate, setSelectedInvoiceDate] = useState<any>(isNew ? new Date() : new Date(data?.invoicedate))
  const [dueDate, setDueDate] = useState<any>(new Date())
  // const { data: itemTypes, isFetching: itemTypeFetching } = useGetAllItemTypesQuery()
  const { data: itemTypes, isFetching: itemTypeFetching } = useGetItemTypesForVendorQuery(selectedVendor, { skip: !selectedVendor })


  const [addInvoice, { isLoading: isAdding }] = useAddInvoiceMutation()
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();

  const onSubmit = async (values: any) => {
    let invoiceItems = manageItemRef.current?.getItems()
    let body = {
      ...values,
      vouchno: data?.vouchno || docData?.next_doc_id,
      invoicedate: formatDate(values.invoicedate, 'yyyy-MM-dd'),
      duedate: formatDate(dueDate, 'yyyy-MM-dd'),
      loctyp: "PR",
      docid: "VIN",
      docstatus: docStatus,
      action: action,
      invamt: invoiceItems?.map((x: any) => parseFloat(x.totalamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0) || 0,
      apterm_days: selectedAPTermDays,
      invoice_items: invoiceItems
    }

    try {
      let resp: any;
      if (isNew) {
        resp = await addInvoice({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateInvoice({ ...body, ...clientProps, key: data?.key }).unwrap();
      }
      // await manageItemRef.current?.saveItem({ invoice_id: resp.data.key, ...clientProps, items: [] });
      refetch()
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate("/vendor/vendorinvoice")
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  useEffect(() => {
    if (purchaseTemplateItems) {
      if (isNew) {
        setGridData(purchaseTemplateItems)
      }
      else {
        let temp = data?.invoice_items.concat(purchaseTemplateItems)
        setGridData(temp)
        setSelectedItemType(data?.itemtype_key)
      }
    }
  }, [purchaseTemplateItems])

  useEffect(() => {
    setPoData(data || {
      ...clientProps,
      invoicedate: convertDateValue(new Date(), true),
      docid: "VIN",
      vouchno: docData?.next_doc_id,
      loctyp: 'PR'
    })
    if (data) {
      setGridData(data?.invoice_items || [])
      setSelectedItemType(data?.itemtype_key)
      setSelectedVendor(data?.vend_key)
      setSelectedAPTermDays(isNew ? 0 : data?.apterm_days)
      setSelectedInvoiceDate((isNew ? new Date() : new Date(data?.invoicedate)))
    }
  }, [data, docData])

  useEffect(() => {
    let result = new Date(selectedInvoiceDate);
    result.setDate(result.getDate() + parseInt(selectedAPTermDays));
    setDueDate(result)
  }, [selectedAPTermDays, selectedInvoiceDate])

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>


      <FormField label="Invoice No" name="invoiceno" className="col-12 md:col-6"
        leftSpan={4}
        rightSpan={6}
        required
        control={control} errors={errors} formItem={{
          component: InputText,
          componentProps: {
            maxLength: 25
          }
        }} />

      <FormField label="Invoice Date" name="invoicedate" className="col-12 md:col-6" useExplicit control={control} errors={errors}
        leftSpan={4}
        rightSpan={6}
        required
        convertValue={convertDateValue}
        onChange={(e: any) => {
          setSelectedInvoiceDate(e.value)
        }}
        formItem={{
          component: Calendar,
          componentProps: {
            showIcon: true,
            dateFormat: defaultDateFormat
          }
        }} />

      <FormField label="Material Vendor Name" name="vend_key" className="col-12 md:col-6" control={control} errors={errors}
        isLoading={vendorsFetching}
        required={"Select a Material Vendor"}
        leftSpan={4}
        rightSpan={6}
        useExplicit
        onChange={(e: any) => {
          setSelectedVendor(e.value)
        }}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear: true,
            optionLabel: "name",
            optionValue: "key",
            filter: true,
            filterBy: "name",
            options: vendors
          }
        }} />

      {/* <FormField label="Voucher Number" name="vouchno" className="col-12 md:col-6" control={control} errors={errors}
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            useGrouping: false,
            disabled: true
          }
        }} /> */}

      <FormField label="Project Name" name="proj_key" className="col-12 md:col-6" control={control} errors={errors}
        isLoading={projectsFetching}
        required={"Select a Project"}
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

      <FormField label="Purchase Order No" name="purchase_no" className="col-12 md:col-6" control={control} errors={errors}
        isLoading={grnNumbersFetching}
        leftSpan={4}
        rightSpan={6}
        useExplicit
        onChange={(e: any) => {
          if (!getSaveBtnDisableStatus()) {
            setSelectedGRNNo(e.value)
          }
        }}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear: true,
            optionLabel: "number",
            optionValue: "key",
            filter: true,
            filterBy: "number",
            options: grnNumbers
          }
        }} />

      <FormField label="Invoice Amount" name="invoice_amount" className="col-12 md:col-6"
        leftSpan={4}
        rightSpan={6}
        required
        control={control} errors={errors} formItem={{
          component: InputText,
          componentProps: {
            maxLength: 25,
            type: 'number'
          }
        }} />

      <FormField label="GST No" name="gstno" className="col-12 md:col-6"
        control={control} errors={errors}
        required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100,
          }
        }} />

      <FormField label="Item Type"
        name="itemtype_key"
        control={control} errors={errors}
        isLoading={itemTypeFetching}
        className="col-12 md:col-6"
        leftSpan={4}
        rightSpan={6}
        required
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
      {/*         
      <FormField label="Term" name="apterm_key" className="col-12 md:col-6" control={control} errors={errors}
        isLoading={apTermsFetching}
        required
        leftSpan={4}
        rightSpan={6}
        useExplicit
        onChange={(e: any) => {
          let temp = apTerms?.filter(d => d.key === e.value)[0]?.days
          setSelectedAPTermDays(temp)
        }}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear: true,
            optionLabel: "descr",
            optionValue: "key",
            filter: true,
            filterBy: "descr",
            options: apTerms
          }
        }} />

       */}


      <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
        <ManageItem
          data={gridData}
          isLoading={isLoading}
          ref={manageItemRef}
          selectedItemType={selectedItemType}
          disableTable={getSaveBtnDisableStatus()}
          onChange={(value: boolean) => !itemsTableChanged && setItemsTableChanged(value)}
        />
      </div>

      <FormField label="Payment Status" name="status" className="col-12 md:col-6"
        leftSpan={4}
        rightSpan={6}
        required
        control={control} errors={errors} formItem={{
          component: Dropdown,
          componentProps: {
            options: ["Unpaid", "Partially Paid", "Paid"]
          }
        }} />

      <FormField label="Pending Payment" name="pending" className="col-12 md:col-6"
        leftSpan={4}
        rightSpan={6}
        required
        control={control} errors={errors} formItem={{
          component: InputText,
          componentProps: {
            maxLength: 25,
            type: 'number'
          }
        }} />

      <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
        <ManageItem2
          data={gridData}
          isLoading={isLoading}
          ref={manageItemRef}
          selectedItemType={selectedItemType}
          disableTable={getSaveBtnDisableStatus()}
          onChange={(value: boolean) => !itemsTableChanged && setItemsTableChanged(value)}
        />
      </div>

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
      <ManageLayout
        ref={manageLayoutRef}
        disableSaveBtn={getSaveBtnDisableStatus()}
        baseRoute="/vendor/vendorinvoice" description="Item Vendor Invoice" id={id} data={poData}
        isUpdating={isAdding || isUpdating || showingToast}
        isItemsTableChanged={itemsTableChanged}
        moreSubmitItems={
          <>
            <Button label='Submit' style={{ margin: '0 20px' }} disabled={getSubmitBtnDisableStatus()} onClick={(e) => {
              e.preventDefault()
              let isDirty = manageLayoutRef.current?.getIsDirty();
              if (isDirty || itemsTableChanged) {
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
            }} />
            <Button
              label='Cancel'
              disabled={isNew || getCancelBtnDisableStatus()}
              className='p-button-plain'
              onClick={e => {
                setAction("CANCEL")
                setDocStatus("C")
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