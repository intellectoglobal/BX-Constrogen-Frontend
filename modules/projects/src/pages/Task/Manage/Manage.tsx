import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ManageLayout, FormField, useToast} from '@igblsln/control';
import { useAddTaskMutation, useGetTaskQuery, useUpdateTaskMutation } from '../taskApi';
import { AFTER_API_TIME, formatDate, getClientProps, useListProjectsWithNoTasksQuery } from '@igblsln/store'
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import ManageWork, { ManageWorkHandle } from './ManageWork'
import ManageStage, { ManageStageHandle } from './ManageStage'
import ManageTask, { ManageTaskHandle } from './ManageTask'

type Props = {}

const Manage = (props: Props) => {

  const receivedTask: any = useLocation().state;

  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)

  const [queryProcessed, setQueryProcessed] = useState(false)
  const [initialSetuping, setInitialSetuping] = useState<any>(null)

  const [selectedWork, setSelectedWork] = useState<number>(-1)
  const [overallWorks, setOverallWorks] = useState<any>([])

  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [overallStages, setOverallStages] = useState<any>({})
  const [stageData, setStageData] = useState<any[]>([])

  const [overallTasks, setOverallTasks] = useState<any>({})
  const [taskData, setTaskData] = useState<any[]>([])

  const clientProps = getClientProps();

  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageWorkRef = useRef<ManageWorkHandle>();
  const manageStageRef = useRef<ManageStageHandle>();
  const manageTaskRef = useRef<ManageTaskHandle>();
  const baseRoute = `/projects/${PAGE_ROUTE}`
  const [itemsTableChanged, setItemsTableChanged] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(id)

  const selectedWorkRef = useRef<number>();
  selectedWorkRef.current = selectedWork;
  const selectedStageRef = useRef<number | null>();
  selectedStageRef.current = selectedStage;

  const { data, isLoading } = useGetTaskQuery(id, {
    skip: isNew
  })

  const { data: projects, isFetching: projectsFetching } = useListProjectsWithNoTasksQuery({}, { refetchOnMountOrArgChange: true, skip: !isNew });

  const [addTask, { isLoading: isAdding }] = useAddTaskMutation()
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();


  useEffect(() => {
    if (data && !queryProcessed) {
      setSelectedProject(data[0]?.proj_key)
      let works = data?.map((d: any) => { return { ...d, indexKey: Math.random() } }) || []
      setOverallWorks(works)

      let temp = works.filter(d => receivedTask?.stage?.work?.key === d.key)[0]
      if (temp) {
        setSelectedWork(temp.indexKey)
      }

      works.map((work: any) => {
        let stage = work?.stages.map((d: any) => { return { ...d, indexKey: Math.random() } }) || []
        temp = overallStages;
        temp[`${work.indexKey}`] = stage;
        setOverallStages({ ...temp })
      })

      Object.keys(overallStages).map((key: any) => {
        overallStages[key]?.map((stage: any) => {
          if (stage.key === receivedTask?.stage?.key) {
            setInitialSetuping({ stage: stage.indexKey })
          }
          let temp = overallTasks;
          temp[`${stage.indexKey}`] = stage.tasks;
          setOverallTasks({ ...temp })
        })
      })

      setQueryProcessed(true)
    }
  }, [data])

  useEffect(() => {
    if (selectedWork === -1 || !selectedWork) {
      setStageData([])
    }
    else {
      let stageCache = overallStages[selectedWork] ? [...overallStages[selectedWork]] : []
      let d = data?.filter((work: any) => work?.indexKey == selectedWork).concat(stageCache) || stageCache
      setStageData(d)
    }
    if (selectedStage !== -1) {
      setSelectedStage(-1)
    }

    if (initialSetuping) {
      setSelectedStage(initialSetuping.stage)
      setInitialSetuping(null)
    }

  }, [selectedWork])

  useEffect(() => {
    if (selectedStage === -1 || !selectedStage) {
      setTaskData([])
    }
    else {
      let stageCache = overallTasks[selectedStage] ? [...overallTasks[selectedStage]] : []
      setTaskData(stageCache)
    }
  }, [selectedStage])

  const getOrganizedData = () => {

    let works = manageWorkRef.current?.getItems()
    let nestedStages: any = {};

    Object.keys(overallStages)?.map((key: any) => {
      nestedStages[key] = overallStages[key]?.map((stage: any) => {
        let refactoredTasks = overallTasks[Object.keys(overallTasks).filter(k => k == stage.indexKey)[0]]?.map((task: any) => {
          return {
            ...task,
            startdate: formatDate(task.startdate, 'yyyy-MM-dd'),
            enddate: formatDate(task.enddate, 'yyyy-MM-dd'),
          }
        })
        return {
          ...stage,
          tasks: refactoredTasks || []
        }
      })
    })

    return works?.map(work => {
      return {
        ...work,
        stages: nestedStages[Object.keys(nestedStages).filter(k => k == work.indexKey)[0]] || []
      }
    })
  }

  const onSubmit = async (values: any) => {

    try {
      let data;
      let resp: any;
      if (isNew) {
        if (!Object.keys(overallTasks).length) {
          showError("No Task Added", "Add atleast 1 task to proceed")
          return
        }
        data = {
          ...values,
          ...clientProps,
          works: getOrganizedData(),
        }
        resp = await addTask({ ...data }).unwrap();
      } else {
        data = {
          ...clientProps,
          works: getOrganizedData(),
          // key: selectedProject,
          proj_key: selectedProject
        }
        resp = await updateTask({ ...data }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        navigate(baseRoute)
      }, AFTER_API_TIME);
    } catch (e) {
      showError('An error occurred', "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-8'>
      <FormField label="Project" name="proj_key" className="col-10 md:col-6" control={control} errors={errors}
        isLoading={projectsFetching}
        required={isNew && "Select a Project"}
        useExplicit
        leftSpan={3}
        rightSpan={9}
        defaultValue={selectedProject}
        formItem={isNew ? {
          component: Dropdown,
          componentProps: {
            showClear : true,
            optionLabel: "name",
            optionValue: "key",
            filter: true,
            filterBy: "name",
            options: projects,
          }
        } : {
          component: InputText,
          componentProps: {
            value: (data ? data[0].project?.name : 'NA'),
            disabled: true,
          }
        }} />

      <div className="col-12 full " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
        <ManageWork
          data={overallWorks}
          isLoading={isLoading}
          ref={manageWorkRef}
          editMode={!isNew}
          selectedWork={selectedWork}
          onSelectedRowChange={(value: number) => { value !== selectedWork && setSelectedWork(value) }}
          onChange={(data: any) => {
            !itemsTableChanged && setItemsTableChanged(true)
          }}
        />
      </div>

      <div className="col-12 full " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
        <ManageStage
          data={stageData}
          ref={manageStageRef}
          editMode={!isNew}
          selectedStage={selectedStage}
          disableTable={!selectedWork || selectedWork === -1}
          onSelectedRowChange={(value: number) => { value !== selectedStage && setSelectedStage(value) }}
          onChange={(data: any) => {
            setSelectedStage(-1)
            !itemsTableChanged && setItemsTableChanged(true)
            let selWork = selectedWorkRef.current
            if (selWork === -1)
              return
            if (selWork) {
              let temp = overallStages;
              temp[selWork] = data;
              setOverallStages({ ...temp })
            }
          }}
        />
      </div>

      <div className="col-12 full " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
        <ManageTask
          data={taskData}
          ref={manageTaskRef}
          editMode={!isNew}
          disableTable={!selectedStage || selectedStage === -1}
          onChange={(data: any) => {
            !itemsTableChanged && setItemsTableChanged(true)
            let selStage = selectedStageRef.current
            if (selStage === -1)
              return
            if (selStage) {
              let temp = overallStages;
              temp[selStage] = data;
              setOverallTasks({ ...temp })
            }
          }}
        />
      </div>

    </div>)
  }

  return (
    <>
      <ManageLayout baseRoute={baseRoute} description={PAGE_NAME} id={id} data={data}
        isUpdating={isAdding || isUpdating || showingToast}
        isItemsTableChanged={itemsTableChanged}
        isLoading={isLoading}
        onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage