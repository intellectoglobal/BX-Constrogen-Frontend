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
  useAddProjectTypeMutation,
  useDeleteProjectTypeMutation,
  useListProjectTypeQuery,
  useUpdateProjectTypeMutation
} from '../projectTypeApi';
import { getClientProps } from '@igblsln/store';

const ProjectTypePage = () => {
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

  const { data, isFetching } = useListProjectTypeQuery({});
  const projectTypes = data?.results || [];

  const [addProjectType, { isLoading: isAdding }] = useAddProjectTypeMutation();
  const [updateProjectType, { isLoading: isUpdating }] = useUpdateProjectTypeMutation();
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteProjectTypeMutation();

  const [isNew, setIsNew] = useState(true);
  const [selectedTypeKey, setSelectedTypeKey] = useState<number | null>(null);

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
        showError('Validation Error', 'Description is required.');
        return;
      }

      if (isNew) {
        resp = await addProjectType({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateProjectType({ key: selectedTypeKey, ...values, ...clientProps }).unwrap();
      }

      setIsNew(true);
      showSuccess('Success', resp.detail);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your request, try again!");
    }
  };

  const deleteData = async (id: number) => {
    confirmDialog({
      message: 'Are you sure you want to delete this Project Type?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await deleteAction(id);
          showSuccess('Success', 'Project Type deleted successfully.');
        } catch (error: any) {
          showError('Failed', error?.data?.detail);
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
            setSelectedTypeKey(value.key);
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
          label="Type Description"
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
            <h3 className={classNames('m-0 my-auto')}>Project Type</h3>
          </div>
        }
        rowHover
        onRowClick={(e) => {
          setIsNew(false);
          setSelectedTypeKey(e.data.key);
          setValue('descr', e.data.descr);
        }}
        value={projectTypes}
        stripedRows
      >
        <Column
          headerStyle={headerIconStyle}
          style={{ maxWidth: '100px' }}
          bodyStyle={{ textAlign: 'center', overflow: 'visible' }}
          body={defaultActionBodyTemplate(deleteData)}
        />
        <Column headerStyle={headerStyle} field="id" header="Type Code" sortable filter />
        <Column headerStyle={headerStyle} field="descr" header="Type Description" sortable filter />
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

export default ProjectTypePage;
