import React, { useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { Divider } from 'primereact/divider';
import { Datatable, FormField } from '@igblsln/control';
import { useForm } from "react-hook-form";
import { confirmDialog } from 'primereact/confirmdialog';
import { headerIconStyle, headerStyle } from '@igblsln/themes';
import { useAddProjectBlockMutation, useDeleteProjectBlockMutation, useGetProjectBlockQuery, useListProjectBlockQuery, useUpdateProjectBlockMutation } from '../blockApi';
import { useGetProjectQuery } from '../../Projects/apis';
import { AFTER_API_TIME, getClientProps, useBlocksForProjectQuery } from '@igblsln/store'


const ManageBlock = () => {

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

  const { data: blockData, isLoading: isProjectBlockFetching, refetch } = useBlocksForProjectQuery({ projectId: projectData?.key }, { skip: !projectData?.key, refetchOnMountOrArgChange: true })

  const [selectedProjectBlockKey, setSelectedProjectBlockKey] = useState(null)
  const [shouldExit, setShouldExit] = useState(false)
  const toast = useRef<Toast>(null);

  const [addProjectBlock, { isLoading: isAdding }] = useAddProjectBlockMutation()
  const [updateProjectBlock, { isLoading: isUpdating }] = useUpdateProjectBlockMutation();

  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteProjectBlockMutation()
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
          setSelectedProjectBlockKey(value.key)
          setValue('descr', value.descr)
          setValue('id', value.id)
        }} icon="pi pi-eye" className="p-button-rounded p-button-text"></Button>
        
        <Button 
          style={{ height: '20px', width: '20px', borderRadius: 50 }} 
          onClick={() => {
            deleteData(value.key)
          }} 
          className="p-button-rounded p-button-text" 
          icon="pi pi-trash"></Button>
      </>);
    }
  }

  const onSubmit = async (values: any) => {
    try {
      let resp: any;

      if (isNew) {
        resp = await addProjectBlock({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateProjectBlock({ key: selectedProjectBlockKey, ...values, ...clientProps }).unwrap();
      }
      refetch()
      showSuccess('Success', resp.detail);
      setValue('descr', '')
      setValue('id', '')
      setIsNew(true)
      if (shouldExit) {
        setTimeout(() => {
          navigate(state?.url || "/projects/project", { state: { ...state.data, projblk_key: resp.data.key } })
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
          refetch()
        } catch (error: any) {
          showError("Failed", error?.data?.detail)
        }
      },
      reject: () => { }
    });
  }

  const renderForm = (control: any, _register: any, errors: any) => {
    return (<div className='pl-8'>
      {/* <FormField
        label="Code"
        name="id"
        control={control}
        errors={errors}
        required
        leftSpan={3}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 25,
            disabled: !isNew,
          }
        }} /> */}

      <FormField
        label="Block Name"
        name="descr"
        control={control}
        errors={errors}
        required
        leftSpan={3}
        rightSpan={5}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100
          }
        }} />

    </div >)
  }

  if (isProjectBlockFetching) {
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
          <h3 className={classNames('m-0 my-auto')} >Blocks of <span style={{color : '#9e945e'}}> {projectData?.id}</span> Project</h3>
        </div>)}
        rowHover
        loading={isDeleting}
        onRowClick={(e) => {
          setIsNew(false)
          setSelectedProjectBlockKey(e.data.key)
          setValue('descr', e.data.descr)
          setValue('id', e.data.id)
        }}
        style={{
          height: (blockData?.length || 1) * 100,
          width: '70%',
          minHeight: 150,
          maxHeight: 250,
          overflow: (blockData?.length || 1) * 100 > 250 ? 'auto' : 'hidden',
          padding: 10,
          margin: 10,
          cursor: 'pointer'
        }}
        value={blockData} stripedRows>
        <Column headerStyle={headerIconStyle} style={{ maxWidth: '100px' }} bodyStyle={{ textAlign: 'center' }} body={defaultActionBodyTemplate(deleteData)} />
        {/* <Column headerStyle={headerStyle} field="id" header="Block Code" sortable filter /> */}
        <Column headerStyle={headerStyle} field="descr" header="Block Name" sortable filter />
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


export default ManageBlock