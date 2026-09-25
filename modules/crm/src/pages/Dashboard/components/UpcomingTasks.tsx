import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { useNavigate } from 'react-router-dom';
import { MODULE_NAME } from '../../../constants';
import './UpcomingTasks.scss';

const UpcomingTasks: React.FC = () => {
  const navigate = useNavigate();

  // Mock task data - this would come from API in real implementation
  const tasks = [
    {
      id: 1,
      title: 'Follow up with Acme Corp',
      due: 'Today 2:00 PM',
      completed: false,
      relatedLead: 'Acme Corporation',
      priority: 'High',
      status: 'Pending'
    },
    {
      id: 2,
      title: 'Prepare proposal for XYZ Ltd',
      due: 'Due Tomorrow',
      completed: false,
      relatedLead: 'XYZ Limited',
      priority: 'Medium',
      status: 'In Progress'
    },
    {
      id: 3,
      title: 'Review contract documents',
      due: 'Due in 2 Days',
      completed: false,
      relatedLead: 'Global Enterprises',
      priority: 'High',
      status: 'Pending'
    },
    {
      id: 4,
      title: 'Schedule site visit',
      due: 'Due in 3 Days',
      completed: false,
      relatedLead: 'Tech Solutions Inc',
      priority: 'Low',
      status: 'Not Started'
    },
    {
      id: 5,
      title: 'Client meeting preparation',
      due: 'Due in 5 Days',
      completed: false,
      relatedLead: 'Innovative Systems',
      priority: 'Medium',
      status: 'In Progress'
    }
  ];

  const handleViewAllTasks = () => {
    navigate(`/${MODULE_NAME}/tasks`);
  };

  return (
    <Card title="Upcoming Tasks" subTitle="Scheduled and upcoming tasks" className="shadow-4 upcoming-tasks-card">
      <div className="upcoming-tasks-container">
        {/* Scrollable task list */}
        <div className="tasks-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-item">
              <div className="task-checkbox">
                <Checkbox
                  checked={task.completed}
                  onChange={() => {}}
                  disabled={true}
                />
              </div>
              <div className="task-details">
                <div className="task-title">{task.title}</div>
                <div className="task-due muted-text">{task.due}</div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Tasks button */}
        <div className="view-all-container">
          <Button
            label="View All Tasks"
            className="p-button-text view-all-button"
            onClick={handleViewAllTasks}
          />
        </div>
      </div>
    </Card>
  );
};

export default UpcomingTasks;