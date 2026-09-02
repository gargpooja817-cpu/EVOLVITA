import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Sparkles, 
  Eye, 
  ArrowRight, 
  FileSpreadsheet, 
  Award, 
  Briefcase,
  Layers
} from 'lucide-react';
import candidateService from '../../services/candidateService';
import MatchScore from '../../components/recruiter/MatchScore';
import EmptyState from '../../components/common/EmptyState';

const CandidateDiscovery = () => {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [minMatch, setMinMatch] = useState(0);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const list = await candidateService.getCandidates();
        setCandidates(list || []);
      } catch (err) {
        console.warn('Candidate discovery fetch notice:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(cand => {
    const nameMatch = !searchQuery || 
      cand.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cand.skillsDNA && cand.skillsDNA.some(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase())));
    const roleMatch = roleFilter === 'All' || cand.targetRole === roleFilter;
    const scoreMatch = (cand.matchScore || 0) >= minMatch;
    return nameMatch && roleMatch && scoreMatch;
  });

  const rolesList = ['All', ...new Set(candidates.map(c => c.targetRole).filter(Boolean))];

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
              SAP Fiori / SAPUI5 Sourcing
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
            Candidate Pipeline
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.2rem' }}>
            Search and inspect verified talent applications across your active requisitions.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => navigate('/recruiter/resume-intelligence')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FileSpreadsheet size={15} /> Batch Resume Ranker
        </button>
      </div>

      {loading ? (
        <div className="loading-orbit" style={{ padding: '6rem 0' }}>
          <div className="orbit-spinner"><div className="orbit-ring"></div><div className="orbit-ring-inner"></div></div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading candidate pipeline...</span>
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState 
          icon="candidates"
          title="No candidates in pipeline yet"
          description="Candidates who apply to your active job requisitions or are evaluated through the Resume Ranker will appear here."
          actionLabel="Go to Resume Ranker"
          onAction={() => navigate('/recruiter/resume-intelligence')}
          secondaryLabel="Create Job Requisition"
          onSecondary={() => navigate('/recruiter/create-job')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* SAP Fiori Style Filter Bar */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search candidates by name or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                style={{ width: '100%', paddingLeft: '2.25rem', height: '38px', fontSize: '0.825rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-select"
                style={{ height: '38px', fontSize: '0.825rem', width: 'auto' }}
              >
                {rolesList.map(role => (
                  <option key={role} value={role}>{role === 'All' ? 'All Roles' : role}</option>
                ))}
              </select>
            </div>

            <select 
              value={minMatch}
              onChange={(e) => setMinMatch(parseInt(e.target.value))}
              className="form-select"
              style={{ height: '38px', fontSize: '0.825rem', width: 'auto' }}
            >
              <option value={0}>All Match Scores</option>
              <option value={70}>Score ≥ 70%</option>
              <option value={80}>Score ≥ 80%</option>
              <option value={90}>Score ≥ 90%</option>
            </select>
          </div>

          {/* CANDIDATES GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {filteredCandidates.map(cand => (
              <div 
                key={cand.id}
                className="glass-card"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{cand.name}</h3>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{cand.targetRole || 'Candidate'}</p>
                      <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{cand.location || 'Location Not Specified'}</p>
                    </div>
                    {cand.matchScore !== undefined && (
                      <MatchScore score={cand.matchScore} size={44} strokeWidth={3} />
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', margin: '0.75rem 0' }}>
                    {cand.skillsDNA?.slice(0, 5).map((sk, idx) => (
                      <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>{sk.name}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <span className={`badge ${cand.decisionStatus === 'Shortlisted' ? 'badge-success' : cand.decisionStatus === 'Rejected' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                    {cand.decisionStatus || 'Needs Review'}
                  </span>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate(`/recruiter/candidate/${cand.id}`)}
                    style={{ fontSize: '0.775rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Eye size={13} /> Inspect Profile
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

export default CandidateDiscovery;
