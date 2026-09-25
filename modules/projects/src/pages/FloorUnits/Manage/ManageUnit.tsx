import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { classNames } from 'primereact/utils';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { ManageLayout, useToast, FormField } from '@igblsln/control';
import { useAddProjectUnitMutation, useGetProjectUnitQuery, useUpdateProjectUnitMutation } from '../unitApi';
import { useGetProjectQuery } from '../../Projects/apis';
import { useListProjectBlockQuery } from '../blockApi';
import { useListProjectFloorQuery } from '../floorApi';
import { AFTER_API_TIME, getClientProps, useBlocksForProjectQuery } from '@igblsln/store'

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)

  const navigate = useNavigate();
  const { unitId: idString, id: projectIdString } = useParams()
  const unitId = parseInt(idString || '');
  const isNew = isNaN(unitId) || unitId <= 0;
  const projectId = parseInt(projectIdString || '');
  const searchQuery = useLocation().search

  const clientProps = getClientProps();

  const baseRoute = searchQuery === '?direct' ? `/projects/unit?bkp=${projectId}` : `/projects/${projectId}/unit`

  const dataFromLocation: any = useLocation().state;

  console.log(dataFromLocation)

  const { data, isLoading } = useGetProjectUnitQuery(unitId, {
    skip: isNew
  })

  const [bedrooms, setBedrooms] = useState<number | null>(data?.bedrooms || dataFromLocation?.bedrooms || 0)
  const [bathrooms, setBathrooms] = useState<number | null>(data?.bathrooms || dataFromLocation?.bathrooms || 0)
  const [balconies, setBalconies] = useState<number | null>(data?.balconies || dataFromLocation?.balconies || 0)

  const { data: projectData } = useGetProjectQuery(projectId, {
    skip: isNaN(projectId) || projectId <= 0
  })

  const { data: blockData } = useBlocksForProjectQuery({ projectId: projectData?.key }, { skip: !projectData?.key })
  const { data: floorData } = useListProjectFloorQuery({ projectId: projectData?.key }, { skip: !projectData?.key })

  const [addProjectUnit, { isLoading: isAdding }] = useAddProjectUnitMutation()
  const [updateProjectUnit, { isLoading: isUpdating }] = useUpdateProjectUnitMutation();



  const [selectedBlock, setSelectedBlock] = useState<any>(dataFromLocation?.projblk_key ? dataFromLocation?.projblk_key : null)
  const [selectedFloorDescr, setSelectedFloorDescr] = useState<any>('')
  const [filteredFloors, setFilteredFloors] = useState<Array<any>>([])


  useEffect(() => {
    if (selectedBlock && floorData) {
      let temp = floorData?.results.filter(d => d.projblk_key === selectedBlock) || []
      setFilteredFloors(temp)
    }
  }, [selectedBlock, floorData])

  useEffect(() => {
    if (data && !dataFromLocation) {
      setSelectedBlock(data.projblk_key)
    }
  }, [data])

  const onSubmit = async (values: any) => {
    try {
      values = {
        ...values,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        balconies: balconies,
      }
      let resp: any;
      if (isNew) {
        resp = await addProjectUnit({ ...values, ...clientProps, proj_key: projectId }).unwrap();
      } else {
        resp = await updateProjectUnit({ ...values, ...clientProps, proj_key: projectId }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate(baseRoute)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: any) => {
    return (<div className='pl-8'>

      <div className="field">
        <label className={classNames('col-2')}>Project Code</label>
        <InputText value={projectData?.id} disabled />
      </div>
      <div className="field">
        <label className={classNames('col-2')}>Project Name</label>
        <InputText style={{ width: '50%' }} value={projectData?.name} disabled />
      </div>
      <Divider />
      <div className="flex">
        <div style={{ border: '1px solid' }} className="col-6">
          <FormField
            label="Block Code"
            name="projblk_key"
            control={control}
            errors={errors}
            required
            leftSpan={4}
            rightSpan={4}
            useExplicit
            onChange={(e: any) => {
              let block = blockData?.filter(d => d.key === e.value)[0] || { key: null }
              setSelectedBlock(block.key)
            }}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear : true,
                optionGroupTemplate:
                  <div
                    style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: '#e6e1e1', color: 'black', lineHeight: 2.5 }}
                    onClick={() => navigate(`/projects/${projectId}/unit/block`, {
                      state: {
                        url: isNew ? `/projects/${projectId}/unit/new` : `/projects/project/${data?.key}/edit`,
                        data: getValues()
                      }
                    })
                    }
                  >
                    -- Create And Edit --
                  </div>
                ,
                optionLabel: "descr",
                optionValue: "key",
                optionGroupLabel: "label",
                optionGroupChildren: "items",
                disabled: !isNew,
                options: [
                  {
                    label: 'Add',
                    items: blockData || []
                  }
                ]
              }
            }} />

          <FormField
            label="Floor Code"
            name="projflr_key"
            control={control}
            errors={errors}
            required
            leftSpan={4}
            rightSpan={4}
            useExplicit
            onChange={(e: any) => {
              let floorName = filteredFloors.filter(d => d.key === e.value)[0]?.descr
              setSelectedFloorDescr(floorName)
            }}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear : true,
                optionGroupTemplate:
                  <div
                    style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: '#e6e1e1', color: 'black', lineHeight: 2.5 }}
                    onClick={() => navigate(`/projects/${projectId}/unit/floor`, {
                      state: {
                        url: isNew ? `/projects/${projectId}/unit/new` : `/projects/project/${data?.key}/edit`,
                        data: getValues()
                      }
                    })
                    }
                  >
                    -- Create And Edit --
                  </div>
                ,
                optionLabel: "descr",
                optionValue: "key",
                optionGroupLabel: "label",
                optionGroupChildren: "items",
                disabled: !isNew,
                options: [
                  {
                    label: 'Add',
                    items: filteredFloors || []
                  }
                ]
              }
            }} />

          {/* <div className="field">
            <label className={classNames('col-4')}>Floor Description</label>
            <InputText value={isNew ? selectedFloorDescr : floorData?.results.filter(d => d.key === data?.projflr_key)[0]?.descr} disabled />
          </div> */}

          {/* <FormField
            label="Unit Code"
            name="id"
            control={control}
            errors={errors}
            required
            leftSpan={4}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 25,
                disabled: !isNew,
              }
            }} /> */}

          <FormField
            label="Unit Description"
            name="descr"
            control={control}
            errors={errors}
            required
            leftSpan={4}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100
              }
            }} />


        </div>
        <div style={{ border: '1px solid' }} className="col-6">

          <div className="field">
            <label htmlFor="saleablearea" className={classNames('col-5', { 'p-error': errors.saleablearea })}>Saleable Area SqFt</label>
            <Controller name="saleablearea" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputText type={"number"} min={0} id={field.name} {...field} className={classNames('col-6', { 'p-invalid': fieldState.invalid })} />
            )} />
            {/* {getFormErrorMessage(errors?.saleablearea?.message)} */}
          </div>
          <div className="field">
            <label htmlFor="carpetarea" className={classNames('col-5', { 'p-error': errors.carpetarea })}>Carpet Area SqFt</label>
            <Controller name="carpetarea" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputText type={"number"} min={0} id={field.name} {...field} className={classNames('col-6', { 'p-invalid': fieldState.invalid })} />
            )} />
            {/* {getFormErrorMessage(errors?.carpetarea?.message)} */}
          </div>
          <div className="field">
            <label htmlFor="udsarea" className={classNames('col-5', { 'p-error': errors.udsarea })}>UDS Area SqFt</label>
            <Controller name="udsarea" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputText type={"number"} min={0} id={field.name} {...field} className={classNames('col-6', { 'p-invalid': fieldState.invalid })} />
            )} />
            {/* {getFormErrorMessage(errors?.udsarea?.message)} */}
          </div>

        </div>
      </div>
      <div className="flex">
        <div style={{ border: '1px solid' }} className="col-6">
          <div className="field">
            <label htmlFor="bedrooms" className={classNames('col-5', { 'p-error': errors.bedrooms })}>Bedrooms</label>
            <Controller name="bedrooms" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputNumber
                showButtons
                placeholder='0'
                style={{ width: '45px' }}
                inputStyle={{ width: 'inherit', textAlign: 'center' }}
                buttonLayout="horizontal"
                value={bedrooms}
                onValueChange={(e) => {
                  setBedrooms(e.value)
                  //@ts-ignore
                  field.onChange(parseInt(e.value))
                }}
                step={1}
                min={0}
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                className={classNames('col-6')} />
            )} />
          </div>
          <div className="field">
            <label htmlFor="bathrooms" className={classNames('col-5', { 'p-error': errors.bathrooms })}>Bathrooms</label>
            <Controller name="bathrooms" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputNumber
                showButtons
                placeholder='0'
                style={{ width: '45px' }}
                inputStyle={{ width: 'inherit', textAlign: 'center' }}
                buttonLayout="horizontal"
                value={bathrooms}
                onValueChange={(e) => {
                  setBathrooms(e.value)
                  //@ts-ignore
                  field.onChange(parseInt(e.value))
                }}
                step={1}
                min={0}
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                className={classNames('col-6')} />
            )} />
          </div>
          <div className="field">
            <label htmlFor="balconies" className={classNames('col-5', { 'p-error': errors.balconies })}>Balconies</label>
            <Controller name="balconies" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputNumber
                showButtons
                placeholder='0'
                style={{ width: '45px' }}
                inputStyle={{ width: 'inherit', textAlign: 'center' }}
                buttonLayout="horizontal"
                value={balconies}
                onValueChange={(e) => {
                  setBalconies(e.value)
                  //@ts-ignore
                  field.onChange(parseInt(e.value))
                }}
                step={1}
                min={0}
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                className={classNames('col-6')} />
            )} />
          </div>
        </div>
        <div style={{ border: '1px solid' }} className="col-6">
          <div className="field" style={{ padding: 10 }}>
            <label style={{ margin: 'auto' }} htmlFor="servicearea" className={classNames('col-5', { 'p-error': errors.servicearea })}>Service Area</label>
            <Controller name="servicearea" control={control} render={({ field, fieldState }) => (
              <Checkbox checked={field.value} trueValue={"1"} falseValue={"0"} id={field.name} {...field}></Checkbox>
            )} />

          </div>
          <div className="field" style={{ padding: 10 }}>
            <label style={{ margin: 'auto' }} htmlFor="poojaroom" className={classNames('col-5', { 'p-error': errors.poojaroom })}>Pooja Room</label>
            <Controller name="poojaroom" control={control} render={({ field, fieldState }) => (
              <Checkbox checked={field.value} trueValue={"1"} falseValue={"0"} id={field.name} {...field}></Checkbox>
            )} />

          </div>
          <div className="field" style={{ padding: 10 }}>
            <label style={{ margin: 'auto' }} htmlFor="carparking" className={classNames('col-5', { 'p-error': errors.carparking })}>Car Parking</label>
            <Controller name="carparking" control={control} render={({ field, fieldState }) => (
              <Checkbox checked={field.value} trueValue={"1"} falseValue={"0"} id={field.name} {...field}></Checkbox>
            )} />

          </div>

        </div>
      </div>
    </div>)
  }

  useEffect(() => {
    setBedrooms(data?.bedrooms || dataFromLocation?.bedrooms || 0)
    setBathrooms(data?.bathrooms || dataFromLocation?.bathrooms || 0)
    setBalconies(data?.balconies || dataFromLocation?.balconies || 0)
  }, [data])

  return (
    <>
      <ManageLayout baseRoute={baseRoute} description="Unit" id={unitId} data={data}
        dataFromLocation={dataFromLocation}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage