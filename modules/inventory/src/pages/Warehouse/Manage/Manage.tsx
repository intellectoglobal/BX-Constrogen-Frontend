import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { ManageLayout, FormField, useToast } from '@igblsln/control';
import { useAddWarehousesMutation, useGetWarehousesQuery, useUpdateWarehousesMutation, useGetStatesQuery, useGetCitiesQuery } from '../warehousesApi';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps } from '@igblsln/store'


type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const [selectedState, setSelectedState] = useState<any>('')

  const clientProps = getClientProps();

  const { data: states, isFetching: statesFetching } = useGetStatesQuery()
  const { data: cities, isFetching: citiesFetching } = useGetCitiesQuery(selectedState)

  const { data, isLoading } = useGetWarehousesQuery(id, {
    skip: isNew
  })
  const [addWarehouses, { isLoading: isAdding }] = useAddWarehousesMutation()
  const [updateWarehouses, { isLoading: isUpdating }] = useUpdateWarehousesMutation();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (isNew) {
        resp = await addWarehouses({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateWarehouses({ ...values, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (

      <div className="flex">
        <div className='pl-8 pt-4 pb-3 grid p-fluid'>

          {/* <FormField label="Warehouse Code" name="id" className="col-12"
            control={control} errors={errors}
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

          <FormField label="Warehouse Name" name="name" className="col-12"
            control={control} errors={errors}
            required={"Enter Name"}
            leftSpan={3}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100,
              }
            }} />

          <FormField label="Address Line 1" name="addr1" className="col-12"
            control={control} errors={errors}
            leftSpan={3}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100,
              }
            }} />

          <FormField label="Address Line 2" name="addr2" className="col-12"
            control={control} errors={errors}
            leftSpan={3}
            rightSpan={5}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100,
              }
            }} />

          <FormField label="State" name="state_key" className="col-12" control={control} errors={errors}
            isLoading={statesFetching}
            required={"Select a State"}
            leftSpan={3}
            rightSpan={3}
            useExplicit
            onChange={(e: any) => {
              setSelectedState(e.value)
            }}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear : true,
                optionLabel: "name",
                optionValue: "key",
                filter: true,
                filterBy: "name",
                options: states,
              }
            }} />

          <FormField label="City" name="city_key" className="col-12" control={control} errors={errors}
            isLoading={citiesFetching}
            required={"Select a City"}
            leftSpan={3}
            rightSpan={3}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear : true,
                optionLabel: "name",
                optionValue: "key",
                filter: true,
                filterBy: "name",
                options: cities,
              }
            }} />

        </div>
        <div className="col-2" style={{ marginTop: 25 }}>
          <div>
            <Button onClick={(e) => e.preventDefault()} label='Contact' className='project-page-tags' style={{ width: '100%' }} />
          </div>
        </div>
      </div>

    )
  }

  return (
    <>
      <ManageLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage