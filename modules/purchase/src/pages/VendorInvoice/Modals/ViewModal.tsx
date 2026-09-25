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
  inputNumberProps,
  refactorDate
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';
import ManageItem from './ManageItem';
import LoadFromKITModal from '../../PurchaseOrder/LoadFromKITModal';
import ImageUploader, { ImageItem } from './ImageUploader';

type Props = {
  displayModal: boolean,
  customDiscard: any,
  id?: any
}

export default function ViewModal({ id, displayModal, customDiscard }: Props) {

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

  const clientProps = getClientProps();
  const { data: poDocIdData } = useGetNextDocNoQuery("PO", { skip: !isNew, refetchOnMountOrArgChange: isNew })
  const { data: docData } = useGetNextDocNoQuery("VIN", { refetchOnMountOrArgChange: true, skip: !isNew })
  const [gridData, setGridData] = useState<any[]>([])
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const { data: vendors, isLoading: vendorsFetching } = useActiveVendorsQuery()
  const { data: projects, isLoading: projectsFetching } = useActiveProjectQuery()

  const [selectedItemTypes, setSelectedItemTypes] = useState<any>(null)
  const { data: itemTypes } = useGetItemTypesForVendorQuery(selectedVendor, { skip: !selectedVendor })

  const [images, setImages] = useState<ImageItem[]>([])


  const { data, isLoading } = useGetInvoiceQuery(id, {
    skip: isNew,
    refetchOnMountOrArgChange: true
  })

  useEffect(() => {
    setFormData(data || {
      invoicedate: convertDateValue(new Date(), true),
      invoiceno: docData?.next_doc_id,
    })
    if (data) {
      setSelectedVendor(data?.vend_key)
      setSelectedItemTypes(data?.item_type_key)
      setGridData(data?.purchase_order?.purchs_odr_items || [])
      setInvoiceAmount(data?.invamt || 0)
      let tdspercent = (parseInt(data?.tdsamt) / parseInt(data?.invamt)) * 100
      // if (tdspercent) {
      setTDSPercent(Math.ceil(tdspercent))
      // }
      setGSTAmount(parseFloat(data?.gstamt || 0))
      setSubAmount({
        transport: data?.transport_chrgs ? parseInt(data?.transport_chrgs) : 0,
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

    if (data) {
      const updatedData = {
        ...data,
        invoicedate: refactorDate(data.invoicedate)
      };
      setFormData(updatedData);
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
    } else {
      withItemList && setInvoiceAmount(0)
    }
  }, [gridData, withItemList])


  const [addInvoice, { isLoading: isAdding }] = useAddInvoiceMutation()
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation()


  const onSubmit = async (values: any) => {
    try {

      if (gridData.some((x: any) => !x.item_uom_key || !x.item_key || !x.qty || !x.netamt)) {
        showError("Missing required fields", "Please fill all the required fields")
        return
      }

      let body = {
        ...values,
        invoiceno: isNew ? docData?.next_doc_id : values.invoiceno,
        number: isNew ? poDocIdData?.next_doc_id : values.po_key,
        tdsamt: (tdsPercent * invoiceAmount * 0.01).toFixed(2),
        invoicedate: formatDate(values.invoicedate, 'yyyy-MM-dd'),
        items: withItemList ? gridData : undefined,
        // roundedamt: roundOffRef.current,
        netamt: getNetAmountWithoutItemList(),
        invamt : withItemList ? gridData.map((x: any) => parseFloat(x.netamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0) : invoiceAmount,
        method: withItemList ? "DirectWithPO" : "Direct",
        discountamt: values?.discountamt || 0,
        gstamt: values?.gstamt || 0,
        roundedamt: values?.roundedamt || 0,
        handling_chrgs: values?.handling_chrgs || 0,
        transport_chrgs: values?.transport_chrgs || 0,
      }
      let resp: any;
      if (isNew)
        resp = await addInvoice({ ...body, ...clientProps }).unwrap();
      else
        resp = await updateInvoice({
          ...body,
          purchase_order: {
            ...body.purchase_order,
            discountamt: body?.discountamt,
            gstamt: body?.gstamt,
            handling_chrgs: body?.handling_chrgs,
            transport_chrgs: body?.transport_chrgs,
            roundedamt: body?.roundedamt,
            rounded_action: body?.rounded_action,
          },
          ...clientProps
        }).unwrap();
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        customDiscard()
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderFormWithItemList = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: any, setValue: UseFormSetValue<any>) => {
    return (
      <div style={{ height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
        <div style={{ border: '2px solid gray', padding: '5px 20px' }}>
          <div className="flex">

            <FormField label="Vendor"
              name="vend_key"
              control={control} errors={errors}
              isLoading={vendorsFetching}
              className="col-12 md:col-4"
              leftSpan={5}
              rightSpan={7}
              required
              onChange={(e: any) => setSelectedVendor(e.value)}
              formItem={{
                component: Dropdown,
                componentProps: {
                  // showClear: true,
                  optionLabel: "name",
                  optionValue: "key",
                  filter: true,
                  filterBy: "name",
                  options: vendors,
                }
              }} />

            <FormField label="Project Name"
              name="proj_key"
              control={control} errors={errors}
              isLoading={projectsFetching}
              className="col-12 md:col-4"
              leftSpan={5}
              rightSpan={7}
              required
              formItem={{
                component: Dropdown,
                componentProps: {
                  // showClear: true,
                  optionLabel: "name",
                  optionValue: "key",
                  filter: true,
                  filterBy: "name",
                  options: projects,
                }
              }} />

            <FormField label="Vendor Invoice No" name="vendor_invoice_no"
              leftSpan={5}
              rightSpan={7}
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
              leftSpan={5}
              rightSpan={7}
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
              leftSpan={5}
              rightSpan={7}
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
              leftSpan={5}
              rightSpan={7}
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

              <ManageItem
                selectedVendor={selectedVendor}
                selectedItemTypes={selectedItemTypes}
                data={gridData}
                isLoading={isLoading}
                disableTable
                // ref={manageItemRef}
                onChange={(value: any[]) => {
                  setGridData(value)
                }}
              />

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
                      rows: 8
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
                    component: InputText,
                    componentProps: {
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
                            discount: parseFloat(e.target.value)
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
                    />
                <FormField label="GST" name="gstamt"
                  leftSpan={4}
                  rightSpan={6}
                  onChange={(event: any) => {
                    setGSTAmount(parseFloat(event.value))
                  }}
                  control={control} errors={errors} formItem={{
                    component: InputNumber,
                    componentProps: {
                      maxLength: 25,
                      value: gstAmount,
                      ...inputNumberProps
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
                    loadUnload: parseFloat(e.target.value)
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
            />


            <FormField label="Round Off"
              name="rounded_action"
              control={control} errors={errors}
              className="col-12 md:col-4"
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
                    roundedamt: parseFloat(e.target.value)
                  }
                })
              }}
              formItem={{
                component: InputText,
                componentProps: {
                  type: 'number',
                  min: 0,
                  step: '0.01',
                  disabled: !subAmount?.roundoff,
                  value: subAmount?.roundedamt
                }
              }}
            />

            <FormField label="Net Amt (₹)" name="netamt"
              className="col-12 md:col-4"
              control={control} errors={errors}
              // required
              leftSpan={4}
              rightSpan={8}
              defaultValue={0}
              formItem={{
                component: InputNumber,
                componentProps: {
                  ...inputNumberProps,
                  maxLength: 50,
                }
              }}
            />

          </div>
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <ImageUploader
            images={images}
            onImagesChange={setImages}
            maxFileSize={2_000_000}
            viewMode
          />
        </div>
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

            <FormField label="Vendor"
              name="vend_key"
              control={control} errors={errors}
              isLoading={vendorsFetching}
              className="col-12 md:col-4"
              leftSpan={5}
              rightSpan={7}
              required
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

            <FormField label="Project Name"
              name="proj_key"
              control={control} errors={errors}
              isLoading={projectsFetching}
              className="col-12 md:col-4"
              leftSpan={5}
              rightSpan={7}
              required
              formItem={{
                component: Dropdown,
                componentProps: {
                  showClear: true,
                  optionLabel: "name",
                  optionValue: "key",
                  filter: true,
                  filterBy: "name",
                  options: projects,
                }
              }} />

            <FormField label="Vendor Invoice No" name="vendor_invoice_no"
              leftSpan={5}
              rightSpan={7}
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
              leftSpan={5}
              rightSpan={7}
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
              leftSpan={5}
              rightSpan={7}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true,
                  value: "Direct"
                }
              }} />

            <FormField label="Date" name="invoicedate" useExplicit control={control} errors={errors}
              leftSpan={5}
              rightSpan={7}
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
                    component: InputText,
                    componentProps: {
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
                    discount: parseFloat(e.target.value)
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
                    roundedamt: parseFloat(e.target.value)
                  }
                })
              }}
              formItem={{
                component: InputText,
                componentProps: {
                  type: 'number',
                  min: 0,
                  step: '0.01',
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
                  value: getNetAmountWithoutItemList()
                }
              }}
            />

          </div>
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <ImageUploader
            images={images}
            onImagesChange={setImages}
            maxFileSize={2_000_000}
            viewMode
          />
        </div>
      </div>
    )
  }


  return (
    <>
      {displayModal && isLoading && (
        <div className="ig-spinner-overlay">
          <ProgressSpinner className="ig-grid-loader" />
        </div>
      )}

      {displayModal && !isLoading && withItemList !== null && (
        <Dialog
          header={`View Vendor Invoice ${withItemList ? 'With' : 'Without'} PO`}
          visible
          position="center"
          modal
          style={{ width: '80vw' }}
          onHide={customDiscard}
          draggable={false}
          resizable={false}
          closable
        >
          <ManageLayout
            baseRoute="/payment/vendorpayment"
            bottomControl
            data={formData}
            hideHeader
            customDiscard={customDiscard}
            ref={manageLayoutRef}
            isUpdating={isAdding || showingToast}
            onSubmit={onSubmit}
            viewMode
            disableInput
            renderForm={
              withItemList
                ? renderFormWithItemList
                : renderFormWithoutItemList
            }
          />

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
