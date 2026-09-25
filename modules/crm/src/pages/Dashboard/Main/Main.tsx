import React, { useMemo, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ListLayout, Datacolumn, useToast } from "@igblsln/control";
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import { Tooltip } from 'primereact/tooltip';
import {
  useGetDashboardDataQuery,
} from "../api";
import { PAGE_NAME, PAGE_ROUTE } from "../constants";
import { MODULE_NAME } from '../../../constants';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { FollowUp } from "../../FollowUps/api";
import { SiteVisit } from '../../SiteVisits/api';
import SiteVisitEditModal from "../../SiteVisits/ManageModal";
import FollowUpsEditModal from "../../FollowUps/ManageModal";
import FollowUpsCommentsModal from "../../FollowUps/Modals/CommentsModal";
import SiteVisitCommentsModal from "../../SiteVisits/CommentsModal";
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import './index.scss';
import WeeklyPerformanceComparison from "../components/WeeklyPerformanceComparison";
import PerformanceOverview from "../components/PerformanceOverview";
import UpcomingTasks from "../components/UpcomingTasks";
import DropReasons from "../components/DropReasons";

// Reuse the exact same card component structure as main dashboard
const renderCardContent = (
  value: number | undefined,
  color: string,
  label: string,
  redirectUrl: string,
  tooltipText: string,
  navigate: (path: string) => void
) => {
  return (
    <div className="text-center py-2">
      <Tooltip target={`.tooltip-${label}`} content={tooltipText} position="top" />
      <h3
        className={`text-4xl font-bold ${color} m-0 cursor-pointer tooltip-${label}`}
        onClick={() => navigate(redirectUrl)}
      >
        {value ?? 0}
      </h3>
      <p className="text-sm text-gray-600 mt-1 mb-0">{label}</p>
    </div>
  );
};

const Main: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const { data, isFetching: isLoadingDashboard } = useGetDashboardDataQuery();

  // State for pagination and modals
  const [followUpPage, setFollowUpPage] = useState(1);
  const [followUpSize, setFollowUpSize] = useState(10);
  const [siteVisitPage, setSiteVisitPage] = useState(1);
  const [siteVisitSize, setSiteVisitSize] = useState(10);
  const [showFollowUpEditModal, setShowFollowUpEditModal] = useState(false);
  const [showSiteVisitEditModal, setShowSiteVisitEditModal] = useState(false);
  const [showFollowupCommentsModal, setShowFollowUpCommentsModal] = useState(false);
  const [showSiteVistCommentsModal, setShowSiteVistCommentsModal] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'followups' | 'sitevisits' | 'all'>('all');

  // Memoized dashboard data
  const dashboard = useMemo(() => data, [data]);

  // Chart data using same color scheme as main dashboard
  const [leadStatusChartData] = useState({
    labels: ['New', 'Contacted', 'Qualified', 'Closed'],
    datasets: [
      {
        data: [30, 25, 20, 15],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',  // Indigo - same as main dashboard
          'rgba(59, 130, 246, 0.8)',  // Blue - same as main dashboard
          'rgba(34, 197, 94, 0.8)',   // Green - same as main dashboard
          'rgba(251, 146, 60, 0.8)'   // Orange - same as main dashboard
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 146, 60)'
        ],
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  });

  // Chart options - same as main dashboard
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            family: 'Roboto, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        }
      }
    }
  };

  // Event handlers
  const handleFollowUpPageChange = (page: number, size: number) => {
    setFollowUpPage(page);
    setFollowUpSize(size);
  };

  const handleSiteVisitPageChange = (page: number, size: number) => {
    setSiteVisitPage(page);
    setSiteVisitSize(size);
  };

  const handleFollowUpsEditClick = (row: any) => {
    setSelectedData(row);
    setShowFollowUpEditModal(true);
  };
  const handleSiteVisitEditClick = (row: any) => {
    setSelectedData(row);
    setShowSiteVisitEditModal(true);
  };

  const handleFollowUpCommentsClick = (row: any) => {
    setSelectedData(row);
    setShowFollowUpCommentsModal(true);
  };
  const handlesiteVisitCommentsClick = (row: any) => {
    setSelectedData(row);
    setShowSiteVistCommentsModal(true);
  };

  // Export functionality
  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();

      // Export FollowUps data
      if (exportType === 'followups' || exportType === 'all') {
        const followUpsData = dashboard?.today_followups || [];
        if (followUpsData.length > 0) {
          const followUpSheet = workbook.addWorksheet("FollowUps");

          followUpSheet.columns = [
            { header: "Lead Name", key: "lead_name" },
            { header: "Contact", key: "contact_1" },
            { header: "Status", key: "status_name" },
            { header: "Lead Status", key: "lead_status" },
            { header: "Follow Up Date", key: "last_followup_date" }
          ];

          followUpsData.forEach((followUp: any) => {
            followUpSheet.addRow({
              lead_name: followUp.lead_name || '',
              contact_1: followUp.contact_1 || '',
              status_name: followUp.status?.name || '',
              lead_status: followUp.lead_status || '',
              last_followup_date: followUp.last_followup_date || ''
            });
          });
        }
      }

      // Export SiteVisits data
      if (exportType === 'sitevisits' || exportType === 'all') {
        const siteVisitsData = dashboard?.today_site_visits || [];
        if (siteVisitsData.length > 0) {
          const siteVisitSheet = workbook.addWorksheet("SiteVisits");

          siteVisitSheet.columns = [
            { header: "Lead Name", key: "lead_name" },
            { header: "Contact", key: "contact_1" },
            { header: "Property Name", key: "project_name" },
            { header: "Status", key: "status_name" },
            { header: "Lead Status", key: "lead_status" },
            { header: "Visit Date", key: "visit_date" }
          ];

          siteVisitsData.forEach((siteVisit: any) => {
            siteVisitSheet.addRow({
              lead_name: siteVisit.lead_name || '',
              contact_1: siteVisit.contact_1 || '',
              project_name: siteVisit.project_name || '',
              status_name: siteVisit.status?.name || '',
              lead_status: siteVisit.lead_status || '',
              visit_date: siteVisit.visit_date || ''
            });
          });
        }
      }

      // Export Summary data
      if (exportType === 'all') {
        const summarySheet = workbook.addWorksheet("Summary");

        summarySheet.columns = [
          { header: "Metric", key: "metric" },
          { header: "Value", key: "value" },
          { header: "Details", key: "details" }
        ];

        summarySheet.addRow({
          metric: "Total Leads",
          value: dashboard?.total_leads || 0,
          details: "Overall lead count"
        });

        summarySheet.addRow({
          metric: "Active Properties",
          value: dashboard?.active_properties || 0,
          details: "Currently active properties"
        });

        summarySheet.addRow({
          metric: "Visits (Next 7 Days)",
          value: dashboard?.visits || 0,
          details: "Scheduled visits"
        });

        summarySheet.addRow({
          metric: "Conversion Rate",
          value: dashboard?.conversion_rate || 0,
          details: "Current conversion rate"
        });
      }

      // Style the workbook
      workbook.worksheets.forEach((sheet) => {
        sheet.getRow(1).font = { bold: true };
        sheet.columns.forEach((col) => {
          col.width = 25;
        });
      });

      // Download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `CRM_Dashboard_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess("Export Successful", "Dashboard data exported successfully");
      setShowExportModal(false);

    } catch (error) {
      showError("Export Failed", "Failed to export dashboard data");
      console.error("Export error:", error);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Dashboard Header - same style as main dashboard */}
        <div className="dashboard-header">
          <h2 className="dashboard-title text-2xl">
            CRM Dashboard
          </h2>
        </div>

        {/* First Row: 4 KPI Cards - same structure as main dashboard */}
        <div className="grid">
          <div className="col-3 p-2 metric-card">
            <Card title="Total Leads" subTitle="All Leads" className="shadow-4">
              {renderCardContent(
                dashboard?.total_leads,
                "text-green-500",
                "Total Leads",
                `/${MODULE_NAME}/total-leads`,
                "Click to view project-wise lead summary",
                navigate
              )}
            </Card>
          </div>
          <div className="col-3 p-2 metric-card">
            <Card title="Active Leads" subTitle="Open & Potential" className="shadow-4">
              {renderCardContent(
                dashboard?.active_properties,
                "text-blue-500",
                "Active Leads",
                `/${MODULE_NAME}/activefollowup`,
                "Click to view active leads",
                navigate
              )}
            </Card>
          </div>
          <div className="col-3 p-2 metric-card">
            <Card title="Follow-ups Due" subTitle="Today's Follow-ups" className="shadow-4">
              {renderCardContent(
                dashboard?.today_followups?.length,
                "text-orange-500",
                "Follow-ups Due",
                `/${MODULE_NAME}/project-followup`,
                "Click to view project-wise follow-up summary",
                navigate
              )}
            </Card>
          </div>
          <div className="col-3 p-2 metric-card">
            <Card title="Site Visits" subTitle="Scheduled Visits" className="shadow-4">
              {renderCardContent(
                dashboard?.today_site_visits?.length,
                "text-purple-500",
                "Site Visits",
                `/${MODULE_NAME}/customer-site-visit`,
                "Click to view customer site visit schedules and status tracking",
                navigate
              )}
            </Card>
          </div>
        </div>

        {/* Quick Actions Section - same style as main dashboard */}
        <div className="quick-actions-section">
          <h2 className="text-2xl font-bold quick-actions-title">Quick Actions</h2>

          <div className="grid">
            <div className="col-3 p-2">
              <Card className="shadow-1 cursor-pointer quick-card" onClick={() => navigate(`/${MODULE_NAME}/leads`)}>
                <div className="flex flex-column align-items-center justify-content-center h-full py-4">
                  <h3 className="m-0 text-xl font-bold">Leads</h3>
                  <p className="m-0 text-sm muted-text">Manage Leads</p>
                </div>
              </Card>
            </div>
            <div className="col-3 p-2">
              <Card className="shadow-1 cursor-pointer quick-card" onClick={() => navigate(`/${MODULE_NAME}/followups`)}>
                <div className="flex flex-column align-items-center justify-content-center h-full py-4">
                  <h3 className="m-0 text-xl font-bold">Follow-ups</h3>
                  <p className="m-0 text-sm muted-text">Manage Follow-ups</p>
                </div>
              </Card>
            </div>
            <div className="col-3 p-2">
              <Card className="shadow-1 cursor-pointer quick-card" onClick={() => navigate(`/${MODULE_NAME}/tasks`)}>
                <div className="flex flex-column align-items-center justify-content-center h-full py-4">
                  <h3 className="m-0 text-xl font-bold">Tasks</h3>
                  <p className="m-0 text-sm muted-text">Manage Tasks</p>
                </div>
              </Card>
            </div>
            <div className="col-3 p-2">
              <Card className="shadow-1 cursor-pointer quick-card" onClick={() => navigate(`/${MODULE_NAME}/sitevisits`)}>
                <div className="flex flex-column align-items-center justify-content-center h-full py-4">
                  <h3 className="m-0 text-xl font-bold">Site Visits</h3>
                  <p className="m-0 text-sm muted-text">Manage Site Visits</p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Analytics Section - same chart styles as main dashboard */}
        <div className="grid">
          <div className="col-6 p-2 chart-card">
            <Card title="Call Status Distribution" subTitle="Current Status Overview" className="shadow-4 cursor-pointer" onClick={() => navigate(`/${MODULE_NAME}/call-status`)}>
              <div className="chart-wrapper">
                <Chart type="doughnut" data={leadStatusChartData} options={pieChartOptions} />
              </div>
            </Card>
          </div>
          <div className="col-6 p-2 chart-card">
            <WeeklyPerformanceComparison />
          </div>
        </div>

        {/* Performance Overview Section - replaces old KPI cards */}
        <PerformanceOverview />

        {/* Upcoming Tasks and Drop Reasons Cards - two cards per row */}
        <div className="grid">
          <div className="col-6 p-2">
            <UpcomingTasks />
          </div>
          <div className="col-6 p-2">
            <DropReasons />
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <Dialog
            header="Export Dashboard Data"
            visible={showExportModal}
            style={{ width: '40vw' }}
            onHide={() => setShowExportModal(false)}
          >
            <div className="field mb-3">
              <label htmlFor="exportType" className="block mb-2">Select data to export:</label>
              <Dropdown
                id="exportType"
                value={exportType}
                options={[
                  { label: 'All Data', value: 'all' },
                  { label: 'FollowUps Only', value: 'followups' },
                  { label: 'SiteVisits Only', value: 'sitevisits' }
                ]}
                onChange={(e) => setExportType(e.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div className="flex justify-content-end gap-2">
              <Button
                label="Cancel"
                className="p-button-secondary"
                onClick={() => setShowExportModal(false)}
              />
              <Button
                label="Export"
                icon="pi pi-file-export"
                onClick={exportToExcel}
              />
            </div>
          </Dialog>
        )}

        {/* Modals */}
        {showFollowUpEditModal && (
          <FollowUpsEditModal
            id={selectedData?.key}
            displayModal={showFollowUpEditModal}
            customDiscard={() => setShowFollowUpEditModal(false)}
          />
        )}
        {showSiteVisitEditModal && (
          <SiteVisitEditModal
            id={selectedData?.key}
            displayModal={showSiteVisitEditModal}
            customDiscard={() => setShowSiteVisitEditModal(false)}
          />
        )}

        {showFollowupCommentsModal && (
          <FollowUpsCommentsModal
            id={selectedData?.key}
            displayModal={showFollowupCommentsModal}
            customDiscard={() => setShowFollowUpCommentsModal(false)}
          />
        )}
        {showSiteVistCommentsModal && (
          <SiteVisitCommentsModal
            id={selectedData?.key}
            displayModal={showSiteVistCommentsModal}
            customDiscard={() => setShowSiteVistCommentsModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Main;
