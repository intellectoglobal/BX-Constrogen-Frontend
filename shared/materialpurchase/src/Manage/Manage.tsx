import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { SaveResponse } from '@igblsln/model';
import { ManageLayout, FormField, useToast, ManageLayoutHandle } from '@igblsln/control';
import { AFTER_API_TIME, useActiveProjectQuery, useActiveVendorsQuery, usePurchaseOrderForInvoiceQuery, useMaterialReceivedItemsForPOQuery, getClientProps, defaultDateFormat } from '@igblsln/store';
import { useGetTransactionQuery, useAddTransactionMutation, useUpdateTransactionMutation, useGetTransactionNextDocIdQuery, Transaction } from '../transactionApi';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { ModuleDocId, Modules } from '../modules';
import ManageItem, { ManageItemHandle } from './ManageItem';
// import './styles.scss';

type Props = {
  moduleName: Modules;
}

const convertDateValue = (value: any, reverse?: boolean) => {
  if (value) {
    return reverse ? `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}` : new Date(value);
  }
  return value;
}

const Manage = ({ moduleName }: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [poData, setPoData] = useState({});
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const [itemsTableChanged, setItemsTableChanged] = useState(false)
  const [docStatus, setDocStatus] = useState<any>("S")
  const [action, setAction] = useState<any>("SAVE")
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const manageItemRef = useRef<ManageItemHandle>();
  const manageLayoutRef = useRef<ManageLayoutHandle>();

  const clientProps = getClientProps();

  const { data, isLoading, refetch } = useGetTransactionQuery(id, {
    skip: isNew
  })

  const { data: docId, isLoading: isDocIdLoading } = useGetTransactionNextDocIdQuery(ModuleDocId[moduleName], {
    skip: !isNew
  })

  const navigate = useNavigate();

  const { data: projects, isLoading: projectsFetching } = useActiveProjectQuery();
  const { data: vendor, isLoading: vendorFetching } = useActiveVendorsQuery();
  const { data: purchaseOrder, isFetching: purchaseOrderFetching } = usePurchaseOrderForInvoiceQuery({ vendor: selectedVendor, project: selectedProject }, { skip: !selectedProject || !selectedVendor });

  const [updateTransaction, { isLoading: isUpdating }] = useUpdateTransactionMutation()
  const [addTransaction, { isLoading: isAdding }] = useAddTransactionMutation()

  useEffect(() => {
    setPoData(data || {
      ...clientProps,
      date: convertDateValue(new Date(), true),
      docid: ModuleDocId[moduleName],
      number: docId?.next_doc_id,
      loctyp: moduleName === 'projects' ? 'PR' : (moduleName === 'inventory' ? 'WH' : '')
    })
    if (data) {
      setSelectedProject(data.proj_key)
      setSelectedVendor(data.vend_key)
    }
  }, [data, docId])

  const [selectedPOId, setSelectedPOId] = useState<number | null>(null)
  const [gridData, setGridData] = useState<any[]>([])
  const { data: purchaseTemplateItems, isFetching: isPurchaseTemplateItemsFetching } = useMaterialReceivedItemsForPOQuery({ id: selectedPOId }, { skip: !selectedPOId })

  useEffect(() => {
    if (purchaseTemplateItems) {
      if (isNew) {
        setGridData(purchaseTemplateItems)
      }
      else {
        let temp = data?.grn_items.concat(purchaseTemplateItems) || []
        setGridData(temp)
      }
    }
  }, [purchaseTemplateItems])

  useEffect(() => {
    if (data) {
      setGridData(data?.grn_items || [])
    }
  }, [data])


  const onSubmit = async (values: any) => {
    const items = manageItemRef.current?.getItems();
    try {
      let resp: SaveResponse<Transaction>;
      if (isNew) {
        resp = await addTransaction({
          ...values,
          action: action,
          loctyp: "PR",
          docstatus: docStatus,
          grn_items: items?.map(x => ({ ...x, ...clientProps })),
          ...clientProps
        }).unwrap();
      } else {
        resp = await updateTransaction({
          ...values,
          action: action,
          docstatus: docStatus,
          grn_items: items?.map(x => ({ ...x, ...clientProps })),
          ...clientProps
        }).unwrap();
      }
      // return;

      refetch();

      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate(`/${moduleName}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className='pl-4 pt-4 grid p-fluid h-full'>
        {/* <div className='col-12 md:col-6 grid grid-nogutter p-fluid' style={{ alignContent: 'flex-start' }}>
          <FormField label="Doc Code" name="docid" className={classNames("col-12 md:col-6")} control={control} errors={errors}
            formItem={{
              component: InputText,
              componentProps: {
                disabled: true
              }
            }} />
          {false && <FormField label="Type" name="loctyp" className="col-12 md:col-6" centerText control={control} errors={errors}
            formItem={{
              component: Dropdown,
              componentProps: {
                optionLabel: "name",
                optionValue: "id",
                options: [{
                  name: 'Project',
                  id: 'PR'
                }, {
                  name: 'Warehouse',
                  id: 'WH'
                }]
              }
            }} />}
        </div> */}
        <FormField label="GRN Number" name="number" isLoading={isDocIdLoading} className="col-12 md:col-6" control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputNumber,
            componentProps: {
              useGrouping: false,
              disabled: true
            }
          }} />
        <FormField label="Project" name="proj_key" className="col-12 md:col-6" control={control} errors={errors}
          required={"Select a Project"}
          isLoading={projectsFetching}
          leftSpan={4}
          rightSpan={6}
          useExplicit
          onChange={(e: any) => {
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
        <FormField label="GRN Date" name="date" className="col-12 md:col-6" useExplicit control={control} errors={errors}
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
        <FormField label="Vendor" name="vend_key" className="col-12 md:col-6" control={control} errors={errors}
          isLoading={vendorFetching}
          required={"Select a Vendor"}
          leftSpan={4}
          rightSpan={6}
          useExplicit
          onChange={(e: any) => {
            setSelectedVendor(e.value)
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear : true,
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              options: vendor
            }
          }} />
        <FormField label="PO Number" name="pono" className="col-12 md:col-6" control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          isLoading={purchaseOrderFetching}
          useExplicit
          onChange={(e: any) => {
            if (!getSaveBtnDisableStatus()) {
              setSelectedPOId(e.value)
            }
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear : true,
              optionLabel: "number",
              optionValue: "key",
              options: purchaseOrder
            }
          }} />
        {/* <div className='col-12 md:col-6' /> */}
        <FormField label="Vendor RefNo" name="vendrefno" className="col-12 md:col-6"
          leftSpan={4}
          rightSpan={6}
          required={"Enter Ref No"}
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }} />

        <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
          <ManageItem
            data={gridData || manageItemRef.current?.getItems() || []}
            isLoading={isLoading}
            moduleName={moduleName}
            ref={manageItemRef}
            disableTable={getSaveBtnDisableStatus()}
            onChange={(value: boolean) => !itemsTableChanged && setItemsTableChanged(value)}
          />

        </div>
      </div>
    )
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
      <ManageLayout baseRoute={`/${moduleName}/${PAGE_ROUTE}`} description={PAGE_NAME} id={id} data={poData}
        isItemsTableChanged={itemsTableChanged}
        ref={manageLayoutRef}
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
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage;