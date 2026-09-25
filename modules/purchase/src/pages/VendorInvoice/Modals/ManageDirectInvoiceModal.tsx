import React, { useEffect, useRef, useState } from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { AutoComplete } from 'primereact/autocomplete';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tooltip } from 'primereact/tooltip';
import {
  ManageLayout,
  useToast,
  ManageLayoutHandle,
  FormField,
} from '@igblsln/control';
import { useAddInvoiceMutation, useGetInvoiceQuery, useUpdateInvoiceMutation } from '../api';
import {
  formatDate,
  useActiveVendorsQuery,
  AFTER_API_TIME,
  getClientProps,
  convertDateValue,
  useGetNextDocNoQuery,
  useActiveProjectQuery,
  useGetAllVendorTypeQuery,
  defaultDateFormat,
  tdsDropdownOptions,
  adjustNumber,
  useGetItemTypesForVendorQuery,
  useGetItemsForItemTypeQuery,
  useGetUOMsForItemTypeQuery,
  inputNumberProps,
  useGetBrandsQuery,
  cleanDecimal,
  reverseDate
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';
import ManageItem from './ManageItem';
import LoadFromKITModal from '../../PurchaseOrder/LoadFromKITModal';
import EditableTable from './CustomTable';
import ImageUploader, { ImageItem } from './ImageUploader';
import ItemRateSummary from '../../ItemRateHistory/ItemRateSummary';

type Props = {
  displayModal: boolean,
  customDiscard: any,
  id?: any
}

export default function ManageDirectInvoiceModal({ id, displayModal, customDiscard }: Props) {

  const isNew = !id
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [displayKITModal, setDisplayKITModal] = useState(false)
  const [invoiceAmount, setInvoiceAmount] = useState(0)
  const [gstAmount, setGSTAmount] = useState(0)
  const [tdsPercent, setTDSPercent] = useState(0)
  const [filteredTDSPercent, setFilteredTDSPercent] = useState<any[]>([])
  const [withItemList, setWithItemList] = useState<any>(null)
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const [formData, setFormData] = useState<any>({});
  const [subAmount, setSubAmount] = useState<any>({})
  const roundOffRef = useRef<any>(null);
  const [isTableRowChanged, setIsTableRowChanged] = useState<boolean>(false)
  const [selectedItemForRates, setSelectedItemForRates] = useState<{ itemKey?: number; brand?: number; model?: string } | undefined>(undefined)

  const clientProps = getClientProps();
  const { data: poDocIdData } = useGetNextDocNoQuery("PO", { skip: !isNew, refetchOnMountOrArgChange: isNew })
  const { data: docData } = useGetNextDocNoQuery("VIN", { refetchOnMountOrArgChange: true, skip: !isNew })
  const [gridData, setGridData] = useState<any[]>([])
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const { data: vendors, isLoading: vendorsFetching } = useActiveVendorsQuery()
  const { data: projects, isLoading: projectsFetching } = useActiveProjectQuery()

  const [selectedItemTypes, setSelectedItemTypes] = useState<any>(null)
  const { data: itemTypes } = useGetItemTypesForVendorQuery(selectedVendor, { skip: !selectedVendor })

  const selectedVendorName = React.useMemo(() => {
    const vendorKey = selectedVendor || (formData as any)?.vend_key;
    if (!vendorKey) return '';
    const selectedKey = (vendorKey as any)?.key ?? vendorKey;
    const selectedKeyAsString = String(selectedKey);
    const match = vendors?.find?.((v: any) => String(v?.key) === selectedKeyAsString);
    return match?.name ?? (typeof vendorKey === 'object' ? vendorKey?.name : '') ?? '';
  }, [selectedVendor, (formData as any)?.vend_key, vendors]);

  const selectedProjectName = React.useMemo(() => {
    const projectKey = (formData as any)?.proj_key;
    if (!projectKey) return '';
    const selectedKey = projectKey?.key ?? projectKey;
    const selectedKeyAsString = String(selectedKey);
    const match = projects?.find?.((p: any) => String(p?.key) === selectedKeyAsString);
    return match?.name ?? (typeof projectKey === 'object' ? projectKey?.name : '') ?? '';
  }, [(formData as any)?.proj_key, projects]);

  const [images, setImages] = useState<ImageItem[]>([])


  const { data, isLoading } = useGetInvoiceQuery(id, {
    skip: isNew,
    refetchOnMountOrArgChange: true
  })

  const showDialog = displayModal && (isNew || !isLoading);
  const showLoader = displayModal && !isNew && isLoading;

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
    const updatedData = data
      ? {
          ...data,
          invoicedate: refactorDate(data.invoicedate),
        }
      : {
          invoicedate: convertDateValue(new Date(), true),
          method: "FromPO",
          invoiceno: docData?.next_doc_id,
        };
    setFormData(updatedData)
    
    if (data) {
      setSelectedVendor(data?.vend_key)
      setSelectedItemTypes(data?.item_type_key)
      setGridData(data?.purchase_order?.purchs_odr_items || [])
      setInvoiceAmount(data?.invamt || 0)
      let tdsamt = parseFloat(data?.tdsamt);
      let invamt = parseFloat(data?.invamt);

      let tdspercent = (invamt && !isNaN(tdsamt) && !isNaN(invamt))
        ? (tdsamt / invamt) * 100
        : 0;
      // if (tdspercent) {
      console.log(Math.ceil(tdspercent))
      setTDSPercent(Math.ceil(tdspercent))
      // }
      console.log('setting gst amount from api', data?.gstamt)
      setGSTAmount(parseFloat(data?.gstamt || 0))
      setSubAmount({
        // transport: data?.transport_chrgs ? parseInt(data?.transport_chrgs) : 0,
        loadUnload: data?.handling_chrgs ? parseInt(data?.handling_chrgs) : 0,
        discount: data?.discountamt ? parseInt(data?.discountamt) : 0,
        roundedamt: data?.roundedamt ? parseFloat(data?.roundedamt) : 0,
        roundoff: data?.rounded_action
      })
      roundOffRef.current = data?.roundedamt || 0
      setWithItemList(data?.method === "DirectWithPO")
      if (data?.images) {
        setImages(data.images.map((img: any, index: number) => ({
          key: img.key,
          base64: img.image_url,
          name: `existing-image-${index + 1}`,
          size: 0,
        })));
      } else {
        setImages([]);
      }
    } else {
      setImages([]);
    }

  }, [data, docData])

  const getNetAmount = () => {
    let tableAmt = gridData.map((x: any) => parseFloat(x.netamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0)
    let sub = (subAmount?.transport || 0) + (subAmount?.loadUnload || 0) - (subAmount?.discount || 0) + (gstAmount || 0)
    // let adjusted = adjustNumber(tableAmt + sub, subAmount?.roundoff)

    // console.log(adjusted, "adjusted")
    // roundOffRef.current = adjusted.remainder

    // return adjusted.rounded

    let total = tableAmt + sub + (
      subAmount?.roundoff === 'A'
        ? 1 * (subAmount.roundedamt || 0)  // Default to 0 if roundedamt is missing
        : subAmount?.roundoff === 'S'
          ? -1 * (subAmount.roundedamt || 0) // Default to 0 if roundedamt is missing
          : 0
    );

    return total
  }

  const getNetAmountWithoutItemList = () => {
    let tableAmt = invoiceAmount
    let sub = (subAmount?.transport || 0) + (subAmount?.loadUnload || 0) - (subAmount?.discount || 0) + (gstAmount || 0)

    // @ts-ignore
    let total = parseFloat(tableAmt) + parseFloat(sub) + (
      subAmount?.roundoff === 'A'
        ? 1 * (subAmount.roundedamt || 0)  // Default to 0 if roundedamt is missing
        : subAmount?.roundoff === 'S'
          ? -1 * (subAmount.roundedamt || 0) // Default to 0 if roundedamt is missing
          : 0
    );

    return total
  }

  useEffect(() => {
    if (!!gridData.length) {
      let tableAmt = gridData.map((x: any) => parseFloat(x.netamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0)
      setInvoiceAmount(tableAmt)
      let gstAmt = gridData.map((x: any) => parseFloat(x.gstamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0)
      console.log(gstAmt)
      console.log(gridData)
      console.log("table data changed setting gst amount", gstAmt)
      setGSTAmount(gstAmt)
    } else {
      if (withItemList) {
        setInvoiceAmount(0)
        console.log("with item list setting gst amount", data?.gstamt)
        setGSTAmount(parseFloat(data?.gstamt || 0))
      }
    }

    // Clear selected item for rates if it's no longer in the grid
    if (selectedItemForRates?.itemKey) {
      const itemStillExists = gridData.some((row: any) => row.item_key === selectedItemForRates.itemKey);
      if (!itemStillExists) {
        setSelectedItemForRates(undefined);
      }
    }
  }, [gridData, withItemList])


  const [addInvoice, { isLoading: isAdding }] = useAddInvoiceMutation()
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation()


  const onSubmit = async (values: any) => {
    try {

      if (gridData.some((x: any) => !x.item_uom_key || !x.item_key || !x.qty)) {
        showError("Missing required fields", "Please fill all the required fields")
        return
      }

      if(withItemList && gridData.length === 0) {
        showError("Need Items", "Please select at least one item to create the PO.");
        return
      }

      const invamt = gridData.map((x: any) => parseFloat(x.netamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0)
      console.log("before invamt ::", invamt)
      console.log("befor netamt ::", getNetAmountWithoutItemList())
      console.log("after invamt ::", cleanDecimal(invamt))
      console.log("after netamt ::", cleanDecimal(getNetAmountWithoutItemList()))

      let body = {
        ...values,
        invoiceno: isNew ? docData?.next_doc_id : values.invoiceno,
        number: isNew ? poDocIdData?.next_doc_id : values.po_key,
        tdsamt: (tdsPercent * invoiceAmount * 0.01).toFixed(2),
        invoicedate: isNew ? formatDate(values.invoicedate, 'yyyy-MM-dd') : formatDate(values.invoicedate, 'yyyy-MM-dd'),
        items: withItemList ? gridData : undefined,
        // roundedamt: roundOffRef.current,
        netamt: cleanDecimal(getNetAmountWithoutItemList()),
        invamt: withItemList ? cleanDecimal(invamt) : invoiceAmount,
        method: withItemList ? "DirectWithPO" : "Direct",
        discountamt: values?.discountamt || 0,
        gstamt: cleanDecimal(gstAmount),
        roundedamt: values?.rounded_action ? values?.roundedamt : 0,
        rounded_action: values?.rounded_action,
        handling_chrgs: values?.handling_chrgs || 0,
        images: images.map(img => ({ key: img.key, image_url: img.base64 })),
        // transport_chrgs: values?.transport_chrgs || 0,
      }
      let resp: any;
      if (isNew)
        resp = await addInvoice({ ...body, ...clientProps }).unwrap();
      else
        resp = await updateInvoice({
          ...body,
          purchase_order: {
            ...body.purchase_order,
            ...(body.purchase_order?.date && { date: reverseDate(body.purchase_order.date) }),
            discountamt: body?.discountamt,
            gstamt: cleanDecimal(body?.gstamt),
            handling_chrgs: body?.handling_chrgs,
            // transport_chrgs: body?.transport_chrgs,
          },
          ...clientProps
        }).unwrap();
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        customDiscard()
      }, AFTER_API_TIME);
    } catch (error: any) {
      console.log("error ::", error)
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const { data: pItems, isLoading: isItemLoading } = useGetItemsForItemTypeQuery(selectedItemTypes, { skip: !selectedItemTypes, refetchOnMountOrArgChange: true })
  const { data: UOMItems, isLoading: isUOMLoading } = useGetUOMsForItemTypeQuery(selectedItemTypes, { skip: !selectedItemTypes, refetchOnMountOrArgChange: true });
  const {data: brands, isLoading: isBrandLoading } = useGetBrandsQuery(
    {type: selectedItemTypes},
    {
      skip: !selectedItemTypes,
      refetchOnMountOrArgChange:true
    }
  )


  const columns = [
    // { key: 'id', name: 'ID', editor: 'text', editable: false, width: 60 },
    {
      key: 'item_key',
      name: 'Item',
      editor: 'dropdown',
      required: true,
      // allowEnter: true,
      width: 250,
      options: pItems?.map((d: any) => ({ label: d.descr, value: d.key, gst: d.gst }))
    },
    { key: 'brand', name: 'Brand', editor: 'dropdown', options: brands?.map((b:any) => ({label: b.name, value: b.key}))},
    { key: 'model_number', name: 'Model', editor: 'text' },
    { key: 'qty', required: true, name: 'Quantity', editor: 'number' },
    {
      key: 'item_uom_key',
      name: 'UOM',
      required: true,
      editor: 'dropdown',
      // allowEnter: true,
      options: UOMItems?.map((d: any) => ({ label: d.descr, value: d.key })),
    },
    { key: 'netamt', name: 'Net Amt (₹)', editor: 'number' },
    { key: 'gst', name: 'GST %', editor: "number" },
    { key: 'gstamt', name: 'GST Amount (₹)', editor: "number" },
  ];

  const renderFormWithItemList = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: any, setValue: UseFormSetValue<any>) => {
    return (
      <div style={{ height: '99vh', overflowX: 'hidden', overflowY: 'auto' }}>
        <div style={{ border: '2px solid gray', padding: '5px 20px' }}>
          <div className="flex">

            {!!selectedVendorName && (
              <Tooltip
                mouseTrack
                mouseTrackLeft={24}
                mouseTrackTop={18}
                target="#directinvoice-vendor"
                position="bottom"
                content={selectedVendorName}
                className="my-tooltip-plain"
              />
            )}
            <FormField label="Vendor"
              name="vend_key"
              control={control} errors={errors}
              isLoading={vendorsFetching}
              className="col-12 md:col-4"
              leftSpan={4}
              rightSpan={8}
              required
              onChange={(e: any) => setSelectedVendor(e.value)}
              formItem={{
                component: Dropdown,
                componentProps: {
                  // showClear: true,
                  id: 'directinvoice-vendor',
                  optionLabel: "name",
                  optionValue: "key",
                  filter: true,
                  filterBy: "name",
                  options: vendors,
                }
              }} />

            {!!selectedProjectName && (
              <Tooltip
                mouseTrack
                mouseTrackLeft={24}
                mouseTrackTop={18}
                target="#directinvoice-project"
                position="bottom"
                content={selectedProjectName}
                className="my-tooltip-plain"
              />
            )}
            <FormField label="Project Name"
              name="proj_key"
              control={control} errors={errors}
              isLoading={projectsFetching}
              className="col-12 md:col-4"
              leftSpan={4}
              rightSpan={8}
              required
              formItem={{
                component: Dropdown,
                componentProps: {
                  // showClear: true,
                  id: 'directinvoice-project',
                  optionLabel: "name",
                  optionValue: "key",
                  filter: true,
                  filterBy: "name",
                  options: projects,
                }
              }} />

            <FormField label="Vendor Invoice No" name="vendor_invoice_no"
              leftSpan={6}
              rightSpan={6}
              className="col-12 md:col-4"
              control={control} errors={errors} formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 100,
                }
              }} />

          </div>

          <div className="flex">

            <FormField
              label="Invoice No"
              name="invoiceno"
              className="col-12 md:col-4"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={8}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true
                }
              }} />

            {/* <FormField
              label="Creation Method"
              name="method"
              className="col-12 md:col-4"
              control={control}
              errors={errors}
              leftSpan={5}
              rightSpan={7}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true,
                  value: "DirectWithPO"
                }
              }} /> */}

            <FormField label="Date" name="invoicedate" useExplicit control={control} errors={errors}
              leftSpan={4}
              rightSpan={8}
              required
              className="col-12 md:col-4"
              convertValue={convertDateValue}
              formItem={{
                component: Calendar,
                componentProps: {
                  showIcon: true,
                  dateFormat: defaultDateFormat
                }
              }} />

            <FormField label="Item Type"
              name="item_type_key"
              control={control} errors={errors}
              className="col-12 md:col-4"
              leftSpan={4}
              rightSpan={8}
              onChange={(e: any) => setSelectedItemTypes(e.value)}
              required
              formItem={{
                component: Dropdown,
                componentProps: {
                  // showClear: true,
                  optionLabel: "descr",
                  optionValue: "key",
                  filter: true,
                  filterBy: "descr",
                  options: itemTypes,
                  disabled: !selectedVendor,
                }
              }} />
          </div>
        </div>

        <div style={{ border: '2px solid gray', margin: '10px auto', padding: '5px 20px' }}>
          <div className='pl-4 pt-4 grid p-fluid h-full'>

            <div className="col-12 pr-4" style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
              <Button
                label='Load Items from Kit'
                style={{
                  marginLeft: 'auto',
                  // marginTop: 5,
                  marginBottom: 5,
                  marginRight: 3,
                  display: 'flex',
                  width: 250
                }}
                onClick={(e) => {
                  e.preventDefault()
                  setDisplayKITModal(true)
                }}
                type='button'
                disabled={!selectedItemTypes}
                className='p-button-plain'
              />
              {/* <ManageItem
                selectedVendor={selectedVendor}
                selectedItemTypes={selectedItemTypes}
                data={gridData}
                isLoading={isLoading}
                // ref={manageItemRef}
                onChange={(value: any[]) => {
                  setGridData(value)
                }}
              /> */}
              <EditableTable
                enableRowSelection
                initialRows={gridData}
                columns={columns}
                onChange={(data) => setGridData(data)}
                allowAddRow={!!selectedItemTypes}
                onTableChange={(value:boolean) => !isTableRowChanged && setIsTableRowChanged(value)}
                onSelectionChange={(selectedRows, selectedRowsData) => {
                  // Only show rate summary when exactly one item is selected
                  if (selectedRowsData.length === 1 && selectedRowsData[0]?.item_key) {
                    setSelectedItemForRates({
                      itemKey: selectedRowsData[0].item_key,
                      brand: selectedRowsData[0].brand,
                      model: selectedRowsData[0].model_number,
                    });
                  } else {
                    setSelectedItemForRates(undefined);
                  }
                }}
              />

              {/* Item Rate Summary - shown only when a single item is selected */}
              {selectedItemForRates?.itemKey && (
                <div className="mt-3">
                  <ItemRateSummary
                    itemKey={selectedItemForRates.itemKey}
                    brand={selectedItemForRates.brand}
                    model={selectedItemForRates.model}
                    maxRates={3}
                  />
                </div>
              )}

            </div>


            <div className='flex col-12' style={{ paddingLeft: 0 }}>
              <div className='col-6'>
                <div style={{ marginBottom: 15 }}>Invoice Description</div>
                <FormField label="" name="invnotes"
                  leftSpan={1}
                  rightSpan={10}
                  control={control} errors={errors} formItem={{
                    component: InputTextarea,
                    componentProps: {
                      maxLength: 500,
                      rows: 8,
                      tabIndex: -1
                    }
                  }} />
              </div>
              <div className='col-6'>
                {/* <FormField label="Invoice Amount (₹)" name="invamt"
                  required
                  leftSpan={4}
                  rightSpan={6}
                  useExplicit
                  onChange={(e: any) => {
                    setInvoiceAmount(e.target.value)
                  }}
                  control={control} errors={errors} formItem={{
                    component: InputText,
                    componentProps: {
                      maxLength: 25
                    }
                  }} /> */}
                <FormField label="TDS Percent (%)" name="tdspercent"
                  leftSpan={4}
                  rightSpan={6}
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
                      completeMethod: (e: any) => tdsDropdownOptions(e, setFilteredTDSPercent, [0, 1, 2, 3]),
                      dropdown: true
                    }
                  }} />
                <FormField label="TDS Amount (₹)" name="tdsamt"
                  leftSpan={4}
                  rightSpan={6}
                  control={control} errors={errors}
                  formItem={{
                    component: InputNumber,
                    componentProps: {
                      ...inputNumberProps,
                      disabled: true,
                      value: (tdsPercent * invoiceAmount * 0.01).toFixed(2)
                    }
                  }} />

                <FormField label="Discount (₹)" name="discountamt"
                  control={control} errors={errors}
                  leftSpan={4}
                  rightSpan={6}
                  useExplicit
                  defaultValue={0}
                  onChange={(e: any) => {
                    setSubAmount((prev: any) => {
                      return {
                        ...prev,
                        discount: parseFloat(e.value)
                      }
                    })
                  }}
                  formItem={{
                    component: InputNumber,
                    componentProps: {
                      ...inputNumberProps,
                    }
                  }}
                />
                <FormField label="GST" name="gstamt"
                  leftSpan={4}
                  rightSpan={6}
                  onChange={(event: any) => {
                    console.log('on change even on gst column', event.value)
                    setGSTAmount(parseFloat(event.value))
                  }}
                  control={control} errors={errors}
                  formItem={{
                    component: InputNumber,
                    componentProps: {
                      ...inputNumberProps,
                      value: gstAmount,
                    }
                  }} />
              </div>
            </div>


            {/* <FormField label="Transport (₹)" name="transport_chrgs"
              className="col-12 md:col-4"
              control={control} errors={errors}
              leftSpan={4}
              rightSpan={8}
              useExplicit
              defaultValue={0}
              onChange={(e: any) => {
                setSubAmount((prev: any) => {
                  return {
                    ...prev,
                    transport: parseFloat(e.target.value)
                  }
                })
              }}
              formItem={{
                component: InputText,
                componentProps: {
                  type: 'number',
                  min: 0,
                  step: '0.01'
                }
              }}
            /> */}

            <FormField label="Load/UnLoad (₹)" name="handling_chrgs"
              className="col-12 md:col-6"
              control={control} errors={errors}
              leftSpan={5}
              rightSpan={7}
              useExplicit
              defaultValue={0}
              onChange={(e: any) => {
                setSubAmount((prev: any) => {
                  return {
                    ...prev,
                    loadUnload: parseFloat(e.value)
                  }
                })
              }}
              formItem={{
                component: InputNumber,
                componentProps: {
                  ...inputNumberProps,
                }
              }}
            />

            <FormField label="Round Off"
              name="rounded_action"
              control={control} errors={errors}
              className="col-12 md:col-6"
              leftSpan={4}
              rightSpan={8}
              useExplicit
              onChange={(e: any) => {
                setSubAmount((prev: any) => {
                  return {
                    ...prev,
                    roundoff: e.value,
                    roundedamt: e.value == null ? 0 : prev.roundedamt
                  }
                })
              }}
              formItem={{
                component: Dropdown,
                componentProps: {
                  options: [
                    {
                      name: "Increment",
                      value: "A"
                    },
                    {
                      name: "Decrement",
                      value: "S"
                    },
                    {
                      name: "None",
                      value: null
                    },
                  ],
                  optionLabel: "name",
                  optionValue: "value",
                }
              }} />

            <FormField label="Rounded Value (₹)" name="roundedamt"
              className="col-12 md:col-6"
              control={control} errors={errors}
              leftSpan={5}
              rightSpan={7}
              useExplicit
              defaultValue={0}
              onChange={(e: any) => {
                setSubAmount((prev: any) => {
                  return {
                    ...prev,
                    roundedamt: parseFloat(e.value)
                  }
                })
              }}
              formItem={{
                component: InputNumber,
                componentProps: {
                  ...inputNumberProps,
                  disabled: !subAmount?.roundoff,
                  value: subAmount?.roundedamt
                }
              }}
            />

            <FormField label="Net Amt (₹)" name="netamt"
              className="col-12 md:col-6"
              control={control} errors={errors}
              // required
              leftSpan={4}
              rightSpan={8}
              defaultValue={0}
              formItem={{
                component: InputNumber,
                componentProps: {
                  ...inputNumberProps,
                  disabled: true,
                  value: getNetAmount()
                }
              }}
            />
          </div>
        </div>
        <ImageUploader
            images={images}
            onImagesChange={setImages}
            maxFileSize={2_000_000}
        />
      </div>

    )
  }

  const renderFormWithoutItemList = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: any, setValue: UseFormSetValue<any>) => {
    return (
      <div>
        <div style={{ border: '2px solid gray', padding: '5px 20px' }}>
          <div className="flex">
            {/* <FormField label="Vendor Type"
              name="vend_type_key"
              control={control} errors={errors}
              className="col-12 md:col-4"
              leftSpan={5}
              rightSpan={7}
              required
              useExplicit
              onChange={(e: any) => {
                setSelectedVendorType(e.value)
              }}
              formItem={{
                component: Dropdown,
                componentProps: {
                  showClear: true,
                  optionLabel: "descr",
                  optionValue: "key",
                  filter: true,
                  filterBy: "descr",
                  options: vendorTypes,
                  value: selectedVendorType
                }
              }} /> */}

            {!!selectedVendorName && (
              <Tooltip
                mouseTrack
                mouseTrackLeft={24}
                mouseTrackTop={18}
                target="#directinvoice-vendor-noitem"
                position="bottom"
                content={selectedVendorName}
                className="my-tooltip-plain"
              />
            )}
            <FormField label="Vendor"
              name="vend_key"
              control={control} errors={errors}
              isLoading={vendorsFetching}
              className="col-12 md:col-4"
              leftSpan={4}
              rightSpan={8}
              required
              onChange={(e: any) => setSelectedVendor(e.value)}
              formItem={{
                component: Dropdown,
                componentProps: {
                  showClear: true,
                  id: 'directinvoice-vendor-noitem',
                  optionLabel: "name",
                  optionValue: "key",
                  filter: true,
                  filterBy: "name",
                  options: vendors
                }
              }} />

            {!!selectedProjectName && (
              <Tooltip
                mouseTrack
                mouseTrackLeft={24}
                mouseTrackTop={18}
                target="#directinvoice-project-noitem"
                position="bottom"
                content={selectedProjectName}
                className="my-tooltip-plain"
              />
            )}
            <FormField label="Project Name"
              name="proj_key"
              control={control} errors={errors}
              isLoading={projectsFetching}
              className="col-12 md:col-4"
              leftSpan={4}
              rightSpan={8}
              required
              formItem={{
                component: Dropdown,
                componentProps: {
                  showClear: true,
                  id: 'directinvoice-project-noitem',
                  optionLabel: "name",
                  optionValue: "key",
                  filter: true,
                  filterBy: "name",
                  options: projects,
                }
              }} />

            <FormField label="Vendor Invoice No" name="vendor_invoice_no"
              leftSpan={6}
              rightSpan={6}
              className="col-12 md:col-4"
              control={control} errors={errors} formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 100,
                }
              }} />

          </div>

          <div className="flex">

            <FormField
              label="Invoice No"
              name="invoiceno"
              className="col-12 md:col-4"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={8}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true
                }
              }} />

            <FormField
              label="Creation Method"
              name="method"
              className="col-12 md:col-4"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={8}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true,
                  value: "Direct"
                }
              }} />

            <FormField label="Date" name="invoicedate" useExplicit control={control} errors={errors}
              leftSpan={4}
              rightSpan={8}
              required
              className="col-12 md:col-4"
              convertValue={convertDateValue}
              formItem={{
                component: Calendar,
                componentProps: {
                  showIcon: true,
                  dateFormat: defaultDateFormat
                }
              }} />
          </div>
        </div>

        <div style={{ border: '2px solid gray', margin: '10px auto' }}>
          <div className='pl-4 pt-4 grid p-fluid h-full'>

            <div className='flex col-12' style={{ paddingLeft: 0 }}>
              <div className='col-6'>
                <div style={{ marginBottom: 15 }}>Invoice Description</div>
                <FormField label="" name="invnotes"
                  leftSpan={1}
                  rightSpan={10}
                  control={control} errors={errors} formItem={{
                    component: InputTextarea,
                    componentProps: {
                      maxLength: 500,
                      rows: 6
                    }
                  }} />
              </div>
              <div className='col-6'>
                  <FormField label="Invoice Amount (₹)" name="invamt"
                    required
                    leftSpan={4}
                    rightSpan={6}
                    useExplicit
                    onChange={(e: any) => {
                      setInvoiceAmount(e.value)
                    }}
                    control={control} errors={errors} formItem={{
                      component: InputNumber,
                      componentProps: {
                        ...inputNumberProps,
                        value: invoiceAmount,
                        min: 0
                      }
                    }} />
                <FormField label="TDS Percent (%)" name="tdspercent"
                  leftSpan={4}
                  rightSpan={6}
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
                      completeMethod: (e: any) => tdsDropdownOptions(e, setFilteredTDSPercent, [0, 1, 2, 3]),
                      dropdown: true
                    }
                  }} />
                <FormField label="TDS Amount (₹)" name="tdsamt"
                  leftSpan={4}
                  rightSpan={6}
                  control={control} errors={errors}
                  formItem={{
                    component: InputNumber,
                    componentProps: {
                      ...inputNumberProps,
                      disabled: true,
                      value: (tdsPercent * invoiceAmount * 0.01).toFixed(2)
                    }
                  }} />
                <FormField label="GST" name="gstamt"
                  leftSpan={4}
                  rightSpan={6}
                  onChange={(event: any) => {
                    setGSTAmount(parseFloat(event.value))
                  }}
                  control={control} errors={errors} formItem={{
                    component: InputNumber,
                    componentProps: {
                      ...inputNumberProps,
                      value: gstAmount,
                      min: 0
                    }
                  }} />
              </div>
            </div>

            <FormField label="Discount (₹)" name="discountamt"
              className="col-12 md:col-6"
              control={control} errors={errors}
              leftSpan={4}
              rightSpan={6}
              useExplicit
              defaultValue={0}
              onChange={(e: any) => {
                setSubAmount((prev: any) => {
                  return {
                    ...prev,
                    discount: parseFloat(e.value)
                  }
                })
              }}
              formItem={{
                component: InputNumber,
                componentProps: {
                  ...inputNumberProps,
                }
              }}
            />

            <FormField label="Round Off"
              name="rounded_action"
              control={control} errors={errors}
              className="col-12 md:col-6"
              leftSpan={4}
              rightSpan={6}
              useExplicit
              onChange={(e: any) => {
                setSubAmount((prev: any) => {
                  return {
                    ...prev,
                    roundoff: e.value,
                    roundedamt: e.value == null ? 0 : prev.roundedamt
                  }
                })
              }}
              formItem={{
                component: Dropdown,
                componentProps: {
                  options: [
                    {
                      name: "Increment",
                      value: "A"
                    },
                    {
                      name: "Decrement",
                      value: "S"
                    },
                    {
                      name: "None",
                      value: null
                    },
                  ],
                  optionLabel: "name",
                  optionValue: "value",
                }
              }} />

            <FormField label="Rounded Value (₹)" name="roundedamt"
              className="col-12 md:col-6"
              control={control} errors={errors}
              leftSpan={4}
              rightSpan={6}
              useExplicit
              defaultValue={0}
              onChange={(e: any) => {
                setSubAmount((prev: any) => {
                  return {
                    ...prev,
                    roundedamt: parseFloat(e.value)
                  }
                })
              }}
              formItem={{
                component: InputNumber,
                componentProps: {
                  ...inputNumberProps,
                  disabled: !subAmount?.roundoff,
                  value: subAmount?.roundedamt
                }
              }}
            />

            <FormField label="Net Amt (₹)" name="netamt"
              className="col-12 md:col-6"
              control={control} errors={errors}
              // required
              leftSpan={4}
              rightSpan={6}
              defaultValue={0}
              formItem={{
                component: InputNumber,
                componentProps: {
                  ...inputNumberProps,
                  disabled: true,
                  value: getNetAmountWithoutItemList()
                }
              }}
            />

          </div>
        </div>
        <ImageUploader
            images={images}
            onImagesChange={setImages}
            maxFileSize={2_000_000}
        />
      </div>
    )
  }


  return (
    <>
    {showLoader && (
      <div className="ig-spinner-overlay">
        <ProgressSpinner className="ig-grid-loader" />
      </div>
    )}
    {showDialog && (
      <Dialog
        header={isNew ? `Create New Vendor Invoice ${withItemList ? 'With' : 'Without'} PO` : `Edit Vendor Invoice ${withItemList ? 'With' : 'Without'} PO`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '80vw' }}
        onHide={() => {
          let element = document.getElementById('discard-btn')
          if (element) {
            element.click()
          } else {
            customDiscard()
          }
        }}
        draggable={false} resizable={false}
        closeOnEscape={false}
      >
        {
          withItemList === null &&
          <div className="pl-5 flex">
            <div className="field" style={{ width: '50%' }}>
              <div className="field-radiobutton">
                <RadioButton
                  // checked={withItemList}
                  onChange={() => {
                    setWithItemList(true)
                  }} />
                <label
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setWithItemList(true)
                  }}>
                  With Item List
                </label>
              </div>
            </div>
            <div className="field" style={{ width: '50%' }}>
              <div className="field-radiobutton">
                <RadioButton
                  // checked={!withItemList}
                  onChange={() => {
                    setWithItemList(false)
                  }} />
                <label
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setWithItemList(false)
                  }}>
                  Without Item List
                </label>
              </div>
            </div>
          </div>
        }

        {
          withItemList !== null &&
          <ManageLayout
            baseRoute="/payment/vendorpayment"
            bottomControl
            data={formData}
            hideHeader
            isItemsTableChanged={isTableRowChanged}
            customDiscard={customDiscard}
            ref={manageLayoutRef}
            isUpdating={isAdding || showingToast}
            onSubmit={onSubmit}
            renderForm={withItemList ? renderFormWithItemList : renderFormWithoutItemList}
          />
        }

        <LoadFromKITModal
          selectedVendor={selectedVendor}
          displayModal={displayKITModal}
          customDiscard={() => setDisplayKITModal(false)}
          setTableData={setGridData}
        />

      </Dialog>
    )}
    </>
  )
}
