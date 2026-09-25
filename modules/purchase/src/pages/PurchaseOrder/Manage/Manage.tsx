import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { ManageLayout, useToast, ManageLayoutHandle, FormField, DynamicTable } from '@igblsln/control';
import { useAddPurchaseOrderMutation, useUpdatePurchaseOrderMutation, useGetPurchaseOrderQuery } from '../purchaseOrderApi';
import { adjustNumber, AFTER_API_TIME, getClientProps, setPromptNavigate, useActiveVendorsQuery, useAppDispatch, useGetAllItemTypesQuery, useGetItemsForItemTypeQuery, useGetItemTypesForVendorQuery, useGetUOMsForItemTypeQuery, useGetBrandsQuery, reverseDate } from '@igblsln/store'
import ManageItem from './ManageItem'
// import  useGetBrandsAllQuery  from '@igblsln/store'; 

import {
  formatDate,
  convertDateValue,
  useGetNextDocNoQuery,
  useGetActiveProjectsQuery,
  defaultDateFormat
} from '@igblsln/store';
import LoadFromKITModal from '../LoadFromKITModal';
import EditableTable from './CustomTable';
import ItemRateSummary from '../../ItemRateHistory/ItemRateSummary';


type Props = {}

const Manage = (props: Props) => {
  const dispatch = useAppDispatch()
  const { showSuccess, showError } = useToast();
  const [displayKITModal, setDisplayKITModal] = useState(false)
  const [subAmount, setSubAmount] = useState<any>({})
  const [poData, setPoData] = useState({});
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const roundOffRef = useRef<any>(null);
  const [tdsPercent, setTDSPercent] = useState(0)
  const [isTableRowChanged, setIsTableRowChanged] = useState<boolean>(false)
  const [selectedItemForRates, setSelectedItemForRates] = useState<{ itemKey?: number; brand?: number; model?: string } | undefined>(undefined)

  const clientProps = getClientProps();

  const { data, isLoading } = useGetPurchaseOrderQuery(id, {
    skip: isNew,
    refetchOnMountOrArgChange: true
  })

  const [gridData, setGridData] = useState<any[]>([])
  const [invoiceAmount, setInvoiceAmount] = useState(0)
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [selectedItemTypes, setSelectedItemTypes] = useState<any>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)

  const { data: docData } = useGetNextDocNoQuery("PO", { skip: !isNew, refetchOnMountOrArgChange: isNew })
  const { data: vendors, isLoading: vendorsFetching } = useActiveVendorsQuery(undefined, { refetchOnMountOrArgChange: true })
  const { data: projects, isLoading: projectsFetching } = useGetActiveProjectsQuery({}, { refetchOnMountOrArgChange: true })
  const { data: itemTypes } = useGetItemTypesForVendorQuery(selectedVendor, { skip: !selectedVendor })

  const selectedVendorName = React.useMemo(() => {
    if (!selectedVendor) return '';
    const selectedKey = (selectedVendor as any)?.key ?? selectedVendor;
    const selectedKeyAsString = String(selectedKey);
    const match = vendors?.find?.((v: any) => String(v?.key) === selectedKeyAsString);
    return match?.name ?? (typeof selectedVendor === 'object' ? selectedVendor?.name : '') ?? '';
  }, [selectedVendor, vendors]);

  const selectedProjectName = React.useMemo(() => {
    const projKey = selectedProject || (poData as any)?.proj_key;
    if (!projKey) return '';
    const selectedKey = projKey?.key ?? projKey;
    const selectedKeyAsString = String(selectedKey);
    const match = projects?.find?.((p: any) => String(p?.key) === selectedKeyAsString);
    return match?.name ?? (typeof projKey === 'object' ? projKey?.name : '') ?? '';
  }, [selectedProject, (poData as any)?.proj_key, projects]);
  const { data: pItems, isLoading: isItemLoading } = useGetItemsForItemTypeQuery(selectedItemTypes, { skip: !selectedItemTypes, refetchOnMountOrArgChange: true })
  const { data: UOMItems, isLoading: isUOMLoading } = useGetUOMsForItemTypeQuery(selectedItemTypes, { skip: !selectedItemTypes, refetchOnMountOrArgChange: true });
 const { data: brands, isLoading: isBrandLoading } = useGetBrandsQuery(
  { type: selectedItemTypes },
  {
    skip: !selectedItemTypes,
    refetchOnMountOrArgChange: true,
  }
);


  const [addPurchaseOrder, { isLoading: isAdding }] = useAddPurchaseOrderMutation()
  const [updatePurchaseOrder, { isLoading: isUpdating }] = useUpdatePurchaseOrderMutation();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;

      if (gridData.some((x: any) => !x.item_uom_key || !x.item_key || !x.qty)) {
        showError("Missing required fields", "Please fill all the required fields")
        return
      }

      // console.log("date ::", values)

      let body = {
        ...values,
        number: isNew ? docData?.next_doc_id : data?.number,
        date: formatDate(values.date, "yyyy-MM-dd"),
        tdsamt: tdsPercent * invoiceAmount * 0.01,
        items: gridData,
        // roundedamt: roundOffRef.current,
        netamt: getNetAmount(),
        roundedamt: values?.roundedamt || 0,
        discountamt: values?.discountamt || 0,
        handling_chrgs: values?.handling_chrgs || 0,
        transport_chrgs: values?.transport_chrgs || 0,
      }

      if(gridData.length === 0){
        showError("Need Items", "Please select at least one item to create the PO.");
        return
      }

      if (isNew) {
        resp = await addPurchaseOrder({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updatePurchaseOrder({ ...body, ...clientProps, key: data?.key }).unwrap();
      }

      showSuccess('Success', resp.detail);
      dispatch(setPromptNavigate({promptNavigate: false}))
      setTimeout(() => {
        navigate("/purchase/purchaseorder")
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  useEffect(() => {
    setPoData(data || {
      ...clientProps,
      date: convertDateValue(new Date(), true),
      docid: "PO",
      number: docData?.next_doc_id,
      loctyp: 'PR'
    })
    if (data) {
      setGridData(data?.purchs_odr_items || [])
      setSelectedVendor(data.vend_key)
      setSelectedItemTypes(data?.item_type_key)
      setSubAmount({
        transport: data?.transport_chrgs ? parseFloat(data?.transport_chrgs) : 0,
        loadUnload: data?.handling_chrgs ? parseFloat(data?.handling_chrgs) : 0,
        discount: data?.discountamt ? parseFloat(data?.discountamt) : 0,
        roundedamt: data?.roundedamt ? parseFloat(data?.roundedamt) : 0,
        roundoff: data?.rounded_action
      })
      // roundOffRef.current = data?.roundedamt || 0
    }
  }, [data, docData])

  useEffect(() => {
    if (!!gridData.length) {
      let tableAmt = gridData.map((x: any) => parseFloat(x.netamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0)
      setInvoiceAmount(tableAmt)
    } else {
      setInvoiceAmount(0)
    }

    // Clear selected item for rates if it's no longer in the grid
    if (selectedItemForRates?.itemKey) {
      const itemStillExists = gridData.some((row: any) => row.item_key === selectedItemForRates.itemKey);
      if (!itemStillExists) {
        setSelectedItemForRates(undefined);
      }
    }
  }, [gridData])

  const getNetAmount = () => {
    let tableAmt = gridData.map((x: any) => parseFloat(x.netamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0)
    let sub = (subAmount?.transport || 0) + (subAmount?.loadUnload || 0) - (subAmount?.discount || 0)
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


  const columns = [
    // { key: 'id', name: 'ID', editor: 'text', editable: false, width: 60 },
    {
      key: 'item_key',
      name: 'Item',
      editor: 'dropdown',
      required: true,
      // allowEnter : true,
      width: 250,
      options: pItems?.map((d: any) => ({ label: d.descr, value: d.key, gst: d.gst }))
    },
    { key: 'brand', name: 'Brand', editor: 'dropdown', options: brands?.map((b: any) => ({ label: b.name, value: b.key}) ) },
    { key: 'model_number', name: 'Model', editor: 'text' },
    { key: 'qty', required: true, name: 'Quantity', editor: 'number' },
    {
      key: 'item_uom_key',
      name: 'UOM',
      required: true,
      editor: 'dropdown',
      // allowEnter : true,
      options: UOMItems?.map((d: any) => ({ label: d.descr, value: d.key })),
    },
    { key: 'netamt', name: 'Net Amt', editor: 'number' },
    { key: 'gst', name: 'GST', editor: "number" },
    { key: 'gstamt', name: 'GST Amount', editor: "number" },
  ];

  console.log("values ::", poData)

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: any) => {
    return (
      <div style={{ height: '80vh', overflowX: 'hidden', overflowY: 'auto' }}>
        <div style={{ border: '2px solid gray', padding: '5px 20px', width: '100%' }}>
          <div className="flex">
            {!!selectedVendorName && (
              <Tooltip
                mouseTrack
                mouseTrackLeft={24}
                mouseTrackTop={18}
                target="#purchaseorder-manage-vendor"
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
              leftSpan={5}
              rightSpan={7}
              required
              onChange={(e: any) => setSelectedVendor(e.value)}
              formItem={{
                component: Dropdown,
                componentProps: {
                  // showClear: true,
                  id: 'purchaseorder-manage-vendor',
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
                target="#purchaseorder-manage-project"
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
              leftSpan={5}
              rightSpan={7}
              required
              onChange={(e: any) => setSelectedProject(e.value)}
              formItem={{
                component: Dropdown,
                componentProps: {
                  // showClear: true,
                  id: 'purchaseorder-manage-project',
                  optionLabel: "name",
                  optionValue: "key",
                  filter: true,
                  filterBy: "name",
                  options: projects,
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
                  disabled: !selectedVendor
                }
              }} />
          </div>

          <div className="flex">
            <FormField
              label="PO No"
              name="number"
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
            <FormField label="Date" name="date" className="col-12 md:col-4" useExplicit control={control} errors={errors}
              leftSpan={5}
              rightSpan={7}
              convertValue={convertDateValue}
              formItem={{
                component: Calendar,
                componentProps: {
                  showIcon: true,
                  dateFormat: defaultDateFormat
                }
              }} />


            {/* <div className="col-12 md:col-6">
              <div className="field">
                <label className={'col-5'}>Item Types</label>
                <MultiSelect
                  value={selectedItemTypes}
                  onChange={(e) => setSelectedItemTypes(e.value)}
                  options={itemTypes}
                  optionLabel="descr"
                  display="chip"
                  placeholder="Select Item Types"
                  className="col-7 w-full md:w-20rem" />
              </div>
            </div> */}
          </div>


        </div>

        <div style={{ border: '2px solid gray', margin: '10px auto', padding: '5px 20px' }}>
          <div className='pl-4 pt-4 grid p-fluid h-full'>

            <div className="col-12 pr-4">
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
                disabled={!selectedItemTypes}
                onClick={(e) => {
                  e.preventDefault()
                  setDisplayKITModal(true)
                }}
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
                onTableChange={(value: boolean) => !isTableRowChanged && setIsTableRowChanged(value)}
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
            />

            <FormField label="Load/UnLoad (₹)" name="handling_chrgs"
              className="col-12 md:col-4"
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
                  step: '0.01'
                }
              }}
            />

            <FormField label="Discount (₹)" name="discountamt"
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
              className="col-12 md:col-4"
              leftSpan={4}
              rightSpan={8}
              useExplicit
              onChange={(e: any) => {
                setSubAmount((prev: any) => {
                  return {
                    ...prev,
                    roundoff: e.value
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
              className="col-12 md:col-4"
              control={control} errors={errors}
              leftSpan={6}
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
                  // disabled: true,
                  // value: roundOffRef.current
                }
              }}
            /> */}

            <FormField label="Net Amt (₹)" name="netamt"
              className="col-12 md:col-4"
              control={control} errors={errors}
              // required
              leftSpan={4}
              rightSpan={8}
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

      </div>

    )
  }

  return (
    <>
      <ManageLayout
        baseRoute="/purchase/purchaseorder"
        description="PO"
        id={id}
        data={poData}
        isItemsTableChanged={isTableRowChanged}
        isUpdating={isAdding || isUpdating}
        ref={manageLayoutRef}
        isLoading={isLoading}
        onSubmit={onSubmit}
        renderForm={renderForm}
      />
      <LoadFromKITModal
        selectedVendor={selectedVendor}
        displayModal={displayKITModal}
        customDiscard={() => setDisplayKITModal(false)}
        setTableData={setGridData}
      />
    </>
  )
}

export default Manage