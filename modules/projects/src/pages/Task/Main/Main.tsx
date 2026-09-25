import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { newTableDefaultStyle } from '@igblsln/themes';
import { useDeleteTaskMutation, useListTaskQuery } from '../taskApi';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { useListProjectQuery } from '../../Projects/apis';

type Props = {}

const Main = (props: Props) => {

  const { data: projects, isFetching: projectsFetching } = useListProjectQuery({});
  const [selectedProject, setSelectedProject] = useState<any>(null)

  const { data, isFetching } = useListTaskQuery({ projectId: selectedProject }, { skip: !selectedProject })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteTaskMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();


  return (
    <>
      <ListLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME}
        isLoading={projectsFetching}
        data={projects?.results}
        newTable
        showHeader
        tableLayoutClass='none'
        gridProps={{
          style: {
            ...newTableDefaultStyle,
            margin: '0 30px 20px',
            border: 'none',
            cursor: 'pointer'
          },
          onRowClick: (row: any) => { setSelectedProject(row.key) },
          rowClass: (row: any) => ((row.key == selectedProject) ? 'selectedrow' : undefined),
        }}
        allowFilters={false}
        hideActionColumn={true}
      >
        <Datacolumn field="name" header="Project Name" type='text' />
        <Datacolumn field="cityname" header="State/City" filteringType="text" displayValueGetter={(row) => `${row.state.id}/${row.city.name}`} />
        <Datacolumn field="pro_type.descr" header="Project Type" filteringType="text" />
        <Datacolumn field="no_of_units" header="Total Units" defaultValue={0} align={"right"} type="number" filteringType="number" />
      </ListLayout>

      <ListLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isFetching || isDeleting}
        data={data?.results}
        deleteAction={deleteAction}
        // actionBodyTemplate={(value)=>defaultActionBodyTemplate(value,selectedProject)}
        navKey={'proj_key'}
        newTable
        emptyRowMessage={selectedProject ? "No Task For Selected Project" : "Select a Project To View" }
      >
        <Datacolumn field="id" header="Task" filteringType='text' />
        <Datacolumn field="descr" header="Task Description" filteringType='text' />
        <Datacolumn field="stage.id" header="Stage" filteringType='text' />
        <Datacolumn field="stage.descr" header="Stage Description" filteringType='text' />
        <Datacolumn field="stage.work.id" header="Phase" filteringType='text' />
        <Datacolumn field="stage.work.descr" header="Phase Description" filteringType='text' />
      </ListLayout>
    </>

  );
}

export default Main