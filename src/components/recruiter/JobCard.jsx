import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Sparkles, Calendar, ArrowUpRight } from 'lucide-react';

const JobCard = ({ job, onView }) => {
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'draft':
        return <span className="badge badge-warning">Draft</span>;
      default:
        return <span className="badge badge-cyan">{status}</span>;
    }
  };

  return (
    <motion.div 
      className="glass-card job-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <div className="job-card-header">
          <div>
            <span className="badge badge-violet" style={{ marginBottom: '0.5rem' }}>
              {job.department}
            </span>
            <h3 className="job-title">{job.title}</h3>
          </div>
          {getStatusBadge(job.status)}
        </div>

        <div className="job-meta-list">
          <div className="job-meta-item">
            <MapPin size={12} />
            <span>{job.location}</span>
          </div>
          <div className="job-meta-item">
            <Calendar size={12} />
            <span>{job.createdDate}</span>
          </div>
        </div>
      </div>

      <div className="job-card-footer">
        <div className="job-metric-group">
          <div className="job-metric">
            <span className="job-metric-val" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Users size={14} style={{ color: 'var(--text-secondary)' }} />
              {job.applicantsCount}
            </span>
            <span className="job-metric-lbl">Applicants</span>
          </div>
          <div className="job-metric">
            <span className="job-metric-val" style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-secondary)' }}>
              <Sparkles size={14} />
              {job.strongMatches}
            </span>
            <span className="job-metric-lbl">AI Matches</span>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={() => onView(job.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          Explore Pipeline <ArrowUpRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default JobCard;
