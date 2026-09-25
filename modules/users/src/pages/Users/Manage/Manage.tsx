import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormGetValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { Tooltip } from 'primereact/tooltip';
import { ManageLayout, FormField, useToast } from '@igblsln/control';
import { useAddUserMutation, useGetUserQuery, useUpdateUserMutation } from '../usersApi';
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
  const [showingToast, setShowingToast] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<any[]>([]);
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
    if (!selectedCompanies.length) {
      showError("Select atleast 1 Company", "No Company is Selected");
      return
    }
    try {
      let resp: any;
      const companyIds = selectedCompanies.map((c) => Number(c.id)).filter((id) => !Number.isNaN(id))
      const { company: _clientCompany, ...clientContext } = clientProps
      const { company: _formCompany, role: _role, ...userFields } = values
      const payload = {
        ...clientContext,
        ...userFields,
        role: values.role,
        company: companyIds,
      }
      console.log('Selected companies:', selectedCompanies)
      console.log('Company IDs in payload:', companyIds)
      console.log('Final payload:', payload)
      if (isNew) {
        resp = await addUser(payload).unwrap();
      } else {
        resp = await updateUser({ id, ...payload }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false }))
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      console.log(error)
      showError(error?.data?.message || "An Error Occured", "We couldn't save your post, try again!");
    }
  }

  useEffect(() => {
    if (data && companies) {
      setRefactoredData({
        ...data,
        role: data?.role[0]?.id || '',
        client_id: data?.company?.[0]?.client_id || '',
      })
      const ids = data?.company?.map((d: any) => d.id).filter((d: any) => d != null) || []
      const temp = companies.filter((d: any) =>
        ids.some((companyId: number) => Number(companyId) === Number(d.id))
      )
      setSelectedCompanies(temp)
    }
  }, [data, companies])

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
        label="User Name"
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
        label="First Name"
        name="first_name"
        control={control}
        errors={errors}
        leftSpan={2}
        rightSpan={4}
        required
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100,
          }
        }} />

      <FormField
        label="Last Name"
        name="last_name"
        control={control}
        errors={errors}
        leftSpan={2}
        rightSpan={4}
        required
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100,
          }
        }} />

      <FormField
        label="Phone Number"
        name="phone_number"
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
        label="Email"
        name="email"
        required
        control={control}
        errors={errors}
        leftSpan={2}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100,
          }
        }} />


      <div className="field">
        <label style={{ margin: 'auto', paddingLeft: 0 }} htmlFor="is_active" className={'col-2'}>Is Active?</label>
        <Controller defaultValue={true} name="is_active" control={control} render={({ field, fieldState }) => (
          <Checkbox checked={field.value} trueValue={true} falseValue={false} id={field.name} {...field}></Checkbox>
        )} />
      </div>

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

      <Tooltip
        mouseTrack
        mouseTrackLeft={10}
        target="#user-company"
        position="top"
        content={"Can't Modify Once Added"}
        className='my-tooltip'
      />

      {/* {
        auth.user?.role[0]?.name?.toLowerCase().includes("superadmin") &&
        <FormField
          label="Company"
          name="company"
          required
          control={control}
          errors={errors}
          isLoading={companiesFetching}
          leftSpan={2}
          rightSpan={4}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "name",
              optionValue: "id",
              filter: true,
              disabled: !isNew,
              id: "user-company",
              filterBy: "id",
              options: companies,
            }
          }} />
      } */}

      {
        auth.user?.role[0]?.name?.toLowerCase().includes("superadmin") &&
        <FormField
          label="Company"
          name="company"
          control={control}
          errors={errors}
          isLoading={companiesFetching}
          leftSpan={2}
          rightSpan={4}
          onChange={(e: any) => setSelectedCompanies(e.value || [])}
          formItem={{
            component: MultiSelect,
            componentProps: {
              value: selectedCompanies,
              optionLabel: "name",
              options: companies,
              display: "chip",
              placeholder: "Select Companies",
              className: "w-full md:w-20rem"
            }
          }}
        />
      }


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