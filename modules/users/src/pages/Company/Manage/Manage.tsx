import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tooltip } from 'primereact/tooltip';
import { ManageLayout, FormField, useToast, ListLayout, Datacolumn } from '@igblsln/control';
import { useAddCompanyMutation, useGetCompanyQuery, useListCompanyQuery, useUpdateCompanyMutation } from '../companiesApi';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';
import { AFTER_API_TIME, getClientProps } from '@igblsln/store'
import { useListClientQuery } from '../../Client/clientApi';
import ManageItem, { ManageItemHandle } from './ManageItem';

type Props = {}

const activeStates = [
  {
    value: true,
    descr: "Active"
  },
  {
    value: false,
    descr: "Inactive"
  },
]

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = idString || '';
  const isNew = !id;
  const specDataRef = useRef<any[]>([]);
  const manageItemRef = useRef<ManageItemHandle>();

  const clientProps = getClientProps();

  const { data, isLoading } = useGetCompanyQuery(id, {
    skip: isNew
  })

  const { data: clients, isLoading: clientsFetching } = useListClientQuery({})

  const [addCompany, { isLoading: isAdding }] = useAddCompanyMutation()
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();

  const [projectStatuses, setProjectStatuses] = useState<any[]>([])

  useEffect(() => {
    if (data && data?.project_status) {
      setProjectStatuses(data.project_status)
    }
  }, [data])

  const shouldAllowAdd = (items: any[]) => {
    if (items.length === 0) return true
    let temp = items[items.length - 1]
    return temp?.descr
  }

  const actionBodyTemplate = (value: any) => {
    return <Button
      style={{ height: '35px', width: '20px', marginLeft: 20 }}
      type="button"
      onClick={() => {
        console.log(value)
        const updValue = specDataRef.current.filter(x => x.descr !== value.descr)
        setProjectStatuses(updValue);
        console.log(updValue)
        specDataRef.current = updValue
      }}
      className="p-button-rounded p-button-text"
      icon="pi pi-trash"></Button>
  }

  const onSubmit = async (values: any) => {
    try {
      console.log(specDataRef.current)
      let resp: any;
      let body = {
        ...values,
        project_status: specDataRef.current,
      }
      if (isNew) {
        resp = await addCompany({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateCompany({ ...body, ...clientProps }).unwrap();
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

  const getOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
    return <Dropdown autoFocus style={{ width: '100%' }} className="p-inputtext-sm"
      value={row[column.key]}
      optionLabel="descr"
      optionValue="value"
      options={activeStates}
      onChange={(e: any) => {
        let clone = { ...row }
        clone[column.key] = e.value;
        onRowChange(clone, true)
      }}
      tabIndex={-1} />
  };

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className='pl-8 pt-4 pb-3 grid p-fluid'>

        <FormField label="Company Name" name="name" className="col-12"
          control={control} errors={errors}
          required={"Enter Company Name"}
          leftSpan={2}
          rightSpan={3}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
            }
          }} />

        <Tooltip
          mouseTrack
          mouseTrackLeft={10}
          target="#company-client"
          position="top"
          content={"Can't Be Modified Once Added"}
          className='my-tooltip'
        />

        <FormField label="Client" name="client" className="col-12"
          control={control} errors={errors}
          isLoading={clientsFetching}
          required
          leftSpan={2}
          rightSpan={3}
          useExplicit
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "name",
              optionValue: "id",
              filter: true,
              id: "company-client",
              disabled: !isNew,
              filterBy: "name",
              options: clients,
            }
          }} />

        <FormField
          label="Address"
          name="addr"
          control={control}
          errors={errors}
          className="col-12"
          leftSpan={2}
          rightSpan={3}
          formItem={{
            component: InputTextarea,
            componentProps: {
              maxLength: 100,
            }
          }} />

        <FormField label="GST No" name="gstno" className="col-12"
          control={control} errors={errors}
          required
          leftSpan={2}
          rightSpan={3}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
            }
          }} />

        <FormField label="PAN No" name="panno" className="col-12"
          control={control} errors={errors}
          required
          leftSpan={2}
          rightSpan={3}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
            }
          }} />


        {/* <div className="row flex" style={{ width: '90%' }}>
          <div className='col-7'>
            <div style={{ width: '80%', marginRight: 50 }}>
              <ListLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading}
                data={projectStatuses}
                newTable
                tableLayoutClass='h-full'
                allowFilters={false}
                actionBodyTemplate={actionBodyTemplate}
                gridProps={{
                  allowAdd: true,
                  disableAdd: !shouldAllowAdd(projectStatuses),
                  OnRowsChanged: (rows: any[]) => {
                    setProjectStatuses(rows)
                    specDataRef.current = rows
                  },
                  newRowDefaults: {
                    is_active: true,
                    key: null
                  }
                }}>

                <Datacolumn field="descr" header="Project Status" editorType="text" />
                <Datacolumn
                  field="is_active"
                  header="Active"
                  // displayValueGetter={(row) => (
                  //   <div style={{ display: 'flex', paddingTop: 7, justifyContent: 'center', }}>
                  //     <Checkbox checked={row.is_active} />
                  //   </div>
                  // )}
                  displayValueGetter={(row) => row.is_active ? "Active" : "Inactive"}
                  editorType={getOptionsEditor} />
              </ListLayout>
            </div>
          </div>
        </div> */}

        <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
          <ManageItem
            data={data?.bank_accounts || []}
            isLoading={isLoading}
            ref={manageItemRef}
          />
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