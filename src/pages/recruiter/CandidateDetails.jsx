import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Award, 
  MapPin, 
  ExternalLink, 
  CheckCircle, 
  ChevronRight, 
  Zap, 
  BookOpen, 
  AlertCircle, 
  X,
  HeartCrack,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

import candidateService from '../../services/candidateService';
import MatchScore from '../../components/recruiter/MatchScore';
import SkillTag from '../../components/recruiter/SkillTag';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [status, setStatus] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const found = await candidateService.getCandidate(id);
        setCandidate(found);
        setStatus(found.decisionStatus || 'Needs Review');
      } catch (err) {
        console.error(err);
        navigate('/recruiter/candidates');
      }
    };
    fetchCandidate();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    try {
      await candidateService.updateCandidate(id, { decisionStatus: newStatus });
      setFeedback({
        type: 'success',
        message: `Candidate ${candidate?.name} moved to "${newStatus}" status.`
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!candidate) {
    return (
      <div className="loading-orbit" style={{ marginTop: '5rem' }}>
        <div className="orbit-spinner">
          <div className="orbit-ring"></div>
          <div className="orbit-ring-inner"></div>
        </div>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading candidate evidence...</span>
      </div>
    );
  }

  const skillsDNA = candidate.skillsDNA || [];
  const whyMatch = candidate.whyMatch || {
    strengths: ['Strong background in modern web architectures.'],
    skillGaps: [],
    growthPotential: 'High adaptability based on project complexity.'
  };
  const projects = candidate.projects || [];
  const sapEvidence = candidate.sapLearningEvidence || [];
  const certs = candidate.certifications || [];

  const radarData = skillsDNA.map(sk => ({
    subject: sk.name,
    A: sk.value,
    fullMark: 100
  }));

  const avatarUrl = candidate.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(candidate.name || 'Candidate')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: '1350px', margin: '0 auto' }}
    >
      {feedback && (
        <div 
          className="glass-panel" 
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '1rem 1.5rem',
            borderLeft: '4px solid var(--accent-success)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle style={{ color: 'var(--accent-success)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} style={{ marginLeft: '1rem', color: 'var(--text-muted)' }}><X size={14} /></button>
        </div>
      )}

      {/* TOP HEADER PROFILE */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '2rem', 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          gap: '2rem',
          marginBottom: '2rem'
        }}
      >
        <button 
          onClick={() => navigate('/recruiter/candidates')}
          className="btn-ghost"
          style={{ padding: '0.3rem', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
          title="Back to Discovery"
        >
          <ArrowLeft size={20} />
        </button>

        <img 
          src={avatarUrl} 
          alt={candidate.name} 
          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }}
        />

        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{candidate.name}</h2>
            <span className={`badge ${status === 'Rejected' ? 'badge-danger' : status === 'Needs Review' ? 'badge-warning' : 'badge-success'}`}>
              Status: {status}
            </span>
          </div>

          <div 
            style={{ 
              display: 'flex', 
              gap: '1.25rem', 
              color: 'var(--text-secondary)', 
              fontSize: '0.85rem', 
              marginTop: '0.5rem',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <strong>Target:</strong> {candidate.targetRole || 'Candidate'}
            </div>
            {candidate.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} />
                <span>{candidate.location}</span>
              </div>
            )}
            {candidate.availability && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} />
                <span>{candidate.availability}</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <MatchScore score={candidate.matchScore || 75} size={58} strokeWidth={4} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => handleStatusChange('Shortlisted')}
              style={{ width: '120px', padding: '0.45rem', fontSize: '0.8rem' }}
            >
              Shortlist
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleStatusChange('Needs Review')}
              style={{ width: '120px', padding: '0.45rem', fontSize: '0.8rem' }}
            >
              Needs Review
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleStatusChange('Rejected')}
              style={{ 
                width: '120px', 
                padding: '0.45rem', 
                fontSize: '0.8rem',
                color: 'var(--accent-danger)'
              }}
            >
              Decline
            </button>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN DETAILS WORKSPACE */}
      <div className="candidate-detail-grid">
        
        {/* LEFT COLUMN: SKILL DNA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel detail-section">
            <h3 className="detail-section-title">
              <Zap size={16} style={{ color: 'var(--accent-primary)' }} />
              Skill DNA Profile
            </h3>
            {radarData.length >= 3 ? (
              <div className="dna-chart-container" style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(0, 0, 0, 0.08)" />
                    <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(0, 0, 0, 0.05)" fontSize={9} />
                    <Radar name={candidate.name} dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Profile contains verified skills list without multi-axial radar requirements.
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '1rem' }}>
              {skillsDNA.map((sk, idx) => (
                <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{sk.name}</span>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: EVIDENCE & PROJECTS */}
        <div className="detail-main-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* WHY THIS CANDIDATE */}
          <div className="glass-panel detail-section">
            <h3 className="detail-section-title">
              <Zap size={16} style={{ color: 'var(--accent-primary)' }} />
              Evaluation Insights
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {whyMatch.strengths && whyMatch.strengths.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                    <CheckCircle size={14} /> Profile Strengths
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#166534', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {whyMatch.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {whyMatch.skillGaps && whyMatch.skillGaps.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                    <AlertCircle size={14} /> Potential Skill Gaps
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#991b1b', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {whyMatch.skillGaps.map((gap, idx) => (
                      <li key={idx}>{gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {whyMatch.growthPotential && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.25rem' }}>
                    <ChevronRight size={14} /> Growth Trajectory
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {whyMatch.growthPotential}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PROJECT EVIDENCE */}
          {projects.length > 0 && (
            <div className="glass-panel detail-section">
              <h3 className="detail-section-title">
                <BookOpen size={16} style={{ color: 'var(--accent-secondary)' }} />
                Project Evidence ({projects.length})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {projects.map((proj, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{proj.name}</h4>
                      {proj.evidenceType && <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{proj.evidenceType}</span>}
                    </div>
                    {proj.description && <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{proj.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CERTIFICATIONS */}
          {certs.length > 0 && (
            <div className="glass-panel detail-section">
              <h3 className="detail-section-title">
                <Award size={16} style={{ color: 'var(--accent-primary)' }} />
                Verified Credentials ({certs.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {certs.map((cert, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                    <CheckCircle size={14} style={{ color: '#16a34a' }} />
                    <span>{cert.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({cert.issuer})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
};

export default CandidateDetails;
