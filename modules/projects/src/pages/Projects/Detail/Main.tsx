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
import { MultiSelect } from 'primereact/multiselect';
import { confirmDialog } from 'primereact/confirmdialog';
import { classNames } from "primereact/utils";
import {
  AFTER_API_TIME,
  getClientProps,
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
import { TabView, TabPanel } from 'primereact/tabview';
import { useAddProjectUnitMutation, useDeleteProjectUnitMutation, useListProjectUnitQuery, useUpdateProjectUnitMutation, useGenerateProjectUnitsMutation } from '../../FloorUnits/unitApi';
import { useAddProjectBlockMutation, useUpdateProjectBlockMutation, useDeleteProjectBlockMutation } from '../../Unit/blockApi';
import { useAddProjectFloorMutation, useUpdateProjectFloorMutation, useDeleteProjectFloorMutation, useGenerateProjectFloorsMutation } from '../../Unit/floorApi';
import { useDispatch, useSelector } from 'react-redux'
import ManageDetail from '../Manage/ManageDetail';
import ElevationDiagram from '../../ElevationDiagram/Main/ElevationDiagram';
import FloorPlanPage from '../../FloorPlan/Main';

type Props = {}

const Main = (props: Props) => {

  const { showError, showSuccess } = useToast()

  const dispatch = useDispatch()
  const selectedProjectKey = useSelector((state: any) => state?.common?.selectedProject)


  const { data: projects } = useActiveProjectQuery()
  const [activeTab, setActiveTab] = useState(0);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const [selectedBlock, setSelectedBlock] = useState<any>(null)
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<any>(null);
  const [selectedBlocksForFloorGeneration, setSelectedBlocksForFloorGeneration] = useState<number[]>([]);
  const [selectedBlocksForUnitGeneration, setSelectedBlocksForUnitGeneration] = useState<number[]>([]);
  const [displayGenerateFloorModal, setDisplayGenerateFloorModal] = useState(false);
  const [displayGenerateUnitModal, setDisplayGenerateUnitModal] = useState(false);
  const [isNewBlock, setIsNewBlock] = useState(true);
  // const [displayAddBlockModal, setDisplayAddBlockModal] = useState(false);
  const [displayAddBlockDetailModal, setDisplayAddBlockDetailModal] = useState(false);
  const [addProjectBlock, { isLoading: isBlockAdding }] = useAddProjectBlockMutation()
  const [updateProjectBlock, { isLoading: isBlockUpdating }] = useUpdateProjectBlockMutation();

  const [selectedFloor, setSelectedFloor] = useState<any>(null)
  const [isNewFloor, setIsNewFloor] = useState(true);
  const [displayAddFloorModal, setDisplayAddFloorModal] = useState(false);
  const [addProjectFloor, { isLoading: isFloorAdding }] = useAddProjectFloorMutation()
  const [updateProjectFloor, { isLoading: isFloorUpdating }] = useUpdateProjectFloorMutation();

  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [isNewUnit, setIsNewUnit] = useState(true);
  const { data: projectUnitStatus } = useGetProjectUnitStatusQuery({})
  const [displayAddUnitModal, setDisplayAddUnitModal] = useState(false);
  const [displayViewUnitModal, setDisplayViewUnitModal] = useState(false);

  const clientProps = getClientProps();

  const { data: blockData, isLoading: isProjectBlockFetching, refetch: refetchBlock } = useBlocksForProjectQuery({
    projectId: selectedProjectKey
  }, { skip: !selectedProjectKey, refetchOnMountOrArgChange: true })

  const { data: floorData, isLoading: isProjectFloorFetching, refetch: refetchFloor } = useFloorsForProjectQuery({
    projectId: selectedProjectKey,
    blockId: selectedBlockFilter,
  }, { skip: !selectedProjectKey, refetchOnMountOrArgChange: true })

  // const totalUnits = floorData?.reduce((acc, f) => acc + (Number(f.no_of_units) || 0), 0) ?? 0;

  const { data: unitData, isFetching: isUnitFetching, refetch: refetchUnit } = useUnitsForProjectQuery({
    projectId: selectedProjectKey,
    blockId: selectedBlockFilter,
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

  const [generateFloors, { isLoading: isGeneratingFloors }] = useGenerateProjectFloorsMutation();
  const [generateUnits, { isLoading: isGeneratingUnits }] = useGenerateProjectUnitsMutation();

  const handleGenerateFloors = async (overwrite: boolean = false, skipConfirm: boolean = false) => {
    const blocks: any[] = (blockData ?? []).filter((block: any) =>
      selectedBlocksForFloorGeneration.includes(Number(block.key))
    );

    if (!blocks.length) {
      confirmDialog({
        message: 'Select at least one block to generate floor names.',
        header: 'No Blocks Selected',
        icon: 'pi pi-exclamation-triangle',
        footer: () => null,
      });
      return;
    }

    const missingFloorCount = blocks.some(
      (block: any) => !block.floor_count || block.floor_count <= 0
    );

    if (missingFloorCount) {
      confirmDialog({
        message: 'Each block must have a Floor Count before generating floor names.',
        header: 'Missing Floor Count',
        icon: 'pi pi-exclamation-triangle',
        footer: () => null,
      });
      return;
    }

    const payload = blocks.map((block: any) => ({
      key: Number(block.key),
      floor_count: Number(block.floor_count),
    }));

    if (!skipConfirm) {
      confirmDialog({
        message: 'Are you sure you want to generate floors for the selected blocks?',
        header: 'Confirm Floor Generation',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: () => handleGenerateFloors(overwrite, true),
      });
      return;
    }

    try {
      const resp: any = await generateFloors({ blocks: payload, overwrite })
        .unwrap()
        .catch((err: any) => err.data || { error: 1, detail: 'API call failed' });

      if (resp.error === 0) {
        showSuccess('Success', 'Floors generated successfully');
        refetchFloor();
        setDisplayGenerateFloorModal(false);
      } else if (resp.error === 2 && resp.blocks?.length) {
        confirmDialog({
          message: `The following blocks already have floors: ${resp.blocks.join(
            ', '
          )}. Do you want to delete them and create new floors?`,
          header: 'Existing Floors Detected',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Yes, Overwrite',
          rejectLabel: 'No',
          accept: () => handleGenerateFloors(true, true), // ✅ directly overwrite, no reconfirm
        });
      } else {
        showError('Error', resp.detail || 'Failed to generate floors');
      }
    } catch (error: any) {
      showError('Error', error?.data?.detail || 'API call failed');
      console.error(error);
    }
  };

  const handleGenerateUnits = async (overwrite = false, skipConfirm = false) => {
    const floors = floorData ?? [];
    const selectedBlockKeys = new Set(selectedBlocksForUnitGeneration.map((k) => Number(k)));
    const filteredFloors = selectedBlockKeys.size
      ? floors.filter((floor: any) => selectedBlockKeys.has(Number(floor.projblk_key)))
      : floors;

    if (!filteredFloors.length) {
      confirmDialog({
        message: 'Select at least one block to generate units.',
        header: 'No Blocks Selected',
        icon: 'pi pi-exclamation-triangle',
        footer: () => null,
      });
      return;
    }

    const missingCount = filteredFloors.some(
      (floor: any) =>
        floor.descr !== 'Ground Floor' && (!floor.no_of_units || floor.no_of_units <= 0)
    );

    if (missingCount) {
      confirmDialog({
        message: 'Each floor must have a Unit Count before generating units (except Ground Floor).',
        header: 'Missing Unit Count',
        icon: 'pi pi-exclamation-triangle',
        footer: () => null,
      });
      return;
    }

    const payload = filteredFloors
      .filter((floor: any) => floor.no_of_units && floor.no_of_units > 0)
      .map((floor: any) => ({
        key: Number(floor.key),
        unit_count: Number(floor.no_of_units),
      }));

    if (!skipConfirm) {
      confirmDialog({
        message: 'Are you sure you want to generate units for the selected floors?',
        header: 'Confirm Unit Generation',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: () => handleGenerateUnits(overwrite, true),
      });
      return;
    }

    try {
      const resp: any = await generateUnits({ floors: payload, overwrite })
        .unwrap()
        .catch((err: any) => err.data || { error: 1, detail: 'API call failed' });

      if (resp.error === 0) {
        showSuccess('Success', 'Units generated successfully');
        refetchUnit();
        setDisplayGenerateUnitModal(false);
      } else if (resp.error === 2 && resp.floors) {
        const floorsDict = resp.floors as Record<string, string[]>; 
        const message = Object.entries(floorsDict)
          .map(
            ([block, floorNames]) => `${block}: ${floorNames.join(', ')}`
          )
          .join('\n');

        confirmDialog({
          message: `The following floors already have units:\n${message}\nDo you want to overwrite them?`,
          header: 'Existing Units Detected',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Yes, Overwrite',
          rejectLabel: 'No',
          accept: () => handleGenerateUnits(true, true),
        });
      } else {
        showError('Error', resp.detail || 'Failed to generate units');
      }
    } catch (error: any) {
      showError('Error', error?.data?.detail || 'API call failed');
      console.error(error);
    }
  };

  useEffect(() => {
    setSelectedBlockFilter(null);
    setSelectedBlocksForFloorGeneration([]);
    setSelectedBlocksForUnitGeneration([]);
    setDisplayGenerateFloorModal(false);
    setDisplayGenerateUnitModal(false);
  }, [selectedProjectKey]);

  useEffect(() => {
    setSelectedBlocksForFloorGeneration((prev) => {
      const blocksWithExistingFloors = new Set(
        (floorData ?? []).map((floor: any) => Number(floor.projblk_key))
      );
      const availableKeys = new Set(
        (blockData ?? [])
          .filter((block: any) =>
            block.floor_count && block.floor_count > 0 && !blocksWithExistingFloors.has(Number(block.key))
          )
          .map((block: any) => Number(block.key))
      );
      return prev.filter((key) => availableKeys.has(Number(key)));
    });
  }, [blockData, floorData]);


  useEffect(() => {
    setSelectedBlocksForFloorGeneration((prev) => {
      const availableKeys = new Set((blockData ?? []).map((block: any) => Number(block.key)));
      return prev.filter((key) => availableKeys.has(Number(key)));
    });
  }, [blockData]);

  useEffect(() => {
    setSelectedBlocksForUnitGeneration((prev) => {
      const availableKeys = new Set((blockData ?? []).map((block: any) => Number(block.key)));
      return prev.filter((key) => availableKeys.has(Number(key)));
    });
  }, [blockData]);


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
              // setDisplayAddBlockModal(false)
              setDisplayAddBlockDetailModal(false)
              showSuccess('Success', resp.detail);
            } catch (e) {
              console.log(e)
              showError('An error occurred', "We couldn't save your request, try again!");
            }

          }} />
        <Button label="Discard" className='p-button-plain' onClick={() => {
          if (isFormChanged) {
            if (confirm("Are You Sure to Discard?")) {
              // setDisplayAddBlockModal(false)
              setDisplayAddBlockDetailModal(false)
            }
          }
          else {
            setIsFormChanged(false)
            // setDisplayAddBlockModal(false)
            setDisplayAddBlockDetailModal(false)
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
            } catch (error: any) {
              console.log(error)
              const detail =
                error?.data?.detail ||
                error?.data?.message ||
                "We couldn't save your request, try again!";
              showError('An error occurred', detail);
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


  const renderGenerateFloorFooter = () => {
    return (
      <div className="flex justify-content-center">
        <Button
          label='Generate'
          loading={isGeneratingFloors}
          disabled={isFloorGenerateDisabled}
          className="p-button-warning mr-3"
          onClick={() => handleGenerateFloors(false)}
        />
        <Button
          label="Discard"
          className='p-button-plain'
          onClick={() => setDisplayGenerateFloorModal(false)}
        />
      </div>
    );
  }

  const getFloorGenerationBlocks = () => {
    const blocks = blockData ?? [];
    const floors = floorData ?? [];
    const blocksWithExistingFloors = new Set(
      floors.map((floor: any) => Number(floor.projblk_key))
    );
    return blocks.filter(
      (block: any) =>
        block.floor_count && block.floor_count > 0 && !blocksWithExistingFloors.has(Number(block.key))
    );
  }

  const renderGenerateUnitFooter = () => {
    return (
      <div className="flex justify-content-center">
        <Button
          label='Generate'
          loading={isGeneratingUnits}
          disabled={isUnitGenerateDisabled}
          className="p-button-warning mr-3"
          onClick={() => handleGenerateUnits(false)}
        />
        <Button
          label="Discard"
          className='p-button-plain'
          onClick={() => setDisplayGenerateUnitModal(false)}
        />
      </div>
    );
  }

  const getUnitGenerationBlocks = () => {
    const blocks = blockData ?? [];
    const floors = floorData ?? [];
    const units = unitData ?? [];
    const blocksWithFloors = new Set(floors.map((floor: any) => Number(floor.projblk_key)));
    const blocksWithUnits = new Set(
      units.map((unit: any) => Number(unit.projblk_key ?? unit.block?.key))
    );
    return blocks.filter(
      (block: any) =>
        blocksWithFloors.has(Number(block.key)) && !blocksWithUnits.has(Number(block.key))
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
      dispatch(setPromptNavigate({ promptNavigate: false }))
      setTimeout(() => {
        setBalconies(0)
        setBathrooms(0)
        setBedrooms(0)
        setDisplayAddUnitModal(false)
      }, AFTER_API_TIME);
    } catch (error: any) {
      console.log(error)
      const detail =
        error?.data?.detail ||
        error?.data?.message ||
        "We couldn't save your request, try again!";
      showError('An error occurred', detail);
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
              <InputNumber id={field.name} value={field.value} onValueChange={(e) => field.onChange(e.value)} className={classNames('col-6', { 'p-invalid': fieldState.invalid })} {...inputNumberProps} useGrouping locale="en-IN" />
            )} />
            {/* {getFormErrorMessage(errors?.saleablearea?.message)} */}
          </div>
          <div className="field">
            <label htmlFor="saleablearea" className={classNames('col-5', { 'p-error': errors.saleablearea })}>Saleable Area SqFt</label>
            <Controller name="saleablearea" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputNumber id={field.name} value={field.value} onValueChange={(e) => field.onChange(e.value)} className={classNames('col-6', { 'p-invalid': fieldState.invalid })} {...inputNumberProps} useGrouping locale="en-IN" />
            )} />
            {/* {getFormErrorMessage(errors?.saleablearea?.message)} */}
          </div>
          <div className="field">
            <label htmlFor="carpetarea" className={classNames('col-5', { 'p-error': errors.carpetarea })}>Carpet Area SqFt</label>
            <Controller name="carpetarea" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputNumber id={field.name} value={field.value} onValueChange={(e) => field.onChange(e.value)} className={classNames('col-6', { 'p-invalid': fieldState.invalid })} {...inputNumberProps} useGrouping locale="en-IN" />
            )} />
            {/* {getFormErrorMessage(errors?.carpetarea?.message)} */}
          </div>
          <div className="field">
            <label htmlFor="udsarea" className={classNames('col-5', { 'p-error': errors.udsarea })}>UDS Area SqFt</label>
            <Controller name="udsarea" control={control} rules={{}} render={({ field, fieldState }) => (
              <InputNumber id={field.name} value={field.value} onValueChange={(e) => field.onChange(e.value)} className={classNames('col-6', { 'p-invalid': fieldState.invalid })} {...inputNumberProps} useGrouping locale="en-IN" />
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
                  const nextValue = e.value ?? null;
                  setBedrooms(nextValue);
                  field.onChange(nextValue);
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
                  const nextValue = e.value ?? null;
                  setBathrooms(nextValue);
                  field.onChange(nextValue);
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
                  const nextValue = e.value ?? null;
                  setBalconies(nextValue);
                  field.onChange(nextValue);
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

  const floorGenerationBlocks = getFloorGenerationBlocks();
  const unitGenerationBlocks = getUnitGenerationBlocks();
  const isFloorGenerateDisabled = floorGenerationBlocks.length === 0;
  const isUnitGenerateDisabled = unitGenerationBlocks.length === 0;

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
              dispatch(setSelectedProjectReducer(e.value))
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
        <TabPanel header="Basic Info">

          <ManageDetail />

        </TabPanel>

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
              showHeader
              hideAddButton
              allowFilters={false}
              hideActionColumn
              deleteAction={deleteBlockAction}
              emptyRowMessage={selectedProjectKey ? "No Block For Selected Project" : "Select a Project To View"}
            >
              {/* <Datacolumn filteringType="text" field="id" header="Block ID" sortable filter style={{ minWidth: '12rem' }} /> */}
              <Datacolumn filteringType="text" field="descr" header="Block Name" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn filteringType="number" field="floor_count" header="Floor Count" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn filteringType="number" field="unit_count" header="Unit Count" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn
                field="actions"
                header="Actions"
                type="custom"
                width={"25%"}
                displayValueGetter={(row: any) => (
                  <div className="flex gap-2">
                    <Button
                      style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                      onClick={() => {
                        setIsNewBlock(false);
                        setDisplayAddBlockDetailModal(true);
                        setSelectedBlock(row);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                      onClick={() => {
                        setIsNewBlock(true);
                        setIsFormChanged(false);
                        setDisplayAddBlockDetailModal(true);
                        setSelectedBlock({ ...row, descr: `${row.descr} (Copy)` });
                      }}
                    >
                      Copy
                    </Button>

                    <Button
                      style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                      onClick={() =>
                        confirmDialog({
                          message: 'Are you sure to delete?',
                          header: 'Confirmation',
                          icon: 'pi pi-exclamation-triangle',
                          accept: () => deleteBlockAction(row.key),
                          reject: () => {},
                        })
                      }
                    >
                      Delete
                    </Button>
                  </div>
                )}
              />
              {/* <Datacolumn
                field="edit"
                header="Edit"
                type="custom"
                width={"10%"}
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => {
                      setIsNewBlock(false)
                      setDisplayAddBlockDetailModal(true)
                      setSelectedBlock(row)
                    }}
                  >
                    Edit
                  </Button>}
              />
              <Datacolumn
                field="copy"
                header="Copy"
                type="custom"
                width={"10%"}
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => {
                      setIsNewBlock(true);
                      setIsFormChanged(false);
                      setDisplayAddBlockDetailModal(true);
                      setSelectedBlock({ ...row, descr: `${row.descr} (Copy)` });
                    }}
                  >
                    Copy
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
              /> */}
            </ListLayout>
            {
              selectedProjectKey &&
              <div className='flex flex-column'>
                <div className='flex flex-row'>
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
                    setDisplayAddBlockDetailModal(true)
                  }}
                  className='p-button-plain'
                />
                <Button
                  label='Generate Floor Names'
                  style={{
                    marginLeft: 15,
                    marginTop: 5,
                    display: 'flex',
                    width: 250
                  }}
                  onClick={() => {
                    const blocks = blockData ?? [];
                    if (blocks.length >= 1) {
                      const blocksWithExistingFloors = new Set(
                        (floorData ?? []).map((floor: any) => Number(floor.projblk_key))
                      );
                      const blocksWithFloorCount = blocks.filter(
                        (block: any) =>
                          block.floor_count && block.floor_count > 0 && !blocksWithExistingFloors.has(Number(block.key))
                      );
                      if (blocksWithFloorCount.length > 0) {
                        setSelectedBlocksForFloorGeneration(
                          blocksWithFloorCount.map((block: any) => Number(block.key))
                        );
                      } else {
                        setSelectedBlocksForFloorGeneration([]);
                      }
                      setDisplayGenerateFloorModal(true);
                      return;
                    }
                    confirmDialog({
                      message: 'Select at least one block to generate floor names.',
                      header: 'No Blocks Selected',
                      icon: 'pi pi-exclamation-triangle',
                      footer: () => null,
                    });
                  }}
                  className='p-button-plain'
                />
                </div>
              </div>
            }

          </div>

        </TabPanel>

        {/* <TabPanel header="Block Detail">

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
              showHeader
              hideAddButton
              allowFilters={false}
              hideActionColumn
              deleteAction={deleteBlockAction}
              emptyRowMessage={selectedProjectKey ? "No Block For Selected Project" : "Select a Project To View"}
            >
              <Datacolumn filteringType="text" field="id" header="Block ID" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn filteringType="text" field="descr" header="Block Name" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn filteringType="number" field="floor_count" header="Floor Count" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn filteringType="number" field="unit_count" header="Unit Count" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn filteringType="number" field="column_count" header="Column Count" sortable filter style={{ minWidth: '12rem' }} />
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
                      setDisplayAddBlockDetailModal(true)
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
                  setDisplayAddBlockDetailModal(true)
                }}
                className='p-button-plain'
              />
            }

          </div>

        </TabPanel> */}

        <TabPanel header="Floor Detail">

          <div style={{ minHeight: 250 }}>
            <div className="flex justify-content-between align-items-center" style={{ marginBottom: '1rem' }}>
              {/* Block Dropdown on the left */}
              <div className="flex align-items-center">
                <label style={{ marginRight: '0.5rem', minWidth: '70px' }}>Block</label>
                <Dropdown
                  style={{ width: '300px' }}
                  optionLabel="descr"
                  optionValue="key"
                  value={selectedBlockFilter}
                  showClear
                  filter
                  filterBy="descr"
                  placeholder="All"
                  onChange={(e) => setSelectedBlockFilter(e.value)}
                  options={blockData || []}
                  disabled={!selectedProjectKey || isProjectBlockFetching}
                />
              </div>

              {/* Total Units on the right */}
              {/* <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                Total Units: 
              </div> */}
            </div>
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
              <Datacolumn filteringType="text" field="no_of_units" header="No of Units" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn
                field="actions"
                header="Actions"
                type="custom"
                width={"20%"}
                displayValueGetter={(row: any) => (
                  <div className="flex gap-2">
                    <Button
                      style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                      onClick={() => {
                        setIsNewFloor(false);
                        setDisplayAddFloorModal(true);
                        setSelectedFloor(row);
                        setSelectedBlock(row.block);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                      onClick={() =>
                        confirmDialog({
                          message: 'Are you sure to delete?',
                          header: 'Confirmation',
                          icon: 'pi pi-exclamation-triangle',
                          accept: () => deleteFloorAction(row.key),
                          reject: () => { },
                        })
                      }
                    >
                      Delete
                    </Button>
                  </div>
                )}
              />
              {/* <Datacolumn
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
              /> */}
              {/* <Datacolumn
                field="copy"
                header="Copy"
                type="custom"
                width={"10%"}
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => {
                      setIsNewFloor(true);
                      setIsFormChanged(false);
                      setDisplayAddFloorModal(true);
                      setSelectedFloor({ ...row, descr: `${row.descr} (Copy)` });
                      setSelectedBlock(row.block);
                    }}
                  >
                    Copy
                  </Button>}
              /> */}
              {/* <Datacolumn
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
              /> */}
            </ListLayout>
            {
              selectedProjectKey &&
              <div className='flex flex-row'>
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
                <Button
                  label='Generate Unit Names'
                  style={{
                    marginLeft: 15,
                    marginTop: 5,
                    display: 'flex',
                    width: 200
                  }}
                  onClick={() => {
                    const blocks = blockData ?? [];
                    if (blocks.length >= 1) {
                      const blocksWithFloors = new Set(
                        (floorData ?? []).map((floor: any) => Number(floor.projblk_key))
                      );
                      const blocksWithUnits = new Set(
                        (unitData ?? []).map((unit: any) => Number(unit.projblk_key ?? unit.block?.key))
                      );
                      const blocksForUnitGen = blocks.filter(
                        (block: any) =>
                          blocksWithFloors.has(Number(block.key)) &&
                          !blocksWithUnits.has(Number(block.key))
                      );
                      if (blocksForUnitGen.length > 0) {
                        setSelectedBlocksForUnitGeneration(
                          blocksForUnitGen.map((block: any) => Number(block.key))
                        );
                      } else {
                        setSelectedBlocksForUnitGeneration([]);
                      }
                      setDisplayGenerateUnitModal(true);
                      return;
                    }
                    confirmDialog({
                      message: 'Select at least one block to generate units.',
                      header: 'No Blocks Selected',
                      icon: 'pi pi-exclamation-triangle',
                      footer: () => null,
                    });
                  }}
                  className='p-button-plain'
                />
              </div>
            }

          </div>

        </TabPanel>

        <TabPanel header="Unit Detail">
          <div style={{ minHeight: 250 }}>
            <div className="field col-6" style={{ marginBottom: '1rem' }}>
              <label className="col-4">Block</label>
              <Dropdown
                style={{ width: '60%' }}
                optionLabel="descr"
                optionValue="key"
                value={selectedBlockFilter}
                showClear
                filter
                filterBy="descr"
                placeholder="All"
                onChange={(e) => setSelectedBlockFilter(e.value)}
                options={blockData || []}
                disabled={!selectedProjectKey || isProjectBlockFetching}
              />
            </div>
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
              <Datacolumn filteringType="text" field="block.descr" header="Block" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn filteringType="text" field="floor.descr" header="Floor" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn filteringType="text" field="descr" header="Unit Name" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn filteringType="text" field="saleablearea" header="Area SQFT" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn filteringType="text" field="udsarea" header="UDS SQFT" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn filteringType="text" field="bedrooms" header="BHK" sortable filter style={{ minWidth: '12rem' }} />
              <Datacolumn
                field="actions"
                header="Actions"
                type="custom"
                width={"25%"}
                displayValueGetter={(row: any) => (
                  <div className="flex gap-2">
                    <Button
                      style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                      onClick={() => {
                        setIsNewUnit(false);
                        setDisplayAddUnitModal(true);
                        setSelectedUnit(row);
                        setBedrooms(row.bedrooms);
                        setBathrooms(row.bathrooms);
                        setBalconies(row.balconies);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                      onClick={() => {
                        setIsNewUnit(true);
                        setIsFormChanged(false);
                        setDisplayAddUnitModal(true);
                        setSelectedUnit({ ...row, descr: `${row.descr} (Copy)` });
                        setSelectedBlock(row.block);
                        setBedrooms(row.bedrooms);
                        setBathrooms(row.bathrooms);
                        setBalconies(row.balconies);
                      }}
                    >
                      Copy
                    </Button>

                    <Button
                      style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                      onClick={() =>
                        confirmDialog({
                          message: 'Are you sure to delete?',
                          header: 'Confirmation',
                          icon: 'pi pi-exclamation-triangle',
                          accept: () => deleteUnitAction(row.key),
                          reject: () => { },
                        })
                      }
                    >
                      Delete
                    </Button>
                  </div>
                )}
              />
              {/* <Datacolumn
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
              <Datacolumn
                field="copy"
                header="Copy"
                type="custom"
                width={"10%"}
                displayValueGetter={(row: any) =>
                  <Button
                    style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                    onClick={() => {
                      setIsNewUnit(true);
                      setIsFormChanged(false);
                      setDisplayAddUnitModal(true);
                      setSelectedUnit({ ...row, descr: `${row.descr} (Copy)` });
                      setSelectedBlock(row.block);
                      setBedrooms(row.bedrooms);
                      setBathrooms(row.bathrooms);
                      setBalconies(row.balconies);
                    }}
                  >
                    Copy
                  </Button>}
              /> */}
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
              {/* <Datacolumn
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
              /> */}
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
        </TabPanel>

        <TabPanel header="Elevation">
          <ElevationDiagram />
        </TabPanel>

        <TabPanel header="Floor-Plan">
          <FloorPlanPage />
        </TabPanel>
      </TabView>


      <Dialog
        header={<div style={{ width: '100%', textAlign: 'center' }}>Select Blocks To Generate Floors</div>}
        visible={displayGenerateFloorModal}
        footer={renderGenerateFloorFooter}
        position="center"
        modal
        style={{ width: '24vw', borderRadius: 0 }}
        onHide={() => setDisplayGenerateFloorModal(false)}
        draggable={false}
        resizable={false}
        closable={true}
      >
        <div className='flex flex-column align-items-center gap-3'>
          <MultiSelect
            value={selectedBlocksForFloorGeneration}
            options={floorGenerationBlocks}
            optionLabel="descr"
            optionValue="key"
            placeholder="Select Blocks"
            display="chip"
            filter
            style={{ width: '18rem' }}
            disabled={isFloorGenerateDisabled}
            onChange={(e) => setSelectedBlocksForFloorGeneration(e.value ?? [])}
          />
          {isFloorGenerateDisabled && (
            <small className="text-color-secondary">
              No blocks available: all blocks already have floors or missing floor count.
            </small>
          )}
        </div>

      </Dialog>

      <Dialog
        header={<div style={{ width: '100%', textAlign: 'center' }}>Select Blocks To Generate Units</div>}
        visible={displayGenerateUnitModal}
        footer={renderGenerateUnitFooter}
        position="center"
        modal
        style={{ width: '24vw', borderRadius: 0 }}
        onHide={() => setDisplayGenerateUnitModal(false)}
        draggable={false}
        resizable={false}
        closable={true}
      >
        <div className='flex flex-column align-items-center gap-3'>
          <MultiSelect
            value={selectedBlocksForUnitGeneration}
            options={unitGenerationBlocks}
            optionLabel="descr"
            optionValue="key"
            placeholder="Select Blocks"
            display="chip"
            filter
            style={{ width: '18rem' }}
            disabled={isUnitGenerateDisabled}
            onChange={(e) => setSelectedBlocksForUnitGeneration(e.value ?? [])}
          />
          {isUnitGenerateDisabled && (
            <small className="text-color-secondary">
              No blocks available: all blocks already have units or no floors found.
            </small>
          )}
        </div>

      </Dialog>

      {/* <Dialog
        header={isNewBlock ? (selectedBlock ? "Copy Block" : "Add Block") : "Edit Block"}
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
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-3'}>Floor Count</label>
            <InputNumber
              showButtons
              placeholder='0'
              style={{ width: '40%' }}
              inputStyle={{ width: 'inherit', textAlign: 'center' }}
              buttonLayout="horizontal"
              value={selectedBlock?.floor_count}
              onValueChange={(e) => {
                !isFormChanged && setIsFormChanged(true)
                setSelectedBlock({
                  ...selectedBlock,
                  floor_count: e.target.value
                })
                //@ts-ignore
                field.onChange(parseInt(e.value))
              }}
              step={1}
              min={0}
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              className={classNames('col-6')} />
          </div>
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-3'}>Unit Count</label>
            <InputNumber
              showButtons
              placeholder='0'
              style={{ width: '40%' }}
              inputStyle={{ width: 'inherit', textAlign: 'center' }}
              buttonLayout="horizontal"
              value={selectedBlock?.unit_count}
              onValueChange={(e) => {
                !isFormChanged && setIsFormChanged(true)
                setSelectedBlock({
                  ...selectedBlock,
                  unit_count: e.target.value
                })
                //@ts-ignore
                field.onChange(parseInt(e.value))
              }}
              step={1}
              min={0}
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              className={classNames('col-6')} />
          </div>
        </div>
      </Dialog> */}

      <Dialog
        header={
          isNewBlock
            ? selectedBlock
              ? "Copy Block"
              : "Add Block"
            : "Edit Block"
        }
        visible={displayAddBlockDetailModal}
        footer={renderBlockFooter}
        position="center"
        modal
        style={{ width: isNewBlock ? "30vw" : "50vw" }}
        onHide={() => setDisplayAddBlockDetailModal(false)}
        draggable={false}
        resizable={false}
        closable
      >
        <div
          className={`flex ${isNewBlock ? "justify-content-center" : ""}`}
          style={{ padding: 15 }}
        >
          <div className={isNewBlock ? "col-10" : "col-6"}>
            <div className="field">
              <label style={{ fontSize: 18 }} className="col-6">
                Block Name*
              </label>
              <InputText
                style={{ width: "50%" }}
                defaultValue={selectedBlock?.descr}
                onChange={(e) => {
                  !isFormChanged && setIsFormChanged(true);
                  setSelectedBlock({
                    ...selectedBlock,
                    descr: e.target.value,
                  });
                }}
              />
            </div>
            <div className="field">
              <label style={{ fontSize: 18 }} className="col-6">
                Floor Count - Above Ground
              </label>
              <InputNumber
                showButtons
                placeholder="0"
                style={{ width: "50%" }}
                inputStyle={{ width: "inherit", textAlign: "center" }}
                buttonLayout="horizontal"
                value={selectedBlock?.floor_count_abv_ground}
                onValueChange={(e) => {
                  !isFormChanged && setIsFormChanged(true);
                  setSelectedBlock({
                    ...selectedBlock,
                    floor_count_abv_ground: e.target.value,
                  });
                  //@ts-ignore
                  field.onChange(parseInt(e.value));
                }}
                step={1}
                min={0}
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                className={classNames("col-6")}
              />
            </div>
            <div className="field">
              <label style={{ fontSize: 18 }} className="col-6">
                Floor Count - Below Ground
              </label>
              <InputNumber
                showButtons
                placeholder="0"
                style={{ width: "50%" }}
                inputStyle={{ width: "inherit", textAlign: "center" }}
                buttonLayout="horizontal"
                value={selectedBlock?.floor_count_blw_ground}
                onValueChange={(e) => {
                  !isFormChanged && setIsFormChanged(true);
                  setSelectedBlock({
                    ...selectedBlock,
                    floor_count_blw_ground: e.target.value,
                  });
                  //@ts-ignore
                  field.onChange(parseInt(e.value));
                }}
                step={1}
                min={0}
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                className={classNames("col-6")}
              />
            </div>
            <div className="field">
              <label style={{ fontSize: 18 }} className="col-6">
                Unit Count
              </label>
              <InputNumber
                showButtons
                placeholder="0"
                style={{ width: "50%" }}
                inputStyle={{ width: "inherit", textAlign: "center" }}
                buttonLayout="horizontal"
                value={selectedBlock?.unit_count}
                disabled={true}
                onValueChange={(e) => {
                  !isFormChanged && setIsFormChanged(true);
                  setSelectedBlock({
                    ...selectedBlock,
                    unit_count: e.target.value,
                  });
                  //@ts-ignore
                  field.onChange(parseInt(e.value));
                }}
                step={1}
                min={0}
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                className={classNames("col-6")}
              />
            </div>
            {!isNewBlock && (
              <>
                {/* <div className="field">
                  <label style={{ fontSize: 18 }} className="col-6">
                    Column Count
                  </label>
                  <InputNumber
                    showButtons
                    placeholder="0"
                    style={{ width: "50%" }}
                    inputStyle={{ width: "inherit", textAlign: "center" }}
                    buttonLayout="horizontal"
                    value={selectedBlock?.column_count}
                    onValueChange={(e) => {
                      !isFormChanged && setIsFormChanged(true);
                      setSelectedBlock({
                        ...selectedBlock,
                        column_count: e.target.value,
                      });
                      //@ts-ignore
                      field.onChange(parseInt(e.value));
                    }}
                    step={1}
                    min={0}
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    className={classNames("col-6")}
                  />
                </div> */}
                <div className="field">
                  <label style={{ fontSize: 18 }} className="col-6">
                    Lift Count
                  </label>
                  <InputNumber
                    showButtons
                    placeholder="0"
                    style={{ width: "50%" }}
                    inputStyle={{ width: "inherit", textAlign: "center" }}
                    buttonLayout="horizontal"
                    value={selectedBlock?.lift_count}
                    onValueChange={(e) => {
                      !isFormChanged && setIsFormChanged(true);
                      setSelectedBlock({
                        ...selectedBlock,
                        lift_count: e.target.value,
                      });
                      //@ts-ignore
                      field.onChange(parseInt(e.value));
                    }}
                    step={1}
                    min={0}
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    className={classNames("col-6")}
                  />
                </div>
              </>
            )}
          </div>
          {!isNewBlock && (
            <div className="col-6">
              <div className="field">
                <label style={{ fontSize: 18 }} className="col-6">
                  Staircase Count
                </label>
                <InputNumber
                  showButtons
                  placeholder="0"
                  style={{ width: "50%" }}
                  inputStyle={{ width: "inherit", textAlign: "center" }}
                  buttonLayout="horizontal"
                  value={selectedBlock?.staircase_count}
                  onValueChange={(e) => {
                    !isFormChanged && setIsFormChanged(true);
                    setSelectedBlock({
                      ...selectedBlock,
                      staircase_count: e.target.value,
                    });
                    //@ts-ignore
                    field.onChange(parseInt(e.value));
                  }}
                  step={1}
                  min={0}
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  className={classNames("col-6")}
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 18 }} className="col-6">
                  Sump Count
                </label>
                <InputNumber
                  showButtons
                  placeholder="0"
                  style={{ width: "50%" }}
                  inputStyle={{ width: "inherit", textAlign: "center" }}
                  buttonLayout="horizontal"
                  value={selectedBlock?.sump_count}
                  onValueChange={(e) => {
                    !isFormChanged && setIsFormChanged(true);
                    setSelectedBlock({
                      ...selectedBlock,
                      sump_count: e.target.value,
                    });
                    //@ts-ignore
                    field.onChange(parseInt(e.value));
                  }}
                  step={1}
                  min={0}
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  className={classNames("col-6")}
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 18 }} className="col-6">
                  Overhead Tank Count
                </label>
                <InputNumber
                  showButtons
                  placeholder="0"
                  style={{ width: "50%" }}
                  inputStyle={{ width: "inherit", textAlign: "center" }}
                  buttonLayout="horizontal"
                  value={selectedBlock?.overhead_tank_count}
                  onValueChange={(e) => {
                    !isFormChanged && setIsFormChanged(true);
                    setSelectedBlock({
                      ...selectedBlock,
                      overhead_tank_count: e.target.value,
                    });
                    //@ts-ignore
                    field.onChange(parseInt(e.value));
                  }}
                  step={1}
                  min={0}
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  className={classNames("col-6")}
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 18 }} className="col-6">
                  OTS Count
                </label>
                <InputNumber
                  showButtons
                  placeholder="0"
                  style={{ width: "50%" }}
                  inputStyle={{ width: "inherit", textAlign: "center" }}
                  buttonLayout="horizontal"
                  value={selectedBlock?.ots_count}
                  onValueChange={(e) => {
                    !isFormChanged && setIsFormChanged(true);
                    setSelectedBlock({
                      ...selectedBlock,
                      ots_count: e.target.value,
                    });
                    //@ts-ignore
                    field.onChange(parseInt(e.value));
                  }}
                  step={1}
                  min={0}
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  className={classNames("col-6")}
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 18 }} className="col-6">
                  Column Footing Count
                </label>
                <InputNumber
                  showButtons
                  placeholder="0"
                  style={{ width: "50%" }}
                  inputStyle={{ width: "inherit", textAlign: "center" }}
                  buttonLayout="horizontal"
                  value={selectedBlock?.col_footing_count}
                  onValueChange={(e) => {
                    !isFormChanged && setIsFormChanged(true);
                    setSelectedBlock({
                      ...selectedBlock,
                      col_footing_count: e.target.value,
                    });
                    //@ts-ignore
                    field.onChange(parseInt(e.value));
                  }}
                  step={1}
                  min={0}
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  className={classNames("col-6")}
                />
              </div>
            </div>
          )}
        </div>
      </Dialog>


      <Dialog
        // header={isNewFloor ? (selectedFloor ? "Copy Floor" : "Add Floor") : "Edit Floor"}
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
              style={{ width: '50%' }}
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
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-3'}>Unit Count</label>
            <InputNumber
              showButtons
              placeholder='0'
              style={{ width: '51%' }}
              inputStyle={{ width: 'inherit', textAlign: 'center' }}
              buttonLayout="horizontal"
              value={selectedFloor?.no_of_units}
              onValueChange={(e) => {
                !isFormChanged && setIsFormChanged(true)
                setSelectedFloor({
                  ...selectedFloor,
                  no_of_units: e.target.value
                })
                //@ts-ignore
                field.onChange(parseInt(e.value))
              }}
              step={1}
              min={0}
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              className={classNames('col-6')} />
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
