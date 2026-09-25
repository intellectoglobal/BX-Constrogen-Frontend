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
  useAddFeedbackDetailMutation,
  useDeleteFeedbackDetailMutation,
  useGetFeedbackDetailsQuery,
  useUpdateFeedbackDetailMutation,
  useGetFeedbacksQuery,
} from "../api";
import { confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { headerIconStyle, headerStyle } from "@igblsln/themes";
import { useForm } from "react-hook-form";
import { getClientProps, useAppDispatch } from "@igblsln/store";
import { setFeedbackNeedsRefresh } from "@igblsln/store";

const FeedbackDetailsPage = () => {
  const navigate = useNavigate();
  const State: any = useLocation().state;
  const clientProps = getClientProps();
  const dispatch = useAppDispatch();

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
    setError,
  } = useForm({});

  const {
    data: feedbackDetails,
    isLoading: isFeedbackDetailsFetching,
  } = useGetFeedbackDetailsQuery();

  const { data: feedbacks } = useGetFeedbacksQuery();

  const [isNew, setIsNew] = useState(true);
  const [selectedFeedbackDetailsKey, setSelectedFeedbackDetailsKey] =
    useState<number | null>(null);
  const [selectedFeedbackFilter, setSelectedFeedbackFilter] = useState<any>(null);
  const toast = useRef<Toast>(null);

  const [addFeedbackDetails, { isLoading: isAdding }] =
    useAddFeedbackDetailMutation();
  const [updateFeedbackDetails, { isLoading: isUpdating }] =
    useUpdateFeedbackDetailMutation();
  const [deleteDataAction, { isLoading: isDeleting }] =
    useDeleteFeedbackDetailMutation();

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

  const feedbackBodyTemplate = (rowData: any) => {
    if (!rowData?.feedback_id || !feedbacks) return "-";
    const feedback = feedbacks.find((f: any) => f.key === rowData.feedback_id);
    return feedback ? feedback.descr : "-";
  };

  const defaultActionBodyTemplate = (deleteData: any) => {
    return (value: any) => (
      <>
        <Button
          onClick={() => {
            setIsNew(false);
            setSelectedFeedbackDetailsKey(value.key);
            setValue("descr", value.descr);
            setValue("feedback_id", value.feedback_id);
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

  const filteredFeedbackDetails = selectedFeedbackFilter
    ? feedbackDetails?.filter((fd: any) => fd.feedback_id === selectedFeedbackFilter.key)
    : feedbackDetails;

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (!values.descr) {
        showError("Validation Error", "Description is required.");
        return;
      }
      if (!values.feedback_id) {
        showError("Validation Error", "Feedback is required.");
        return;
      }

      if (isNew) {
        if (feedbackDetails?.some(fd => fd.descr.toLowerCase().trim() === values.descr.toLowerCase().trim() && fd.feedback_id === values.feedback_id)) {
          setError("descr", { message: "Feedback Details already exists for this feedback." });
          return;
        }
      } else {
        if (feedbackDetails?.some(fd => fd.key !== selectedFeedbackDetailsKey && fd.descr.toLowerCase().trim() === values.descr.toLowerCase().trim() && fd.feedback_id === values.feedback_id)) {
          setError("descr", { message: "Feedback Details already exists for this feedback." });
          return;
        }
      }

      if (isNew) {
        resp = await addFeedbackDetails({
          ...values,
          ...clientProps,
        }).unwrap();
      } else {
        resp = await updateFeedbackDetails({
          key: selectedFeedbackDetailsKey,
          ...values,
          ...clientProps,
        }).unwrap();
      }

      setIsNew(true);
      setValue("descr", "");
      setValue("feedback_id", null);
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
      message: "Are you sure you want to delete this Feedback Details?",
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
          label="Feedback"
          name="feedback_id"
          control={control}
          errors={errors}
          required
          leftSpan={4}
          rightSpan={5}
          formItem={{
            component: Dropdown,
            componentProps: {
              options: feedbacks?.map((f: any) => ({ label: f.descr, value: f.key })) || [],
              optionLabel: "label",
              optionValue: "value",
              placeholder: "Select Feedback",
              disabled: isAdding || isUpdating,
            },
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
              maxLength: 255,
              disabled: isAdding || isUpdating,
            },
          }}
        />
      </div>
    );
  };

  if (isFeedbackDetailsFetching) {
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

      <div className="pl-8 mb-3">
        <label style={{ fontWeight: 'bold' }}>Filter by Feedback:</label>
        <Dropdown
          value={selectedFeedbackFilter}
          options={feedbacks?.map((f: any) => ({ label: f.descr, value: f })) || []}
          onChange={(e) => setSelectedFeedbackFilter(e.value)}
          optionLabel="label"
          optionValue="value"
          placeholder="Select Feedback to filter"
          showClear
          filter
          filterBy="label"
          className="ml-2"
          style={{ width: '300px' }}
        />
      </div>

      <Datatable
        className="pl-8"
        style={{ height: "50%", width: "70%" }}
        header={
          <div className="flex">
            <h3 className={classNames("m-0 my-auto")}>Feedback Details</h3>
          </div>
        }
        rowHover
        onRowClick={(e) => {
          setIsNew(false);
          setSelectedFeedbackDetailsKey(e.data.key);
          setValue("descr", e.data.descr);
          setValue("feedback_id", e.data.feedback_id);
        }}
        value={filteredFeedbackDetails}
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
          header="Feedback Details Description"
          sortable
          filter
        />
        <Column
          headerStyle={headerIconStyle}
          header="Feedback"
          body={feedbackBodyTemplate}
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
                  setValue("feedback_id", null);
                }}
              />

              <Button
                loading={isAdding || isUpdating}
                label="Back"
                onClick={() => {
                  // Set the refresh flag before navigating back
                  dispatch(setFeedbackNeedsRefresh(true));

                  const leadKey = State?.data?.leadKey ?? null;
                  const requestedReturnUrl =
                    typeof State?.url === "string" ? State.url.replace(/^#/, "") : "";
                  const returnUrl = requestedReturnUrl.startsWith("/crm/")
                    ? requestedReturnUrl
                    : "/crm/leads";

                  navigate(returnUrl, {
                      state: { openFollowUpDirect: true, leadKey, fromFeedbackDetails: true },
                  })
                }}
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default FeedbackDetailsPage;
