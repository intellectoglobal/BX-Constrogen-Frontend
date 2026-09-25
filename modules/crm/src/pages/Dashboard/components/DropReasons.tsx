import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import './DropReasons.scss';

const DropReasons: React.FC = () => {
  // Mock drop reasons data - this would come from API in real implementation
  const dropReasons = [
    {
      id: 1,
      reason: 'Not Interested',
      count: 42,
      percentage: 35,
      icon: 'pi pi-times-circle'
    },
    {
      id: 2,
      reason: 'Budget Mismatch',
      count: 28,
      percentage: 23,
      icon: 'pi pi-dollar'
    },
    {
      id: 3,
      reason: 'Location Mismatch',
      count: 20,
      percentage: 17,
      icon: 'pi pi-map-marker'
    },
    {
      id: 4,
      reason: 'Square Feet Mismatch',
      count: 15,
      percentage: 12,
      icon: 'pi pi-arrows-h'
    },
    {
      id: 5,
      reason: 'Road Facing Requirement',
      count: 10,
      percentage: 8,
      icon: 'pi pi-road'
    },
    {
      id: 6,
      reason: 'Casual Enquiry',
      count: 5,
      percentage: 4,
      icon: 'pi pi-question-circle'
    },
    {
      id: 7,
      reason: 'Resale Property Request',
      count: 1,
      percentage: 1,
      icon: 'pi pi-home'
    }
  ];

  // Calculate total drops
  const totalDrops = dropReasons.reduce((sum, reason) => sum + reason.count, 0);

  return (
    <Card title="Drop Reasons" subTitle="Lead drop-off analysis by reason" className="shadow-4 drop-reasons-card">
      {/* Total Drops Badge - aligned to top-right */}
      <div className="total-drops-badge">
        <span className="total-drops-value">{totalDrops}</span>
        <span className="badge-label">Total Drops</span>
      </div>

      {/* Drop Reasons Table */}
      <div className="drop-reasons-table">
        <div className="table-header">
          <div className="header-cell reason">Reason</div>
          <div className="header-cell count">Count</div>
          <div className="header-cell percentage">Percentage</div>
        </div>

        <div className="table-body">
          {dropReasons.map((reason) => (
            <div key={reason.id} className="table-row">
              <div className="cell reason">
                <i className={`pi ${reason.icon} reason-icon`} />
                <span className="reason-text">{reason.reason}</span>
              </div>
              <div className="cell count">
                <Tag severity="info" value={reason.count} className="count-tag" />
              </div>
              <div className="cell percentage">
                <Tag severity="success" value={`${reason.percentage}%`} className="percentage-tag" />
              </div>
            </div>
          ))}

          {/* Summary Row */}
          <div className="table-row summary-row">
            <div className="cell reason summary-cell">
              <strong>Total</strong>
            </div>
            <div className="cell count summary-cell">
              <Tag severity="info" value={totalDrops} className="count-tag" />
            </div>
            <div className="cell percentage summary-cell">
              <Tag severity="success" value="100%" className="percentage-tag" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DropReasons;