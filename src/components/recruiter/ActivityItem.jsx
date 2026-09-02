import React from 'react';

const ActivityItem = ({ activity, isLast }) => {
  const getDotColor = (type) => {
    switch (type) {
      case 'candidate_match':
        return 'var(--accent-primary)';
      case 'bias_audit':
        return 'var(--accent-warning)';
      case 'status_update':
        return 'var(--accent-secondary)';
      case 'job_created':
        return 'var(--accent-success)';
      default:
        return 'var(--text-muted)';
    }
  };

  const dotColor = getDotColor(activity.type);

  return (
    <div className="activity-item">
      <div className="activity-dot-wrapper">
        <div 
          className="activity-dot" 
          style={{ 
            backgroundColor: dotColor, 
            boxShadow: `0 0 8px ${dotColor}` 
          }}
        />
        {!isLast && <div className="activity-line" />}
      </div>
      <div className="activity-content">
        <span className="activity-time">{activity.time}</span>
        <span className="activity-text">
          <strong>{activity.recruiter}</strong> completed <strong>{activity.action}</strong>: {activity.detail}
        </span>
      </div>
    </div>
  );
};

export default ActivityItem;
