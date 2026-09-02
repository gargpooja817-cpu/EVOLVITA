import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Users, 
  Sparkles, 
  ClipboardCheck, 
  ArrowRight, 
  TrendingUp, 
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Layers,
  Plus
} from 'lucide-react';

import recruiterService from '../../services/recruiterService';
import candidateService from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import EmptyState from '../../components/common/EmptyState';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  let authContext = null;
  try {
    authContext = useAuth();
  } catch {
    authContext = null;
  }

  const currentUser = authContext?.currentUser || authService.getCurrentUser();
  const userName = currentUser?.displayName || currentUser?.name || 'Recruiter';

  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [jobsRes, candidatesRes] = await Promise.all([
          recruiterService.getJobs().catch(() => []),
          candidateService.getCandidates().catch(() => [])
        ]);
        setJobs(jobsRes || []);
        setCandidates(candidatesRes || []);
      } catch (err) {
        console.warn('Dashboard data fetch note:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const activeJobs = (jobs || []).filter(j => j.status === 'Active');
  const strongMatches = (candidates || []).filter(c => (c.matchScore || 0) >= 85);
  const pendingReviews = (candidates || []).filter(c => !c.decisionStatus || c.decisionStatus === 'Needs Review');
  const hasJobs = jobs.length > 0;
  const hasCandidates = candidates.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: '1350px', margin: '0 auto' }}
    >
      {/* HERO / WELCOME BANNER */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '2.25rem', 
          marginBottom: '2rem', 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ maxWidth: '750px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <span className="badge badge-violet">
              SAP Fiori Recruiter Workspace
            </span>
            <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>
              Fiori-inspired Prototype
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome, {userName}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.5rem', lineHeight: 1.55 }}>
            {hasJobs 
              ? `Manage your active requisitions, evaluate applicant fit against verified skills, and log explainable hiring decisions.`
              : `Start building your hiring pipeline. Define job requisitions with automated linguistic bias checks and evaluate applicants with explainable AI evidence.`}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/recruiter/create-job')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlusCircle size={16} /> Create Job Requisition
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/recruiter/resume-intelligence')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileSpreadsheet size={16} /> Resume Ranker
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/recruiter/bias-audit')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> Bias Audit
            </button>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', padding: '1.5rem 2rem', borderRadius: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'Outfit' }}>
            {activeJobs.length}
          </span>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>
            Active Requisitions
          </p>
        </div>
      </div>

      {/* STATS GRID — STRICTLY REAL NUMBERS */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Jobs</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {activeJobs.length}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {jobs.length} total requisitions
            </span>
          </div>
          <div style={{ color: 'var(--accent-primary)', opacity: 0.9 }}>
            <Briefcase size={26} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Talent Sourced</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {candidates.length}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {hasCandidates ? 'Actual applicants in pipeline' : 'No applications yet'}
            </span>
          </div>
          <div style={{ color: '#0284c7', opacity: 0.9 }}>
            <Users size={26} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Strong Matches</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {strongMatches.length}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Score ≥ 85% confidence
            </span>
          </div>
          <div style={{ color: '#059669', opacity: 0.9 }}>
            <Sparkles size={26} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Reviews</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {pendingReviews.length}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Awaiting hiring decisions
            </span>
          </div>
          <div style={{ color: '#d97706', opacity: 0.9 }}>
            <ClipboardCheck size={26} />
          </div>
        </div>
      </div>

      {/* FIRST-TIME RECRUITER ONBOARDING STEP CARDS IF NO JOBS OR APPLICANTS */}
      {!hasJobs && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Start Building Your Hiring Pipeline
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Follow these 3 steps to configure requisitions and evaluate candidates.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div 
              className="glass-card"
              onClick={() => navigate('/recruiter/create-job')}
              style={{ padding: '1.5rem', cursor: 'pointer', borderLeft: '3px solid var(--accent-primary)' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '0.75rem' }}>
                1
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Create Job
              </h4>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Define title, required skills, and run automated linguistic inclusivity checks.
              </p>
            </div>

            <div 
              className="glass-card"
              onClick={() => navigate('/recruiter/jobs')}
              style={{ padding: '1.5rem', cursor: 'pointer', borderLeft: '3px solid #0284c7' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0F9FF', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '0.75rem' }}>
                2
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Publish and Share
              </h4>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Make your requisition active so talent can discover and apply to the role.
              </p>
            </div>

            <div 
              className="glass-card"
              onClick={() => navigate('/recruiter/resume-intelligence')}
              style={{ padding: '1.5rem', cursor: 'pointer', borderLeft: '3px solid #059669' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDF4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '0.75rem' }}>
                3
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Review Applications
              </h4>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Run Resume Ranker to evaluate candidate skill DNA and log final decisions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* ACTIVE REQUISITIONS LIST */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} style={{ color: 'var(--accent-primary)' }} /> Active Job Requisitions
            </h3>
            <button className="btn btn-secondary" onClick={() => navigate('/recruiter/jobs')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
              Manage All Jobs
            </button>
          </div>

          {loading ? (
            <div className="loading-orbit" style={{ padding: '3rem 0' }}>
              <div className="orbit-spinner"><div className="orbit-ring"></div><div className="orbit-ring-inner"></div></div>
            </div>
          ) : activeJobs.length === 0 ? (
            <EmptyState 
              icon="jobs"
              title="No job requisitions yet"
              description="Create your first job requisition to start evaluating candidates and matching skill profiles."
              actionLabel="Create your first job"
              onAction={() => navigate('/recruiter/create-job')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activeJobs.slice(0, 4).map(job => (
                <div 
                  key={job.id} 
                  className="glass-card" 
                  style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
                >
                  <div>
                    <span className="badge badge-violet" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>{job.department}</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{job.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {job.location} • {job.workMode} • {job.type}
                    </p>
                  </div>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/recruiter/resume-intelligence')}
                    style={{ fontSize: '0.775rem', padding: '0.4rem 0.8rem', whiteSpace: 'nowrap' }}
                  >
                    Rank Resumes <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUICK RECRUITER ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              Recruiter Quick Actions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div 
                className="glass-card" 
                onClick={() => navigate('/recruiter/create-job')}
                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                  <PlusCircle size={18} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Create New Job</h4>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Define roles with automated bias checks</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>

              <div 
                className="glass-card" 
                onClick={() => navigate('/recruiter/resume-intelligence')}
                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>
                  <FileSpreadsheet size={18} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Resume Ranker</h4>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Batch parse and rank candidate CVs</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>

              <div 
                className="glass-card" 
                onClick={() => navigate('/recruiter/bias-audit')}
                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
                  <Sparkles size={18} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Linguistic Bias Audit</h4>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Scan descriptions for inclusive hiring</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>

              <div 
                className="glass-card" 
                onClick={() => navigate('/recruiter/decisions')}
                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
                  <ClipboardCheck size={18} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Hiring Decision Center</h4>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Log human-in-the-loop decisions</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default RecruiterDashboard;
