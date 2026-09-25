import React, { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { ManageLayout, FormField, useToast, ListLayout, Datacolumn } from '@igblsln/control';
import { useAddPurposesMutation, useGetPurposesQuery, useUpdatePurposesMutation } from '../purposesApi';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps, setPromptNavigate } from '@igblsln/store'
import { useListItemTypesQuery } from '../../ItemType/itemTypesApi';
import { useDispatch } from "react-redux";

type Props = {}


const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const dispatch = useDispatch();

  const clientProps = getClientProps();
  const [specData, setSpecData] = useState<any[]>([])
  const specDataRef = useRef<any[]>([]);

  const { data, isLoading } = useGetPurposesQuery(id, {
    skip: isNew
  })
  const [addPurposes, { isLoading: isAdding }] = useAddPurposesMutation()
  const [updatePurposes, { isLoading: isUpdating }] = useUpdatePurposesMutation();

  const { data: itemTypes, isFetching: itemTypesFetching } = useListItemTypesQuery({page : 1, size : 1000})

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (isNew) {
        resp = await addPurposes({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updatePurposes({ ...values, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false}))
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const shouldAllowAdd = (items: any[]) => {
    if (items.length === 0) return true
    let temp = items[items.length - 1]
    return temp?.item_descr
  }

  const actionBodyTemplate = (value: any) => {
    return <Button
      style={{ height: '35px', width: '20px', marginLeft: 20 }}
      type="button"
      onClick={() => {
        const updValue = specDataRef.current.filter(x => x.item_descr !== value.item_descr)
        setSpecData(updValue);
        specDataRef.current = updValue
      }}
      className="p-button-rounded p-button-text"
      icon="pi pi-trash"></Button>
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className='pl-8 pt-4 pb-3 grid p-fluid'>


        <FormField label="Material Item Type" name="itemtyp_key" className="col-12" control={control} errors={errors}
          isLoading={itemTypesFetching}
          required={"Select an Material Item"}
          leftSpan={2}
          rightSpan={5}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              options: itemTypes?.results,
            }
          }} />

        <FormField label="Description" name="name" className="col-12"
          control={control} errors={errors}
          required
          leftSpan={2}
          rightSpan={5}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
            }
          }} />



        {/* <FormField label="No Of Material Items" name="no_of_items" className="col-12"
          control={control} errors={errors}
          leftSpan={2}
          rightSpan={5}
          formItem={{
            component: InputText,
            componentProps: {
              type: 'number',
              disabled: true,
              value : specData.length
            }
          }} /> */}


        {/* <div style={{ width: '58%', minHeight: 200 }}>
          <ListLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading}
            data={specData}
            newTable
            tableLayoutClass='h-full'
            allowFilters={false}
            actionColumnWidth={"5%"}
            actionBodyTemplate={actionBodyTemplate}
            gridProps={{
              style: {
                overflowX: 'hidden',
              },
              allowAdd: true,
              disableAdd: !shouldAllowAdd(specData),
              OnRowsChanged: (rows: any[]) => {
                setSpecData(rows)
                specDataRef.current = rows
              },
            }}>

            <Datacolumn field="item_descr" header="Material Item Description" editorType="text" />
          </ListLayout>
        </div> */}


      </div>
    )
  }

  return (
    <>
      <ManageLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage