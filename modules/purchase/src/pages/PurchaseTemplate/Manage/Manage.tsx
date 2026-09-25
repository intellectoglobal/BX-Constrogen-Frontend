import React, { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { ManageLayout, FormField, useToast } from '@igblsln/control';
import { useAddPurchaseTemplateMutation, useGetPurchaseTemplateQuery, useUpdatePurchaseTemplateMutation } from '../purchaseTemplateApi';
import {
  AFTER_API_TIME,
  getClientProps,
  useGetAllItemTypesQuery,
  useGetItemsForItemTypeQuery,
  useGetNextDocNoQuery
} from '@igblsln/store'
import ManageItem, { ManageItemHandle } from './ManageItem';

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageItemRef = useRef<ManageItemHandle>();

  const clientProps = getClientProps();

  const { data, isLoading, refetch } = useGetPurchaseTemplateQuery(id, {
    skip: isNew
  })

  const [gridData, setGridData] = useState<any[]>([])
  const [selectedItemType, setSelectedItemType] = useState<any>(null)
  const { data: docData, error } = useGetNextDocNoQuery("PT", { skip: !isNew, refetchOnMountOrArgChange: isNew })

  const [addPurchaseTemplate, { isLoading: isAdding }] = useAddPurchaseTemplateMutation()
  const [updatePurchaseTemplate, { isLoading: isUpdating }] = useUpdatePurchaseTemplateMutation();
  const { data: itemTypes, isFetching: itemTypeFetching } = useGetAllItemTypesQuery()

  const { data: purchaseTemplateItems, isFetching: isPurchaseTemplateItemsFetching } = useGetItemsForItemTypeQuery(selectedItemType, { skip: !selectedItemType })

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let purchaseTmplItems = manageItemRef.current?.getItems() || []
      if (isNew) {
        let data = {
          ...values,
          docid: "PT",
          number: docData?.next_doc_id,
          purchs_template_items: purchaseTmplItems
        }
        resp = await addPurchaseTemplate({ ...data, ...clientProps, purchs_template_items: purchaseTmplItems }).unwrap();
      } else {
        resp = await updatePurchaseTemplate({ ...values, ...clientProps, purchs_template_items: purchaseTmplItems }).unwrap();
      }
      await manageItemRef.current?.saveItem({ p_template_id: resp.data.key, ...clientProps, items: purchaseTmplItems });

      refetch();
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate("/purchase/purchasetemplate")
      }, AFTER_API_TIME);
    } catch (e) {
      showError('An error occurred', "We couldn't save your post, try again!");
    }
  }

  useEffect(() => {
    if (purchaseTemplateItems) {
      if (isNew) {
        let temp = purchaseTemplateItems.map(d => {
          return {
            item_key: d.key,
            itemuom_key: d.itemuom_key
          }
        })
        setGridData(temp)
      }
      else {
        let temp = data?.purchs_template_items.concat(purchaseTemplateItems.map(d => {
          return {
            item_key: d.key,
            itemuom_key: d.itemuom_key
          }
        }))
        setGridData(temp)
      }
    }
  }, [purchaseTemplateItems])

  useEffect(() => {
    if (!isNew && data) {
      setGridData(data.purchs_template_items)
      setSelectedItemType(data.itemtyp_key)
    }
  }, [data])

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-6'>
      <div className="flex">
        {/* <div className="field col-6">
          <label htmlFor="docid" className={classNames('col-3', { 'p-error': errors.docid })}>Doc Code</label>
          <Controller defaultValue={"PT"} name="docid" control={control} rules={{}} render={({ field, fieldState }) => (
            <InputText disabled id={field.name} {...field} />
          )} />
        </div> */}
        <div className="field col-6">
          <label htmlFor="number" className={classNames('col-4', { 'p-error': errors.number })}>Template No</label>
          <Controller defaultValue={docData?.next_doc_id} name="number" control={control} rules={{}} render={({ field, fieldState }) => (
            <InputText disabled id={field.name} {...field} value={data?.number || docData?.next_doc_id} />
          )} />
        </div>
      </div>
      <div className="flex">

        <FormField
          label="Template Name"
          name="name"
          className="field col-6"
          control={control}
          errors={errors}
          required
          leftSpan={4}
          rightSpan={5}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 50
            }
          }} />

        <div className="field col-6" style={{ padding: 10 }}>
          <label style={{ margin: 'auto' }} htmlFor="inactive" className={classNames('col-4', { 'p-error': errors.inactive })}>Inactive</label>
          <Controller defaultValue={"N"} name="inactive" control={control} render={({ field, fieldState }) => (
            <Checkbox checked={field.value} trueValue={"Y"} falseValue={"N"} id={field.name} {...field} style={{ marginBottom: 6 }}></Checkbox>
          )} />
        </div>
      </div>
      <div className="field col-6">
        <FormField label="Item Type"
          name="itemtyp_key"
          control={control} errors={errors}
          isLoading={itemTypeFetching}
          required
          leftSpan={4}
          rightSpan={5}
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
              filterBy: "descr",
              options: itemTypes,
            }
          }} />
      </div>
      <div className="col-8" style={{ minHeight: 200, maxHeight: 500, marginBottom: 10 }}>

        <ManageItem
          selectedItemType={selectedItemType}
          data={data?.purchs_template_items || []}
          isLoading={isLoading}
          ref={manageItemRef}
        />
      </div>

    </div>)
  }

  return (
    <>
      <ManageLayout baseRoute="/purchase/purchasetemplate" description="Purchase Template" id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm}
        bottomControl
      />
    </>
  )
}

export default Manage