import React, { useState, useRef } from "react";
import { Datatable, FormField } from "@igblsln/control";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Skeleton } from "primereact/skeleton";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";

import { useNavigate, useLocation } from "react-router-dom";
import {
  useAddLeadSourceMutation,
  useDeleteLeadSourceMutation,
  useGetLeadSourcesQuery,
  useUpdateLeadSourceMutation,
} from "../leadSourceApi";
import { useGetLeadsourceCategoriesQuery } from "../../LeadSourceCategory/leadSourceCategoryApi";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { headerIconStyle, headerStyle } from "@igblsln/themes";
import { useForm, Controller } from "react-hook-form";
import { getClientProps } from "@igblsln/store";

const LeadSourcePage = () => {
  const navigate = useNavigate();

  const state: any = useLocation().state;

  const clientProps = getClientProps();

  const {
    control,
    formState: { errors, isDirty },
    register,
    reset,
    handleSubmit,
    setValue,
    setError,
  } = useForm({});

  const { data: leadSources, isLoading: isLeadSourcesFetching } =
    useGetLeadSourcesQuery();
  const { data: leadsourceCategories } = useGetLeadsourceCategoriesQuery();
  const [isNew, setIsNew] = useState(true);
  const [selectedLeadSourceKey, setSelectedLeadSourceKey] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
  const toast = useRef<Toast>(null);

  const [addLeadSources, { isLoading: isAdding }] = useAddLeadSourceMutation();
  const [updateLeadSources, { isLoading: isUpdating }] =
    useUpdateLeadSourceMutation();

  const [deleteDataAction, { isLoading: isDeleting }] =
    useDeleteLeadSourceMutation();
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

  const LeadSourceCategoryField = ({
    control,
    value,
    onChange,
    ...props
  }: {
    control: any;
    value?: string;
    onChange: (event: { target: { value: string } }) => void;
    [key: string]: any;
  }) => {
    const options = [
      {
        label: "Add",
        items:
          leadsourceCategories?.map((cat) => ({
            label: cat.descr,
            value: cat.key,
          })) || [],
      },
    ];

    return (
      <Dropdown
        value={value}
        onChange={(e) => onChange({ target: { value: e.value } })}
        options={options}
        optionLabel="label"
        optionValue="value"
        placeholder="Select Lead Source Category"
        showClear
        filter
        filterBy="label"
        optionGroupLabel="label"
        optionGroupChildren="items"
        optionGroupTemplate={
          <div
            style={{
              cursor: "pointer",
              textAlign: "center",
              backgroundColor: "#e6e1e1",
              color: "black",
              lineHeight: 2.5,
            }}
            onClick={() =>
              navigate("/crm/leadsourcecategory", {
                state: {
                  url: window.location.pathname,
                  data: null,
                },
              })
            }
          >
            -- Create And Edit --
          </div>
        }
        className="w-full"
        {...props}
      />
    );
  };

  const defaultActionBodyTemplate = (deleteData: any) => {
    return (value: any) => {
      return (
        <>
          <Button
            onClick={() => {
              setIsNew(false);
              setSelectedLeadSourceKey(value.key);
              setValue("descr", value.descr);
              setValue("lead_source_category", value.category_id);
            }}
            icon="pi pi-eye"
            className="p-button-rounded p-button-text"
          ></Button>
          <Button
            style={{ height: "20px", width: "20px", borderRadius: 50 }}
            onClick={() => deleteData(value.key)}
            className="p-button-rounded p-button-text"
            icon="pi pi-trash"
          ></Button>
        </>
      );
    };
  };

  const leadSourceCategoryBodyTemplate = (rowData: any) => {
    if (!rowData?.category_id || !leadsourceCategories) return "-";
    const category = leadsourceCategories.find(
      (cat) => cat.key === rowData.category_id
    );
    return category ? category.descr : "-";
  };

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      // Transform field names to match API expectations
      const apiData = {
        ...values,
        ...clientProps,
        category_id: values.lead_source_category, // API expects category_id, not lead_source_category
      };
      delete apiData.lead_source_category; // Remove the frontend field name

      if (isNew) {
        if (leadSources?.some(source => source.descr.toLowerCase().trim() === values.descr.toLowerCase().trim())) {
          setError("descr", { message: "Lead Source already exists." });
          return;
        }
      } else {
        if (leadSources?.some(source => source.key !== selectedLeadSourceKey && source.descr.toLowerCase().trim() === values.descr.toLowerCase().trim())) {
          setError("descr", { message: "Lead Source already exists." });
          return;
        }
      }

      if (isNew) {
        resp = await addLeadSources(apiData).unwrap();
      } else {
        resp = await updateLeadSources({
          key: selectedLeadSourceKey,
          ...apiData,
        }).unwrap();
      }
      setIsNew(true);
      setValue("descr", "");
      setValue("lead_source_category", "");
      showSuccess("Success", resp.detail);
    } catch (error: any) {
      const errorMessage =
        error?.data?.detail ||
        error?.data?.data?.category_id?.[0] ||
        "We couldn't save your request, try again!";
      showError("An error occurred", errorMessage);
    }
  };

  const deleteData = async (data: any) => {
    if (!deleteAction) {
      return;
    }

    confirmDialog({
      message: "Are you sure you want to delete?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const resp = await deleteAction(data);
          //@ts-ignore
          showSuccess("Success", resp);
        } catch (error: any) {
          showError("Failed", error?.data?.detail);
        }
      },
      reject: () => {},
    });
  };

  const renderForm = (control: any, _register: any, errors: any) => {
    return (
      <div className="pl-8">
        <FormField
          label="Lead Source Category"
          name="lead_source_category"
          leftSpan={4}
          rightSpan={5}
          required
          control={control}
          errors={errors}
          formItem={{
            component: LeadSourceCategoryField,
            componentProps: { control },
          }}
        />

        <FormField
          label="Description"
          name="descr"
          control={control}
          errors={errors}
          required
          leftSpan={4}
          rightSpan={5}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
              disabled: isAdding || isUpdating,
            },
          }}
        />
      </div>
    );
  };

  if (isLeadSourcesFetching) {
    return (
      <div className="custom-skeleton p-4">
        <div>
          <Skeleton height="50px" width="30%" className="mb-2"></Skeleton>
          <Skeleton height="50px" width="50%" className="mb-2"></Skeleton>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="pl-8 mb-3">
          <label style={{ fontWeight: 'bold' }}>Filter by Lead Source Category </label>
        <Dropdown
          value={selectedCategoryFilter}
          onChange={(e: any) => setSelectedCategoryFilter(e.value)}
          options={leadsourceCategories?.map((cat) => ({
            label: cat.descr,
            value: cat.key,
          })) || []}
          optionLabel="label"
          optionValue="value"
          placeholder="All Categories"
          showClear
          style={{ width: '30%' }}
        />
      </div>
      <Datatable
        className="pl-8"
        style={{ height: "50%", width: "70%" }}
        header={
          <div className="flex">
            <h3 className={classNames("m-0 my-auto")}>Lead Source</h3>
          </div>
        }
        rowHover
        onRowClick={(e) => {
          setIsNew(false);
          setSelectedLeadSourceKey(e.data.key);
          setValue("descr", e.data.descr);
          setValue("lead_source_category", e.data.category_id);
        }}
        value={leadSources?.filter(
          (source) =>
            !selectedCategoryFilter || (source as any).category_id === selectedCategoryFilter
        )}
        stripedRows
      >
        <Column
          headerStyle={headerIconStyle}
          style={{ maxWidth: "100px" }}
          bodyStyle={{ textAlign: "center", overflow: "visible" }}
          body={defaultActionBodyTemplate(deleteData)}
        />
        {/* <Column
          headerStyle={headerIconStyle}
          field="key"
          header="Lead Source Code"
          sortable
          filter
        /> */}
        <Column
          headerStyle={headerIconStyle}
          field="descr"
          header="Lead Source"
          sortable
          filter
        />
        <Column
          headerStyle={headerIconStyle}
          header="Lead Source Category"
          body={leadSourceCategoryBodyTemplate}
          sortable
          filter
        />
      </Datatable>

      <Divider />
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex">
            <div className="col-1"></div>
            <div className="col-7">{renderForm(control, register, errors)}</div>
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
                  setValue("lead_source_category", "");
                }}
              />

              {/* <Button
                                loading={isAdding || isUpdating}
                                label='Back'
                                onClick={() => navigate('/crm/leads')} /> */}
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

export default LeadSourcePage;
