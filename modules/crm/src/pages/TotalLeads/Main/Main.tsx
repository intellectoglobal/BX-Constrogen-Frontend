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

  // Mock data for project-wise leads summary
  // In a real application, this would come from an API
  const generateMockLeadData = () => {
    if (!projects || projects.length === 0) return [];

    return projects.map((project: any) => ({
      project_key: project.key,
      project_name: project.name,
      total_leads: Math.floor(Math.random() * 100) + 50, // 50-150 leads
      new_leads_today: Math.floor(Math.random() * 10), // 0-9 new leads
      active_leads: Math.floor(Math.random() * 30) + 20, // 20-50 active leads
      closed_leads: Math.floor(Math.random() * 20) + 10, // 10-30 closed leads
      dropped_leads: Math.floor(Math.random() * 15) + 5, // 5-20 dropped leads
    }));
  };

  const leadData = generateMockLeadData();

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
        total: leadData?.length || 0,
        onChange: handlePageChange
      }}
      baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
      title="Total Leads"
      description="Project-wise lead summary and analytics"
      hideAddButton
      hideActionColumn
      isLoading={isLoading}
      data={leadData || []}
      newTable
      showHeader
    >
      <Datacolumn field="project_name" header="Project Name" filteringType='text' />
      <Datacolumn field="total_leads" header="Total Leads" filteringType='text' />
      <Datacolumn field="new_leads_today" header="New Leads (Today)" filteringType='text' />
      <Datacolumn field="active_leads" header="Active Leads" filteringType='text' />
      <Datacolumn field="closed_leads" header="Closed Leads" filteringType='text' />
      <Datacolumn field="dropped_leads" header="Dropped Leads" filteringType='text' />
    </ListLayout>
  );
}

export default Main