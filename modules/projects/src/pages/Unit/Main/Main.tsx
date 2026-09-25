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
  setPaymentMenu,
  setPromptNavigate,
  setSelectedProjectReducer,
  useActiveProjectQuery,
  useBlocksForProjectQuery,
  useFloorsForProjectQuery,
  useUnitsForProjectQuery,
  useGetProjectUnitStatusQuery,
  inputNumberProps,
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';
import { useAddProjectUnitMutation, useDeleteProjectUnitMutation, useListProjectUnitQuery, useUpdateProjectUnitMutation } from '../../FloorUnits/unitApi';
import { useSelector, useDispatch } from 'react-redux'

type Props = {}

const Main = (props: Props) => {

  const { showError, showSuccess } = useToast()
  const dispatch = useDispatch();

  const selectedProjectFromReducer = useSelector((state: any) => state?.common?.selectedProject)

  const projKeyFromState: any = useLocation().state;

  const { data: projects } = useActiveProjectQuery()
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(projKeyFromState || selectedProjectFromReducer)

  const [selectedBlock, setSelectedBlock] = useState<any>(null)

  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [isNewUnit, setIsNewUnit] = useState(true);
  const [displayAddUnitModal, setDisplayAddUnitModal] = useState(false);
  const [displayViewUnitModal, setDisplayViewUnitModal] = useState(false);
  const { data: projectUnitStatus } = useGetProjectUnitStatusQuery({})

  const searchQuery = useLocation().search

  const clientProps = getClientProps();

  useEffect(() => {
    if (searchQuery && searchQuery.split('bkp=').length === 2) {
      let id = parseInt(searchQuery.split('bkp=')[1])
      setSelectedProjectKey(id)
    }
  }, [])

  useEffect(() => {
    dispatch(setPaymentMenu('project'));
    return () => {
      dispatch(setPaymentMenu(''));
    };
  }, [dispatch]);

  const { data: blockData } = useBlocksForProjectQuery({
    projectId: selectedProjectKey
  }, { skip: !selectedProjectKey, refetchOnMountOrArgChange: true })

  const { data: floorData } = useFloorsForProjectQuery({
    projectId: selectedProjectKey
  }, { skip: !selectedProjectKey, refetchOnMountOrArgChange: true })

  const { data: unitData, isFetching: isUnitFetching, refetch: refetchUnit } = useUnitsForProjectQuery({
    projectId: selectedProjectKey
  }, { skip: !selectedProjectKey, refetchOnMountOrArgChange: true })


  const [bedrooms, setBedrooms] = useState<number | null>(0)
  const [bathrooms, setBathrooms] = useState<number | null>(0)
  const [balconies, setBalconies] = useState<number | null>(0)

  const [formattedUnitData, setFormattedUnitData] = useState<any>([])

  useEffect(() => {
    if (unitData) {
      const formatted = unitData.map((unit: any) => ({
        ...unit,
        saleablearea: unit.saleablearea || unit.saleablearea === 0 ? (parseFloat(unit.saleablearea).toFixed(2).replace(/\.?0+$/, '').replace(/\.$/, '')) : null,
        udsarea: unit.udsarea || unit.udsarea === 0 ? (parseFloat(unit.udsarea).toFixed(2).replace(/\.?0+$/, '').replace(/\.$/, '')) : null,
      }));
      setFormattedUnitData(formatted);
    } else {
      setFormattedUnitData([]);
    }
  }, [unitData]);

  const [deleteUnit, { isLoading: isUnitDeleting }] = useDeleteProjectUnitMutation()
  const [addProjectUnit, { isLoading: isAdding }] = useAddProjectUnitMutation()
  const [updateProjectUnit, { isLoading: isUpdating }] = useUpdateProjectUnitMutation();
  const deleteUnitAction = async (id: number) => {
    await deleteUnit(id).unwrap();
    refetchUnit();
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
      dispatch(setPromptNavigate({promptNavigate: false}))
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
            label="Status"
            name="projunit_status_key"
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
                options: projectUnitStatus,
              }
            }} />
          

        </div>
        <div style={{ border: '1px solid' }} className="col-6">

        <div className="field">
          <label htmlFor="base_price" className={classNames('col-5', { 'p-error': errors.base_price })}>Base Price</label>
          <Controller name="base_price" control={control} rules={{}} render={({ field, fieldState }) => (
             <InputNumber id={field.name} value={field.value} onValueChange={(e) => field.onChange(e.value)} className={classNames('col-6', { 'p-invalid': fieldState.invalid })} {...inputNumberProps} useGrouping locale="en-IN"/>
          )} />
          {/* {getFormErrorMessage(errors?.saleablearea?.message)} */}
        </div>

          <div className="field">
            <label htmlFor="saleablearea" className={classNames('col-5', { 'p-error': errors.saleablearea })}>Saleable Area SqFt</label>
            <Controller name="saleablearea" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputNumber  id={field.name} value={field.value} onValueChange={(e) => field.onChange(e.value)} className={classNames('col-6', { 'p-invalid': fieldState.invalid })} {...inputNumberProps} useGrouping locale="en-IN"/>
            )} />
            {/* {getFormErrorMessage(errors?.saleablearea?.message)} */}
          </div>
          <div className="field">
            <label htmlFor="carpetarea" className={classNames('col-5', { 'p-error': errors.carpetarea })}>Carpet Area SqFt</label>
            <Controller name="carpetarea" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputNumber  id={field.name} value={field.value} onValueChange={(e) => field.onChange(e.value)} className={classNames('col-6', { 'p-invalid': fieldState.invalid })} {...inputNumberProps} useGrouping locale="en-IN"/>
            )} />
            {/* {getFormErrorMessage(errors?.carpetarea?.message)} */}
          </div>
          <div className="field">
            <label htmlFor="udsarea" className={classNames('col-5', { 'p-error': errors.udsarea })}>UDS Area SqFt</label>
            <Controller name="udsarea" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputNumber  id={field.name} value={field.value} onValueChange={(e) => field.onChange(e.value)} className={classNames('col-6', { 'p-invalid': fieldState.invalid })} {...inputNumberProps} useGrouping locale="en-IN"/>
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
      <div className="flex">
        <div className="field col-6">
          <label className={'col-4'}>Project Name</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectFromReducer}
            filter
            filterBy={"name"}
            onChange={(e) => {
              dispatch(setSelectedProjectReducer(e.value))
              setSelectedProjectKey(e.value)
            }}
            options={projects || []}
          />

        </div>

      </div>

      <div style={{ minHeight: 250 }}>
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
          data={formattedUnitData}
          newTable
          allowFilters={false}
          hideActionColumn
          hideAddButton
          deleteAction={deleteUnitAction}
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