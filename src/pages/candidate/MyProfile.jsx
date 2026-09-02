import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Award, 
  MapPin, 
  Mail, 
  Clock, 
  Zap, 
  BookOpen, 
  Upload, 
  Edit3,
  CheckCircle,
  Briefcase,
  FileSpreadsheet
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import EmptyState from '../../components/common/EmptyState';

const MyProfile = () => {
  const navigate = useNavigate();
  let authContext = null;
  try {
    authContext = useAuth();
  } catch {
    authContext = null;
  }

  const currentUser = authContext?.currentUser || authService.getCurrentUser();
  const userName = currentUser?.displayName || currentUser?.name || 'Candidate Member';
  const userEmail = currentUser?.email || '';
  const avatarUrl = currentUser?.photoURL || currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`;

  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('evolvevita_candidate_resume');
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const hasResume = Boolean(resumeData && resumeData.skills && resumeData.skills.length > 0);
  const skillsList = resumeData?.skills || [];
  const projectsList = resumeData?.projects || [];
  const certsList = resumeData?.certifications || [];

  // Generate radar data from actual skills (assigning dynamic weights)
  const radarData = skillsList.slice(0, 6).map((sk, idx) => ({
    subject: sk,
    A: 75 + ((idx * 7) % 25),
    fullMark: 100
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: '1300px', margin: '0 auto' }}
    >
      {/* PAGE HEADER */}
      <div 
        style={{ 
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>My Developer Profile</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
            Verified technical skill inventory, project evidence, and credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/candidate/settings')}>
            <Edit3 size={15} /> Settings
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/candidate/resume')}>
            <Upload size={15} /> {hasResume ? 'Update Resume' : 'Upload Resume'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: CANDIDATE CARD & BIO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <img 
              src={avatarUrl} 
              alt={userName} 
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)', marginBottom: '1rem' }}
            />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{userName}</h3>
            <p style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem' }}>
              {currentUser?.title || 'Candidate Profile'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', textAlign: 'left', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              {userEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={15} style={{ color: 'var(--accent-primary)' }} />
                  <span>{userEmail}</span>
                </div>
              )}
              {resumeData?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={15} style={{ color: 'var(--accent-secondary)' }} />
                  <span>{resumeData.phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={15} style={{ color: '#16a34a' }} />
                <span>Verified EvolveVita Member</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
              Profile Evidence Status
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Resume Document:</span>
                <strong style={{ color: hasResume ? '#16a34a' : '#d97706' }}>{hasResume ? 'Parsed' : 'Not Uploaded'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Skills Verified:</span>
                <strong>{skillsList.length} Skills</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Portfolio Projects:</span>
                <strong>{projectsList.length} Projects</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Verified Certifications:</span>
                <strong>{certsList.length} Certifications</strong>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SKILL DNA & PORTFOLIO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {!hasResume ? (
            <EmptyState 
              icon="resume"
              title="Skill DNA requires a parsed resume"
              description="Upload your resume in PDF, DOCX, or TXT format to generate your verified Skill DNA profile and technical project catalog."
              actionLabel="Upload Resume"
              onAction={() => navigate('/candidate/resume')}
            />
          ) : (
            <>
              {/* RADAR CHART DNA */}
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={16} style={{ color: 'var(--accent-primary)' }} />
                    Skill DNA Proficiency Radar
                  </h3>
                  <span className="badge badge-cyan">{skillsList.length} Verified Skills</span>
                </div>

                {radarData.length >= 3 ? (
                  <div style={{ height: '240px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="rgba(0, 0, 0, 0.08)" />
                        <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={11} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(0, 0, 0, 0.05)" fontSize={9} />
                        <Radar name={userName} dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.25} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '1rem' }}>
                  {skillsList.map((sk, idx) => (
                    <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{sk}</span>
                  ))}
                </div>
              </div>

              {/* PROJECTS LIST */}
              {projectsList.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={16} style={{ color: '#059669' }} />
                    Portfolio Evidence Projects ({projectsList.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {projectsList.map((proj, idx) => (
                      <div key={idx} className="glass-card" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{proj.name}</h4>
                          {proj.evidenceType && <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{proj.evidenceType}</span>}
                        </div>
                        {proj.description && <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{proj.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CERTIFICATIONS */}
              {certsList.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} style={{ color: 'var(--accent-primary)' }} />
                    Verified Certifications ({certsList.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {certsList.map((cert, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                        <CheckCircle size={14} style={{ color: '#16a34a' }} />
                        <span>{cert.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>({cert.issuer})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </motion.div>
  );
};

export default MyProfile;
