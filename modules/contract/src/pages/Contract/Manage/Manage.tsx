import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { confirmDialog } from 'primereact/confirmdialog';
import { SaveResponse } from '@igblsln/model';
import { ManageLayout, FormField, useToast, ManageLayoutHandle } from '@igblsln/control';
import { useActiveProjectQuery, useActiveContractorsQuery, AFTER_API_TIME, getClientProps, defaultDateFormat } from '@igblsln/store';
import { useGetContractQuery, useAddContractMutation, useUpdateContractMutation, Contract } from '../contractApi';
import ManageTask, { ManageTaskHandle } from './ManageTask';
import ManageStage, { ManageStageHandle } from './ManageStage';
import { formatDate, useGetNextDocNoQuery } from '@igblsln/store';

type Props = {
}

const convertDateValue = (value: any, reverse?: boolean) => {
  if (value) {
    return reverse ? `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}` : new Date(value);
  }
  return value;
}

const Manage = ({ }: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [poData, setPoData] = useState({});
  const [taskTableChanged, setTaskTableChanged] = useState(false)
  const [stageTableChanged, setStageTableChanged] = useState(false)
  const [contractorType, setContractorType] = useState<any>('')
  const [docStatus, setDocStatus] = useState<any>("S")
  const [action, setAction] = useState<any>("SAVE")
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageTaskRef = useRef<ManageTaskHandle>();
  const manageStageRef = useRef<ManageStageHandle>();
  const manageLayoutRef = useRef<ManageLayoutHandle>();

  const clientProps = getClientProps();

  const [selectedProject, setSelectedProject] = useState<any>(null)

  const { data, isLoading, refetch } = useGetContractQuery(id, {
    skip: isNew
  })

  const { data: docId, isLoading: isDocIdLoading } = useGetNextDocNoQuery("VCN", {
    skip: !isNew
  })

  const navigate = useNavigate();

  const { data: projects, isLoading: projectsFetching } = useActiveProjectQuery();
  const { data: contractor, isLoading: contractorFetching } = useActiveContractorsQuery();

  const [updateContract, { isLoading: isUpdating }] = useUpdateContractMutation()
  const [addContract, { isLoading: isAdding }] = useAddContractMutation()

  useEffect(() => {
    setPoData(data || {
      ...clientProps,
      contractdate: convertDateValue(new Date(), true),
      docid: "VCN",
      contractno: docId?.next_doc_id,
      loctyp: 'PR'
    })
  }, [data, docId])

  useEffect(() => {
    if (data && contractor) {
      let temp = contractor?.filter(d => d.key === data.vend_key);
      if (temp) {
        setContractorType(temp[0]?.type?.id)
      }
    }
    if (data) {
      setSelectedProject(data.proj_key)
    }
  }, [data, contractor])

  const onSubmit = async (values: any) => {
    let taskItems = manageTaskRef.current?.getItems()
    let stageItems = manageStageRef.current?.getItems()
    let body = {
      ...values,
      contractdate: formatDate(values.contractdate, 'yyyy-MM-dd'),
      docstatus: docStatus,
      action: action,
      vend_contract_tasks: taskItems,
      vend_contract_stages: stageItems
    }

    try {
      let resp: SaveResponse<Contract>;
      if (isNew) {
        resp = await addContract({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateContract({ ...body, ...clientProps }).unwrap();
      }

      refetch();

      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate(`/contract/contract`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className='pl-4 pt-4 pb-3 grid p-fluid h-full'>
        {/* <div className='col-12 md:col-6 grid grid-nogutter p-fluid' style={{ alignContent: 'flex-start' }}>
          <FormField label="Doc Code" name="docid" className={classNames("col-12 md:col-6")} control={control} errors={errors}
            formItem={{
              component: InputText,
              componentProps: {
                disabled: true,
              }
            }} />
        </div> */}
        <FormField label="Contract ID" name="contractno" isLoading={isDocIdLoading} className="col-10 md:col-6" control={control} errors={errors}
          leftSpan={4}
          rightSpan={8}
          formItem={{
            component: InputNumber,
            componentProps: {
              useGrouping: false,
              disabled: true
            }
          }} />

        {/* <FormField label="Contractor Category" name="contractortype" className="col-10 md:col-6" control={control} errors={errors}
          formItem={{
            component: InputText,
            componentProps: {
              useGrouping: false,
              disabled: true,
              value: contractorType
            }
          }} /> */}

        <FormField label="Contractor Category" name="vend_key" className="col-10 md:col-6" control={control} errors={errors}
          isLoading={contractorFetching}
          required={"Select a Contractor"}
          leftSpan={4}
          rightSpan={8}
          useExplicit
          onChange={(e: any) => {
            let temp = contractor?.filter(d => d.key === e.value);
            if (temp) {
              setContractorType(temp[0]?.type?.id)
            }
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              options: contractor
            }
          }} />

        <FormField label="Contractor Name" name="vend_key" className="col-10 md:col-6" control={control} errors={errors}
          isLoading={contractorFetching}
          required={"Select a Contractor"}
          leftSpan={4}
          rightSpan={8}
          useExplicit
          onChange={(e: any) => {
            let temp = contractor?.filter(d => d.key === e.value);
            if (temp) {
              setContractorType(temp[0]?.type?.id)
            }
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              options: contractor
            }
          }} />

        <FormField label="Contract Date" name="contractdate" className="col-10 md:col-6" useExplicit control={control} errors={errors}
          convertValue={convertDateValue}
          required={"Select a Date"}
          leftSpan={4}
          rightSpan={8}
          formItem={{
            component: Calendar,
            componentProps: {
              showIcon: true,
              dateFormat: defaultDateFormat
            }
          }} />

        <FormField label="Project" name="proj_key" className="col-10 md:col-6" control={control} errors={errors}
          isLoading={projectsFetching}
          required={"Select a Project"}
          leftSpan={4}
          rightSpan={8}
          useExplicit
          onChange={(e: any) => {
            setSelectedProject(e.value)
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              options: projects
            }
          }} />


        <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
          <ManageTask
            data={data?.vend_contract_tasks || manageTaskRef.current?.getItems() || []}
            isLoading={isLoading}
            ref={manageTaskRef}
            disableTable={getSaveBtnDisableStatus()}
            onChange={(value: boolean) => !taskTableChanged && setTaskTableChanged(value)}
          />
        </div>

        <FormField label="Total Contract Amount" name="contractamt"
          leftSpan={4}
          rightSpan={8}
          className="col-10 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 25
            }
          }} />

        <FormField label="Description" name="notes" className="col-12 md:col-6"
          control={control} errors={errors}
          leftSpan={4}
          rightSpan={8}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 255
            }
          }} />
        {/* <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
          <ManageStage
            data={data?.vend_contract_stages || manageStageRef.current?.getItems() || []}
            isLoading={isLoading}
            ref={manageStageRef}
            selectedProject={selectedProject}
            disableTable={getSaveBtnDisableStatus()}
          />
        </div> */}

      </div>
    )
  }


  const getSaveBtnDisableStatus = () => {
    let disableConditions = ['U', 'R', 'C']
    return disableConditions.includes(data?.docstatus)
  }

  const getCancelBtnDisableStatus = () => {
    let disableConditions = ['R', 'C']
    return disableConditions.includes(data?.docstatus)
  }

  const getSubmitBtnDisableStatus = () => {
    return data?.docstatus !== "S"
  }

  const onCustomSubmit = async (docStatus: any, action: any) => {
    await setDocStatus(docStatus)
    await setAction(action)
    document.getElementById('submit')?.click()
  }

  return (
    <>
      <ManageLayout
        ref={manageLayoutRef}
        baseRoute={`/contract/contract`}
        description={"Contract"}
        id={id}
        data={poData}
        disableSaveBtn={getSaveBtnDisableStatus()}
        isItemsTableChanged={taskTableChanged || stageTableChanged}
        moreSubmitItems={
          <>
            <Button label='Submit' style={{ margin: '0 20px' }} disabled={getSubmitBtnDisableStatus()} onClick={(e) => {
              e.preventDefault()
              let isDirty = manageLayoutRef.current?.getIsDirty();
              if (isDirty || taskTableChanged || stageTableChanged) {
                confirmDialog({
                  message: 'Do you want to save the changes before submit?',
                  header: 'Confirmation',
                  icon: 'pi pi-exclamation-triangle',
                  accept: () => onCustomSubmit("U", "SUBMIT_WITH_SAVE"),
                  reject: () => onCustomSubmit("U", "SUBMIT_WITHOUT_SAVE")
                })
              }
              else {
                onCustomSubmit("U", "SUBMIT_WITH_SAVE")
              }
            }} />
            <Button
              label='Cancel'
              disabled={isNew || getCancelBtnDisableStatus()}
              className='p-button-plain'
              onClick={e => {
                setAction("CANCEL")
                setDocStatus("C")
                return true
              }}
            />
          </>
        }
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage;