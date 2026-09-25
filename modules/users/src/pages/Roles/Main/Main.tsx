
import React, { useState, useRef } from 'react';
import { Datatable, FormField } from '@igblsln/control';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Skeleton } from 'primereact/skeleton';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { useNavigate, useLocation } from 'react-router-dom'
import { useAddRoleMutation, useDeleteRoleMutation, useGetPermissionsQuery, useGetRolesQuery, useUpdateRoleMutation } from '../roleApi';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { classNames } from "primereact/utils";
import { headerIconStyle, headerStyle } from '@igblsln/themes';
import {
    useForm,
    Controller,
} from "react-hook-form";
import { getClientProps, useAuth } from '@igblsln/store';


const RolePage = () => {
    const auth = useAuth()
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

    const { data: roles, isLoading: isRolesFething, refetch } = useGetRolesQuery()
    const { data: permissions, isLoading: isPermissionsFetching } = useGetPermissionsQuery()

    const [selectedPages, setSelectedPages] = useState<any[] | undefined>([]);

    const [isNew, setIsNew] = useState(true)
    const [selectedRole, setSelectedRole] = useState<any>(null)
    const toast = useRef<Toast>(null);

    const [shouldExit, setShouldExit] = useState(false)

    const [addRole, { isLoading: isAdding }] = useAddRoleMutation()
    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

    const [deleteDataAction, { isLoading: isDeleting }] = useDeleteRoleMutation()
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

                {/* <Button onClick={() => {
                    console.log(value)
                    setIsNew(false)
                    setSelectedRole(value)
                    setValue('role', value.role)
                    setValue('role_description', value.role_description)
                    setSelectedPages(permissions?.filter(d=>value?.access?.filter((acc:any) => acc.id === d.id).length > 0))
                    // setSelectedPages(permissions?.filter(d => [1, 2].includes(d.id)))
                }} icon="pi pi-eye" className="p-button-rounded p-button-text"></Button> */}
                <Button style={{ height: '20px', width: '20px', borderRadius: 50 }} onClick={() => deleteData(value.id)} className="p-button-rounded p-button-text" icon="pi pi-trash"></Button>
            </>);
        }
    }

    const onSubmit = async (values: any) => {
        try {
            let resp: any;
            let data = {
                ...values,
                access: selectedPages?.map(d => d.id),
                is_role_active: true
            }
            if (isNew) {
                resp = await addRole({ ...data, ...clientProps }).unwrap();
            } else {
                resp = await updateRole({ key: selectedRole?.id, ...data, ...clientProps }).unwrap();
            }
            setIsNew(true)
            setSelectedRole(null)
            setValue('role', '')
            setValue('role_description', '')
            setSelectedPages([])
            showSuccess('Success', resp.detail);
            refetch()
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
                    setIsNew(true)
                    setSelectedRole(null)
                    setValue('role', '')
                    setValue('role_description', '')
                    setSelectedPages([])
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
                label="Role Name"
                name="role"
                control={control}
                errors={errors}
                required
                leftSpan={4}
                rightSpan={5}
                formItem={{
                    component: InputText,
                    componentProps: {
                        maxLength: 50,
                        disabled: isAdding || isUpdating || selectedRole?.role?.toLowerCase() === "superadmin"
                    }
                }} />

            <FormField
                label="Description"
                name="role_description"
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
                label="Accessible Pages"
                name="access"
                control={control}
                errors={errors}
                // required
                leftSpan={4}
                rightSpan={5}
                formItem={{
                    component: MultiSelect,
                    componentProps: {
                        value: selectedPages,
                        optionLabel: "permission",
                        onChange: (e: any) => setSelectedPages(e.value),
                        options: permissions,
                        display: "chip",
                        disabled: isAdding ||
                            isUpdating ||
                            (!auth.user?.role[0]?.name?.toLowerCase().includes("superadmin") && selectedRole?.role?.toLowerCase() === "superadmin"),
                        placeholder: "Select Pages",
                        className: "w-full md:w-20rem"
                    }
                }} />

        </div>)
    }


    const columns = [
        { key: 'id', name: 'ID', editor: 'text', editable: false, width: 60 },
        { key: 'name', name: 'Name', editor: 'text' },
        { key: 'age', name: 'Age', editor: 'number' },
        {
            key: 'role',
            name: 'Role',
            editor: 'dropdown',
            // options: [
            //   { label: 'Developer', value: 'Developer' },
            //   { label: 'Designer', value: 'Designer' },
            // ],
            options: selectedPages?.map((d: any) => ({ label: d.permission, value: d.permission })),
        },
    ];

    const [initialRows, setInitialRows] = useState([
        { id: 1, name: 'Alice', age: 24 },
        { id: 2, name: 'Bob', age: 30 }
    ])

    if (isRolesFething) {
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
            <Datatable className='pl-8' style={{ height: '50%', width: '90%' }}
                header={(<div className='flex'>
                    <h3 className={classNames('m-0 my-auto')} >Role</h3>
                </div>)}
                rowHover
                onRowClick={(e) => {
                    setIsNew(false)
                    setSelectedRole(e.data)
                    setValue('role', e.data.role)
                    setValue('role_description', e.data.role_description)
                    console.log(permissions?.filter(d => e.data?.access?.filter((acc: any) => acc.id === d.id).length > 0))
                    setSelectedPages(permissions?.filter(d => e.data?.access?.filter((acc: any) => acc.id === d.id).length > 0))
                }}
                value={roles} stripedRows>
                <Column headerStyle={headerIconStyle} style={{ maxWidth: '80px' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={defaultActionBodyTemplate(deleteData)} />
                <Column headerStyle={headerStyle} style={{ maxWidth: '200px' }} bodyStyle={{ cursor: 'pointer' }} field="role" header="Role Name" sortable filter />
                <Column headerStyle={headerStyle} field="access_pages" bodyStyle={{ cursor: 'pointer' }} header="Accessible Pages" body={rowdata => (rowdata?.access.map((d: any) => d.name).join(","))} />
            </Datatable>

            <Divider />
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex">
                    <div className="col-1"></div>
                    <div className="col-7">
                        {renderForm(control, register, errors)}
                    </div>
                    <div className='my-auto'>
                        <Button loading={isAdding || isUpdating} label={'Save'} id='submit' type='submit' style={{ paddingRight: 20 }} className="p-button-warning mr-3" />

                        {/* <Button
                            loading={isAdding || isUpdating}
                            label={'Save & Exit'}
                            style={{ paddingRight: 20 }}
                            className="p-button-warning mr-3"
                            onClick={async (e) => {
                                e.preventDefault()
                                await setShouldExit(true)
                                document.getElementById('submit')?.click()
                            }}
                        /> */}
                        <Button
                            loading={isAdding || isUpdating}
                            label={'Clear'}
                            style={{ paddingRight: 20 }}
                            className="p-button-warning mr-3"
                            onClick={async (e) => {
                                e.preventDefault()
                                setIsNew(true)
                                setSelectedRole(null)
                                setValue('role', '')
                                setValue('role_description', '')
                                setSelectedPages([])
                            }}
                        />
                        <Button
                            loading={isAdding || isUpdating}
                            label='Back'
                            onClick={(e) => {
                                e.preventDefault()
                                navigate(state?.url || "/users/users", { state: state?.data })
                            }}
                        />


                    </div>

                </div>

            </form>

        </>
    );
}


export default RolePage