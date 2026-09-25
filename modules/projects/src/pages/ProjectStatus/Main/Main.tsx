
import React, { useState, useRef } from 'react';
import { Datatable, FormField } from '@igblsln/control';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Skeleton } from 'primereact/skeleton';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { useNavigate, useLocation } from 'react-router-dom'
import { useAddProjectStatusMutation, useDeleteProjectStatusMutation, useGetProjectStatusesQuery, useUpdateProjectStatusMutation } from '../projectStatusApi';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { classNames } from "primereact/utils";
import { headerIconStyle, headerStyle } from '@igblsln/themes';
import {
    useForm,
    Controller,
} from "react-hook-form";
import { getClientProps } from '@igblsln/store';

const ProjectStatusPage = () => {

    const navigate = useNavigate();

    const state: any = useLocation().state;

    const clientProps = getClientProps();

    const {
        control,
        formState: { errors, isDirty },
        register,
        reset,
        handleSubmit,
        setValue
    } = useForm({});

    const { data: projectStatus, isLoading: isProjectStatusFething } = useGetProjectStatusesQuery()

    const [isNew, setIsNew] = useState(true)
    const [selectedProjectStatusKey, setSelectedProjectStatusKey] = useState(null)
    const toast = useRef<Toast>(null);

    const [addProjectStatus, { isLoading: isAdding }] = useAddProjectStatusMutation()
    const [updateProjectStatus, { isLoading: isUpdating }] = useUpdateProjectStatusMutation();

    const [deleteDataAction, { isLoading: isDeleting }] = useDeleteProjectStatusMutation()
    const deleteAction = (id: number) => deleteDataAction(id).unwrap();

    const showSuccess = (title: string, msg: string) => {
        toast?.current?.show({ severity: 'success', summary: title, detail: msg, life: 3000 });
    }

    const showError = (title: string, msg: string) => {
        toast?.current?.show({ severity: 'error', summary: title, detail: msg, life: 3000 });
    }

    const defaultActionBodyTemplate = (deleteData: any) => {
        return (value: any) => {
            return (<>

                <Button onClick={() => {
                    setIsNew(false)
                    setSelectedProjectStatusKey(value.key)
                    setValue('descr', value.descr)
                }} icon="pi pi-eye" className="p-button-rounded p-button-text"></Button>
                <Button style={{ height: '20px', width: '20px', borderRadius: 50 }} onClick={() => deleteData(value.key)} className="p-button-rounded p-button-text" icon="pi pi-trash"></Button>
            </>);
        }
    }

    const onSubmit = async (values: any) => {
        try {
            let resp: any;

            if (isNew) {
                resp = await addProjectStatus({ ...values, ...clientProps }).unwrap();
            } else {
                resp = await updateProjectStatus({ key: selectedProjectStatusKey, ...values, ...clientProps }).unwrap();
            }
            showSuccess('Success', resp.detail);
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
                label="Project Status"
                name="descr"
                control={control}
                errors={errors}
                required
                leftSpan={3}
                rightSpan={5}
                formItem={{
                    component: InputText,
                    componentProps: {
                        maxLength: 100,
                        disabled: isAdding || isUpdating
                    }
                }} />
        </div>)
    }

    if (isProjectStatusFething) {
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
            <Datatable className='pl-8' style={{ height: '50%', width: '50%' }}
                header={(<div className='flex'>
                    <h3 className={classNames('m-0 my-auto')} >Project Status</h3>
                    <Button loading={isAdding || isUpdating}
                        label="Add" className="ml-3"
                        onClick={() => {
                            setIsNew(true)
                            setValue('descr', '')
                        }} />
                </div>)}
                rowHover
                onRowClick={(e) => {
                    setIsNew(false)
                    setSelectedProjectStatusKey(e.data.key)
                    setValue('descr', e.data.descr)
                }}
                value={projectStatus} stripedRows>
                <Column headerStyle={headerIconStyle} style={{ maxWidth: '100px' }} bodyStyle={{ textAlign: 'center' }} body={defaultActionBodyTemplate(deleteData)} />
                <Column headerStyle={headerStyle} field="descr" header="Project Status" sortable filter />
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
                            <Button loading={isAdding || isUpdating} label='Save' type='submit' style={{ paddingRight: 20 }} className="p-button-warning mr-3" />

                            <Button loading={isAdding || isUpdating} label='Discard' className='p-button-plain' onClick={() => navigate(state?.url || "/projects/project", { state: state.data })} />

                        </div>

                    </div>
                </form>
            </div>


        </>
    );
}


export default ProjectStatusPage