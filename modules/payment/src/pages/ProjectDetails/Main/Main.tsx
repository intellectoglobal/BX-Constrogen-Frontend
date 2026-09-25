import React, { useState } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { Datacolumn, Datatable, ListLayout } from '@igblsln/control';
import { useActiveProjectQuery } from '@igblsln/store';
import { classNames } from "primereact/utils";
import { headerStyle1 } from '@igblsln/themes';
import { MultiSelect } from 'primereact/multiselect';
import { Link } from 'react-router-dom'
import { useListProjectPurchaseDetailsQuery } from '../projectDetailsApi';
import { PAGE_NAME } from '../constants';
// import './style.scss';

type Props = {}

const Main = (props: Props) => {
  const { data } = useActiveProjectQuery()

  const [selectedProjectName, setSelectedProjectName] = useState<any>('')
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)

  const { data: projectDetails, isFetching: isProjectDetailsFetching } = useListProjectPurchaseDetailsQuery({ projectId: selectedProjectKey?.map((d: any) => d.key) }, { skip: !selectedProjectKey })


  return (
    <>
      <div className='flex'>
        <h3 className={classNames('m-0 my-auto')} >{PAGE_NAME}</h3>
        {/* <Link
          to={`/projects`}
          style={{ textDecoration: "none", marginLeft: 'auto' }} >
          <Button label="Back" className="ml-3" />
        </Link> */}
      </div>

      <Divider />
      <div className="pl-5">
        <div className="field">
          <label className={classNames('col-2')}>Project</label>
          <MultiSelect
            value={selectedProjectKey}
            onChange={(e) => setSelectedProjectKey(e.value)}
            options={data}
            optionLabel="id"
            display="chip"
            placeholder="Select Projects"
            className="w-full md:w-20rem" />
          {/* <Dropdown
            style={{ width: '30%' }}
            optionLabel={"id"}
            optionValue={"key"}
            value={selectedProjectKey}
            filter
            multiple
            filterBy={"id"}
            onChange={(e) => {
              let projectName = data?.filter(d => d.key === e.value)[0].name
              setSelectedProjectName(projectName)
              setSelectedProjectKey(e.value)
            }}
            options={data}
          /> */}
        </div>
        {/* <div className="field">
          <label className={classNames('col-2')}>Project Name</label>
          <InputText style={{ width: '50%' }} value={selectedProjectName} disabled />
        </div> */}
      </div>

      <Divider />

      <ListLayout
        showExport={"projectdetails"}
        isLoading={isProjectDetailsFetching}
        data={projectDetails}
        emptyRowMessage={selectedProjectKey?.length ? "No Details Available For Selected Project" : "Select a Project To View"}
        newTable
      >
        <Datacolumn field="name" header="Project Name" filteringType='text' />
        <Datacolumn field="material_type" header="Material Type" filteringType='text' />
        <Datacolumn field="material" header="Material Cost" filteringType='text' />
        <Datacolumn field="total_cost" header="Total Cost" filteringType='text' />
      </ListLayout>

      {/* <Datatable
        showExport={"projectdetails"}
        loading={isProjectDetailsFetching}
        emptyMessage={<h3 className='text-center'>{selectedProjectKey ? "No Details Available For Selected Project" : "Select a Project To View"}</h3>}
        style={{ height: (projectDetails?.length || 1) * 100, minHeight: 150, maxHeight: 250, overflowX: 'auto', padding: 10, margin: 10 }}
        value={projectDetails}>
        <Column headerStyle={headerStyle1} bodyClassName="name" field="name" header="Project Name" sortable filter style={{ minWidth: '12rem' }} />
        <Column headerStyle={headerStyle1} bodyClassName="material_type" field="material_type" header="Material Type" sortable filter style={{ minWidth: '8rem' }} />
        <Column headerStyle={headerStyle1} bodyClassName="material" field="material" header="Material Cost" sortable filter style={{ minWidth: '8rem' }} />
        <Column headerStyle={headerStyle1} bodyClassName="total_cost" field="total_cost" header="Total Cost" sortable filter style={{ minWidth: '8rem' }} />
      </Datatable> */}

    </>


  );
}

export default Main