import React from 'react';
import { Card } from 'primereact/card';
import './WeeklyPerformanceComparison.scss';

// Define the data structure for weekly performance
interface WeeklyPerformanceData {
  day: string;
  lastWeek: number;
  currentWeek: number;
  change: number;
}

// Weekly Performance Comparison Component
const WeeklyPerformanceComparison: React.FC = () => {
  // Sample data - this would come from API in real implementation
  const weeklyData: WeeklyPerformanceData[] = [
    { day: 'Mon', lastWeek: 12, currentWeek: 15, change: 3 },
    { day: 'Tue', lastWeek: 18, currentWeek: 22, change: 4 },
    { day: 'Wed', lastWeek: 14, currentWeek: 18, change: 4 },
    { day: 'Thu', lastWeek: 20, currentWeek: 25, change: 5 },
    { day: 'Fri', lastWeek: 25, currentWeek: 30, change: 5 },
    { day: 'Sat', lastWeek: 8, currentWeek: 12, change: 4 },
    { day: 'Sun', lastWeek: 10, currentWeek: 10, change: 0 },
  ];

  // Calculate totals
  const totalLastWeek = weeklyData.reduce((sum, day) => sum + day.lastWeek, 0);
  const totalCurrentWeek = weeklyData.reduce((sum, day) => sum + day.currentWeek, 0);
  const totalChange = totalCurrentWeek - totalLastWeek;

  // Format change with + sign for positive values
  const formatChange = (value: number) => {
    return value > 0 ? `+${value}` : value.toString();
  };

  // Get change color class based on value
  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <Card title="Weekly Performance" subTitle="Last Week vs Current Week Comparison" className="shadow-4 weekly-performance-card">
      <div className="weekly-performance-table">
        <div className="table-header">
          <div className="header-cell day-cell">Day</div>
          <div className="header-cell">Last Week</div>
          <div className="header-cell">Current Week</div>
          <div className="header-cell change-cell">Change</div>
        </div>

        <div className="table-body">
          {weeklyData.map((data, index) => (
            <div key={index} className="table-row">
              <div className="table-cell day-cell">{data.day}</div>
              <div className="table-cell muted-value">{data.lastWeek}</div>
              <div className="table-cell primary-value">{data.currentWeek}</div>
              <div className={`table-cell change-cell ${getChangeColor(data.change)}`}>
                {formatChange(data.change)}
              </div>
            </div>
          ))}
        </div>

        <div className="table-footer">
          <div className="footer-cell day-cell">Total</div>
          <div className="footer-cell muted-value">{totalLastWeek}</div>
          <div className="footer-cell primary-value">{totalCurrentWeek}</div>
          <div className={`footer-cell change-cell ${getChangeColor(totalChange)}`}>
            {formatChange(totalChange)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeeklyPerformanceComparison;