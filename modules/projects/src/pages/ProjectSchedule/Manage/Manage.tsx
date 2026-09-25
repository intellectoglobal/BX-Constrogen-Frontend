import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UseFormRegister, FieldErrors, FieldValues, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ManageLayout, FormField, useToast } from "@igblsln/control";
import {
  useAddSchedulesMutation,
  useGetSchedulesQuery,
  useUpdateSchedulesMutation,
} from "../api";
import { PAGE_NAME, PAGE_ROUTE, DURATION_OPTIONS } from "../constants";
import { MODULE_NAME } from "../../../constants";
import {
  AFTER_API_TIME,
  getClientProps,
  setPromptNavigate,
} from "@igblsln/store";
import { useListProjectTypeQuery } from "../../ProjectTypes/projectTypeApi";
import { useDispatch } from "react-redux";

type Props = {};

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false);
  const navigate = useNavigate();
  const { id: idString } = useParams();
  const id = parseInt(idString || "");
  const isNew = isNaN(id) || id <= 0;
  const dispatch = useDispatch();

  const clientProps = getClientProps();
  const [specData, setSpecData] = useState<any[]>([]);
  const specDataRef = useRef<any[]>([]);

  const { data, isLoading } = useGetSchedulesQuery(id, {
    skip: isNew,
  });
  const [addSchedules, { isLoading: isAdding }] = useAddSchedulesMutation();
  const [updateSchedules, { isLoading: isUpdating }] =
    useUpdateSchedulesMutation();

  const { data: projectTypes, isFetching: projectTypesFetching } =
    useListProjectTypeQuery({ page: 1, size: 1000 });

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (isNew) {
        resp = await addSchedules({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateSchedules({ ...values, ...clientProps }).unwrap();
      }
      showSuccess("Success", resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false }));
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`);
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError(
        "An error occurred",
        error?.data?.detail || "We couldn't save your post, try again!"
      );
    }
  };

  const shouldAllowAdd = (items: any[]) => {
    if (items.length === 0) return true;
    let temp = items[items.length - 1];
    return temp?.item_descr;
  };

  const actionBodyTemplate = (value: any) => {
    return (
      <Button
        style={{ height: "35px", width: "20px", marginLeft: 20 }}
        type="button"
        onClick={() => {
          const updValue = specDataRef.current.filter(
            (x) => x.item_descr !== value.item_descr
          );
          setSpecData(updValue);
          specDataRef.current = updValue;
        }}
        className="p-button-rounded p-button-text"
        icon="pi pi-trash"
      ></Button>
    );
  };

  const renderForm = (
    control: any,
    _register: UseFormRegister<FieldValues>,
    errors: FieldErrors<FieldValues>
  ) => {
    return (
      <div className="pl-8 pt-4 pb-3 grid p-fluid">
        <FormField
          label="Project Type"
          name="projtyp_key"
          className="col-12"
          control={control}
          errors={errors}
          isLoading={projectTypesFetching}
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
              options: projectTypes?.results,
            },
          }}
        />

        <FormField
          label="Description"
          name="name"
          className="col-12"
          control={control}
          errors={errors}
          required
          leftSpan={2}
          rightSpan={5}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
            },
          }}
        />

        {/* <FormField
          label="Duration Type"
          name="duration_type"
          className="col-12"
          control={control}
          errors={errors}
          required="Select a Duration Type"
          leftSpan={2}
          rightSpan={5}
          useExplicit
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              options: DURATION_OPTIONS,
            },
          }}
        />

        <FormField
          label="Duration"
          name="duration"
          className="col-12"
          control={control}
          errors={errors}
          required
          leftSpan={2}
          rightSpan={5}
          formItem={{
            component: InputText,
            componentProps: {
              thousandSeparator: true,
              type: 'number',
              // disabled: true,
            }
          }} /> */}
         
      <FormField
        label="Duration"
        name="duration"
        className="col-12"
        control={control}
        errors={errors}
        required="Duration is required"
        leftSpan={2}
        rightSpan={5}
        useExplicit
        formItem={{
          component: () => (
              <div className="flex gap-2">
                <InputText
                  type="number"
                  min={1}
                  {...control.register("duration", { required: "Duration is required" })}
                  className={`w-1/2 ${errors.duration ? "p-invalid" : ""}`}
                />

                <Controller
                  name="duration_type"
                  control={control}
                  rules={{ required: "Unit is required" }}
                  render={({ field }) => (
                    <Dropdown
                      {...field}
                      options={DURATION_OPTIONS}
                      optionLabel="name"
                      optionValue="key"
                      placeholder="Unit"
                      className={`w-1/2 ${errors.duration_type ? "p-invalid" : ""}`}
                    />
                  )}
                />
              </div>
          ),
        }}
      />
      </div>
    );
  };

  return (
    <>
      <ManageLayout
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
        description={PAGE_NAME}
        id={id}
        data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading}
        onSubmit={onSubmit}
        renderForm={renderForm}
      />
    </>
  );
};

export default Manage;
