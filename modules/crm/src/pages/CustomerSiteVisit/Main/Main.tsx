import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { Card } from 'primereact/card';
import { useActiveProjectQuery } from '@igblsln/store';
import { PAGE_SIZE } from '@igblsln/store';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import './index.scss';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE);

  // Fetch active projects data
  const { data: projects, isLoading } = useActiveProjectQuery();

  // Mock data for site visit summary cards
  const generateMockSummaryData = () => {
    return {
      siteVisitScheduled: Math.floor(Math.random() * 50) + 20, // 20-70 scheduled
      siteVisitCompleted: Math.floor(Math.random() * 40) + 15, // 15-55 completed
      reSiteVisitScheduled: Math.floor(Math.random() * 20) + 5, // 5-25 rescheduled
    };
  };

  // Mock data for site visit table
  const generateMockSiteVisitData = () => {
    if (!projects || projects.length === 0) return [];

    const visitStatuses = ['Scheduled', 'Completed', 'Rescheduled', 'Cancelled', 'In Progress'];
    const visitTypes = ['Initial Visit', 'Follow-up', 'Final Inspection', 'Client Meeting'];

    return Array.from({ length: 50 }, (_, index) => {
      const project = projects[index % projects.length];
      return {
        id: index + 1,
        lead_name: `Lead ${Math.floor(Math.random() * 1000) + 1000}`,
        contact: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        project_name: project.name,
        visit_date: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        visit_status: visitStatuses[Math.floor(Math.random() * visitStatuses.length)],
        visit_type: visitTypes[Math.floor(Math.random() * visitTypes.length)],
      };
    });
  };

  const summaryData = generateMockSummaryData();
  const siteVisitData = generateMockSiteVisitData();

  const handlePageChange = (page: number, size: number) => {
    setPage(page);
    setSize(size);
  };

  return (
    <div className="site-visit-page">
      {/* Summary Cards Section */}
      <div className="summary-cards-section">
        <div className="grid">
          <div className="col-4 p-2">
            <Card className="summary-card shadow-4">
              <div className="summary-card-content">
                <h3 className="summary-value text-blue-500">{summaryData.siteVisitScheduled}</h3>
                <p className="summary-label">Site Visit Scheduled</p>
                <p className="summary-subtitle">Upcoming visits</p>
              </div>
            </Card>
          </div>
          <div className="col-4 p-2">
            <Card className="summary-card shadow-4">
              <div className="summary-card-content">
                <h3 className="summary-value text-green-500">{summaryData.siteVisitCompleted}</h3>
                <p className="summary-label">Site Visit Completed</p>
                <p className="summary-subtitle">Successfully done</p>
              </div>
            </Card>
          </div>
          <div className="col-4 p-2">
            <Card className="summary-card shadow-4">
              <div className="summary-card-content">
                <h3 className="summary-value text-orange-500">{summaryData.reSiteVisitScheduled}</h3>
                <p className="summary-label">Re-Site Visit Scheduled</p>
                <p className="summary-subtitle">Follow-up visits</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Site Visit Table Section */}
      <div className="site-visit-table-section">
        <ListLayout
          pagination={{
            pageSize: size,
            loading: isLoading,
            currentPage: page,
            total: siteVisitData?.length || 0,
            onChange: handlePageChange
          }}
          baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
          title={PAGE_NAME}
          description="Customer site visit schedules and status tracking"
          hideAddButton
          hideActionColumn
          isLoading={isLoading}
          data={siteVisitData || []}
          newTable
          showHeader
        >
          <Datacolumn field="lead_name" header="Lead Name" filteringType='text' />
          <Datacolumn field="contact" header="Contact" filteringType='text' />
          <Datacolumn field="project_name" header="Project Name" filteringType='text' />
          <Datacolumn field="visit_date" header="Visit Date" filteringType='text' />
          <Datacolumn field="visit_status" header="Visit Status" filteringType='text' />
          <Datacolumn field="visit_type" header="Visit Type" filteringType='text' />
        </ListLayout>
      </div>
    </div>
  );
}

export default Main