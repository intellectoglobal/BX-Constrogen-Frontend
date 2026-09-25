import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE);

  // Mock task data - this would come from API in real implementation
  const generateMockTaskData = () => {
    const statuses = ['Pending', 'In Progress', 'Completed', 'Overdue', 'Not Started'];
    const priorities = ['High', 'Medium', 'Low'];
    const leads = ['Acme Corporation', 'XYZ Limited', 'Global Enterprises', 'Tech Solutions Inc', 'Innovative Systems', 'Blue Sky Ventures', 'Summit Partners', 'Horizon Builders'];

    const tasks = [];
    for (let i = 1; i <= 50; i++) {
      tasks.push({
        id: i,
        task_name: `Task ${i}`,
        related_lead: leads[Math.floor(Math.random() * leads.length)],
        due_date: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        created_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    return tasks;
  };

  const taskData = generateMockTaskData();

  const handlePageChange = (page: number, size: number) => {
    setPage(page);
    setSize(size);
  };

  return (
    <ListLayout
      pagination={{
        pageSize: size,
        loading: false,
        currentPage: page,
        total: taskData.length,
        onChange: handlePageChange
      }}
      baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
      title={PAGE_NAME}
      description="All scheduled and upcoming tasks"
      hideAddButton
      hideActionColumn
      isLoading={false}
      data={taskData}
      newTable
      showHeader
    >
      <Datacolumn field="task_name" header="Task Name" filteringType='text' />
      <Datacolumn field="related_lead" header="Related Lead / Project" filteringType='text' />
      <Datacolumn field="due_date" header="Due Date" filteringType='date' />
      <Datacolumn field="priority" header="Priority" filteringType='text' />
      <Datacolumn field="status" header="Status" filteringType='text' />
    </ListLayout>
  );
};

export default Main
