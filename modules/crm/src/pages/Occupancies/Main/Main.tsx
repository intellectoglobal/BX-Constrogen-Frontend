import React, { useState, useRef, useMemo } from 'react';
import { FormField } from '@igblsln/control';
import { Datatable } from '@igblsln/control';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useListOccupanciesQuery, useDeleteOccupanciesMutation, useAddOccupanciesMutation, useUpdateOccupanciesMutation } from '../occupanciesApi';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { getClientProps } from '@igblsln/store';

type Props = {}

const Main = (props: Props) => {
  const navigate = useNavigate();
  const { data, isFetching: isLoading } = useListOccupanciesQuery()
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteOccupanciesMutation()
  const [addOccupancies, { isLoading: isAdding }] = useAddOccupanciesMutation()
  const [updateOccupancies, { isLoading: isUpdating }] = useUpdateOccupanciesMutation()
  
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();
  
  const toast = useRef<Toast>(null);
  const clientProps = getClientProps();
  
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    setError,
  } = useForm({});

  const [isNew, setIsNew] = useState(true);
  const [selectedKey, setSelectedKey] = useState<number | null>(null);

  // Transform data to include id field for ListLayout navigation
  const transformedData = useMemo(() =>
    data?.map(item => ({ ...item, id: item.key })) || [],
    [data]
  );

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
            setSelectedKey(value.key);
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

  const deleteData = async (id: number) => {
    confirmDialog({
      message: "Are you sure you want to delete this Occupancy?",
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

  const onSubmit = async (values: any) => {
    try {
      if (!values.descr) {
        showError("Validation Error", "Description is required.");
        return;
      }

      if (isNew) {
        if (data?.some(occupancy => occupancy.descr.toLowerCase().trim() === values.descr.toLowerCase().trim())) {
          setError("descr", { message: "Occupancy already exists." });
          return;
        }
      } else {
        if (data?.some(occupancy => occupancy.key !== selectedKey && occupancy.descr.toLowerCase().trim() === values.descr.toLowerCase().trim())) {
          setError("descr", { message: "Occupancy already exists." });
          return;
        }
      }

      let resp: any;
      if (isNew) {
        resp = await addOccupancies({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateOccupancies({ key: selectedKey, ...values, ...clientProps }).unwrap();
      }

      setIsNew(true);
      setValue("descr", "");
      showSuccess("Success", resp.detail);
    } catch (error: any) {
      showError("Error", error?.data?.detail || "We couldn't save your request, try again!");
    }
  };

  const renderForm = (control: any, errors: any) => {
    return (
      <div className="pl-8">
        <FormField
          label="Occupancy"
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

  return (
    <>
      <Toast ref={toast} />
      <Divider />

      <Datatable
        className="pl-8"
        style={{ height: "50%", width: "70%" }}
        header={
          <div className="flex">
            <h3 className="m-0 my-auto">{PAGE_NAME}</h3>
          </div>
        }
        rowHover
        onRowClick={(e) => {
          setIsNew(false);
          setSelectedKey(e.data.key);
          setValue("descr", e.data.descr);
        }}
        value={transformedData}
        stripedRows
      >
        <Column
          style={{ maxWidth: "100px" }}
          bodyStyle={{ textAlign: "center", overflow: "visible" }}
          body={defaultActionBodyTemplate(deleteData)}
        />
        <Column 
          field="descr" 
          header="Occupancy" 
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
}

export default Main
