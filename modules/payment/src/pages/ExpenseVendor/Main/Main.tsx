
import React, { useState, useRef } from 'react';
import { Datatable, FormField } from '@igblsln/control';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Skeleton } from 'primereact/skeleton';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useNavigate, useLocation } from 'react-router-dom'
import { useAddExpenseVendorMutation, useDeleteExpenseVendorMutation, useGetExpenseVendorsQuery, useUpdateExpenseVendorMutation } from '../api';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { classNames } from "primereact/utils";
import { headerIconStyle, headerStyle } from '@igblsln/themes';
import {
    useForm,
    Controller,
} from "react-hook-form";
import { getClientProps } from '@igblsln/store';

const ExpenseVendorPage = () => {

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

    const { data: expenseVendors, isLoading: isExpenseVendorsFething } = useGetExpenseVendorsQuery()

    const [isNew, setIsNew] = useState(true)
    const [selectedExpenseVendorKey, setSelectedExpenseVendorKey] = useState(null)
    const toast = useRef<Toast>(null);

    const [addExpenseVendor, { isLoading: isAdding }] = useAddExpenseVendorMutation()
    const [updateExpenseVendor, { isLoading: isUpdating }] = useUpdateExpenseVendorMutation();

    const [deleteDataAction, { isLoading: isDeleting }] = useDeleteExpenseVendorMutation()
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
                    setSelectedExpenseVendorKey(value.key)
                    setValue('name', value.name)
                }} icon="pi pi-eye" className="p-button-rounded p-button-text"></Button>
                <Button style={{ height: '20px', width: '20px', borderRadius: 50 }} onClick={() => deleteData(value.key)} className="p-button-rounded p-button-text" icon="pi pi-trash"></Button>
            </>);
        }
    }

    const onSubmit = async (values: any) => {
        try {
            let resp: any;

            if (isNew) {
                resp = await addExpenseVendor({ ...values, ...clientProps }).unwrap();
            } else {
                resp = await updateExpenseVendor({ key: selectedExpenseVendorKey, ...values, ...clientProps }).unwrap();
            }
            setIsNew(true)
            setValue('name', '')
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
                label="Expense Vendor Name"
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

        </div>)
    }

    if (isExpenseVendorsFething) {
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
                    <h3 className={classNames('m-0 my-auto')} >Expense Vendor</h3>
                </div>)}
                rowHover
                onRowClick={(e) => {
                    setIsNew(false)
                    setSelectedExpenseVendorKey(e.data.key)
                    setValue('name', e.data.name)
                }}
                value={expenseVendors} stripedRows>
                <Column headerStyle={headerIconStyle} style={{ maxWidth: '100px' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={defaultActionBodyTemplate(deleteData)} />
                <Column headerStyle={headerStyle} field="name" header="Expense Vendor Name" sortable filter />
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
                                }} />

                            <Button
                                loading={isAdding || isUpdating}
                                label='Back'
                                onClick={() => navigate(state?.url || "/payment/expenses", { state: state.data })} />

                        </div>

                    </div>
                </form>
            </div>


        </>
    );
}


export default ExpenseVendorPage