
import React, { useEffect, useState,useMemo } from 'react';
import { CreateButton, Datacolumn, ListLayout, useToast } from '@igblsln/control';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { useNavigate } from 'react-router-dom'
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { PAGE_SIZE, Project, setPaymentMenu, setSelectedProjectReducer, useActiveProjectQuery } from '@igblsln/store';
import { useDeleteProjectMutation, useGetProjectStatusesQuery, useListProjectQuery, useGetProjectQuery } from '../apis';
import ProjectCard from '../../../components/ProjectCard';
import ViewModal from '../ViewModal';
import { useDispatch, useSelector } from 'react-redux'
import Manage from '../Manage/Manage'

const Projects = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch()
  const selectedProject = useSelector((state: any) => state?.common?.selectedProject)

  const { data: projects } = useActiveProjectQuery()

  const { showSuccess, showError } = useToast();
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE);
  const [showModal, setShowModal] = useState<boolean>(false)
  const [customProjectStatus, setCustomProjectStatus] = useState<any>([])
  const { data, isFetching: isLoading } = useListProjectQuery({ page: page, size: size, status: selectedStatus }, { refetchOnMountOrArgChange: true })
  const { data: selectedProjectDetails, isFetching: isFetchingSelectedProject } = useGetProjectQuery(selectedProject, { skip: !selectedProject })
  const [deleteProjectType, { isLoading: isDeleting }] = useDeleteProjectMutation()
  const [searchFilter, setSearchFilter] = useState('')

  const deleteAction = (id: number) => deleteProjectType(id).unwrap();

  const { data: projectStatuses } = useGetProjectStatusesQuery(null, { refetchOnMountOrArgChange: true })

  const filteredData = useMemo(() => {
    return searchFilter ? data?.results?.filter((d:any) => d.name.toLowerCase().includes(searchFilter.toLowerCase())) : data?.results
  }, [data?.results, searchFilter])

  const selectedProjectData = useMemo(() => {
    if (!selectedProject) return null;
    // Use the fetched project details if available
    if (selectedProjectDetails) return selectedProjectDetails;
    // Fallback to finding in current page results
    return data?.results?.find((p: any) => p.key === selectedProject);
  }, [selectedProject, selectedProjectDetails, data?.results])

  const deleteData = async (data: any) => {
    confirmDialog({
      message: 'Are you sure you want to delete?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          const resp: any = await deleteAction(data);
          showSuccess('Success', resp);
        } catch (error: any) {
          showError("Failed", error?.data?.detail)
        }
      },
      reject: () => { }
    });
  }

  const renderGridItem = (data: Project) => {
    if (!data) return;
    return (
      <div className="col-12 md:col-6 p-1">
        <ProjectCard data={data} deleteData={deleteData} />
      </div>
    );
  }

  const getStatus = (data: any) => {
    if (data.latest_proj_status && Object.keys(data.latest_proj_status).length) {
      return data?.latest_proj_status?.descr
    }
    else if (data.status && Object.keys(data.status).length) {
      return data?.status?.descr
    }
    else return "NA"
  }

  useEffect(() => {
    setCustomProjectStatus([
      { key: null, descr: "All" },
      ...projectStatuses || []
    ])
  }, [projectStatuses])

  const customDiscard = () => {
    setShowModal(false)
  }


  useEffect(() => {
    dispatch(setSelectedProjectReducer(null))
  }, []);

  return (
    <>
      <Divider />
      <div className="flex" style={{ width: '100%' }}>
        <div className="field col-5">
          <label className={'col-4'}>Search Project</label>
          <Dropdown
            style={{ width: '60%' }}
            value={selectedProject}
            onFilter={(e) => setSearchFilter(e.filter)}
            onChange={(e) => dispatch(setSelectedProjectReducer(e.value))}
            options={projects || []}
            optionLabel="name"
            optionValue="key"
            placeholder="Search"
            showClear
            filter
            filterBy="name"
            // className="w-full"
          />
        </div>

        {/* Status Filter */}
        <div className="field flex col-5">
          <label className={'col-4'}>Status</label>
          <div style={{ display: 'flex', flexDirection: 'column', paddingTop: 0, width: '60%' }}>
            <Dropdown
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.value);
                setPage(1);
              }}
              options={customProjectStatus || []}
              optionLabel="descr"
              optionValue="key"
              placeholder="All"
              showClear
              // className="w-full"
            />
          </div>
        </div>
        {/* Create Project Button */}
          <CreateButton to="/projects/project/new" label="Project"  col={2}/>
      </div>

      <ListLayout
        pagination={{
          pageSize: size,
          loading: isLoading || isFetchingSelectedProject,
          currentPage: page,
          total: selectedProject ? 1 : searchFilter ? filteredData?.length : data?.count,
          onChange: (page, size) => {
            setPage(page);
            setSize(size)
          }
        }}
        // enableView
        // onViewClick={(key: any) => {
        //   setShowModal(true)
        //   dispatch(setSelectedProjectReducer(key))
        // }}
        editLabel='Open'
        customEditOnClick={(value: any) => {
          navigate(`/projects/project/detail`)
          dispatch(setSelectedProjectReducer(value.key))
        }}
        baseRoute="/projects/project"
        description="Project"
        isLoading={isLoading || isDeleting || isFetchingSelectedProject}
        data={selectedProjectData ? [selectedProjectData] : filteredData}
        // showGridView
        showHeader
        newTable
        hideAddButton
        showExport={"projects"}
        gridTileRenderer={renderGridItem}
        deleteAction={deleteAction}>
        {/* <Datacolumn field="id" header="Project Code" filteringType="text" /> */}
        <Datacolumn field="name" width={"15%"} header="Project Name" filteringType="text" />
        {/* <Datacolumn field="cityname" header="State/City" filteringType="text"
          displayValueGetter={(row) => `${row?.state?.id || ""}${row?.state?.id ? "/" : ""}${row?.city?.name || ""}`} /> */}

        {/* <Datacolumn field="pro_type.descr" header="Project Type" filteringType="text" /> */}
        <Datacolumn field="no_of_blocks" width={"8%"} header="Blocks" defaultValue={0} align={"right"} type="number" filteringType="number" />
        <Datacolumn field="no_of_units" width={"8%"} header="Units" defaultValue={0} align={"right"} type="number" filteringType="number" />
        {/* <Datacolumn field="streetname" header="Street Name" defaultValue={''} align={"right"} type="text" filteringType="number" /> */}
        <Datacolumn field="addr1" header="Address" defaultValue={''} align={"right"} type="text" filteringType="number" />
        {/* <Datacolumn field="cityname" header="City" filteringType="text"
          displayValueGetter={(row) => `${row?.city?.name || ""}`} /> */}
        {/* <Datacolumn field="pincode" header="Pincode" defaultValue={''} align={"right"} type="number" filteringType="number" /> */}
        <Datacolumn field="latest_proj_status.descr" width={"10%"} displayValueGetter={getStatus} header="Status" filteringType="text" align={'center'} alignHeader='center' headerStyle={{ justifyContent: 'center' }}
          defaultValue="N/A" />
      </ListLayout>

      <ViewModal displayModal={showModal} projectId={selectedProject} customDiscard={customDiscard} />
    </>
  );
}

export default Projects;