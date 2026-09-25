import React from 'react';
import { Card } from 'primereact/card';
import { Tooltip } from 'primereact/tooltip';
import './PerformanceOverview.scss';

// Performance Overview Component
const PerformanceOverview: React.FC = () => {
  // Sample data - this would come from API in real implementation
  const performanceData = {
    conversionRate: 42.5,
    callsMade: 187,
    responseTime: '2.4h',
    dailyActivities: 48,
    monthlyTargetProgress: 78,
    agentPerformance: 89.2,
    responseTimeChange: '+12%',
    conversionRateChange: '+8%'
  };

  // Format change with + sign for positive values
  const formatChange = (value: string) => {
    return value.startsWith('+') ? value : value;
  };

  // Get change color class based on value
  const getChangeColor = (value: string) => {
    if (value.startsWith('+')) return 'text-green-500';
    if (value.startsWith('-')) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="performance-overview-section">
      {/* Section Header */}
      <div className="performance-header">
        <div className="header-content">
          <h2 className="performance-title text-2xl">Performance Overview</h2>
          <p className="performance-subtitle muted-text">Key performance indicators and metrics</p>
        </div>

        {/* Top KPI Summary - compact indicators aligned to the right */}
        <div className="top-kpi-summary">
          <div className="compact-kpi">
            <Tooltip target=".conversion-tooltip" content="Lead to Customer Conversion Rate" position="top" />
            <div className="compact-kpi-value text-green-500 conversion-tooltip">
              {performanceData.conversionRate}%
            </div>
            <div className="compact-kpi-label muted-text">Conversion Rate</div>
          </div>
          <div className="compact-kpi">
            <Tooltip target=".calls-tooltip" content="Total Calls Made Today" position="top" />
            <div className="compact-kpi-value text-blue-500 calls-tooltip">
              {performanceData.callsMade}
            </div>
            <div className="compact-kpi-label muted-text">Calls Made</div>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid - 2 rows */}
      <div className="grid performance-grid">
        {/* Lead Conversion Rate */}
        <div className="col-4 p-2">
          <Card title="Lead Conversion Rate" subTitle="Month-over-Month Performance" className="shadow-4 performance-card">
            <div className="performance-card-content">
              <div className="primary-kpi-value text-green-500">
                {performanceData.conversionRate}%
              </div>
              <div className={`performance-change ${getChangeColor(performanceData.conversionRateChange)}`}>
                {formatChange(performanceData.conversionRateChange)} vs last month
              </div>
            </div>
          </Card>
        </div>

        {/* Average Response Time */}
        <div className="col-4 p-2">
          <Card title="Average Response Time" subTitle="Customer Service Efficiency" className="shadow-4 performance-card">
            <div className="performance-card-content">
              <div className="primary-kpi-value text-orange-500">
                {performanceData.responseTime}
              </div>
              <div className={`performance-change ${getChangeColor(performanceData.responseTimeChange)}`}>
                {formatChange(performanceData.responseTimeChange)} improvement
              </div>
            </div>
          </Card>
        </div>

        {/* Agent Performance */}
        <div className="col-4 p-2">
          <Card title="Agent Performance" subTitle="Team Productivity Score" className="shadow-4 performance-card">
            <div className="performance-card-content">
              <div className="primary-kpi-value text-purple-500">
                {performanceData.agentPerformance}
              </div>
              <div className="performance-subtitle muted-text">
                Based on call quality and resolution rate
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Secondary KPI Cards Grid */}
      <div className="grid performance-grid">
        {/* Daily Activity Summary */}
        <div className="col-4 p-2">
          <Card title="Daily Activity Summary" subTitle="Today's CRM Activities" className="shadow-4 performance-card">
            <div className="performance-card-content">
              <div className="secondary-kpi-value text-blue-500">
                {performanceData.dailyActivities}
              </div>
              <div className="performance-subtitle muted-text">
                Tasks completed today
              </div>
            </div>
          </Card>
        </div>

        {/* Monthly Target Progress */}
        <div className="col-4 p-2">
          <Card title="Monthly Target Progress" subTitle="Sales Target Achievement" className="shadow-4 performance-card">
            <div className="performance-card-content">
              <div className="secondary-kpi-value text-green-500">
                {performanceData.monthlyTargetProgress}%
              </div>
              <div className="performance-subtitle muted-text">
                On track for monthly goals
              </div>
            </div>
          </Card>
        </div>

        {/* Placeholder for future expansion */}
        <div className="col-4 p-2">
          <Card title="Customer Satisfaction" subTitle="CSAT Score" className="shadow-4 performance-card">
            <div className="performance-card-content">
              <div className="secondary-kpi-value text-indigo-500">
                4.7
              </div>
              <div className="performance-subtitle muted-text">
                Average rating (5.0 scale)
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOverview;