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

  // Mock data for project-wise follow-up summary
  // In a real application, this would come from an API
  const generateMockFollowUpData = () => {
    if (!projects || projects.length === 0) return [];

    return projects.map((project: any) => ({
      project_key: project.key,
      project_name: project.name,
      total_followup: Math.floor(Math.random() * 50) + 20, // 20-70 follow-ups
      followups_due: Math.floor(Math.random() * 15) + 5, // 5-20 due
      followups_completed: Math.floor(Math.random() * 30) + 10, // 10-40 completed
      rescheduled_followups: Math.floor(Math.random() * 10) + 2, // 2-12 rescheduled
      need_time_to_decide: Math.floor(Math.random() * 8) + 1, // 1-9 need time
      active_followup: Math.floor(Math.random() * 25) + 8, // 8-33 active
    }));
  };

  const followUpData = generateMockFollowUpData();

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
        total: followUpData?.length || 0,
        onChange: handlePageChange
      }}
      baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
      title={PAGE_NAME}
      description="Project-wise follow up summary and analytics"
      hideAddButton
      hideActionColumn
      isLoading={isLoading}
      data={followUpData || []}
      newTable
      showHeader
    >
      <Datacolumn field="project_name" header="Project Name" filteringType='text' />
      <Datacolumn field="total_followup" header="Total Follow Up" filteringType='text' />
      <Datacolumn field="followups_due" header="Follow Ups Due" filteringType='text' />
      <Datacolumn field="followups_completed" header="Follow Ups Completed" filteringType='text' />
      <Datacolumn field="rescheduled_followups" header="Rescheduled Follow Ups" filteringType='text' />
      <Datacolumn field="need_time_to_decide" header="Need Time to Decide" filteringType='text' />
      <Datacolumn field="active_followup" header="Active Follow Up" filteringType='text' />
    </ListLayout>
  );
}

export default Main