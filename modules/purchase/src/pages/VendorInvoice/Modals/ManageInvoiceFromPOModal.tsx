import React, { useEffect, useRef, useState } from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue, set } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'primereact/tooltip';
import { AutoComplete } from 'primereact/autocomplete';
import {
  ManageLayout,
  useToast,
  ManageLayoutHandle,
  FormField,
  ListLayout,
  Datacolumn,
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
  defaultDateFormat,
  tdsDropdownOptions
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';
import { useListPurchaseOrderQuery } from '../../PurchaseOrder/purchaseOrderApi';
import ImageUploader, { ImageItem } from './ImageUploader';

type Props = {
  displayModal: boolean,
  customDiscard: any,
  id?: any
}

export default function ManageInvoiceFromPOModal({ id, displayModal, customDiscard }: Props) {

  const isNew = !id
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const [formData, setFormData] = useState<any>({});
  const [invoiceAmount, setInvoiceAmount] = useState(0)
  const [tdsPercent, setTDSPercent] = useState(0)
  const [gstAmount, setGSTAmount] = useState(0)
  const [filteredTDSPercent, setFilteredTDSPercent] = useState<any[]>([])
  const [selectedPOs, setSelectedPOs] = useState<any>(null);
  const [selectedPODetail, setSelectedPODetail] = useState<any>({});
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedVendorKey, setSelectedVendorKey] = useState<any>(null)
  const [subAmount, setSubAmount] = useState<any>({})

  const clientProps = getClientProps();

  const { data: docData } = useGetNextDocNoQuery("VIN", { refetchOnMountOrArgChange: true, skip: !isNew })
  const { data: vendors, isLoading: vendorsFetching } = useActiveVendorsQuery()
  const { data: projects, isLoading: projectsFetching } = useActiveProjectQuery()
  const { data: allPOs, isFetching: isPOLoading } = useListPurchaseOrderQuery({ page: 1, size: 100, project: selectedProjectKey, vendor: selectedVendorKey }, { skip: !selectedProjectKey || !selectedVendorKey, refetchOnMountOrArgChange: true })

  const selectedVendorName = React.useMemo(() => {
    if (!selectedVendorKey && !formData?.vend_key) return '';
    const vendorKey = selectedVendorKey || formData?.vend_key;
    const selectedKey = (vendorKey as any)?.key ?? vendorKey;
    const selectedKeyAsString = String(selectedKey);
    const match = vendors?.find?.((v: any) => String(v?.key) === selectedKeyAsString);
    return match?.name ?? (typeof vendorKey === 'object' ? vendorKey?.name : '') ?? '';
  }, [selectedVendorKey, formData?.vend_key, vendors]);

  const selectedProjectName = React.useMemo(() => {
    if (!selectedProjectKey && !formData?.proj_key) return '';
    const projectKey = selectedProjectKey || formData?.proj_key;
    const selectedKey = (projectKey as any)?.key ?? projectKey;
    const selectedKeyAsString = String(selectedKey);
    const match = projects?.find?.((p: any) => String(p?.key) === selectedKeyAsString);
    return match?.name ?? (typeof projectKey === 'object' ? projectKey?.name : '') ?? '';
  }, [selectedProjectKey, formData?.proj_key, projects]);
  const [tableData, setTableData] = useState<any>([])
  const [images, setImages] = useState<ImageItem[]>([])

  const ref = useRef(allPOs?.results || []);

  const { data } = useGetInvoiceQuery(id, {
    skip: isNew,
    refetchOnMountOrArgChange: true
  })

  useEffect(() => {
    setFormData(data || {
      invoicedate: convertDateValue(new Date(), true),
      method: "FromPO",
      invoiceno: docData?.next_doc_id
    })

    if (data) {
      setSelectedProjectKey(data.proj_key)
      setSelectedPOs(data?.po_key)
      setInvoiceAmount(parseFloat(data?.invamt) || 0)
      let tdspercent = (data?.tdsamt / data?.invamt) * 100
      setTDSPercent(tdspercent)
      setSubAmount({
        transport: data?.transport_chrgs ? parseInt(data?.transport_chrgs) : 0,
        loadUnload: data?.handling_chrgs ? parseInt(data?.handling_chrgs) : 0,
        discount: data?.discountamt ? parseInt(data?.discountamt) : 0,
        roundedamt: data?.roundedamt ? parseFloat(data?.roundedamt) : 0,
        roundoff: data?.rounded_action
      })
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

  useEffect(() => {
    if (selectedPODetail) {
      setInvoiceAmount((parseFloat(selectedPODetail?.netamt) || 0))
    } else {
      setTDSPercent(0)
    }
  }, [selectedPODetail])

  useEffect(() => {
    if (allPOs) {
      let temp = allPOs.results.map(d => {
        return {
          ...d,
          uuid: Math.random(),
        }
      })
      setTableData(temp)
      ref.current = temp;
    }

  }, [allPOs])


  const [addInvoice, { isLoading: isAdding }] = useAddInvoiceMutation()
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation()


  const onSubmit = async (values: any) => {
    try {

      if (!selectedPOs) {
        showError("No PO Selected", "Select atleast 1 PO")
        return
      }

      let body = {
        ...values,
        // tdsamt: selectedPODetail?.tdsamt,
        // gstamt: selectedPODetail?.gstamt,
        invamt: invoiceAmount,
        netamt: getNetAmount(),
        tdsamt: getTdsValue(),
        invoiceno: isNew ? docData?.next_doc_id : values.invoiceno,
        invoicedate: formatDate(values.invoicedate, 'yyyy-MM-dd'),
        images: images.map(img => ({ key: img.key, image_url: img.base64 })),
        po_key: selectedPOs
      }
      let resp: any;
      if (isNew)
        resp = await addInvoice({ ...body, ...clientProps }).unwrap();
      else
        resp = await updateInvoice({ ...body, ...clientProps }).unwrap();
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        customDiscard()
      }, AFTER_API_TIME);
    } catch (error: any) {
      console.log(error)
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const getCheckboxEditor = ({ row, column, onRowChange, onClose }: any) => {
    return <Checkbox style={{ width: '100%', display: 'flex', margin: '10px auto', justifyContent: 'center' }}
      checked={row[column.key]}
      onChange={async (e: any) => {
        console.log(e.checked)
        if (e.checked) {
          setSelectedPOs(row?.key)
          setSelectedPODetail(row)
        }
        else {
          setSelectedPOs(null)
          setSelectedPODetail({})
        }
        onRowChange({ ...row, [column.key]: e.checked }, true)
        onClose(true)
      }}
      tabIndex={-1} />
  };

  const getTdsValue = () => {
    const tdsPercen = isNaN(Number(tdsPercent)) ? 0 : Number(tdsPercent);
    const invoiceAmoun = isNaN(Number(invoiceAmount)) ? 0 : Number(invoiceAmount);
    const gstAmoun = isNaN(Number(gstAmount)) ? 0 : Number(gstAmount);

    const value = tdsPercen * (invoiceAmoun + gstAmoun) * 0.01;
    return value.toFixed(2); // ensures string with 2 decimals
  };

  useEffect(() => {
    if (selectedPODetail && selectedPODetail.purchs_odr_items) {
      const totalGst = selectedPODetail.purchs_odr_items.reduce(
        (sum: number, item: any) => {
          const val = parseFloat(item?.gstamt ?? 0); // ensure number
          return sum + (isNaN(val) ? 0 : val);
        },
        0
      );

      setGSTAmount(totalGst.toFixed(2));
    } else {
      setGSTAmount(0.00);
    }
  }, [selectedPODetail]);


  const getNetAmount = () => {
    const transport = Number(subAmount?.transport) || 0;
    const loadUnload = Number(subAmount?.loadUnload) || 0;
    const discount = Number(subAmount?.discount) || 0;
    const gst = Number(gstAmount) || 0;
    const roundedAmt = Number(subAmount?.roundedamt) || 0;
    const invoice = Number(invoiceAmount) || 0;

    let sub = transport + loadUnload - discount + gst;

    let total = invoice + sub + (
      subAmount?.roundoff === 'A'
        ? roundedAmt
        : subAmount?.roundoff === 'S'
          ? -roundedAmt
          : 0
    );

    return total;
  }


  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: any, setValue: UseFormSetValue<any>) => {

  useEffect(() => {
    if (gstAmount !== null && gstAmount !== undefined) {
      // put your "onChange" side effects here
      // console.log("GST changed:", gstAmount);
      // e.g. call react-hook-form's setValue
      setValue("gstamt", gstAmount);
    }
  }, [gstAmount, setValue]);

    return (
      <div>
        <div style={{ padding: '5px 20px' }}>
          <div className="flex">
            {!!selectedVendorName && (
              <Tooltip
                mouseTrack
                mouseTrackLeft={24}
                mouseTrackTop={18}
                target="#invoicefrompo-vendor"
                position="bottom"
                content={selectedVendorName}
                className="my-tooltip-plain"
              />
            )}
            <FormField label="Vendor"
              name="vend_key"
              control={control} errors={errors}
              isLoading={vendorsFetching}
              className="col-12 md:col-6"
              leftSpan={4}
              rightSpan={6}
              useExplicit
              onChange={(e: any) => {
                setSelectedVendorKey(e.target.value)
              }}
              required
              formItem={{
                component: Dropdown,
                componentProps: {
                  showClear: true,
                  id: 'invoicefrompo-vendor',
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
                target="#invoicefrompo-project"
                position="bottom"
                content={selectedProjectName}
                className="my-tooltip-plain"
              />
            )}
            <FormField label="Project Name"
              name="proj_key"
              control={control} errors={errors}
              isLoading={projectsFetching}
              className="col-12 md:col-6"
              leftSpan={4}
              rightSpan={6}
              required
              useExplicit
              onChange={(e: any) => {
                setSelectedProjectKey(e.target.value)
              }}
              formItem={{
                component: Dropdown,
                componentProps: {
                  showClear: true,
                  id: 'invoicefrompo-project',
                  optionLabel: "name",
                  optionValue: "key",
                  filter: true,
                  filterBy: "name",
                  options: projects,
                }
              }} />

          </div>

          <div className="flex">

            <FormField
              label="Invoice No"
              name="invoiceno"
              className="col-12 md:col-6"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true,
                }
              }} />

            <FormField
              label="Creation Method"
              name="method"
              className="col-12 md:col-6"
              control={control}
              errors={errors}
              leftSpan={4}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 25,
                  disabled: true,
                  value: "FromPO"
                }
              }} />
          </div>

          <div className="flex">

            <FormField label="Date" name="invoicedate" useExplicit control={control} errors={errors}
              leftSpan={4}
              rightSpan={6}
              required
              className="col-12 md:col-6"
              convertValue={convertDateValue}
              formItem={{
                component: Calendar,
                componentProps: {
                  showIcon: true,
                  dateFormat: defaultDateFormat
                }
              }} />

            <FormField label="Invoice Amount" name="invamt"
              // required
              leftSpan={4}
              rightSpan={6}
              className="col-12 md:col-6"
              control={control} errors={errors} formItem={{
                component: InputText,
                componentProps: {
                  disabled: true,
                  value: parseFloat(selectedPODetail?.netamt || data?.invamt || 0)
                  // value: invoiceAmount || 0,
                }
              }} />
          </div>

          <div className="flex">

            <FormField label="GST" name="gstamt"
              leftSpan={4}
              rightSpan={6}
              className="col-12 md:col-6"
              onChange={(event: any) => {
                setGSTAmount(parseFloat(event.target.value))
              }}
              control={control} errors={errors} formItem={{
                component: InputText,
                componentProps: {
                  step: 0.01,
                  type: 'number',
                  disabled: !selectedPOs,
                  value: gstAmount,
                }
              }} />

            <FormField label="TDS (%)" name="tdspercent"
              leftSpan={4}
              rightSpan={6}
              className="col-12 md:col-6"
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
                  dropdown: true,
                  disabled: !selectedPOs,
                }
              }} />
          </div>

          <div className="flex">
            <FormField label="TDS (₹)" name="tdsamt"
              className="col-12 md:col-6"
              leftSpan={4}
              rightSpan={6}
              control={control} errors={errors}
              formItem={{
                component: InputText,
                componentProps: {
                  disabled: true,
                  type: 'number',
                  value: getTdsValue(),
                  // value: ((isNaN(tdsPercent) ? 0 : tdsPercent) * (isNaN(invoiceAmount) ? 0 : invoiceAmount + (isNaN(gstAmount) ? 0 : gstAmount)) * 0.01)
                }
              }} />


            <FormField label="Vendor Invoice No" name="vendor_invoice_no"
              leftSpan={4}
              rightSpan={6}
              className="col-12 md:col-6"
              control={control} errors={errors} formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 100,
                  disabled: !selectedPOs,
                }
              }} />


            {/* <FormField label="Vendor Invoice No" name="vendor_invoice_no"
              leftSpan={4}
              rightSpan={6}
              className="col-12 md:col-6"
              control={control} errors={errors} formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 100,
                }
              }} /> */}
          </div>
          <div className="flex">
            <FormField label="Transport (₹)" name="transport_chrgs"
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
                    transport: parseFloat(e.target.value)
                  }
                })
              }}
              formItem={{
                component: InputText,
                componentProps: {
                  type: 'number',
                  min: 0,
                  step: '0.01',
                  disabled: !selectedPOs,
                }
              }}
            />

            <FormField label="Load/UnLoad (₹)" name="handling_chrgs"
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
                    loadUnload: parseFloat(e.target.value)
                  }
                })
              }}
              formItem={{
                component: InputText,
                componentProps: {
                  type: 'number',
                  min: 0,
                  step: '0.01',
                  disabled: !selectedPOs,
                }
              }}
            />
          </div>

          <div className="flex">
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
                  step: '0.01',
                  disabled: !selectedPOs,
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
                console.log(e.value)
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
                  disabled: !selectedPOs,
                }
              }} />

          </div>

          <div className="flex">

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
                component: InputText,
                componentProps: {
                  maxLength: 50,
                  disabled: true,
                  value: getNetAmount()
                }
              }}
            />
          </div>


        </div>

        <div key={selectedPOs} className="col-12 " style={{ minHeight: 200, }}>

          <ListLayout
            hideActionColumn
            hideAddButton
            allowFilters={false}
            isLoading={isPOLoading}
            data={tableData}
            newTable
            showHeader
          // gridProps={{
          //   OnRowsChanged: (rows: any[]) => {
          //     let temp = rows.filter(r => r.selected).map(r => r.key)
          //     setSelectedPOs(temp)
          //   },
          // }}
          >
            <Datacolumn field="date" header="PO Date" filteringType='date' />
            <Datacolumn field="number" header="PO Number" filteringType='text' />
            <Datacolumn field="vendor.name" header="Vendor" filteringType='text' />
            <Datacolumn field="netamt" header="Amount" type='currency' filteringType='currency' />
            {/* <Datacolumn width={"10%"} field="selected" header="Select"
              valueGetter={(row) => row.key === selectedPOs}
              type="checkbox" editorType={getCheckboxEditor} /> */}

            <Datacolumn width={"10%"} field="selected"
              displayValueGetter={(row, field) => {
                return <Checkbox
                  checked={row.selected}
                  onChange={() => {
                    let temp = ref.current?.map(d => {
                      if (d?.uuid === row?.uuid) {
                        if (!d.selected) {
                          setSelectedPOs(row?.key)
                          setSelectedPODetail(row)
                        }
                        else {
                          setSelectedPOs(null)
                          setSelectedPODetail({})
                        }
                        return {
                          ...d,
                          selected: !d.selected
                        }
                      }
                      else return {
                        ...d,
                        selected: false
                      }
                    })

                    ref.current = temp;
                    setTableData(temp);
                  }}
                  style={{ width: '100%', display: 'flex', margin: '10px auto', justifyContent: 'center' }} />
              }}
              header="Select" />

          </ListLayout>
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
      <Dialog
        header={isNew ? `Create New Vendor Invoice` : `Edit Vendor Invoice`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        draggable={false} resizable={false} closable
      >
        <ManageLayout
          baseRoute="/payment/vendorpayment"
          bottomControl
          data={formData}
          hideHeader
          saveBtnLabel={isNew ? 'Generate' : 'Update'}
          customDiscard={customDiscard}
          ref={manageLayoutRef}
          isUpdating={isAdding || showingToast}
          onSubmit={onSubmit}
          renderForm={renderForm}
        />
      </Dialog>
    </>
  )
}
