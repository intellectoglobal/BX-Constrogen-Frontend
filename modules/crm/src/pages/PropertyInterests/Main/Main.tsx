import React, { useState, useRef } from "react";
import { Datatable, FormField } from "@igblsln/control";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Skeleton } from "primereact/skeleton";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useAddPropertyInterestMutation,
  useDeletePropertyInterestMutation,
  useListPropertyInterestsQuery,
  useUpdatePropertyInterestMutation,
} from "../propertyInterestsApi";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { headerIconStyle, headerStyle } from "@igblsln/themes";
import { useForm } from "react-hook-form";
import { getClientProps } from "@igblsln/store";

const PropertyInterestsPage = () => {
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

  const { data: propertyInterests, isLoading: isPropertyInterestsFetching } =
    useListPropertyInterestsQuery();
  const [isNew, setIsNew] = useState(true);
  const [selectedPropertyInterestKey, setSelectedPropertyInterestKey] =
    useState<number | null>(null);
  const toast = useRef<Toast>(null);

  const [addPropertyInterest, { isLoading: isAdding }] =
    useAddPropertyInterestMutation();
  const [updatePropertyInterest, { isLoading: isUpdating }] =
    useUpdatePropertyInterestMutation();
  const [deleteDataAction, { isLoading: isDeleting }] =
    useDeletePropertyInterestMutation();

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
            setSelectedPropertyInterestKey(value.key);
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
        showError("Validation Error", "Property Interest name is required.");
        return;
      }

      if (isNew) {
        if (propertyInterests?.some(interest => interest.descr.toLowerCase().trim() === values.descr.toLowerCase().trim())) {
          setError("descr", { message: "Property Interest already exists." });
          return;
        }
      } else {
        if (propertyInterests?.some(interest => interest.key !== selectedPropertyInterestKey && interest.descr.toLowerCase().trim() === values.descr.toLowerCase().trim())) {
          setError("descr", { message: "Property Interest already exists." });
          return;
        }
      }

      if (isNew) {
        resp = await addPropertyInterest({
          ...values,
          ...clientProps,
        }).unwrap();
      } else {
        resp = await updatePropertyInterest({
          key: selectedPropertyInterestKey,
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
      message: "Are you sure you want to delete this property interest?",
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
          label="Property Interest Name"
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

  if (isPropertyInterestsFetching) {
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
            <h3 className={classNames("m-0 my-auto")}>Property Interests</h3>
          </div>
        }
        rowHover
        onRowClick={(e) => {
          setIsNew(false);
          setSelectedPropertyInterestKey(e.data.key);
          setValue("descr", e.data.descr);
        }}
        value={propertyInterests}
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
          header="Property Interest Name"
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

export default PropertyInterestsPage;
