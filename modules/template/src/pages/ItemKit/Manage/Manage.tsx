import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormGetValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { Tooltip } from 'primereact/tooltip';
import { ManageLayout, FormField, useToast, ListLayout, Datacolumn } from '@igblsln/control';
import { useAddItemKitTemplateMutation, useGetItemKitTemplateQuery, useUpdateItemKitTemplateMutation } from '../api';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps, useAuth, useGetAllCompaniesQuery, useGetAllContractorTypeQuery, useGetAllItemTypesQuery, useGetAllUOMsQuery, useGetPurposesForItemTypeQuery } from '@igblsln/store'
import ManageTable from './ManageTable';

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false);
  const [tableChanged, setTableChanged] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState(false);

  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;

  const clientProps = getClientProps();

  const { data, isLoading } = useGetItemKitTemplateQuery(id, {
    skip: isNew
  })
  const { data: itemTypes } = useGetAllItemTypesQuery(undefined, { refetchOnMountOrArgChange: true })
  const { data: purposes } = useGetPurposesForItemTypeQuery(selectedItemType, { refetchOnMountOrArgChange: true, skip : !selectedItemType })

  const [tableData, setTableData] = useState<any[]>([]);
  const [addItemKitTemplate, { isLoading: isAdding }] = useAddItemKitTemplateMutation()
  const [updateItemKitTemplate, { isLoading: isUpdating }] = useUpdateItemKitTemplateMutation();

  useEffect(() => {
    if (data) {
      setTableData(data?.item_kit_template_detail || [])
      setSelectedItemType(data?.item_type_key)
    }
  }, [data])

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let body = {
        ...clientProps,
        ...values,
        item_kit_template_detail: tableData
      }
      console.log(body);
      // return;
      if (isNew) {
        resp = await addItemKitTemplate(body).unwrap();
      } else {
        resp = await updateItemKitTemplate(body).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      console.log(error)
      showError(error?.data?.message || "An Error Occured", "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: UseFormGetValues<any>) => {
    return (<div
      className='pl-8'>

      <FormField
        label="Kit Name"
        name="kit_name"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100
          }
        }} />


      <FormField
        label="Item Type"
        name="item_type_key"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={4}
        onChange={(e: any) => {
          setSelectedItemType(e.value);
        }}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear: true,
            optionLabel: "descr",
            optionValue: "key",
            filter: true,
            filterBy: "descr",
            options: itemTypes
          }
        }} />

      <FormField
        label="Purpose"
        name="purpose_key"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear: true,
            optionLabel: "name",
            optionValue: "key",
            filter: true,
            filterBy: "name",
            options: purposes
          }
        }} />

      <FormField
        label="Description"
        name="description"
        control={control}
        errors={errors}
        leftSpan={2}
        rightSpan={6}
        // required
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100,
          }
        }} />

      <div className="col-10" style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
        <ManageTable
          data={tableData}
          isLoading={isLoading}
          onTableChange={(value: boolean) => !tableChanged && setTableChanged(value)}
          onChange={(value: any[]) => setTableData(value)}
        />
      </div>


    </div>)
  }

  return (
    <>
      <ManageLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isItemsTableChanged={tableChanged}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage