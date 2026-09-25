import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { ManageLayout, useToast, ManageLayoutHandle, FormField } from '@igblsln/control';
import { useAddColumnBodyMutation, useUpdateColumnBodyMutation, useGetColumnBodyQuery } from '../columnBodyApi';
import { AFTER_API_TIME, getClientProps, useActiveProjectQuery, useBlocksForProjectQuery, useGetAllUOMsQuery} from '@igblsln/store'
import { PAGE_NAME } from '../constants';


type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)

  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageLayoutRef = useRef<ManageLayoutHandle>();

  const { state } = useLocation();

  if (!state && isNew) {
    navigate("/estimation/columnbody")
  }

  const clientProps = getClientProps();

  const { data, isLoading } = useGetColumnBodyQuery(id, {
    skip: isNew,
    refetchOnMountOrArgChange: true
  })

  const { data: projects, isLoading: projectsFetching } = useActiveProjectQuery();
  const { data: blockData, isLoading: isBlockFetching } = useBlocksForProjectQuery({ projectId: state?.projectKey }, { skip: !state?.projectKey })


  const { data: UOMs } = useGetAllUOMsQuery({});

  const [addColumnBody, { isLoading: isAdding }] = useAddColumnBodyMutation()
  const [updateColumnBody, { isLoading: isUpdating }] = useUpdateColumnBodyMutation();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let body = {
        ...values,

      }
      if (isNew) {
        resp = await addColumnBody({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateColumnBody({ ...body, ...clientProps, key: data?.key }).unwrap();
      }

      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate("/estimation/columnbody")
      }, AFTER_API_TIME);
    } catch {
      showError('An error occurred', "We couldn't save your post, try again!");
    }
  }

  useEffect(() => {

    setFormData(data || {
      ...clientProps,
      proj_key: state?.projectKey,
      projblk_key: state?.blockKey
    })

  }, [data])

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, setValue: UseFormSetValue<any>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>

      <FormField label="Project" name="proj_key" className="col-10 md:col-6" control={control} errors={errors}
        isLoading={projectsFetching}
        // required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: Dropdown,
          componentProps: {
            disabled: true,
            optionLabel: "name",
            optionValue: "key",
            options: projects
          }
        }} />

      <FormField
        className="col-10 md:col-5"
        label="Block"
        name="projblk_key"
        control={control}
        errors={errors}
        // required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: Dropdown,
          componentProps: {
            disabled: true,
            optionLabel: "descr",
            optionValue: "key",
            options: blockData
          }
        }} />

      <div className='col-10 md:col-1'>
        <Button disabled label='Clear' />
      </div>
      <Divider />

      <FormField
        label="Component Name"
        className="col-12"
        name="name" control={control} errors={errors}
        leftSpan={2}
        rightSpan={4}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100,
          },

        }} />

      <FormField
        label="Description"
        className="col-12"
        name="descr"
        control={control} errors={errors}
        leftSpan={2}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 100
          }
        }} />


      <div className="p-inputgroup field grid grid-nogutter p-fluid col-12 flex">

        <label className='col-3' style={{ paddingLeft: 0 }}>Base Quantity / UOM</label>
        <InputText
          className='col-1'
          placeholder=""
          //value={baseQty}
          //onChange={e => setBaseQty(e.target.value)}
        />
        <span className='inputgroup-divider'>/</span>
        <Dropdown
          className='col-1'
          optionLabel='descr'
          optionValue='key'
          options={UOMs}
          //value={uomValue}
          //onChange={e => setUomValue(e.value)}
        />
        <div className="col-6"></div>
      </div>
      <div className="p-inputgroup field grid grid-nogutter p-fluid col-12 flex">
        <label className='col-3'>W x B / UOM</label>
        <InputText
          className='col-1'
          style={{ marginLeft: 4 }}
          placeholder=""
          //value={baseQty}
          //onChange={e => setBaseQty(e.target.value)}
        />
        <span className='inputgroup-divider-normal'>X</span>
        <InputText
          className='col-1'
          style={{ marginLeft: 4 }}
          placeholder=""
          //value={baseQty}
          //onChange={e => setBaseQty(e.target.value)}
        />
        <span className='inputgroup-divider'>/</span>
        <Dropdown
          className='col-2'
          optionLabel='descr'
          optionValue='key'
          options={UOMs}
          //value={uomValue}
          //onChange={e => setUomValue(e.value)}
        />
        <div className="col-4" style={{ margin: 'auto' }}>
          <label style={{
            display: 'flex',
            justifyContent: 'center'
          }}>Target Quantity / UOM</label>
        </div>

      </div>
      <div className="p-inputgroup field grid grid-nogutter p-fluid col-12 flex">

        <label className='col-3'>Column Extension RCC</label>
        <div className="col-3">
          <Dropdown
            optionLabel='descr'
            style={{ width: '100%' }}
            optionValue='key'
            options={UOMs}
            //value={uomValue}
            //onChange={e => setUomValue(e.value)}
          />
        </div>
        <div className="col-3" style={{ marginLeft: 5 }}>
          <InputText
            style={{ width: '100%' }}
            placeholder=""
            value={"1:1:2"}
            disabled
          
          />
        </div>
        <div className="col-1" style={{ marginLeft: 5 }}>
          <InputText
            style={{ width: '100%' }}
            placeholder=""
          />
        </div>
        <div className="col-1" style={{ marginLeft: 5 }}>
          <InputText
            style={{ width: '100%' }}
            placeholder=""
            disabled
            value={"CFT"}
          
          />
        </div>

      </div>
      <div className="p-inputgroup field grid grid-nogutter p-fluid col-12 flex">

        <label className='col-3'>Column Body Rod Pack</label>
        <div className="col-3">
          <Dropdown
            optionLabel='descr'
            style={{ width: '100%' }}
            optionValue='key'
            options={UOMs}
            //value={uomValue}
            //onChange={e => setUomValue(e.value)}
          />
        </div>
        <div className="col-3" style={{ marginLeft: 5 }}>
          <InputText
            style={{ width: '100%' }}
            placeholder=""
            value={"1.0 X 1.6 FEET"}
            disabled
          
          />
        </div>
        <div className="col-1" style={{ marginLeft: 5 }}>
          <InputText
            style={{ width: '100%' }}
            placeholder=""
          />
        </div>
        <div className="col-1" style={{ marginLeft: 5 }}>
          <InputText
            style={{ width: '100%' }}
            placeholder=""
            disabled
            value={"FEET"}
          
          />
        </div>
      </div>

    </div>)
  }


  return (
    <>
      <ManageLayout
        baseRoute="/estimation/columnbody"
        description={PAGE_NAME}
        id={id}
        data={formData}
        isUpdating={isAdding || isUpdating || showingToast}
        ref={manageLayoutRef}
        isLoading={isLoading}
        onSubmit={onSubmit}
        renderForm={renderForm}
      />
    </>
  )
}

export default Manage