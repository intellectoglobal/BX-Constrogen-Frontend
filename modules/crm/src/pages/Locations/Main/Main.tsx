import React, { useState, useRef } from "react";
import { Datatable, FormField } from "@igblsln/control";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Skeleton } from "primereact/skeleton";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useAddLocationMutation,
  useDeleteLocationMutation,
  useListLocationsQuery,
  useUpdateLocationMutation,
} from "../locationsApi";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { headerIconStyle, headerStyle } from "@igblsln/themes";
import { useForm } from "react-hook-form";
import { getClientProps } from "@igblsln/store";

const LocationsPage = () => {
  const navigate = useNavigate();
  const locationState: any = useLocation().state;
  const clientProps = getClientProps();

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
    setError,
  } = useForm({});

  const { data: locations, isLoading: isLocationsFetching } =
    useListLocationsQuery();
  const [isNew, setIsNew] = useState(true);
  const [selectedLocationKey, setSelectedLocationKey] = useState<number | null>(
    null
  );
  const toast = useRef<Toast>(null);

  const [addLocation, { isLoading: isAdding }] = useAddLocationMutation();
  const [updateLocation, { isLoading: isUpdating }] =
    useUpdateLocationMutation();
  const [deleteDataAction, { isLoading: isDeleting }] =
    useDeleteLocationMutation();

  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  const showSuccess = (title: string, msg: string) => {
    toast?.current?.show({
      severity: "success",
      summary: title,
      detail: msg,
      life: 3000,
    });
  };

  const showError = (title: string, msg: string) => {
    toast?.current?.show({
      severity: "error",
      summary: title,
      detail: msg,
      life: 3000,
    });
  };

  const defaultActionBodyTemplate = (deleteData: any) => {
    return (value: any) => (
      <>
        <Button
          onClick={() => {
            setIsNew(false);
            setSelectedLocationKey(value.key);
            setValue("descr", value.descr);
          }}
          icon="pi pi-eye"
          className="p-button-rounded p-button-text"
        />
        <Button
          style={{ height: "20px", width: "20px", borderRadius: 50 }}
          onClick={() => deleteData(value.key)}
          className="p-button-rounded p-button-text"
          icon="pi pi-trash"
        />
      </>
    );
  };

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (!values.descr) {
        showError("Validation Error", "Location name is required.");
        return;
      }

      if (isNew) {
        if (locations?.some(location => location.descr.toLowerCase().trim() === values.descr.toLowerCase().trim())) {
          setError("descr", { message: "Location already exists." });
          return;
        }
      } else {
        if (locations?.some(location => location.key !== selectedLocationKey && location.descr.toLowerCase().trim() === values.descr.toLowerCase().trim())) {
          setError("descr", { message: "Location already exists." });
          return;
        }
      }

      // Add default occupancy relationship to satisfy backend validation
      const apiData = {
        ...values,
        ...clientProps,
        occup_id: 1, // Default occupancy ID to satisfy backend validation
      };

      if (isNew) {
        resp = await addLocation(apiData).unwrap();
      } else {
        resp = await updateLocation({
          key: selectedLocationKey,
          ...apiData,
        }).unwrap();
      }

      setIsNew(true);
      showSuccess("Success", resp.detail);
    } catch (error: any) {
      showError(
        "Error",
        error?.data?.detail || "We couldn't save your request, try again!"
      );
    }
  };

  const deleteData = async (id: number) => {
    confirmDialog({
      message: "Are you sure you want to delete this location?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const resp = await deleteAction(id);
          //@ts-ignore
          showSuccess("Success", resp);
        } catch (error: any) {
          showError("Failed", error?.data?.detail);
        }
      },
      reject: () => {},
    });
  };

  const renderForm = (control: any, errors: any) => {
    return (
      <div className="pl-8">
        <FormField
          label="Location Name"
          name="descr"
          control={control}
          errors={errors}
          required
          leftSpan={4}
          rightSpan={5}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 50,
              disabled: isAdding || isUpdating,
            },
          }}
        />
      </div>
    );
  };

  if (isLocationsFetching) {
    return (
      <div className="custom-skeleton p-4">
        <div>
          <Skeleton height="50px" width="30%" className="mb-2" />
          <Skeleton height="50px" width="50%" className="mb-2" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />

      <Datatable
        className="pl-8"
        style={{ height: "50%", width: "70%" }}
        header={
          <div className="flex">
            <h3 className={classNames("m-0 my-auto")}>Locations</h3>
          </div>
        }
        rowHover
        onRowClick={(e) => {
          setIsNew(false);
          setSelectedLocationKey(e.data.key);
          setValue("descr", e.data.descr);
        }}
        value={locations}
        stripedRows
      >
        <Column
          headerStyle={headerIconStyle}
          style={{ maxWidth: "100px" }}
          bodyStyle={{ textAlign: "center", overflow: "visible" }}
          body={defaultActionBodyTemplate(deleteData)}
        />
        <Column
          headerStyle={headerIconStyle}
          field="descr"
          header="Location Name"
          sortable
          filter
        />
      </Datatable>

      <Divider />

      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex">
            <div className="col-1"></div>
            <div className="col-7">{renderForm(control, errors)}</div>
            <div className="my-auto">
              <Button
                loading={isAdding || isUpdating}
                label="Save"
                type="submit"
                style={{ paddingRight: 20 }}
                className="p-button-warning mr-3"
              />

              <Button
                loading={isAdding || isUpdating}
                label="Clear"
                className="mr-3"
                onClick={(e) => {
                  e.preventDefault();
                  setIsNew(true);
                  setValue("descr", "");
                }}
              />

              {/* <Button
                loading={isAdding || isUpdating}
                label="Back"
                onClick={() => navigate('/crm/leads')}
              /> */}
              <Button
                loading={isAdding || isUpdating}
                label="Back"
                onClick={() =>
                  navigate("/crm/leads", {
                    state: { openModal: true, leadKey: null },
                  })
                }
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default LocationsPage;
