import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues, UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { ManageLayout, useToast, FormField } from '@igblsln/control';
import { useAddItemsMutation, useGetItemsQuery, useUpdateItemsMutation } from '../itemsApi';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps, setPromptNavigate, useGetAllItemTypesQuery, useGetItemSubTypeForItemTypeQuery, useGetPurposesForItemTypeQuery, useGetUOMsForItemTypeQuery } from '@igblsln/store'
import { useGetItemSubTypesQuery } from '../../ItemSubType/itemSubTypesApi';
import ManageItem, { ManageItemHandle } from './ManageItem'
import { Chip } from 'primereact/chip';
import { Tooltip } from 'primereact/tooltip';
import { useDispatch } from 'react-redux';

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [itemDescrFocus, setItemDescFocus] = useState(false)
  const [itemDescription, setItemDescription] = useState('')
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const { state } = useLocation();
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageItemRef = useRef<ManageItemHandle>();
  const [itemsTableChanged, setItemsTableChanged] = useState(false)
  const dispatch = useDispatch();


  const clientProps = getClientProps();

  const [addItems, { isLoading: isAdding }] = useAddItemsMutation()
  const [updateItems, { isLoading: isUpdating }] = useUpdateItemsMutation();

  const [selectedItemType, setSelectedItemType] = useState<any>(null)
  const [selectedItemSubType, setSelectedItemSubType] = useState<any>(null)

  const { data: itemTypes, isFetching: itemTypeFetching } = useGetAllItemTypesQuery()
  const { data: itemSubTypes, isFetching: itemSubTypeFetching } = useGetItemSubTypeForItemTypeQuery(selectedItemType, { skip: !selectedItemType })
  const { data: UOMs } = useGetUOMsForItemTypeQuery(selectedItemType, { skip: !selectedItemType });
  const { data: selectedSubTypeData } = useGetItemSubTypesQuery(selectedItemSubType, { skip: !selectedItemSubType });
  const { data: purposes, isFetching: purposeFetching } = useGetPurposesForItemTypeQuery(selectedItemType, { skip: !selectedItemType })
  const [selectedUOMs, setSelectedUOMs] = useState<any[] | undefined>([]);
  const [selectedPurposes, setSelectedPurposes] = useState<any[] | undefined>([]);

  const { data, isLoading } = useGetItemsQuery(id, {
    skip: isNew
  })
  const [specData, setSpecData] = useState<any[] | undefined>(data?.specifications)

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      const items = manageItemRef.current?.getItems();
      let data = {
        ...values,
        specifications: items,
        ...clientProps,
        stocktype: "I",
        uoms: selectedUOMs?.map(d => d?.item_uom_key),
        purpose: selectedPurposes?.map(d => d?.key),
      }
      if (isNew) {
        resp = await addItems(data).unwrap();
      } else {
        data = {
          ...data,
          specifications: items?.map(item => {
            if (!item?.item_subtype_spec_key) {
              let temp = {
                ...item,
                item_subtype_spec_key: item.key,
              }
              let { key: id, ...others } = temp;
              return others
            }
            else
              return item
          }),
          uoms: selectedUOMs
        }
        resp = await updateItems(data).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false}))
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      console.log(error)
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  useEffect(() => {
    if (state) {
      setSelectedItemType(state?.itemtype)
      setSelectedItemSubType(state?.itemsubtype)
    }
  }, [])

  useEffect(() => {
    if (data) {
      setSelectedItemType(data.itemtyp_key)
      setSelectedItemSubType(data.subtype)
      setItemDescription(data.descr)
      if (data.specifications) {
        let temp = data?.specifications?.map((d: any) => {
          return {
            ...d,
            name: d.item_subtype_spec_key
          }
        }) || []
        setSpecData(temp)
      }
      setSelectedUOMs(data.uoms)

    }
    if (data && purposes) {
      let ids = data?.purpose?.map((d: any) => d.purpose_key).filter((d: any) => !!d) || []
      let temp = purposes?.filter(d => ids.includes(d.key)) || []
      setSelectedPurposes(temp)
    }
  }, [data, purposes])



  useEffect(() => {
    if (selectedSubTypeData) {
      let temp = selectedSubTypeData?.uoms?.map((uom: any) => {
        let { key, ...others } = uom
        return others
      })
      setSelectedUOMs(temp)
    }
  }, [selectedSubTypeData])

  const getUOMNameFromKey = (key: any) => {
    if (UOMs?.length) {
      let temp = UOMs.filter(u => u.key === key)[0]
      if (temp) {
        return temp?.descr || "NA"
      }
    }
    return "NA"
  }

  const renderForm = (
    control: any,
    _register: UseFormRegister<FieldValues>,
    errors: FieldErrors<FieldValues>,
    getValues: UseFormGetValues<any>,
    setValue: UseFormSetValue<any>
  ) => {
    return (
      <div className='pl-8 pt-4 pb-3 grid p-fluid'>

        {/* <FormField label="Material Item Code" name="id" className="col-12"
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

        <FormField label="Material Item Type" name="itemtyp_key" className="col-12 md:col-6" control={control} errors={errors}
          isLoading={itemTypeFetching}
          required
          leftSpan={4}
          rightSpan={6}
          useExplicit
          onChange={(e: any) => {
            setSelectedUOMs([])
            setSpecData([])
            setSelectedItemType(e.value)
            setSelectedItemSubType('')
            setValue('subtype', '')
            setValue('gst', '')
            // let temp = "Spec1,Spec2,Spec3".split(',').map(d => {
            //   return {
            //     name: d
            //   }
            // })
            // setSpecData(temp)
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              //showClear : true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              value: selectedItemType,
              disabled: state?.itemtype || !isNew,
              options: itemTypes,
            }
          }} />

        <FormField label="Material Item Sub Type" name="subtype" className="col-12 md:col-6" control={control} errors={errors}
          isLoading={itemSubTypeFetching}
          required
          leftSpan={4}
          rightSpan={6}
          useExplicit
          onChange={(e: any) => {
            setSelectedItemSubType(e.value)
            let temp = itemSubTypes?.filter(d => d.key === e.value)[0]
            setValue('gst', temp?.gst || "")
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              //showClear : true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              options: itemSubTypes,
              disabled: state?.itemsubtype || !isNew,
              value: selectedItemSubType || data?.subtype
            }
          }} />

        <FormField label="GST (%)" name="gst" className="col-12"
          control={control} errors={errors}
          required
          leftSpan={2}
          rightSpan={3}
          formItem={{
            component: InputText,
            componentProps: {
              type: 'number',
              min: 0,
              max: 100
            }
          }} />

        <FormField label="Material Item Description" name="descr" className="col-6 default"
          control={control} errors={errors}
          required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
              id: 'item-descr',
              onFocus: ((e: any) => {
                setItemDescFocus(true)
              }),
              onBlur: ((e: any) => {
                setItemDescription(e?.target?.defaultValue)
                setItemDescFocus(false)
              }),
              style: {
                marginLeft: 4
              }
            }
          }} />
        {
          !!itemDescription && !itemDescrFocus &&
          <Tooltip
            mouseTrack
            mouseTrackLeft={10}
            target="#item-descr"
            position="top"
            content={itemDescription}
            className='my-tooltip'
          />
        }

        <Button style={{ width: "24%", marginBottom: 25, marginTop: 8 }}
          className="col-12 md:col-6"
          label='Generate Material Item Description'
          onClick={(e) => {
            e.preventDefault()
            const items = manageItemRef.current?.getItems();
            console.log(items)
            let spec_value: any = items?.map(d => {
              return `${d.value || 0}${d.subtype_spec_descr || ''}`
            })
            spec_value = `[ ${spec_value?.join('x')} ]`
            let formValue = getValues()
            let itemDescr = formValue?.descr?.split('[')[0].trim()
            let mfrName = ''
            let modelNumber = formValue?.model_number ? `[${formValue?.model_number || ''}]` : ''
            let mfr = purposes?.filter(d => d.key === formValue.purpose_key)
            if (mfr?.length) {
              mfrName = `[${mfr[0].name}]`
            }
            let generated = `${itemDescr || ''} ${spec_value} ${mfrName} ${modelNumber}`
            generated = generated.trim()
            if (!!!generated) {
              showError("Enter Some Data", "Nothing to Generate")
            }
            else {
              setValue('descr', generated)
              setItemDescription(generated)
            }

          }} />

        {/* <FormField label="Stock Type" name="stocktype" className="col-12" control={control} errors={errors}
          required
          leftSpan={2}
          rightSpan={5}
          formItem={{
            component: Dropdown,
            componentProps: {
              //showClear : true,
              optionLabel: "descr",
              optionValue: "key",
              options: [
                {
                  key: "I",
                  descr: "Inventory"
                },
                {
                  key: "N",
                  descr: "Non-Inventory"
                },
              ],
            }
          }} /> */}



        {/* <FormField label="Material Item UOM" name="itemuom_key" className="col-12" control={control} errors={errors}
          isLoading={UOMFetching}
          required
          leftSpan={2}
          rightSpan={3}
          formItem={{
            component: Dropdown,
            componentProps: {
              //showClear : true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              options: UOMs?.results,
            }
          }} /> */}

        <FormField label="Model Number" name="model_number" className="col-12"
          control={control} errors={errors}
          leftSpan={2}
          rightSpan={3}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
            }
          }} />

        <FormField label="Purpose" name="purpose_key" className="col-12" control={control} errors={errors}
          isLoading={purposeFetching}
          leftSpan={2}
          rightSpan={3}
          formItem={{
            component: MultiSelect,
            componentProps: {
              optionLabel: "name",
              value: selectedPurposes,
              onChange: (e: any) => setSelectedPurposes(e.value),
              options: purposes,
              display: "chip",
              placeholder: "Select Purposes",
              className: "w-full"
            }
          }} />


        <div className="flex" style={{ width: '100%' }}>
          <div style={{ width: '42%', marginRight: 50, height: 200 }}>
            <ManageItem
              data={specData || []}
              selectedItemSubType={selectedItemSubType}
              isLoading={isLoading}
              ref={manageItemRef}
              onChange={(value: boolean) => !itemsTableChanged && setItemsTableChanged(value)}
            />
          </div>
          {
            !!selectedUOMs?.length &&
            <div style={{ width: '50%', paddingLeft: 40 }}>
              <div
                className="w-full md:w-25rem"
                style={{
                  border: " 2px solid #827f7f",
                  backgroundColor: "#827f7f",
                  height: "35px",
                  display: "flex",
                  marginRight: "auto",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  color: "#fff"
                }}
              >UOMs</div>

              <div className='card flex flex-wrap gap-2'>
                {selectedUOMs?.map((uom, index) => (
                  <Chip key={index} label={getUOMNameFromKey(uom?.item_uom_key)} />
                ))}
              </div>


            </div>
          }

        </div>
      </div>
    )
  }


  return (
    <>
      <ManageLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        stateValue={state}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage