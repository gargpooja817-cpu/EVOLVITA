import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  PlusCircle, 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  ArrowRight, 
  CheckCircle,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import recruiterService from '../../services/recruiterService';
import EmptyState from '../../components/common/EmptyState';

const JobsManagement = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const list = await recruiterService.getJobs();
        setJobs(list || []);
      } catch (err) {
        console.warn('Jobs management fetch notice:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = !searchQuery || 
      j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || j.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const departments = ['All', ...new Set(jobs.map(j => j.department).filter(Boolean))];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: '1350px', margin: '0 auto' }}
    >
      {/* PAGE HEADER */}
      <div 
        className="glass-panel"
        style={{ 
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
              SAP Fiori Job Management
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
            Job Requisitions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.2rem' }}>
            Manage active openings, define required skills criteria, and launch candidate sourcing.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => navigate('/recruiter/create-job')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusCircle size={15} /> Create Job Requisition
        </button>
      </div>

      {loading ? (
        <div className="loading-orbit" style={{ padding: '6rem 0' }}>
          <div className="orbit-spinner"><div className="orbit-ring"></div><div className="orbit-ring-inner"></div></div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading job requisitions...</span>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState 
          icon="jobs"
          title="No job requisitions yet"
          description="Create your first job requisition to define role criteria, run bias checks, and evaluate applicant matches."
          actionLabel="Create Job Requisition"
          onAction={() => navigate('/recruiter/create-job')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* FILTER BAR */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search job requisitions by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                style={{ width: '100%', paddingLeft: '2.25rem', height: '38px', fontSize: '0.825rem' }}
              />
            </div>

            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="form-select"
              style={{ height: '38px', fontSize: '0.825rem', width: 'auto' }}
            >
              {departments.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </select>
          </div>

          {/* JOBS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {filteredJobs.map(job => (
              <div 
                key={job.id}
                className="glass-card"
                style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span className="badge badge-violet" style={{ fontSize: '0.68rem' }}>{job.department}</span>
                    <span className={`badge ${job.status === 'Active' ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '0.68rem' }}>
                      {job.status || 'Active'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {job.title}
                  </h3>

                  <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                    {job.location} • {job.workMode} • {job.type}
                  </p>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.85rem 0' }}>
                    {job.description?.slice(0, 140)}...
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    {job.requiredSkills?.slice(0, 4).map((sk, idx) => (
                      <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>{sk}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    Exp: {job.experienceMin}-{job.experienceMax} yrs
                  </span>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/recruiter/resume-intelligence')}
                    style={{ fontSize: '0.775rem', padding: '0.35rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <FileSpreadsheet size={13} /> Rank Resumes
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </motion.div>
  );
};

export default JobsManagement;
