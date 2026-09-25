import React, { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { ManageLayout, useToast, FormField } from "@igblsln/control";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import {
  FileUpload,
  FileUploadHeaderTemplateOptions,
} from "primereact/fileupload";
import { Image } from "primereact/image";
import { Panel } from "primereact/panel";
import { DataView } from "primereact/dataview";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { base64Converter } from "@igblsln/store";
import { STATUS_OPTIONS, StatusOption } from "../constants";
import { useListWorkNameCategoryQuery } from "../../WorkInfo/workInfoApi";
import ManageItem from "./ManageItem";

interface ProgressDetail {
  descr: string;
  comments: string;
  status: string;
  status_label: string;
  images?: { key?: number; image_url: string }[];
  key?: number;
}

interface Props {
  displayModal: boolean;
  customDiscard: () => void;
  data?: ProgressDetail | null;
  onSave: (updatedData: ProgressDetail) => void;
}

interface ImageItem {
  key?: number; // Added for existing images
  base64: string; // S3 URL for existing images, base64 for new images
  name: string;
  size: number;
}

const ManageModal = ({ displayModal, customDiscard, data, onSave }: Props) => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<ProgressDetail>(
    data || {
      descr: "",
      comments: "",
      status: "Y",
      status_label: "Yet to Start",
    }
  );
  const [existingImages, setExistingImages] = useState<ImageItem[]>([]);
  const [newImages, setNewImages] = useState<ImageItem[]>([]);
  const isEditMode = !!data?.key;
  const fileUploadRef = useRef<any>(null); // Reference to FileUpload component
  const [selectedWorkCategory, setSelectedWorkCategory] = useState<
    number | null
  >(null);

  const { data: workCategory, isLoading: workCategoryFetching } =
    useListWorkNameCategoryQuery();

  useEffect(() => {
    setFormData(
      data || {
        descr: "",
        comments: "",
        status: "Y",
        status_label: "Yet to Start",
      }
    );
    setExistingImages(
      data?.images
        ? data.images.map((img, index) => ({
            key: img.key,
            base64: img.image_url, // S3 URL
            name: `existing-image-${index + 1}`,
            size: 0,
          }))
        : []
    );
    setNewImages([]);
    // Clear FileUpload component
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  }, [data]);

  const deleteImage = (item: ImageItem, isExisting: boolean) => {
    confirmDialog({
      message: "Are you sure you want to delete this image?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        if (isExisting) {
          setExistingImages(
            existingImages.filter((img) => img.base64 !== item.base64)
          );
        } else {
          setNewImages(newImages.filter((img) => img.base64 !== item.base64));
          // Update FileUpload component to reflect deletion
          if (fileUploadRef.current) {
            const updatedFiles = fileUploadRef.current
              .getFiles()
              .filter((file: File) => file.name !== item.name);
            fileUploadRef.current.setFiles(updatedFiles);
          }
        }
        showSuccess("Success", "Image deleted successfully");
      },
      reject: () => {},
    });
  };

  const onSubmit = async (values: any) => {
    try {
      const updatedValues: ProgressDetail = {
        ...formData,
        status_label:
          STATUS_OPTIONS.find((x: StatusOption) => x.key === formData.status)
            ?.name || formData.status_label,
        images: [
          ...existingImages.map((file) => ({
            key: file.key,
            image_url: file.base64,
          })),
          ...newImages.map((file) => ({
            image_url: file.base64,
          })),
        ],
      };

      onSave(updatedValues);
      console.log("state value in formData: ", formData);
      console.log("state value in managemodal: ", updatedValues);
      showSuccess(
        "Success",
        isEditMode ? "Progress updated!" : "Progress added!"
      );
      customDiscard();
      // Clear FileUpload component and newImages
      setNewImages([]);
      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
      }
    } catch (err) {
      console.error("Error saving progress:", err);
      showError("Error", "Failed to save progress. Please try again.");
    }
  };

  const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
    const { className, chooseButton } = options;
    return (
      <div
        className={className}
        style={{
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
        }}
      >
        {chooseButton}
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column">
        <i
          className="pi pi-image mt-3 p-5"
          style={{
            fontSize: "5em",
            borderRadius: "50%",
            backgroundColor: "var(--surface-b)",
            color: "var(--surface-d)",
          }}
        ></i>
        <span
          style={{ fontSize: "1.2em", color: "var(--text-color-secondary)" }}
          className="my-5"
        >
          Drag and Drop to Upload Image
        </span>
      </div>
    );
  };

  const imageItemTemplate = (item: ImageItem, layout: string) => {
    const index = existingImages.findIndex(
      (file) => file.base64 === item.base64
    );
    return (
      <div className="col-12 md:col-6 p-1">
        <Panel
          className="project-grid"
          header={`Image #${index + 1}`}
          icons={
            <Button
              type="button"
              style={{ height: "35px", width: "20px" }}
              className="p-button-rounded p-button-text"
              icon="pi pi-trash"
              onClick={() => deleteImage(item, true)}
            />
          }
        >
          <div className="flex">
            <Image
              style={{ width: "100%" }}
              src={item.base64}
              alt={`Image ${index + 1}`}
              width="100%"
              height="300"
              preview
            />
          </div>
          <div className="mt-2">
            {item.name} - {(item.size / 1024).toFixed(2)} KB
          </div>
        </Panel>
      </div>
    );
  };

  const onFileRemove = (event: any) => {
    const file = event.file;
    setNewImages(newImages.filter((img) => img.name !== file.name));
  };

  return (
    <Dialog
      header={isEditMode ? "Update Progress" : "Add Progress"}
      visible={displayModal}
      position="center"
      modal
      style={{ width: "70vw" }}
      onHide={() => {
        customDiscard();
        setNewImages([]);
        if (fileUploadRef.current) {
          fileUploadRef.current.clear();
        }
      }}
      draggable={false}
      resizable={false}
      closable
    >
      <ManageLayout
        baseRoute=""
        id={data?.key}
        data={formData}
        isUpdating={false}
        saveButton={
          <Button
            label="Save"
            onClick={onSubmit}
            type="button"
            style={{ paddingRight: 20 }}
            className="p-button-warning mr-3"
          />
        }
        bottomControl
        hideHeader
        customDiscard={() => {
          customDiscard();
          setNewImages([]);
          if (fileUploadRef.current) {
            fileUploadRef.current.clear();
          }
        }}
        isLoading={false}
        onSubmit={() => {
          console.log("on submit triggered :::");
        }}
        renderForm={(
          control: any,
          _register: any,
          errors: any,
          getValues: any
        ) => (
          <div className="flex justify-center">
            <div className="pl-4 pt-4 grid p-fluid h-full w-full md:w-10/12 lg:w-9/12 xl:w-8/12">
              <div className="col-12 md:col-6">
                <FormField
                  label="Work Category"
                  name="workctgry_key"
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
                />
              </div>
              <div className="col-12 md:col-6">
                <FormField
                  label="Description"
                  name="descr"
                  control={control}
                  errors={errors}
                  required
                  leftSpan={4}
                  rightSpan={8}
                  onChange={(event: any) => {
                    setFormData((previous) => ({
                      ...previous,
                      descr: event.target.value,
                    }));
                  }}
                  formItem={{
                    component: InputText,
                    componentProps: { maxLength: 100 },
                  }}
                />
              </div>
              <div className="col-12 md:col-6">
                <FormField
                  label="Status"
                  name="status"
                  control={control}
                  errors={errors}
                  required
                  leftSpan={4}
                  rightSpan={8}
                  onChange={(e: any) => {
                    const newValue = e.value;
                    setFormData((previous) => ({
                      ...previous,
                      status: newValue,
                      status_label:
                        STATUS_OPTIONS.find((opt) => opt.key === newValue)
                          ?.name || previous.status_label,
                    }));
                  }}
                  formItem={{
                    component: Dropdown,
                    componentProps: {
                      value: formData.status,
                      options: STATUS_OPTIONS.map(
                        ({ key, name }: StatusOption) => ({
                          label: name,
                          value: key,
                        })
                      ),
                      optionLabel: "label",
                      optionValue: "value",
                      placeholder: "Select Status",
                    },
                  }}
                />
              </div>
              <div className="col-12 md:col-6">
                <FormField
                  label="Comments"
                  name="comments"
                  control={control}
                  errors={errors}
                  leftSpan={4}
                  rightSpan={8}
                  onChange={(event: any) => {
                    setFormData((previous) => ({
                      ...previous,
                      comments: event.target.value,
                    }));
                  }}
                  formItem={{
                    component: InputText,
                    componentProps: {
                      // rows: 3,
                      maxLength: 100,
                      // autoResize: true,
                    },
                  }}
                />
              </div>
              <div className="col-6" style={{ height: 200 }}>
                <ManageItem
                  data={[
                    { key: 1, descr: "Civil Labour", name: "Civil Labour", value: "5" },
                    { key: 2, descr: "Mason", name: "Mason", value: "2" },
                    { key: 3, descr: "Store Cutter", name: "Store Cutter", value: "1" },
                    { key: 4, descr: "Electrician", name: "Electrician", value: "3" },
                    { key: 5, descr: "Plumber", name: "Plumber", value: "2" }
                  ]}
                  // selectedItemSubType={selectedItemSubType}
                  // isLoading={isLoading}
                  // ref={manageItemRef}
                  // onChange={(value: boolean) =>
                  //   !itemsTableChanged && setItemsTableChanged(value)
                  // }
                />
              </div>
              {isEditMode && (
                <div className="col-12">
                  <label className="mb-2 font-semibold block">
                    Existing Images
                  </label>
                  {existingImages.length > 0 ? (
                    <DataView
                      value={existingImages}
                      itemTemplate={imageItemTemplate}
                      layout="grid"
                      totalRecords={existingImages.length}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        height: "50%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span>No existing images available</span>
                    </div>
                  )}
                </div>
              )}
              <div className="col-12">
                <label className="mb-2 font-semibold block">
                  Upload New Image
                </label>
                <FileUpload
                  ref={fileUploadRef}
                  name="image[]"
                  accept="image/*"
                  customUpload
                  multiple
                  onSelect={async (e) => {
                    const filesArray = Array.from(e.files) as File[];
                    const newFiles = await Promise.all(
                      filesArray.map(async (file) => ({
                        base64: (await base64Converter(file)) as string,
                        name: file.name,
                        size: file.size,
                      }))
                    );
                    setNewImages([...newImages, ...newFiles]);
                  }}
                  onRemove={onFileRemove}
                  onClear={() => setNewImages([])}
                  headerTemplate={headerTemplate}
                  emptyTemplate={emptyTemplate}
                  chooseLabel="Browse"
                  cancelLabel="Clear All"
                />
              </div>
            </div>
          </div>
        )}
      />
    </Dialog>
  );
};

export default ManageModal;
