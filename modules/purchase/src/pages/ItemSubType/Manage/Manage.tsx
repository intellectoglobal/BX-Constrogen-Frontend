import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ManageLayout, FormField, useToast, ListLayout, Datacolumn } from '@igblsln/control';
import { useAddItemSubTypesMutation, useGetItemSubTypesQuery, useUpdateItemSubTypesMutation } from '../itemSubTypesApi';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { AFTER_API_TIME, getClientProps, setPromptNavigate, useGetAllItemTypesQuery, useGetUOMsForItemTypeQuery } from '@igblsln/store'
import { useListItemTypesQuery } from '../../ItemType/itemTypesApi';
import { useDispatch } from 'react-redux';

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [initialSetDone, setInitialSetDone] = useState(false)
  const [showSpecTable, setShowSpecTable] = useState(false)
  const [showUOMTable, setShowUOMTable] = useState(false)

  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const specDataRef = useRef<any[]>([]);
  const dispatch = useDispatch();

  const clientProps = getClientProps();
  const [selectedUOMs, setSelectedUOMs] = useState<any[]>([]);

  const { data, isLoading } = useGetItemSubTypesQuery(id, {
    skip: isNew
  })
  const [selectedItemType, setSelectedItemType] = useState<any>(null)
  const [specData, setSpecData] = useState<any[]>([])

  const [addItemSubTypes, { isLoading: isAdding }] = useAddItemSubTypesMutation()
  const [updateItemSubTypes, { isLoading: isUpdating }] = useUpdateItemSubTypesMutation();

  const { data: itemTypes, isFetching: itemTypesFetching } = useGetAllItemTypesQuery(undefined, { refetchOnMountOrArgChange: true })

  const { data: UOMs, isLoading: UOMsFetching } = useGetUOMsForItemTypeQuery(selectedItemType, { skip: !selectedItemType, refetchOnMountOrArgChange: true });

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let data = {
        ...values,
        specifications: specDataRef.current.map(d => {
          return {
            descr: d?.item_descr
          }
        }),
        uoms: selectedUOMs.map(d => {
          return {
            item_uom_key: d.key
          }
        }),
        ...clientProps
      }
      if (isNew) {
        resp = await addItemSubTypes(data).unwrap();
      } else {
        resp = await updateItemSubTypes(data).unwrap();
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

  useEffect(() => {
    if (data) {
      setSelectedItemType(data.itemtyp_key)
      if (data?.specifications) {
        setShowSpecTable(true)
        let temp = data?.specifications.map((d:any) => {
          return {
            item_descr: d.descr
          }
        })
        specDataRef.current = temp
        setSpecData(temp)
      }
    }
  }, [data])

  useEffect(() => {
    if (data?.uoms && UOMs && !initialSetDone) {
      setInitialSetDone(true)
      setShowUOMTable(true)
      let temp1 = data.uoms.map((d:any) => parseInt(d.item_uom_key))
      let temp2 = UOMs?.filter(d => temp1.includes(d.key))
      setSelectedUOMs(temp2)
    }
  }, [UOMs])



  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className='pl-8 pt-4 pb-3 grid p-fluid'>

        {/* <FormField label="Type Code" name="id" className="col-12"
          control={control} errors={errors}
          required
          leftSpan={2}
          rightSpan={3}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25,
              disabled: !isNew,
            }
          }} /> */}

        <FormField label="Material Item Type" name="itemtyp_key" className="col-12" control={control} errors={errors}
          isLoading={itemTypesFetching}
          required={"Select an Material Item Type"}
          leftSpan={2}
          rightSpan={5}
          useExplicit
          onChange={(e: any) => {
            setSelectedItemType(e.value)
            setSelectedUOMs([])
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

        <FormField label="Material Item Sub Type" name="descr" className="col-12"
          control={control} errors={errors}
          required={"Enter Description"}
          leftSpan={2}
          rightSpan={5}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
            }
          }} />


        <FormField label="GST (%)" name="gst" className="col-12"
          control={control} errors={errors}
          required={"Enter GST"}
          leftSpan={2}
          rightSpan={5}
          formItem={{
            component: InputText,
            componentProps: {
              type: 'number',
              min: 0,
              max: 100
            }
          }} />


        <div className="row flex" style={{ width: '90%' }}>
          <div className='col-6'>

            <Button style={{ width: "60%", marginBottom: 30 }}
              label='Add Specification'
              disabled={showSpecTable}
              onClick={(e) => {
                e.preventDefault()
                setShowSpecTable(true)
              }} />

            <div style={{ width: '80%', marginRight: 50, visibility: showSpecTable ? 'visible' : 'hidden' }}>
              <ListLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading}
                data={specData}
                newTable
                tableLayoutClass='h-full'
                allowFilters={false}
                actionBodyTemplate={actionBodyTemplate}
                gridProps={{
                  allowAdd: true,
                  disableAdd: !shouldAllowAdd(specData),
                  OnRowsChanged: (rows: any[]) => {
                    setSpecData(rows)
                    specDataRef.current = rows
                  },
                }}>

                <Datacolumn field="item_descr" header="Specification Parameter" editorType="text" />
              </ListLayout>
            </div>



          </div>


          <div className='col-6'>

            <Button style={{ width: "50%", marginBottom: 30 }}
              label='Add UOM'
              disabled={showUOMTable}
              onClick={(e) => {
                e.preventDefault()
                setShowUOMTable(true)
              }} />

            <div style={{ width: '40%', alignItems: 'right', visibility: showUOMTable ? 'visible' : 'hidden' }}>
              <MultiSelect
                value={selectedUOMs}
                onChange={(e) => setSelectedUOMs(e.value)}
                options={UOMs}
                optionLabel="descr"
                display="chip"
                placeholder="Select UOM"
                className="w-full md:w-20rem" />

            </div>

          </div>



        </div>




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