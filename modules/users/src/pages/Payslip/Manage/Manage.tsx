import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormGetValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Tooltip } from 'primereact/tooltip';
import { ManageLayout, FormField, useToast } from '@igblsln/control';
import { useAddUserMutation, useGetUserQuery, useUpdateUserMutation } from '../api';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps, useAuth, useGetAllCompaniesQuery } from '@igblsln/store'
import { useGetRolesQuery } from '../../Roles/roleApi';
import { useDispatch } from 'react-redux';
import { setPromptNavigate } from '@igblsln/store';

type Props = {}

const Manage = (props: Props) => {
  const auth = useAuth()
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const dispatch = useDispatch();

  const clientProps = getClientProps();
  const { data: roles, isLoading: isRolesFething } = useGetRolesQuery()

  const { data, isLoading } = useGetUserQuery(id, {
    skip: isNew
  })

  const [refactoredData, setRefactoredData] = useState<any>(null)

  const { data: companies, isFetching: companiesFetching } = useGetAllCompaniesQuery()

  const [addUser, { isLoading: isAdding }] = useAddUserMutation()
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (isNew) {
        resp = await addUser({ ...clientProps, ...values }).unwrap();
      } else {
        resp = await updateUser({ ...clientProps, ...values }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false }))
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  useEffect(() => {
    if (data) {
      setRefactoredData({
        ...data,
        role: data?.role[0]?.id || '',
        company: data?.company?.company_id || '',
        client_id: data?.company?.client_id || '',
      })
    }
  }, [data])

  const getEditStatus = () => {
    if (data?.role[0]?.name?.toLowerCase() === "superadmin") {
      return auth.user?.role[0]?.name?.toLowerCase().includes("superadmin") ? 'auto' : 'none'
    }
    else return 'auto'
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: UseFormGetValues<any>) => {
    return (<div
      style={{ pointerEvents: getEditStatus() }}
      className='pl-8'>

      <FormField
        label="Employee Name"
        name="user_name"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={5}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100
          }
        }} />


      <FormField
        label="Role"
        name="role"
        control={control}
        errors={errors}
        required
        leftSpan={2}
        rightSpan={4}
        useExplicit
        formItem={{
          component: Dropdown,
          componentProps: {
            optionGroupTemplate:
              <div
                style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: '#e6e1e1', color: 'black', lineHeight: 2.5 }}
                onClick={() => navigate(`/users/roles`, {
                  state: {
                    url: isNew ? `/users/users/new` : `/users/users/${refactoredData?.id}/edit`,
                    data: getValues()
                  }
                })
                }
              >
                -- Create And Edit --
              </div>
            ,
            optionLabel: "role",
            optionValue: "id",
            optionGroupLabel: "label",
            optionGroupChildren: "items",
            options: [
              {
                label: 'Add',
                items: roles?.filter((d: any) => d?.role?.toLowerCase().includes("superadmin") ? auth.user?.role[0]?.name?.toLowerCase().includes("superadmin") : true) || []
              }
            ]
          }
        }} />

      <FormField
        label="Salary"
        name="salary"
        required
        control={control}
        errors={errors}
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100,
          }
        }} />

      <FormField
        label="Weekly Allowance"
        name="allowance"
        required
        control={control}
        errors={errors}
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100,
          }
        }} />

    </div>)
  }

  return (
    <>
      <ManageLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} id={id} data={refactoredData}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage