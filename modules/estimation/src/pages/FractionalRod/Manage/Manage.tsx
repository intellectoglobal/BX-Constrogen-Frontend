import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { RadioButton } from 'primereact/radiobutton';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { Dropdown } from 'primereact/dropdown';
import { ManageLayout, useToast, ManageLayoutHandle, FormField, getFormErrorMessage } from '@igblsln/control';
import { useAddFractionalRodMutation, useUpdateFractionalRodMutation, useGetFractionalRodQuery } from '../fractionalRodApi';
import { AFTER_API_TIME, getClientProps, useActiveProjectQuery, useBlocksForProjectQuery, useGetAllUOMsQuery } from '@igblsln/store'
import ManageItem, { ManageItemHandle } from './ManageItem'
import { PAGE_NAME } from '../constants';


type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [itemsTableChanged, setItemsTableChanged] = useState(false)

  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageItemRef = useRef<ManageItemHandle>();
  const manageLayoutRef = useRef<ManageLayoutHandle>();

  const { state } = useLocation();

  if (!state && isNew) {
    navigate("/estimation/fractionalrod")
  }

  const clientProps = getClientProps();

  const { data, isLoading } = useGetFractionalRodQuery(id, {
    skip: isNew,
    refetchOnMountOrArgChange: true
  })

  const { data: projects, isLoading: projectsFetching } = useActiveProjectQuery();
  const { data: blockData, isLoading: isBlockFetching } = useBlocksForProjectQuery({ projectId: state?.projectKey }, { skip: !state?.projectKey })
  const [gridData, setGridData] = useState<any[]>([])
  const [selectedItemType, setSelectedItemType] = useState<any>(null)

  const [localFormData, setLocalFormData] = useState<any>({})
  const { data: UOMs } = useGetAllUOMsQuery({});

  const [addFractionalRod, { isLoading: isAdding }] = useAddFractionalRodMutation()
  const [updateFractionalRod, { isLoading: isUpdating }] = useUpdateFractionalRodMutation();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let fractionalRodItems = manageItemRef.current?.getItems()
      let body = {
        ...values,
        itemtyp_key: selectedItemType,
        items: fractionalRodItems,

      }
      if (isNew) {
        resp = await addFractionalRod({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateFractionalRod({ ...body, ...clientProps, key: data?.key }).unwrap();
      }

      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate("/estimation/fractionalrod")
      }, AFTER_API_TIME);
    } catch {
      showError('An error occurred', "We couldn't save your post, try again!");
    }
  }

  useEffect(() => {

    setFormData(data || {
      ...clientProps,
      proj_key: state?.projectKey,
      projblk_key: state?.blockKey
    })

    if (data) {
      setGridData(data?.items || [])
      setSelectedItemType(data.itemtyp_key)
    }
  }, [data])

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, setValue: UseFormSetValue<any>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>

      <FormField label="Project" name="proj_key" className="col-10 md:col-6" control={control} errors={errors}
        isLoading={projectsFetching}
        // required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: Dropdown,
          componentProps: {
            disabled: true,
            optionLabel: "name",
            optionValue: "key",
            options: projects
          }
        }} />

      <FormField
        className="col-10 md:col-5"
        label="Block"
        name="projblk_key"
        control={control}
        errors={errors}
        // required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: Dropdown,
          componentProps: {
            disabled: true,
            optionLabel: "descr",
            optionValue: "key",
            options: blockData
          }
        }} />

      <div className='col-10 md:col-1'>
        <Button disabled label='Clear' />
      </div>

      <div className="pl-5 col-12 flex">
        <div className="field" style={{ width: '50%' }}>
          <div className="field-radiobutton">
            <RadioButton name="fractional" checked />
            <label>Fractional</label>
          </div>
        </div>
        <div className="field" style={{ width: '50%' }}>
          <div className="field-radiobutton">
            <RadioButton onChange={() => {
              navigate("/estimation/wholerod/new",{state:{ projectKey: state.projectKey, blockKey: state.blockKey }})
            }} />
            <label
              style={{ cursor: 'pointer' }}
              onClick={() => {
                navigate("/estimation/wholerod/new")
              }}>
              Whole
            </label>
          </div>
        </div>

      </div>
      {/* <Divider /> */}

      <FormField
        label="Rod Pack Name"
        className="col-12"
        name="name" control={control} errors={errors}
        leftSpan={2}
        rightSpan={4}
        useExplicit
        onChange={(e: any) => {
          setLocalFormData({
            ...localFormData,
            name: e.target.value
          })
        }}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100
          }
        }} />


      <FormField label="Rod Pack Type"
        name="itemtyp_key"
        className="col-12"
        control={control} errors={errors}
        leftSpan={2}
        rightSpan={4}
        required
        formItem={{
          component: Dropdown,
          componentProps: {
            options: ["Fractional", "Whole"],
          }
        }} />


      <div className="p-inputgroup field grid grid-nogutter p-fluid col-12 flex" style={{ marginBottom: 0 }}>

        <label className='col-2' style={{ paddingLeft: 0 }}>Base Quantity / UOM</label>
        <div className="input-field col-1">
          <Controller name="base_qty" control={control} rules={{ required: 'required.' }} render={({ field, fieldState }) => (
            <InputText
              style={{ width: '100%' }}
              id={field.name} {...field}
              onChange={(e) => {
                setLocalFormData({
                  ...localFormData,
                  base_qty: e.target.value
                })
                field.onChange(e)
              }}
              className={classNames({ 'p-invalid': fieldState.invalid })} />
          )} />
          {getFormErrorMessage(errors?.base_qty?.message)}
        </div>
        <span className='inputgroup-divider'>/</span>
        <div className="input-field col-1">
          <Controller name="uom_key" control={control} rules={{ required: 'required.' }} render={({ field, fieldState }) => (
            <Dropdown
              id={field.name}
              {...field}
              style={{ width: '100%' }}
              className={classNames({ 'p-invalid': fieldState.invalid })}
              optionValue={"key"}
              optionLabel="descr"
              onChange={(e) => {
                setLocalFormData({
                  ...localFormData,
                  uom: UOMs?.filter(d => d.key === e.target.value)[0].descr
                })
                field.onChange(e)
              }}
              options={UOMs}
            />)
          } />
          {getFormErrorMessage(errors?.uom_key?.message)}
        </div>
        <div className="col-6"></div>
      </div>

      <FormField
        label="Description"
        className="col-12"
        name="descr"
        control={control} errors={errors}
        leftSpan={2}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            style: {
              marginTop: '1rem'
            },
            maxLength: 100
          }
        }} />

      <div className="col-12" style={{ fontWeight: 'bolder', fontSize: 24 }}>
        Rod List required for <i> {localFormData?.base_qty || "<Base Qty>"}</i> <i>{localFormData?.uom || "<UOM>"}</i> of <i>{localFormData?.name || "<Name>"}</i>
      </div>

      <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
        <ManageItem
          selectedItemType={selectedItemType}
          data={gridData}
          isLoading={isLoading}
          ref={manageItemRef}
          onChange={(value: boolean) => !itemsTableChanged && setItemsTableChanged(value)}
        />
      </div>

    </div>)
  }


  return (
    <>
      <ManageLayout
        baseRoute="/estimation/fractionalrod"
        description={PAGE_NAME}
        id={id}
        data={formData}
        isUpdating={isAdding || isUpdating || showingToast}
        ref={manageLayoutRef}
        isItemsTableChanged={itemsTableChanged}
        isLoading={isLoading}
        onSubmit={onSubmit}
        renderForm={renderForm}
      />
    </>
  )
}

export default Manage