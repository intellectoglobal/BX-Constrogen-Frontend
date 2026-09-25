import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { useActiveProjectQuery } from '@igblsln/store';
import { PAGE_SIZE } from '@igblsln/store';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE);

  // Fetch active projects data
  const { data: projects, isLoading } = useActiveProjectQuery();

  // Mock data for project-wise call status analytics
  const generateMockCallData = () => {
    if (!projects || projects.length === 0) return [];

    return projects.map((project: any) => ({
      project_key: project.key,
      project_name: project.name,
      calls_connected: Math.floor(Math.random() * 100) + 50, // 50-150 connected calls
      rnr: Math.floor(Math.random() * 30) + 10, // 10-40 RNR
      line_busy: Math.floor(Math.random() * 20) + 5, // 5-25 line busy
      un_answered: Math.floor(Math.random() * 25) + 8, // 8-33 unanswered
      irrelevant: Math.floor(Math.random() * 15) + 3, // 3-18 irrelevant
    }));
  };

  const callData = generateMockCallData();

  const handlePageChange = (page: number, size: number) => {
    setPage(page);
    setSize(size);
  };

  return (
    <ListLayout
      pagination={{
        pageSize: size,
        loading: isLoading,
        currentPage: page,
        total: callData?.length || 0,
        onChange: handlePageChange
      }}
      baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
      title={PAGE_NAME}
      description="Project-wise call status and connection analytics"
      hideAddButton
      hideActionColumn
      isLoading={isLoading}
      data={callData || []}
      newTable
      showHeader
    >
      <Datacolumn field="project_name" header="Project Name" filteringType='text' />
      <Datacolumn field="calls_connected" header="Calls Connected" filteringType='text' />
      <Datacolumn field="rnr" header="RNR" filteringType='text' />
      <Datacolumn field="line_busy" header="Line Busy" filteringType='text' />
      <Datacolumn field="un_answered" header="Un Answered" filteringType='text' />
      <Datacolumn field="irrelevant" header="Irrelevant" filteringType='text' />
    </ListLayout>
  );
}

export default Main