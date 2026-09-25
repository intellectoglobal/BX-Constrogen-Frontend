import React, { useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Column } from 'primereact/column';
import { Datatable, FormField } from '@igblsln/control';
import { Skeleton } from 'primereact/skeleton';
import {
  useForm,
  Controller,
} from "react-hook-form";
import { confirmDialog } from 'primereact/confirmdialog';
import { headerIconStyle, headerStyle } from '@igblsln/themes';
import { useAddProjectFloorMutation, useDeleteProjectFloorMutation, useGetProjectFloorQuery, useListProjectFloorQuery, useUpdateProjectFloorMutation } from '../floorApi';
import { useGetProjectQuery } from '../../Projects/apis';
import { AFTER_API_TIME, getClientProps, useBlocksForProjectQuery } from '@igblsln/store'
import { useListProjectBlockQuery } from '../blockApi';


const ManageFloor = () => {

  const navigate = useNavigate();
  const { id: projectIdString } = useParams()
  const projectId = parseInt(projectIdString || '');
  const baseRoute = `/projects/${projectId}/unit`
  const state: any = useLocation().state;
  const [isNew, setIsNew] = useState(true)

  const {
    control,
    formState: { errors, isDirty },
    register,
    reset,
    handleSubmit,
    setValue,
    getValues
  } = useForm({});

  const { data: projectData } = useGetProjectQuery(projectId, {
    skip: isNaN(projectId) || projectId <= 0
  })

  const { data: blockData} = useBlocksForProjectQuery({ projectId: projectData?.key }, { skip: !projectData?.key })
  const { data: floorData, isLoading: isProjectFloorFetching } = useListProjectFloorQuery({ projectId: projectData?.key }, { skip: !projectData?.key, refetchOnMountOrArgChange: true })

  const [selectedProjectFloorKey, setSelectedProjectFloorKey] = useState(null)
  const [shouldExit, setShouldExit] = useState(false)
  const toast = useRef<Toast>(null);

  const [addProjectFloor, { isLoading: isAdding }] = useAddProjectFloorMutation()
  const [updateProjectFloor, { isLoading: isUpdating }] = useUpdateProjectFloorMutation();

  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteProjectFloorMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  const showSuccess = (title: string, msg: string) => {
    toast?.current?.show({ severity: 'success', summary: title, detail: msg, life: 3000 });
  }

  const showError = (title: string, msg: string) => {
    toast?.current?.show({ severity: 'error', summary: title, detail: msg, life: 3000 });
  }

  const clientProps = {
    ...getClientProps(),
    proj_key: projectId
  };

  const defaultActionBodyTemplate = (deleteData: any) => {
    return (value: any) => {
      return (<>

        <Button onClick={() => {
          setIsNew(false)
          setSelectedProjectFloorKey(value.key)
          setValue('descr', value.descr)
          setValue('id', value.id)
          setValue('projblk_key', value.projblk_key)
        }} icon="pi pi-eye" className="p-button-rounded p-button-text"></Button>
        <Button style={{ height: '20px', width: '20px', borderRadius: 50 }} onClick={() => deleteData(value.key)} className="p-button-rounded p-button-text" icon="pi pi-trash"></Button>
      </>);
    }
  }

  const onSubmit = async (values: any) => {
    try {
      let resp: any;

      if (isNew) {
        resp = await addProjectFloor({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateProjectFloor({ key: selectedProjectFloorKey, ...values, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setValue('descr', '')
      setValue('id', '')
      setValue('projblk_key', '')
      setIsNew(true)
      if (shouldExit) {
        setTimeout(() => {
          navigate(state?.url || "/projects/project", { state: { ...state.data, projflr_key: resp.data?.key, projblk_key: resp.data?.projblk_key } })
        }, AFTER_API_TIME);
      }

    } catch {
      showError('An error occurred', "We couldn't save your request, try again!");
    }
  }

  const deleteData = async (data: any) => {

    if (!deleteAction) {
      return;
    }

    confirmDialog({
      message: 'Are you sure you want to delete?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          const resp = await deleteAction(data);
          //@ts-ignore
          showSuccess('Success', resp);
        } catch (error: any) {
          showError("Failed", error?.data?.detail)
        }
      },
      reject: () => { }
    });
  }

  const renderForm = (control: any, _register: any, errors: any) => {
    return (<div className='pl-8'>

      <FormField
        label="Block"
        name="projblk_key"
        control={control}
        errors={errors}
        required
        leftSpan={4}
        rightSpan={4}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear : true,
            optionLabel: "descr",
            optionValue: "key",
            filter: true,
            filterBy: "descr",
            options: blockData
          }
        }} />

      {/* <FormField
        label="Code"
        name="id"
        control={control}
        errors={errors}
        required
        leftSpan={4}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 25,
            disabled: !isNew,
          }
        }} /> */}

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
            maxLength: 100
          }
        }} />

    </div>)
  }

  if (isProjectFloorFetching) {
    return <div className="custom-skeleton p-4">
      <div>
        <Skeleton height="50px" width="30%" className="mb-2"></Skeleton>
        <Skeleton height="50px" width="50%" className="mb-2"></Skeleton>
      </div>
    </div>
  }

  return (
    <>
      <Toast ref={toast} />
      <Datatable className='pl-8 custom'
        header={(<div className='flex'>
        <h3 className={classNames('m-0 my-auto')} >Floors of <span style={{color : '#9e945e'}}> {projectData?.id}</span> Project</h3>
      </div>)}
        rowHover
        loading={isDeleting}
        onRowClick={(e) => {
          setIsNew(false)
          setSelectedProjectFloorKey(e.data.key)
          setValue('descr', e.data.descr)
          setValue('id', e.data.id)
          setValue('projblk_key', e.data.projblk_key)
        }}
        style={{
          height: (floorData?.results?.length || 1) * 100,
          width: '70%',
          minHeight: 150,
          maxHeight: 250,
          overflow: (floorData?.results?.length || 1) * 100 > 250 ? 'auto' : 'hidden',
          padding: 10,
          margin: 10,
          cursor: 'pointer'
        }}
        value={floorData?.results} stripedRows>
        <Column headerStyle={headerIconStyle} style={{ maxWidth: '100px' }} bodyStyle={{ textAlign: 'center' }} body={defaultActionBodyTemplate(deleteData)} />
        <Column headerStyle={headerStyle} field="block.descr" header="Block" sortable filter />
        <Column headerStyle={headerStyle} field="id" header="Floor Code" sortable filter />
        <Column headerStyle={headerStyle} field="descr" header="Floor Description" sortable filter />
      </Datatable>

      <Divider />
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex">
            <div className="col-1"></div>
            <div className="col-7">
              {renderForm(control, register, errors)}
            </div>
            <div className='my-auto'>
              <Button loading={isAdding || isUpdating} label={'Save'} id='submit' type='submit' style={{ paddingRight: 20 }} className="p-button-warning mr-3" />

              <Button
                loading={isAdding || isUpdating}
                label={'Save & Exit'}
                style={{ paddingRight: 20 }}
                className="p-button-warning mr-3"
                onClick={async (e) => {
                  e.preventDefault()
                  await setShouldExit(true)
                  document.getElementById('submit')?.click()
                }}
              />
              {/* <Button loading={isAdding || isUpdating}
                label="Clear" className="mr-3"
                onClick={(e) => {
                  e.preventDefault()
                  setIsNew(true)
                  setValue('descr', '')
                  setValue('id', '')
                  setValue('projblk_key', '')
                }} /> */}
              <Button
                loading={isAdding || isUpdating}
                label='Back'
                onClick={() => navigate(state?.url || "/projects/project", { state: state.data })}
              />

            </div>
          </div>
        </form>
      </div>


    </>
  );
}


export default ManageFloor