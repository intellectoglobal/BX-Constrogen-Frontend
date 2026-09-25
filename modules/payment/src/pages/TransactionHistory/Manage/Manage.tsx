import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { ManageLayout, useToast, ManageLayoutHandle, FormField } from '@igblsln/control';
import { useAddPurchaseOrderMutation, useUpdatePurchaseOrderMutation, useGetPurchaseOrderQuery, useAddVendorInvoiceMutation, useAddContractInvoiceMutation } from '../apis';
import { AFTER_API_TIME, ViewModalBorderRadius, getClientProps, useActiveVendorsQuery, useGetAllItemTypesQuery, useGetItemTypesForVendorQuery } from '@igblsln/store'
import {
  formatDate,
  usePurchaseTemplateItemsForIdQuery,
  convertDateValue,
  useGetNextDocNoQuery,
  useGetActiveProjectsQuery,
  useGetActivePurchaseTemplatesForItemTypeQuery,
  defaultDateFormat
} from '@igblsln/store';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';


type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [poData, setPoData] = useState({});
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageLayoutRef = useRef<ManageLayoutHandle>();

  const clientProps = getClientProps();

  const { data, isLoading } = useGetPurchaseOrderQuery(id, {
    skip: isNew,
    refetchOnMountOrArgChange: true
  })

  // const { data: pTemplate } = useListPurchaseTemplateQuery({})

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [gridData, setGridData] = useState<any[]>([])
  const [selectedItemType, setSelectedItemType] = useState<any>(null)
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const { data: purchaseTemplateItems, isFetching: isPurchaseTemplateItemsFetching } = usePurchaseTemplateItemsForIdQuery({ id: selectedTemplateId }, { skip: !selectedTemplateId })


  const { data: docData } = useGetNextDocNoQuery("PO", { skip: !isNew, refetchOnMountOrArgChange: isNew })
  const { data: vendors, isLoading: vendorsFetching } = useActiveVendorsQuery()
  const { data: projects, isLoading: projectsFetching } = useGetActiveProjectsQuery({})
  // const { data: itemTypes, isFetching: itemTypeFetching } = useGetAllItemTypesQuery()
  const { data: itemTypes, isFetching: itemTypeFetching } = useGetItemTypesForVendorQuery(selectedVendor, { skip: !selectedVendor })


  const [addPurchaseOrder, { isLoading: isAdding }] = useAddPurchaseOrderMutation()
  const [updatePurchaseOrder, { isLoading: isUpdating }] = useUpdatePurchaseOrderMutation();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let body = {
        ...values,
        docid: "PO",
        number: isNew ? docData?.next_doc_id : data?.number,
        date: formatDate(values.date, 'yyyy-MM-dd'),
        loctyp: "PR",
        itemtyp_key: selectedItemType,
      }

      if (isNew) {
        resp = await addPurchaseOrder({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updatePurchaseOrder({ ...body, ...clientProps, key: data?.key }).unwrap();
      }

      showSuccess('Success', resp.detail);

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
      setSelectedItemType(data.itemtyp_key)
      setSelectedVendor(data.vend_key)
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

      <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>
        <FormField label="Payment ID" name="number" className="col-12 md:col-6" control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              // useGrouping: false,
              // disabled: true,
              // value: data?.number || docData?.next_doc_id
            }
          }} />

        <FormField label="Amount" name="proj_key" className="col-12 md:col-6" control={control} errors={errors}
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

        <FormField label="Date" name="date" className="col-12 md:col-6" useExplicit control={control} errors={errors}
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

        <FormField label="Type" name="descr7" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: Dropdown,
            componentProps: {
              options: ["Income", "Expense"]
            }
          }}
        />

      </div>

      <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>

        <FormField label="Company Name" name="proj_key" className="col-12 md:col-6" control={control} errors={errors}
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

        <FormField label="Account Name" name="descr2" className="col-12 md:col-6" control={control} errors={errors}
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

        <FormField label="Beneficiary Type" name="descr7" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: Dropdown,
            componentProps: {
              options: ["Vendor", "Contractor", "Employee", "Taxer", "Flat Purchaser", "Land Purchaser", "Miscellaneous"]
            }
          }}
        />

        <FormField label="Beneficiary Name" name="descr1" className="col-12 md:col-6" control={control} errors={errors}
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

        <div className="flex" style={{ width: '70%', marginLeft: 10 }}>
          <div className="field grid grid-nogutter p-fluid col-12" style={{ paddingLeft: 0, marginBottom: 3 }}>
            <label htmlFor="modeofpay" style={{ marginRight: 3 }} className={'col-3'}>Payment Mode</label>
            <div className="flex col-8 m-auto">
              {
                ["Cash", "Cheque", "Net Transfer"].map((d) => (
                  <div key={d} className="field m-auto" style={{ width: '30%' }}>
                    <div className="field-radiobutton" onClick={() => {
                      // setSelectedModeOfPay(d)
                    }}>
                      <RadioButton
                        name={d}
                        value={d}
                        // checked={selectedModeOfPay === d}
                        defaultChecked={d === "Cash"}
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

        <FormField label="Reference ID " name="descr8" className="col-12 md:col-6" control={control} errors={errors}
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

        <FormField label="Transaction ID List" name="descr9" className="col-12 md:col-6" control={control} errors={errors}
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
      </div>

    </div>)
  }

  return (
    <>
      <ManageLayout
        baseRoute={`/payment/${PAGE_ROUTE}`}
        description={PAGE_NAME}
        id={id}
        data={poData}
        isUpdating={isAdding || isUpdating}
        ref={manageLayoutRef}
        isLoading={isLoading}
        onSubmit={onSubmit}
        renderForm={renderForm}
      />
    </>
  )
}

export default Manage