import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Award, 
  BookOpen, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  Circle,
  FileSpreadsheet,
  User,
  PlusCircle,
  AlertCircle,
  Briefcase,
  Layers,
  Check
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import recruiterService from '../../services/recruiterService';
import candidateService from '../../services/candidateService';
import MatchScore from '../../components/recruiter/MatchScore';
import EmptyState from '../../components/common/EmptyState';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  let authContext = null;
  try {
    authContext = useAuth();
  } catch {
    authContext = null;
  }

  const currentUser = authContext?.currentUser || authService.getCurrentUser();
  const userName = currentUser?.displayName || currentUser?.name || 'Candidate';

  const [resumeData, setResumeData] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentMatch, setRecentMatch] = useState(null);

  useEffect(() => {
    // Check if resume data has been parsed and stored
    const savedResume = localStorage.getItem('evolvevita_candidate_resume');
    if (savedResume) {
      try {
        setResumeData(JSON.parse(savedResume));
      } catch (err) {
        console.error('Error loading stored resume:', err);
      }
    }

    const savedMatch = localStorage.getItem('evolvevita_last_match_result');
    if (savedMatch) {
      try {
        setRecentMatch(JSON.parse(savedMatch));
      } catch {}
    }

    const loadJobs = async () => {
      try {
        const jobs = await recruiterService.getJobs();
        const active = (jobs || []).filter(j => j.status === 'Active');
        setActiveJobs(active.slice(0, 3));
      } catch (err) {
        console.warn('Dashboard note on fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const hasResume = Boolean(resumeData && resumeData.skills && resumeData.skills.length > 0);
  const skillsCount = resumeData?.skills?.length || 0;
  const projectsCount = resumeData?.projects?.length || 0;
  const certsCount = resumeData?.certifications?.length || 0;

  // Calculate profile completeness strictly based on actual data
  let completenessScore = 20; // baseline for created account
  if (currentUser?.displayName) completenessScore += 10;
  if (hasResume) completenessScore += 40;
  if (projectsCount > 0) completenessScore += 15;
  if (recentMatch) completenessScore += 15;
  completenessScore = Math.min(100, completenessScore);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: '1300px', margin: '0 auto' }}
    >
      {/* WELCOME / HERO BANNER */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '2.25rem', 
          marginBottom: '2rem', 
          display: 'grid', 
          gridTemplateColumns: hasResume ? '1.4fr 1fr' : '1fr', 
          gap: '2rem',
          alignItems: 'center'
        }}
      >
        <div>
          <span className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>Candidate Intelligence Hub</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome, {userName}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.5rem', lineHeight: 1.55 }}>
            {hasResume
              ? `Your resume has been parsed with ${skillsCount} verified skills and ${projectsCount} project records. Compare your profile against open requisitions to unlock real-time match scores.`
              : 'Build your career intelligence profile. Upload your resume to extract validated skills, discover open roles, and track personalized learning gaps.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/candidate/resume')}>
              <FileSpreadsheet size={16} /> {hasResume ? 'View Skill DNA' : 'Upload Resume'}
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/candidate/jobs')}>
              <Briefcase size={16} /> Browse Opportunities
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/candidate/profile')}>
              <User size={16} /> My Profile
            </button>
          </div>
        </div>

        {hasResume && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center', background: '#F8FAFC', border: '1px solid var(--border-subtle)', padding: '1.25rem 1.75rem', borderRadius: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'Outfit' }}>{skillsCount}</span>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>Skills</p>
              </div>
              <div style={{ height: '36px', width: '1px', background: 'var(--border-subtle)' }} />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', fontFamily: 'Outfit' }}>{projectsCount}</span>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>Projects</p>
              </div>
              <div style={{ height: '36px', width: '1px', background: 'var(--border-subtle)' }} />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-secondary)', fontFamily: 'Outfit' }}>{completenessScore}%</span>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>Profile</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* METRIC CARDS — STRICTLY REAL DATA */}
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
            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Extracted Skills</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {skillsCount > 0 ? `${skillsCount} Skills` : '0 Skills'}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {hasResume ? 'Verified from parsed resume' : 'Upload resume to extract'}
            </span>
          </div>
          <div style={{ color: 'var(--accent-primary)', opacity: 0.9 }}>
            <Award size={26} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Project Evidence</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {projectsCount > 0 ? `${projectsCount} Projects` : '0 Projects'}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {projectsCount > 0 ? 'Verified in profile' : 'No projects extracted yet'}
            </span>
          </div>
          <div style={{ color: '#059669', opacity: 0.9 }}>
            <BookOpen size={26} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Latest Match Readiness</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {recentMatch?.match_score !== undefined ? `${recentMatch.match_score}%` : 'Pending'}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {recentMatch ? (recentMatch.job_title || 'Evaluated fit') : 'No match evaluated yet'}
            </span>
          </div>
          <div style={{ color: 'var(--accent-secondary)', opacity: 0.9 }}>
            <TrendingUp size={26} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Profile Strength</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {completenessScore}%
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {completenessScore >= 80 ? 'Strong profile' : 'Needs resume & analysis'}
            </span>
          </div>
          <div style={{ color: '#d97706', opacity: 0.9 }}>
            <Sparkles size={26} />
          </div>
        </div>
      </div>

      {/* IF NO RESUME EXISTS: DISPLAY EXPLICIT ONBOARDING STATE */}
      {!hasResume ? (
        <EmptyState 
          icon="resume"
          title="Your career intelligence starts with your resume"
          description="Upload your resume to generate your Skill DNA, discover relevant opportunities, and identify personalized learning gaps."
          actionLabel="Upload Resume"
          onAction={() => navigate('/candidate/resume')}
          secondaryLabel="Complete Profile"
          onSecondary={() => navigate('/candidate/profile')}
        />
      ) : null}

      {/* ONBOARDING STEP CARDS */}
      {!hasResume && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Career Intelligence Steps
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Follow these steps to unlock AI-powered workforce intelligence and match evaluations.
              </p>
            </div>
            <span className="badge badge-violet">{completenessScore}% Completed</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { step: '1', title: 'Complete Profile', desc: 'Add contact details and background', done: Boolean(currentUser?.displayName), action: () => navigate('/candidate/profile') },
              { step: '2', title: 'Upload Resume', desc: 'Parse PDF or DOCX file with AI', done: hasResume, action: () => navigate('/candidate/resume') },
              { step: '3', title: 'Discover Opportunities', desc: 'Evaluate match coefficients against active jobs', done: Boolean(recentMatch), action: () => navigate('/candidate/jobs') }
            ].map((step, idx) => (
              <div 
                key={idx}
                onClick={step.action}
                className="glass-card"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  borderLeft: step.done ? '3px solid #16a34a' : '3px solid var(--border-subtle)',
                  background: step.done ? '#f0fdf4' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  {step.done ? (
                    <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#EEF2FF', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {step.step}
                    </div>
                  )}
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: step.done ? '#15803d' : 'var(--text-primary)' }}>
                    {step.title}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1.75rem', lineHeight: 1.4 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
        
        {/* AVAILABLE JOBS REQUISITIONS */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} style={{ color: 'var(--accent-primary)' }} /> Available Opportunities
            </h3>
            <button className="btn btn-secondary" onClick={() => navigate('/candidate/jobs')} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
              View All Jobs
            </button>
          </div>

          {loading ? (
            <div className="loading-orbit" style={{ padding: '3rem 0' }}>
              <div className="orbit-spinner"><div className="orbit-ring"></div><div className="orbit-ring-inner"></div></div>
            </div>
          ) : activeJobs.length === 0 ? (
            <EmptyState 
              icon="jobs"
              title="No active job requisitions"
              description="Check back soon for new opportunities posted by recruiters."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="glass-card" 
                  style={{ 
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flexGrow: 1 }}>
                    <span className="badge badge-violet" style={{ fontSize: '0.65rem', marginBottom: '0.35rem' }}>{job.department}</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{job.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {job.location} • {job.workMode} • {job.type}
                    </p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                      {job.requiredSkills?.slice(0, 4).map((s, idx) => (
                        <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{s}</span>
                      ))}
                    </div>
                  </div>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/candidate/resume')}
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    Analyze Match <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WORKFORCE INTELLIGENCE TOOLS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              Workforce Intelligence Tools
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div 
                className="glass-card" 
                onClick={() => navigate('/candidate/resume')}
                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                  <FileSpreadsheet size={18} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Resume Intelligence</h4>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Parse resume and evaluate job description fit</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>

              <div 
                className="glass-card" 
                onClick={() => navigate('/candidate/skill-gap')}
                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-secondary)', flexShrink: 0 }}>
                  <Award size={18} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Skill Gap Analysis</h4>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Identify high-impact missing capabilities</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>

              <div 
                className="glass-card" 
                onClick={() => navigate('/candidate/learning')}
                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
                  <BookOpen size={18} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Learning Growth Roadmap</h4>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Step-by-step guidance for missing skills</p>
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

export default CandidateDashboard;
