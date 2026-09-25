import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { useLocation } from 'react-router-dom'
import { ListLayout, Datacolumn, ManageLayout, FormField, useToast } from '@igblsln/control';
import { Controller, UseFormRegister, FieldErrors, FieldValues, set } from 'react-hook-form';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { InputNumber } from 'primereact/inputnumber';
import { confirmDialog } from 'primereact/confirmdialog';
import { classNames } from "primereact/utils";
import {
  AFTER_API_TIME,
  getClientProps,
  PAGE_SIZE,
  useActiveProjectQuery,
  useBlocksForProjectQuery,
  useFloorsForProjectQuery,
  useUnitsForProjectQuery
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { useAddProjectUnitMutation, useDeleteProjectUnitMutation, useListProjectUnitQuery, useUpdateProjectUnitMutation } from '../../FloorUnits/unitApi';
import { useAddProjectBlockMutation, useUpdateProjectBlockMutation, useDeleteProjectBlockMutation } from '../blockApi';
import { useAddProjectFloorMutation, useUpdateProjectFloorMutation, useDeleteProjectFloorMutation } from '../floorApi';
import {useSelector} from 'react-redux'

type Props = {}

const Main = (props: Props) => {

  const { showError, showSuccess } = useToast()

  const selectedProjectReducer = useSelector((state: any) => state?.common?.selectedProject)

  const projKeyFromState: any = useLocation().state;
  const [unitPage, setUnitPage] = useState(1)
  const [unitSize, setUnitSize] = useState(PAGE_SIZE)
  const { data: projects } = useActiveProjectQuery()
  const [activeTab, setActiveTab] = useState(0);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(projKeyFromState || selectedProjectReducer)

  const [selectedBlock, setSelectedBlock] = useState<any>(null)
  const [isNewBlock, setIsNewBlock] = useState(true);
  const [displayAddBlockModal, setDisplayAddBlockModal] = useState(false);
  const [addProjectBlock, { isLoading: isBlockAdding }] = useAddProjectBlockMutation()
  const [updateProjectBlock, { isLoading: isBlockUpdating }] = useUpdateProjectBlockMutation();

  const [selectedFloor, setSelectedFloor] = useState<any>(null)
  const [isNewFloor, setIsNewFloor] = useState(true);
  const [displayAddFloorModal, setDisplayAddFloorModal] = useState(false);
  const [addProjectFloor, { isLoading: isFloorAdding }] = useAddProjectFloorMutation()
  const [updateProjectFloor, { isLoading: isFloorUpdating }] = useUpdateProjectFloorMutation();

  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [isNewUnit, setIsNewUnit] = useState(true);
  const [displayAddUnitModal, setDisplayAddUnitModal] = useState(false);
  const [displayViewUnitModal, setDisplayViewUnitModal] = useState(false);

  const searchQuery = useLocation().search

  const clientProps = getClientProps();

  useEffect(() => {
    if (searchQuery && searchQuery.split('bkp=').length === 2) {
      let id = parseInt(searchQuery.split('bkp=')[1])
      setSelectedProjectKey(id)
    }
  }, [])
  const { data: blockData, isLoading: isProjectBlockFetching, refetch: refetchBlock } = useBlocksForProjectQuery({
    projectId: selectedProjectKey
  }, { skip: !selectedProjectKey, refetchOnMountOrArgChange: true })

  const { data: floorData, isLoading: isProjectFloorFetching, refetch: refetchFloor } = useFloorsForProjectQuery({
    projectId: selectedProjectKey
  }, { skip: !selectedProjectKey, refetchOnMountOrArgChange: true })

  const { data: unitData, isFetching: isUnitFetching, refetch: refetchUnit } = useUnitsForProjectQuery({
    projectId: selectedProjectKey
  }, { skip: !selectedProjectKey, refetchOnMountOrArgChange: true })


  const [bedrooms, setBedrooms] = useState<number | null>(0)
  const [bathrooms, setBathrooms] = useState<number | null>(0)
  const [balconies, setBalconies] = useState<number | null>(0)


  const [deleteBlock, { isLoading: isBlockDeleting },] = useDeleteProjectBlockMutation()
  const deleteBlockAction = async (id: number) => {
    await deleteBlock(id).unwrap();
    refetchUnit();
    refetchBlock();
    refetchFloor();
  }

  const [deleteFloor, { isLoading: isFloorDeleting },] = useDeleteProjectFloorMutation()
  const deleteFloorAction = async (id: number) => {
    await deleteFloor(id).unwrap();
    refetchFloor();
    refetchUnit();
  }

  const [deleteUnit, { isLoading: isUnitDeleting }] = useDeleteProjectUnitMutation()
  const [addProjectUnit, { isLoading: isAdding }] = useAddProjectUnitMutation()
  const [updateProjectUnit, { isLoading: isUpdating }] = useUpdateProjectUnitMutation();
  const deleteUnitAction = async (id: number) => {
    await deleteUnit(id).unwrap();
    refetchUnit();
  }

  const renderBlockFooter = () => {
    return (
      <div>
        <Button loading={isBlockAdding || isBlockUpdating} label="Save" className="p-button-warning mr-3"
          onClick={async () => {
            try {
              if (!selectedBlock?.descr) {
                showError("Please Enter Block Name", "Block Name is Empty")
                return
              }
              let resp: any;
              if (isNewBlock) {
                resp = await addProjectBlock({
                  proj_key: selectedProjectKey,
                  ...selectedBlock,
                  ...clientProps
                }).unwrap();
              } else {
                resp = await updateProjectBlock({
                  key: selectedBlock.id,
                  ...selectedBlock,
                  ...clientProps
                }).unwrap();
              }
              refetchBlock()
              setDisplayAddBlockModal(false)
              showSuccess('Success', resp.detail);
            } catch (e) {
              console.log(e)
              showError('An error occurred', "We couldn't save your request, try again!");
            }

          }} />
        <Button label="Discard" className='p-button-plain' onClick={() => {
          if (isFormChanged) {
            if (confirm("Are You Sure to Discard?")) {
              setDisplayAddBlockModal(false)
            }
          }
          else {
            setIsFormChanged(false)
            setDisplayAddBlockModal(false)
          }

        }} />
      </div>
    );
  }

  const renderFloorFooter = () => {
    return (
      <div>
        <Button loading={isFloorAdding || isFloorUpdating} label="Save" className="p-button-warning mr-3"
          onClick={async () => {
            try {
              if (!selectedFloor?.projblk_key) {
                showError("Please Choose Block", "Block is Empty")
                return
              }
              if (!selectedFloor?.descr) {
                showError("Please Enter Floor Name", "Floor Name is Empty")
                return
              }
              let resp: any;
              if (isNewFloor) {
                resp = await addProjectFloor({
                  proj_key: selectedProjectKey,
                  ...selectedFloor,
                  ...clientProps
                }).unwrap();
              } else {
                resp = await updateProjectFloor({
                  key: selectedFloor.id,
                  ...selectedFloor,
                  ...clientProps
                }).unwrap();
              }
              refetchFloor()
              setDisplayAddFloorModal(false)
              setIsFormChanged(false)
              showSuccess('Success', resp.detail);
            } catch (error) {
              console.log(error)
              showError('An error occurred', "We couldn't save your request, try again!");
            }

          }} />
        <Button label="Discard" className='p-button-plain' onClick={() => {
          if (isFormChanged) {
            if (confirm("Are You Sure to Discard?")) {
              setDisplayAddFloorModal(false)
            }
          }
          else {
            setIsFormChanged(false)
            setDisplayAddFloorModal(false)
          }

        }} />
      </div>
    );
  }

  const onUnitSubmit = async (values: any) => {
    try {
      values = {
        ...values,
      }
      let resp: any;
      if (isNewUnit) {
        resp = await addProjectUnit({ ...values, ...clientProps, proj_key: selectedProjectKey }).unwrap();
      } else {
        resp = await updateProjectUnit({ ...values, ...clientProps, proj_key: selectedProjectKey }).unwrap();
      }
      refetchUnit();
      showSuccess('Success', resp.detail);
      setTimeout(() => {
        setBalconies(0)
        setBathrooms(0)
        setBedrooms(0)
        setDisplayAddUnitModal(false)
      }, AFTER_API_TIME);
    } catch (error: any) {
      console.log(error)
      // showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: any) => {
    return (<div className='pl-2'>

      {/* <div className="field">
        <label className={classNames('col-2')}>Project Code</label>
        <InputText value={projectData?.id} disabled />
      </div>
      <div className="field">
        <label className={classNames('col-2')}>Project Name</label>
        <InputText style={{ width: '50%' }} value={projectData?.name} disabled />
      </div>
      <Divider /> */}
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
              setSelectedBlock(block)
            }}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionLabel: "descr",
                optionValue: "key",
                disabled: !isNewUnit,
                options: blockData || []
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
            // onChange={(e: any) => {
            //   let floorName = filteredFloors.filter(d => d.key === e.value)[0]?.descr
            //   setSelectedFloorDescr(floorName)
            // }}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionLabel: "descr",
                optionValue: "key",
                disabled: !isNewUnit,
                options: floorData?.filter((f: any) => (f.projblk_key === selectedBlock?.key) || (f.projblk_key === selectedUnit?.projblk_key)) || []
              }
            }} />

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


          <FormField
            label="Facing"
            name="facing"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={4}
            useExplicit
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                options: ["East", "West", "North", "South"],
              }
            }} />


          <FormField
            label="GST (%)"
            name="gst_percentage"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={4}
            useExplicit
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                options: [1, 5],
              }
            }} />


          <FormField
            label="Base Price"
            name="base_price"
            control={control}
            errors={errors}
            // required
            leftSpan={4}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100,
                type: 'number',
                min: 0,
                step: '0.01'
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
          </div>
          {/* <div className="field">
            <label htmlFor="car_parking_cost" className={classNames('col-5')}>Car Parking Cost</label>
            <Controller name="car_parking_cost" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputText type={"number"} min={0} id={field.name} {...field} className={classNames('col-6')} />
            )} />
          </div>
          <div className="field">
            <label htmlFor="eb_cost" className={classNames('col-5')}>EB Cost</label>
            <Controller name="eb_cost" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputText type={"number"} min={0} id={field.name} {...field} className={classNames('col-6')} />
            )} />
          </div>
          <div className="field">
            <label htmlFor="water_drainage_cost" className={classNames('col-5')}>Water Drainage Cost</label>
            <Controller name="water_drainage_cost" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputText type={"number"} min={0} id={field.name} {...field} className={classNames('col-6')} />
            )} />
          </div> */}
        </div>
      </div>
      <div className="flex" style={{ marginBottom: 10 }}>
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

  return (
    <>
      <Divider />
      <div className="pl-5">
        <div className="field">
          <label className={classNames('col-2')}>Project Name</label>
          <Dropdown
            style={{ width: '30%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectKey}
            filter
            filterBy={"name"}
            onChange={(e) => {
              setSelectedProjectKey(e.value)
            }}
            options={projects}
          />
        </div>
      </div>

      <TabView
        onTabChange={(e) => {
          setActiveTab(e.index)
        }}
        activeIndex={activeTab}
        className='custom-tabview pl-5'>

        <TabPanel header="Block Detail">

          <div style={{ minHeight: 250 }}>
            <ListLayout
              gridProps={{
                style: {
                  maxHeight: 400,
                  overflowY: 'auto',
                }
              }}
              tableLayoutClass='none'
              baseRoute={`/projects/${selectedProjectKey}/block`}
              description="Block"
              isLoading={isProjectBlockFetching || isBlockDeleting}
              data={blockData}
              customBaseRoute={{
                directUrl: `/projects/FIRST_ARG/block/`,
                args: ['proj_key'],
                suffix: '?direct'
              }}
              newTable
              allowFilters={false}
              hideActionColumn
              deleteAction={deleteBlockAction}
              emptyRowMessage={selectedProjectKey ? "No Block For Selected Project" : "Select a Project To View"}
            >
              {/* <Datacolumn filteringType="text" field="id" header="Block ID" sortable filter style={{ minWidth: '12rem' }} /> */}
              <Datacolumn filteringType="text" field="descr" header="Block Name" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn
                field="edit"
                header="Edit"
                type="custom"
                width={"10%"}
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => {
                      setIsNewBlock(false)
                      setDisplayAddBlockModal(true)
                      setSelectedBlock(row)
                    }}
                  >
                    Edit
                  </Button>}
              />
              <Datacolumn
                field="delete"
                header="Delete"
                type="custom"
                width={"10%"}
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => confirmDialog({
                      message: 'Are you sure to delete?',
                      header: 'Confirmation',
                      icon: 'pi pi-exclamation-triangle',
                      accept: () => deleteBlockAction(row.key),
                      reject: () => { }
                    })
                    }
                  >
                    Delete
                  </Button>}
              />
            </ListLayout>
            {
              selectedProjectKey &&
              <Button
                label='Add Block'
                style={{
                  marginLeft: 'auto',
                  marginTop: 5,
                  display: 'flex',
                  width: 150
                }}
                onClick={() => {
                  setSelectedBlock(null)
                  setIsNewBlock(true)
                  setDisplayAddBlockModal(true)
                }}
                className='p-button-plain'
              />
            }

          </div>

        </TabPanel>

        <TabPanel header="Floor Detail">
          {/* {
            !floorData?.length &&
            <h3 className='text-center'>
              {selectedProjectKey ? "No Floor For Selected Project" : "Select a Project To View"}
            </h3>
          } */}
          {
            // floorData?.map((d: any) => (
            <div style={{ minHeight: 250, marginBottom: 10 }}>
              <ListLayout
                gridProps={{
                  style: {
                    maxHeight: 400,
                    overflowY: 'auto',
                  }
                }}
                tableLayoutClass='none'
                baseRoute={`/projects/${selectedProjectKey}/floor`}
                // title={`Block Name - ${d?.block?.descr}`}
                showHeader
                isLoading={isProjectFloorFetching}
                data={floorData}
                newTable
                allowFilters={false}
                hideActionColumn
                hideAddButton
                deleteAction={deleteBlockAction}
                emptyRowMessage={selectedProjectKey ? "No Floor For Selected Project" : "Select a Project To View"}
              >
                <Datacolumn filteringType="text" field="block.descr" header="Block" sortable filter style={{ minWidth: '12rem' }} />
                <Datacolumn filteringType="text" field="descr" header="Floor Name" sortable filter style={{ minWidth: '12rem' }} />
                <Datacolumn
                  field="edit"
                  header="Edit"
                  type="custom"
                  width={"10%"}
                  displayValueGetter={(row: any) =>
                    <Button
                      style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                      onClick={() => {
                        setIsNewFloor(false)
                        setDisplayAddFloorModal(true)
                        setSelectedFloor(row)
                        setSelectedBlock(row.block)
                      }}
                    >
                      Edit
                    </Button>}
                />
                <Datacolumn
                  field="delete"
                  header="Delete"
                  type="custom"
                  width={"10%"}
                  displayValueGetter={(row: any) =>
                    <Button
                      style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                      onClick={() => confirmDialog({
                        message: 'Are you sure to delete?',
                        header: 'Confirmation',
                        icon: 'pi pi-exclamation-triangle',
                        accept: () => deleteFloorAction(row.key),
                        reject: () => { }
                      })
                      }
                    >
                      Delete
                    </Button>}
                />
              </ListLayout>
              {
                selectedProjectKey &&
                <Button
                  label='Add Floor'
                  style={{
                    marginLeft: 'auto',
                    marginTop: 5,
                    display: 'flex',
                    width: 150
                  }}
                  onClick={() => {
                    setSelectedFloor(null)
                    setIsNewFloor(true)
                    setDisplayAddFloorModal(true)
                    // setSelectedBlock(d.block)
                  }}
                  className='p-button-plain'
                />
              }

            </div>
            // ))
          }

        </TabPanel>

        <TabPanel header="Unit Detail">
          {/* {
            !unitData?.results?.length &&
            <h3 className='text-center'>
              {selectedProjectKey ? "No Unit For Selected Project" : "Select a Project To View"}
            </h3>
          } */}
          {
            // blockData?.map(d => (
            <div style={{ minHeight: 250, marginBottom: 10 }}>
              <ListLayout
                gridProps={{
                  style: {
                    maxHeight: 400,
                    overflowY: 'auto',
                  }
                }}
                tableLayoutClass='none'
                baseRoute={`/projects/${selectedProjectKey}/unit`}
                showHeader
                isLoading={isUnitFetching}
                data={unitData}
                newTable
                allowFilters={false}
                hideActionColumn
                hideAddButton
                deleteAction={deleteBlockAction}
                emptyRowMessage={selectedProjectKey ? "No Units For Selected Project" : "Select a Project To View"}
              >
                <Datacolumn filteringType="text" field="floor.descr" header="Floor" sortable filter style={{ minWidth: '12rem' }} />
                <Datacolumn filteringType="text" field="descr" header="Unit Name" sortable filter style={{ minWidth: '12rem' }} />
                <Datacolumn filteringType="text" field="saleablearea" header="Area SQFT" sortable filter style={{ minWidth: '12rem' }} />
                <Datacolumn filteringType="text" field="udsarea" header="UDS SQFT" sortable filter style={{ minWidth: '12rem' }} />
                <Datacolumn filteringType="text" field="bedrooms" header="BHK" sortable filter style={{ minWidth: '12rem' }} />
                <Datacolumn
                  field="edit"
                  header="Edit"
                  type="custom"
                  width={"10%"}
                  displayValueGetter={(row: any) =>
                    <Button
                      style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                      onClick={() => {
                        setIsNewUnit(false)
                        setDisplayAddUnitModal(true)
                        setSelectedUnit(row)
                        setBedrooms(row.bedrooms)
                        setBathrooms(row.bathrooms)
                        setBalconies(row.balconies)
                      }}
                    >
                      Edit
                    </Button>}
                />
                {/* <Datacolumn
                  field="view"
                  header="View"
                  type="custom"
                  width={"10%"}
                  displayValueGetter={(row: any) =>
                    <Button
                      style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                      onClick={() => {
                        setIsNewUnit(false)
                        setDisplayViewUnitModal(true)
                        setSelectedUnit(row)
                      }}
                    >
                      View
                    </Button>}
                /> */}
                <Datacolumn
                  field="delete"
                  header="Delete"
                  type="custom"
                  width={"10%"}
                  displayValueGetter={(row: any) =>
                    <Button
                      style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                      onClick={() => confirmDialog({
                        message: 'Are you sure to delete?',
                        header: 'Confirmation',
                        icon: 'pi pi-exclamation-triangle',
                        accept: () => deleteUnitAction(row.key),
                        reject: () => { }
                      })
                      }
                    >
                      Delete
                    </Button>}
                />
              </ListLayout>
              {
                selectedProjectKey &&
                <Button
                  label='Add Unit'
                  style={{
                    marginLeft: 'auto',
                    marginTop: 5,
                    display: 'flex',
                    width: 150
                  }}
                  onClick={() => {
                    setSelectedUnit(null)
                    setIsNewUnit(true)
                    setDisplayAddUnitModal(true)
                  }}
                  className='p-button-plain'
                />
              }

            </div>
            // ))
          }
        </TabPanel>

      </TabView>

      <Dialog
        header={`${isNewBlock ? "Add" : "Edit"} Block`}
        visible={displayAddBlockModal}
        footer={renderBlockFooter}
        position={'center'}
        modal
        style={{ width: '40vw' }}
        onHide={() => setDisplayAddBlockModal(false)}
        draggable={false} resizable={false} closable={false}
      >
        <div style={{ padding: 15 }}>
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-3'}>Block Name*</label>
            <InputText
              style={{ width: '40%' }}
              defaultValue={selectedBlock?.descr}
              onChange={(e) => {
                !isFormChanged && setIsFormChanged(true)
                setSelectedBlock({
                  ...selectedBlock,
                  descr: e.target.value
                })
              }}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        header={`${isNewFloor ? "Add" : "Edit"} Floor`}
        visible={displayAddFloorModal}
        footer={renderFloorFooter}
        position={'center'}
        modal
        style={{ width: '40vw' }}
        onHide={() => setDisplayAddFloorModal(false)}
        draggable={false} resizable={false} closable={false}
      >
        <div style={{ padding: 15 }}>
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-3'}>Block*</label>
            <Dropdown
              style={{ width: '50%' }}
              placeholder='Select a Block'
              options={blockData || []}
              value={selectedFloor?.projblk_key}
              onChange={(e) => {
                !isFormChanged && setIsFormChanged(true)
                setSelectedFloor({
                  ...selectedFloor,
                  projblk_key: e.target.value
                })
              }}
              optionLabel='descr'
              optionValue='key'
            />
          </div>
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-3'}>Floor Name*</label>
            <InputText
              style={{ width: '40%' }}
              defaultValue={selectedFloor?.descr}
              onChange={(e) => {
                !isFormChanged && setIsFormChanged(true)
                setSelectedFloor({
                  ...selectedFloor,
                  descr: e.target.value
                })
              }}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        // header={`${isNewUnit ? "Add" : "Edit"} Unit`}
        visible={displayAddUnitModal}
        // footer={renderUnitFooter}
        position={'center'}
        modal
        style={{ width: '60vw' }}
        onHide={() => {
          setDisplayAddUnitModal(false)
        }}
        draggable={false} resizable={false} closable={false}
      >
        <ManageLayout bottomControl customDiscard={() => {
          if (isFormChanged) {
            if (confirm("Are You Sure to Discard?")) {
              setBalconies(0)
              setBathrooms(0)
              setBedrooms(0)
              setDisplayAddUnitModal(false)
            }
          }
          else {
            setBalconies(0)
            setBathrooms(0)
            setBedrooms(0)
            setDisplayAddUnitModal(false)
          }

        }} baseRoute={""} description="Unit" id={selectedUnit?.key} data={selectedUnit}
          onSubmit={onUnitSubmit} renderForm={renderForm} />

      </Dialog>

      <Dialog
        header={`View Unit`}
        visible={displayViewUnitModal}
        closeOnEscape
        ariaCloseIconLabel='X'
        position={'center'}
        modal
        style={{ width: '40vw' }}
        onHide={() => setDisplayViewUnitModal(false)}
        draggable={false} resizable={false} closable
      >
        <div style={{ padding: 15 }}>
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-3'}>Unit Name*</label>
            <InputText
              style={{ width: '40%' }}
              disabled
              defaultValue={selectedUnit?.descr}
              onChange={(e) => {
                !isFormChanged && setIsFormChanged(true)
                setSelectedUnit({
                  ...selectedUnit,
                  descr: e.target.value
                })
              }}
            />
          </div>
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-3'}>Floor*</label>
            <InputText
              disabled
              style={{ width: '40%' }}
              defaultValue={selectedUnit?.floor?.descr}
            />
          </div>
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-3'}>Area SQFT*</label>
            <InputText
              disabled
              style={{ width: '40%' }}
              defaultValue={selectedUnit?.saleablearea}
            />
          </div>
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-3'}>UDS SQFT*</label>
            <InputText
              disabled
              style={{ width: '40%' }}
              defaultValue={selectedUnit?.descr}
            />
          </div>
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-3'}>BHK*</label>
            <InputText
              disabled
              style={{ width: '40%' }}
              defaultValue={selectedUnit?.descr}
            />
          </div>
        </div>

      </Dialog>

    </>
  );
}

export default Main