import React, { useState, useRef } from 'react';
import { Datatable, FormField } from '@igblsln/control';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Skeleton } from 'primereact/skeleton';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { classNames } from "primereact/utils";
import { headerIconStyle, headerStyle } from '@igblsln/themes';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useAddProjectStatusMutation,
  useDeleteProjectStatusMutation,
  useGetProjectStatusesQuery,
  useUpdateProjectStatusMutation
} from '../api';
import { getClientProps } from '@igblsln/store';

const ProjectStatusPage = () => {
  const navigate = useNavigate();
  const state: any = useLocation().state;
  const toast = useRef<Toast>(null);

  const clientProps = getClientProps();

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
  } = useForm({});

  const { data: projectStatuses, isLoading: isFetching } = useGetProjectStatusesQuery();
  const [addProjectStatus, { isLoading: isAdding }] = useAddProjectStatusMutation();
  const [updateProjectStatus, { isLoading: isUpdating }] = useUpdateProjectStatusMutation();
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteProjectStatusMutation();

  const [isNew, setIsNew] = useState(true);
  const [selectedStatusKey, setSelectedStatusKey] = useState<number | null>(null);

  const showSuccess = (title: string, msg: string) => {
    toast?.current?.show({ severity: 'success', summary: title, detail: msg, life: 3000 });
  };

  const showError = (title: string, msg: string) => {
    toast?.current?.show({ severity: 'error', summary: title, detail: msg, life: 3000 });
  };

  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (!values.descr) {
        showError("Validation Error", "Project Status is required.");
        return;
      }

      if (isNew) {
        resp = await addProjectStatus({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateProjectStatus({ key: selectedStatusKey, ...values, ...clientProps }).unwrap();
      }

      setIsNew(true);
      showSuccess('Success', resp.detail);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your request, try again!");
    }
  };

  const deleteData = async (id: number) => {
    confirmDialog({
      message: 'Are you sure you want to delete this Project Status?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          const resp = await deleteAction(id);
          showSuccess('Success', 'Project Status deleted successfully.');
        } catch (error: any) {
          showError("Failed", error?.data?.detail);
        }
      },
      reject: () => {},
    });
  };

  const defaultActionBodyTemplate = (deleteData: any) => {
    return (value: any) => (
      <>
        <Button
          onClick={() => {
            setIsNew(false);
            setSelectedStatusKey(value.key);
            setValue('descr', value.descr);
          }}
          icon="pi pi-eye"
          className="p-button-rounded p-button-text"
        />
        <Button
          onClick={() => deleteData(value.key)}
          icon="pi pi-trash"
          className="p-button-rounded p-button-text"
        />
      </>
    );
  };

  const renderForm = (control: any, errors: any) => {
    return (
      <div className="pl-8">
        <FormField
          label="Project Status"
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

  if (isFetching) {
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
      <Datatable
        className="pl-8"
        style={{ height: '50%', width: '70%' }}
        header={
          <div className="flex">
            <h3 className={classNames('m-0 my-auto')}>Project Status</h3>
          </div>
        }
        rowHover
        onRowClick={(e) => {
          setIsNew(false);
          setSelectedStatusKey(e.data.key);
          setValue('descr', e.data.descr);
        }}
        value={projectStatuses}
        stripedRows
      >
        <Column
          headerStyle={headerIconStyle}
          style={{ maxWidth: '100px' }}
          bodyStyle={{ textAlign: 'center', overflow: 'visible' }}
          body={defaultActionBodyTemplate(deleteData)}
        />
        <Column headerStyle={headerStyle} field="id" header="Status Code" sortable filter />
        <Column headerStyle={headerStyle} field="descr" header="Project Status" sortable filter />
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
                label="Clear"
                className="mr-3"
                onClick={(e) => {
                  e.preventDefault();
                  setIsNew(true);
                  setValue('descr', '');
                }}
              />

              <Button
                label="Back"
                onClick={() =>
                  navigate(state?.url || '/projects/project', { state: state?.data })
                }
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProjectStatusPage;
