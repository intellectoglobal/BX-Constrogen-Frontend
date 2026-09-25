import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues, Controller } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from "primereact/dropdown"
import { ManageLayout, FormField, useToast } from '@igblsln/control';
import { Checkbox } from 'primereact/checkbox';
// import { useAddItemTypesMutation, useGetItemTypesQuery, useUpdateItemTypesMutation } from '../itemTypesApi';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps, setPromptNavigate, useAppDispatch } from '@igblsln/store'
import { classNames } from 'primereact/utils';
import { useGetWorkCategoryDataQuery } from '../../WorkCategory/api';
import { useAddWorkTypeMutation, useGetWorkTypeQuery, useUpdateWorkTypeMutation } from '../api';

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const dispatch = useAppDispatch();
  const [selectedWorkCategory, setSelectedWorkCategory] = useState(null)

  const clientProps = getClientProps();
  const { data, isFetching: isLoading } = useGetWorkCategoryDataQuery();

  const { data:workTypeData, isLoading:isWorkTypeLoading } = useGetWorkTypeQuery(id, {
    skip: isNew
  })
  const [addWorkType, { isLoading: isAdding }] = useAddWorkTypeMutation()
  const [updateWorkType, { isLoading: isUpdating }] = useUpdateWorkTypeMutation();

  const onSubmit = async (values: any) => {
    try {
      console.log("api values ::", values)
      let resp: any;
      if (isNew) {
        resp = await addWorkType({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateWorkType({ ...values, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false}))
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
      dispatch(setPromptNavigate({ promptNavigate: false}))
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className="flex">
        <div className='pl-8 col-10'>
          {/* <FormField
            label="Contractor Code"
            name="id"
            control={control}
            errors={errors}
            required
            leftSpan={3}
            rightSpan={3}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 25,
                disabled: !isNew,
              }
            }} /> */}

          <FormField
            label="Work Category"
            name="category_key"
            control={control}
            errors={errors}
            // required
            leftSpan={3}
            rightSpan={4}
            useExplicit
            onChange={(e: any) => {
              setSelectedWorkCategory(e.value)
            }}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionLabel: "descr",
                optionValue: "key",
                filter: true,
                filterBy: "name",
                options: data?.results
              }
            }} />


          <FormField
            label="Description"
            name="descr"
            control={control}
            errors={errors}
            required
            leftSpan={3}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                showClear: true,
                optionLabel: "descr",
                optionValue: "key",
                filter: true,
                filterBy: "descr",
              }
            }} />



          <div className="field" style={{ display: 'flex' }}>
            <label style={{ margin: 'auto 0px', paddingLeft: 0 }} htmlFor="is_repetitive" className={classNames('col-3', { 'p-error': errors.inactive })}>Is Repetitive</label>
            <div style={{ margin: 'auto 0px' }}>
              <Controller defaultValue={false} name="is_repetitive" control={control} render={({ field, fieldState }) => (
                <Checkbox checked={field.value} trueValue={true} falseValue={false} id={field.name} {...field}></Checkbox>
              )} />
            </div>
          </div>
        </div>
        {/* <div className="col-2" style={{ marginTop: 25 }}>
          <div>
            <Button label='Contact' onClick={(e) => e.preventDefault()} className='project-page-tags' style={{ width: '100%' }} />
          </div>
        </div> */}
      </div>



    )
  }

  return (
    <>
      <ManageLayout 
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} 
        description={PAGE_NAME} 
        id={id} 
        data={workTypeData}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading || isWorkTypeLoading} 
        onSubmit={onSubmit} 
        renderForm={renderForm} 
        />
    </>
  )
}

export default Manage