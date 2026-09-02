import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserCheck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  FileSpreadsheet, 
  Eye, 
  Filter,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import candidateService from '../../services/candidateService';
import MatchScore from '../../components/recruiter/MatchScore';
import EmptyState from '../../components/common/EmptyState';

const HiringDecisions = () => {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('All'); // 'All', 'Shortlisted', 'Needs Review', 'Rejected'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const list = await candidateService.getCandidates();
        setCandidates(list || []);
      } catch (err) {
        console.warn('Hiring decisions fetch notice:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const shortlisted = candidates.filter(c => c.decisionStatus === 'Shortlisted');
  const needsReview = candidates.filter(c => !c.decisionStatus || c.decisionStatus === 'Needs Review');
  const rejected = candidates.filter(c => c.decisionStatus === 'Rejected');

  const getFilteredList = () => {
    let list = candidates;
    if (filterTab === 'Shortlisted') list = shortlisted;
    else if (filterTab === 'Needs Review') list = needsReview;
    else if (filterTab === 'Rejected') list = rejected;

    if (searchQuery) {
      list = list.filter(c => 
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.targetRole?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  };

  const displayedCandidates = getFilteredList();

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
              SAP Fiori Decision Governance
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
            Hiring Decisions & Audit Trail
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.2rem' }}>
            Authoritative human-in-the-loop hiring actions and immutable compliance logs.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => navigate('/recruiter/resume-intelligence')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FileSpreadsheet size={15} /> Resume Ranker
        </button>
      </div>

      {loading ? (
        <div className="loading-orbit" style={{ padding: '6rem 0' }}>
          <div className="orbit-spinner"><div className="orbit-ring"></div><div className="orbit-ring-inner"></div></div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading decision records...</span>
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState 
          icon="decisions"
          title="No hiring decisions registered yet"
          description="Log shortlist, review, or decline decisions on candidate profiles or via the Resume Ranker."
          actionLabel="Go to Resume Ranker"
          onAction={() => navigate('/recruiter/resume-intelligence')}
          secondaryLabel="View Active Jobs"
          onSecondary={() => navigate('/recruiter/jobs')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Status Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div 
              className="glass-card" 
              onClick={() => setFilterTab('All')}
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer',
                borderBottom: filterTab === 'All' ? '3px solid var(--accent-primary)' : '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>All Applications</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem' }}>{candidates.length}</h3>
            </div>

            <div 
              className="glass-card" 
              onClick={() => setFilterTab('Shortlisted')}
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer',
                borderBottom: filterTab === 'Shortlisted' ? '3px solid #16a34a' : '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.725rem', color: '#16a34a', textTransform: 'uppercase', fontWeight: 600 }}>Shortlisted</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem', color: '#15803d' }}>{shortlisted.length}</h3>
            </div>

            <div 
              className="glass-card" 
              onClick={() => setFilterTab('Needs Review')}
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer',
                borderBottom: filterTab === 'Needs Review' ? '3px solid #d97706' : '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.725rem', color: '#d97706', textTransform: 'uppercase', fontWeight: 600 }}>Needs Review</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem', color: '#b45309' }}>{needsReview.length}</h3>
            </div>

            <div 
              className="glass-card" 
              onClick={() => setFilterTab('Rejected')}
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer',
                borderBottom: filterTab === 'Rejected' ? '3px solid #dc2626' : '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.725rem', color: '#dc2626', textTransform: 'uppercase', fontWeight: 600 }}>Declined</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem', color: '#b91c1c' }}>{rejected.length}</h3>
            </div>
          </div>

          {/* Table Container */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ position: 'relative', flexGrow: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Filter decisions by candidate name or role..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', paddingLeft: '2.25rem', height: '36px', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Candidate</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Target Role</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Match Score</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Decision Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Recruiter Notes</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCandidates.map((cand, idx) => {
                    const status = cand.decisionStatus || 'Needs Review';
                    return (
                      <tr 
                        key={cand.id || idx}
                        style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}
                      >
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {cand.name}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                          {cand.targetRole || 'Not Specified'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 700 }}>{cand.matchScore || 80}%</span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span 
                            className={`badge ${status === 'Shortlisted' ? 'badge-success' : status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.775rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                          {cand.recruiterNotes || 'Decision pending recruiter notes.'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => navigate(`/recruiter/candidate/${cand.id}`)}
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                          >
                            <Eye size={13} /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}
    </motion.div>
  );
};

export default HiringDecisions;
