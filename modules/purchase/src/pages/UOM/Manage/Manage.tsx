import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { ManageLayout, FormField, useToast } from '@igblsln/control';
import { useAddUOMsMutation, useGetUOMsQuery, useListUOMsQuery, useUpdateUOMsMutation } from '../UOMsApi';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps, setPromptNavigate } from '@igblsln/store'
import { useListItemTypesQuery } from '../../ItemType/itemTypesApi';
import { useDispatch } from 'react-redux';

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const dispatch = useDispatch();

  const clientProps = getClientProps();

  const { data, isLoading } = useGetUOMsQuery(id, {
    skip: isNew
  })

  const { data: uomTypes, isFetching: uomTypeFetching } = useListItemTypesQuery({page : 1, size : 1000})

  const [addUOMs, { isLoading: isAdding }] = useAddUOMsMutation()
  const [updateUOMs, { isLoading: isUpdating }] = useUpdateUOMsMutation();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      if (isNew) {
        resp = await addUOMs({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateUOMs({ ...values, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false}))
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className='pl-8 pt-4 pb-3 grid p-fluid'>

        {/* <FormField label="UOM Code" name="id" className="col-12"
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

        <FormField label="Material Item Type" name="itemtyp_key" className="col-12" control={control} errors={errors}
          isLoading={uomTypeFetching}
          required
          leftSpan={3}
          rightSpan={4}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear : true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              options: uomTypes?.results,
            }
          }} />

        <FormField label="UOM Description" name="descr" className="col-12"
          control={control} errors={errors}
          required={"Enter Material Item Description"}
          leftSpan={3}
          rightSpan={4}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
            }
          }} />

        {/* <Divider layout='horizontal' /> */}

        {/* <FormField label="When Standard UOM" name="stockuom_key" className="col-12" control={control} errors={errors}
          leftSpan={3}
          rightSpan={5}
          // required={"Select One"}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear : true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: 'descr',
              options: UOMs?.results,
            }
          }} />

        <div className='col-12 grid grid-nogutter p-fluid' style={{ alignContent: 'flex-start' }}>
          <FormField label="is multiplied by this" name="convunits" className="col-7"
            control={control} errors={errors}
            leftSpan={5}
            rightSpan={7}
            useExplicit
            formItem={{
              component: InputNumber,
              componentProps: {
                maxFractionDigits: 3,
              }
            }} />
          <label style={{ marginTop: 10 }}> &nbsp;&nbsp; the result will equal the New UOM</label>
        </div> */}

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