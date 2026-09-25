import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UseFormRegister, FieldErrors, FieldValues } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import {
  ManageLayout,
  FormField,
  useToast,
  ManageLayoutHandle,
} from "@igblsln/control";
import {
  useActiveProjectQuery,
  getClientProps,
  useBlocksForProjectQuery,
  useUnitsForFloorQuery,
  defaultDateFormat,
  useAppDispatch,
} from "@igblsln/store";
import {
  useGetDailyProgressQuery,
  useAddDailyProgressMutation,
  useUpdateDailyProgressMutation,
} from "../api";
import { useFloorsForProjectBlockQuery } from "../../FloorPlan/api";
import { useListWorkNameCategoryQuery } from "../../WorkInfo/workInfoApi";
import { useListSchedulesWithoutPaginationQuery } from "../../ProjectSchedule/api"
import ManageProgress from "./ManageProgress";
import { formatDate } from "@igblsln/store";
import { MODULE_NAME, PAGE_ROUTE, STATUS_OPTIONS, StatusOption } from "../constants";

interface WorkCategory {
  key: string | number;
  descr: string;
}

interface Project {
  key: string | number;
  name: string;
}

interface ProgressDetail {
  key?: number;
  descr: string;
  comments: string;
  status: string;
  status_label: string;
  created_by?: string;
  created_at?: string; 
  images?: { key?: number; image_url: string }[];
}

interface FormData {
  workctgry_key?: number;
  project_key?: number;
  blk_key?: number;
  floor_key?: number;
  unit_key?: number;
  status?: string;
  date?: string;
  details?: ProgressDetail[];
}

const convertDateValue = (value: any, reverse?: boolean) => {
  if (value) {
    return reverse
      ? `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`
      : new Date(value);
  }
  return value;
};

const Manage = () => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [progressDetails, setProgressDetails] = useState<ProgressDetail[]>([]);
  const progressDetailsRef = useRef<ProgressDetail[]>([]);
  const [progressDetailsChanged, setProgressDetailsChanged] = useState(false);
  const { id: idString } = useParams<{ id: string }>();
  const id = parseInt(idString || "");
  const isNew = isNaN(id) || id <= 0;
  const manageLayoutRef = useRef<ManageLayoutHandle>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const clientProps = getClientProps();

  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [selectedWorkCategory, setSelectedWorkCategory] = useState<number | null>(null);

  const { data, isLoading } = useGetDailyProgressQuery(id, {
    skip: isNew,
  });

  const {
    data: blockData,
    isLoading: isProjectBlockFetching,
  } = useBlocksForProjectQuery(
    { projectId: selectedProject },
    { skip: !selectedProject, refetchOnMountOrArgChange: true }
  );

  const { data: floors, isLoading: isBlockFloorFetching } =
    useFloorsForProjectBlockQuery(
      { projectId: selectedProject, blockId: selectedBlock },
      {
        skip: !selectedProject || !selectedBlock,
        refetchOnMountOrArgChange: true,
      }
    );

  const { data: units, isLoading: isFloorUnitsFetching } =
    useUnitsForFloorQuery(
      { floorId: selectedFloor },
      { skip: !selectedFloor, refetchOnMountOrArgChange: true }
    );

  const { data: projects, isLoading: projectsFetching } = useActiveProjectQuery();

  const { data: workCategory, isLoading: workCategoryFetching } =
    useListWorkNameCategoryQuery();

    const { data: projectSchedules, isLoading: projectSchedulesFetching } =
    useListSchedulesWithoutPaginationQuery();

  const [updateContract, { isLoading: isUpdating }] = useUpdateDailyProgressMutation();
  const [addContract, { isLoading: isAdding }] = useAddDailyProgressMutation();

  const hasInitializedProgress = useRef(false);

  useEffect(() => {
    if (isNew) {
      const initialData = {
        ...clientProps,
        date: convertDateValue(new Date(), true),
      };
      setFormData(initialData);
      progressDetailsRef.current = [];
    } else if (data) {
      setFormData(data);
      if (!hasInitializedProgress.current) {
        const details = data.details || [];
        setProgressDetails(details);
        progressDetailsRef.current = details;
        hasInitializedProgress.current = true;
      }
      setSelectedWorkCategory(data.workctgry_key);
      setSelectedProject(data.project_key);
      setSelectedBlock(data.blk_key);
      setSelectedFloor(data.floor_key);
      setSelectedUnit(data.unit_key);
      setSelectedSchedule(data.schedule_key)
    }
  }, [data, clientProps, isNew]);

  useEffect(() => {
    console.log("progressDetails changed →", progressDetails);
  }, [progressDetails]);

  const onSubmit = async (values: any) => {
    console.log("Manage: progressDetails at submit →", progressDetailsRef.current);
    if (progressDetailsRef.current.length === 0) {
      showError("Progress Required", "Add at least one progress to proceed!");
      return;
    }

    const body = {
      workctgry_key: parseInt(values.workctgry_key),
      work_ctgry_name: workCategory?.find((d: WorkCategory) => d.key === Number(values.workctgry_key))?.descr,
      project_key: parseInt(values.project_key),
      project_name: projects?.find((p: Project) => p.key === Number(values.project_key))?.name,
      blk_key: parseInt(values.blk_key),
      floor_key: parseInt(values.floor_key),
      unit_key: parseInt(values.unit_key),
      schedule_key: parseInt(values.schedule_key),
      status: values.status,
      status_label: STATUS_OPTIONS.find((s: StatusOption) => s.key === values.status)?.name,
      date: formatDate(values.date, "yyyy-MM-dd"),
      details: progressDetailsRef.current.map((d) => ({
        key: d.key, // Include the key if it exists
        descr: d.descr,
        comments: d.comments,
        status: d.status,
        created_at: d.created_at,
        status_label: d.status_label,
        images: d.images || [],
      })),
    };

    try {
      setShowingToast(true);
      if (isNew) {
        await addContract(body).unwrap();
        showSuccess("Success", "Daily progress added!");
      } else {
        await updateContract({ key: id, ...body }).unwrap();
        showSuccess("Success", "Daily progress updated!");
      }
      navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`);
    } catch (error) {
      showError("Error", "Failed to save daily progress. Please try again.");
    } finally {
      setShowingToast(false);
    }
  };

  const renderForm = (
    control: any,
    _register: UseFormRegister<FieldValues>,
    errors: FieldErrors<FieldValues>
  ) => {
    return (
      <div className="pl-4 pr-4 pt-4 pb-3 grid p-fluid h-full">
        {/* <FormField
          label="Work Category"
          name="workctgry_key"
          className="col-10 md:col-4"
          control={control}
          errors={errors}
          isLoading={workCategoryFetching}
          leftSpan={4}
          rightSpan={8}
          useExplicit
          onChange={(e: any) => {
            setSelectedWorkCategory(e.value);
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              options: workCategory,
              value: selectedWorkCategory,
            },
          }}
        /> */}

        <FormField
          label="Project"
          name="project_key"
          className="col-10 md:col-4"
          control={control}
          errors={errors}
          isLoading={projectsFetching}
          required="Select a Project"
          leftSpan={4}
          rightSpan={8}
          useExplicit
          onChange={(e: any) => {
            setSelectedProject(e.value);
            setSelectedBlock(null);
            setSelectedFloor(null);
            setSelectedUnit(null);
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              options: projects,
              value: selectedProject,
            },
          }}
        />

        <FormField
          label="Block"
          name="blk_key"
          className="col-10 md:col-4"
          control={control}
          errors={errors}
          isLoading={isProjectBlockFetching}
          required="Select a Block"
          leftSpan={4}
          rightSpan={8}
          useExplicit
          onChange={(e: any) => {
            setSelectedBlock(e.value);
            setSelectedFloor(null);
            setSelectedUnit(null);
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              options: blockData,
              value: selectedBlock,
            },
          }}
        />

        <FormField
          label="Floor"
          name="floor_key"
          className="col-10 md:col-4"
          control={control}
          errors={errors}
          isLoading={isBlockFloorFetching}
          required="Select a Floor"
          leftSpan={4}
          rightSpan={8}
          onChange={(e: any) => {
            setSelectedFloor(e.value);
            setSelectedUnit(null);
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              options: floors,
              value: selectedFloor,
            },
          }}
        />

        <FormField
          label="Unit"
          name="unit_key"
          className="col-10 md:col-4"
          control={control}
          errors={errors}
          isLoading={isFloorUnitsFetching}
          required="Select a Unit"
          leftSpan={4}
          rightSpan={8}
          useExplicit
          onChange={(e: any) => {
            setSelectedUnit(e.value);
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              options: units,
              value: selectedUnit,
            },
          }}
        />

        {/* <FormField
          label="Status"
          name="status"
          className="col-10 md:col-4"
          control={control}
          errors={errors}
          required="Select a Status"
          leftSpan={4}
          rightSpan={8}
          useExplicit
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              options: STATUS_OPTIONS,
            },
          }}
        /> */}

        <FormField
          label="Schedule"
          name="schedule_key"
          className="col-10 md:col-4"
          control={control}
          errors={errors}
          isLoading={projectSchedulesFetching}
          leftSpan={4}
          rightSpan={8}
          useExplicit
          onChange={(e: any) => {
            setSelectedSchedule(e.value);
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              options: projectSchedules,
              value: selectedSchedule
            },
          }}
        />

        <FormField
          label="Date"
          name="date"
          className="col-10 md:col-4"
          useExplicit
          control={control}
          errors={errors}
          convertValue={convertDateValue}
          required="Select a Date"
          leftSpan={4}
          rightSpan={8}
          formItem={{
            component: Calendar,
            componentProps: {
              showIcon: true,
              dateFormat: defaultDateFormat,
            },
          }}
        />
        <div
          className="col-12"
          style={{ height: "calc(100% - 183px)", minHeight: 200 }}
        >
          <ManageProgress
            data={progressDetails}
            isLoading={isLoading}
            onTableChange={(changed: boolean) =>
              !progressDetailsChanged && setProgressDetailsChanged(changed)
            }
            onChange={(value: ProgressDetail[]) => {
              console.log("Manage: Received from ManageProgress →", value);
              setProgressDetails(value);
              progressDetailsRef.current = value; // keep latest value in ref
              console.log("ProgressDetails ref updated →", progressDetailsRef.current);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      ref={manageLayoutRef}
      baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
      description="Daily Progress"
      id={id}
      data={formData}
      isItemsTableChanged={progressDetailsChanged}
      isUpdating={isAdding || isUpdating || showingToast}
      isLoading={isLoading}
      onSubmit={onSubmit}
      renderForm={renderForm}
    />
  );
};

export default Manage;