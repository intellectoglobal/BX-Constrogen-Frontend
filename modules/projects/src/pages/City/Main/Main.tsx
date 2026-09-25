
import React, { useState, useRef } from 'react';
import { Datatable, FormField } from '@igblsln/control';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Skeleton } from 'primereact/skeleton';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useNavigate, useLocation } from 'react-router-dom'
import { useAddCityMutation, useDeleteCityMutation, useGetCitiesQuery, useUpdateCityMutation, useGetStatesQuery } from '../cityApi';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { classNames } from "primereact/utils";
import { headerIconStyle, headerStyle } from '@igblsln/themes';
import {
    useForm,
    Controller,
} from "react-hook-form";
import { getClientProps } from '@igblsln/store';

const CityPage = () => {

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

    const { data: cities, isLoading: isCitiesFething } = useGetCitiesQuery()
    const { data: states, isLoading: isStatesFething } = useGetStatesQuery()

    const [isNew, setIsNew] = useState(true)
    const [selectedCityKey, setSelectedCityKey] = useState(null)
    const toast = useRef<Toast>(null);

    const [addCity, { isLoading: isAdding }] = useAddCityMutation()
    const [updateCity, { isLoading: isUpdating }] = useUpdateCityMutation();

    const [deleteDataAction, { isLoading: isDeleting }] = useDeleteCityMutation()
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
                    setSelectedCityKey(value.key)
                    setValue('name', value.name)
                    setValue('state_key', value.state_key)
                }} icon="pi pi-eye" className="p-button-rounded p-button-text"></Button>
                <Button style={{ height: '20px', width: '20px', borderRadius: 50 }} onClick={() => deleteData(value.key)} className="p-button-rounded p-button-text" icon="pi pi-trash"></Button>
            </>);
        }
    }

    const onSubmit = async (values: any) => {
        try {
            let resp: any;

            if (isNew) {
                resp = await addCity({ ...values, ...clientProps }).unwrap();
            } else {
                resp = await updateCity({ key: selectedCityKey, ...values, ...clientProps }).unwrap();
            }
            setIsNew(true)
            setValue('name', '')
            setValue('state_key', '')
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
                label="City Name"
                name="name"
                control={control}
                errors={errors}
                required
                leftSpan={4}
                rightSpan={5}
                formItem={{
                    component: InputText,
                    componentProps: {
                        maxLength: 50,
                        disabled: isAdding || isUpdating
                    }
                }} />

            <FormField
                label="State"
                name="state_key"
                control={control}
                errors={errors}
                required
                leftSpan={4}
                rightSpan={6}
                formItem={{
                    component: Dropdown,
                    componentProps: {
                        showClear : true,
                        optionLabel: "name",
                        optionValue: "key",
                        filter: true,
                        filterBy: "name",
                        options: states
                    }
                }} />
        </div>)
    }

    if (isCitiesFething || isStatesFething) {
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
            <Datatable className='pl-8' style={{ height: '50%', width: '70%' }}
                header={(<div className='flex'>
                    <h3 className={classNames('m-0 my-auto')} >City</h3>
                </div>)}
                rowHover
                onRowClick={(e) => {
                    setIsNew(false)
                    setSelectedCityKey(e.data.key)
                    setValue('name', e.data.name)
                    setValue('state_key', e.data.state_key)
                }}
                value={cities} stripedRows>
                <Column headerStyle={headerIconStyle} style={{ maxWidth: '100px' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={defaultActionBodyTemplate(deleteData)} />
                <Column headerStyle={headerStyle} field="name" header="City Name" sortable filter />
                <Column headerStyle={headerStyle} field="state.name" header="State" sortable filter />
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

                            <Button loading={isAdding || isUpdating}
                                label="Clear" className="mr-3"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setIsNew(true)
                                    setValue('name', '')
                                    setValue('state_key', '')
                                }} />

                            <Button
                                loading={isAdding || isUpdating}
                                label='Back'
                                onClick={() => navigate(state?.url || "/projects/project", { state: state.data })} />

                        </div>

                    </div>
                </form>
            </div>


        </>
    );
}


export default CityPage