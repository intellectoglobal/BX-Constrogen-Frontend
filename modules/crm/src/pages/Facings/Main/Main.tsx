import React, { useState, useRef } from "react";
import { Datatable, FormField } from "@igblsln/control";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Skeleton } from "primereact/skeleton";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useAddFacingMutation,
  useDeleteFacingMutation,
  useListFacingsQuery,
  useUpdateFacingMutation,
} from "../facingsApi";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { headerIconStyle, headerStyle } from "@igblsln/themes";
import { useForm } from "react-hook-form";
import { getClientProps } from "@igblsln/store";

const FacingsPage = () => {
  const navigate = useNavigate();
  const State: any = useLocation().state;
  const clientProps = getClientProps();

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
    setError,
  } = useForm({});

  const { data: facings, isLoading: isFacingsFetching } = useListFacingsQuery();
  const [isNew, setIsNew] = useState(true);
  const [selectedFacingKey, setSelectedFacingKey] = useState<number | null>(
    null
  );
  const toast = useRef<Toast>(null);

  const [addFacing, { isLoading: isAdding }] = useAddFacingMutation();
  const [updateFacing, { isLoading: isUpdating }] = useUpdateFacingMutation();
  const [deleteDataAction, { isLoading: isDeleting }] =
    useDeleteFacingMutation();

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
            setSelectedFacingKey(value.key);
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
        showError("Validation Error", "Facing name is required.");
        return;
      }

      if (isNew) {
        if (facings?.some(facing => facing.descr.toLowerCase().trim() === values.descr.toLowerCase().trim())) {
          setError("descr", { message: "Facing already exists." });
          return;
        }
      } else {
        if (facings?.some(facing => facing.key !== selectedFacingKey && facing.descr.toLowerCase().trim() === values.descr.toLowerCase().trim())) {
          setError("descr", { message: "Facing already exists." });
          return;
        }
      }

      if (isNew) {
        resp = await addFacing({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateFacing({
          key: selectedFacingKey,
          ...values,
          ...clientProps,
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
      message: "Are you sure you want to delete this facing?",
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
          label="Facing Name"
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

  if (isFacingsFetching) {
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
            <h3 className={classNames("m-0 my-auto")}>Facings</h3>
          </div>
        }
        rowHover
        onRowClick={(e) => {
          setIsNew(false);
          setSelectedFacingKey(e.data.key);
          setValue("descr", e.data.descr);
        }}
        value={facings}
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
          header="Facing Name"
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

export default FacingsPage;
