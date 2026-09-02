import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Briefcase, 
  CheckCircle, 
  AlertTriangle, 
  Upload, 
  ArrowRight, 
  RefreshCw, 
  Award, 
  AlertCircle, 
  Send, 
  CheckCircle2, 
  X,
  Clock,
  MapPin
} from 'lucide-react';
import recruiterService from '../../services/recruiterService';
import candidateService from '../../services/candidateService';
import MatchScore from '../../components/recruiter/MatchScore';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import EmptyState from '../../components/common/EmptyState';

const JobMatches = () => {
  const navigate = useNavigate();
  let authContext = null;
  try {
    authContext = useAuth();
  } catch {
    authContext = null;
  }

  const currentUser = authContext?.currentUser || authService.getCurrentUser();

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [candidateResume, setCandidateResume] = useState(null);
  
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [analysisMap, setAnalysisMap] = useState({});
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load resume data
    const savedResume = localStorage.getItem('evolvevita_candidate_resume');
    if (savedResume) {
      try {
        setCandidateResume(JSON.parse(savedResume));
      } catch {}
    }

    const savedApplied = localStorage.getItem('evolvevita_applied_jobs');
    if (savedApplied) {
      try {
        setAppliedJobs(JSON.parse(savedApplied));
      } catch {}
    }

    const fetchJobs = async () => {
      try {
        const list = await recruiterService.getJobs();
        const activeList = (list || []).filter(j => j.status === 'Active');
        setJobs(activeList);
        if (activeList.length > 0) {
          setSelectedJobId(activeList[0].id);
        }
      } catch (err) {
        console.error('Failed to load active jobs:', err);
        setError('Failed to fetch job requisitions from backend.');
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const hasResume = Boolean(candidateResume && candidateResume.skills && candidateResume.skills.length > 0);

  const handleAnalyzeJob = async (job) => {
    if (!hasResume) {
      navigate('/candidate/resume');
      return;
    }

    setLoadingAnalysis(true);
    setError(null);

    try {
      const matchInput = {
        candidate_name: candidateResume.candidate_name || currentUser?.displayName || 'Candidate',
        skills: candidateResume.skills || [],
        experience_years: candidateResume.experience ? candidateResume.experience.length * 1.5 : 3.0,
        projects: candidateResume.projects || [],
        certifications: candidateResume.certifications || [],
        sap_learning_evidence: [],
        job_title: job.title,
        required_skills: job.requiredSkills || [],
        preferred_skills: job.preferredSkills || [],
        experience_min: job.experienceMin || 0,
        experience_max: job.experienceMax || 10
      };

      const result = await candidateService.matchCandidate(matchInput);
      setAnalysisMap(prev => ({
        ...prev,
        [job.id]: result
      }));
    } catch (err) {
      console.error('[Job Match Calculation Error]', err);
      setError(err.message || 'Failed to analyze match fit.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleApplyToJob = async (job) => {
    if (!hasResume) {
      navigate('/candidate/resume');
      return;
    }

    setApplying(true);
    try {
      const appData = {
        candidate_name: candidateResume.candidate_name || currentUser?.displayName || currentUser?.name || 'Applicant',
        email: candidateResume.email || currentUser?.email || '',
        phone: candidateResume.phone || '',
        skills: candidateResume.skills || [],
        projects: candidateResume.projects || [],
        certifications: candidateResume.certifications || [],
        education: candidateResume.education || [],
        experience: candidateResume.experience || [],
        availability: 'Immediate (2 weeks notice)',
        avatar: currentUser?.photoURL || currentUser?.avatar
      };

      const response = await candidateService.applyToJob(job.id, appData);
      
      const newApplied = [...new Set([...appliedJobs, job.id])];
      setAppliedJobs(newApplied);
      localStorage.setItem('evolvevita_applied_jobs', JSON.stringify(newApplied));

      setFeedback({
        type: 'success',
        message: `Application submitted for "${job.title}"! Match Score: ${response.match_score || 85}%`
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error('[Application Submission Error]', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to submit application. Please check backend.'
      });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setApplying(false);
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const selectedAnalysis = selectedJob ? analysisMap[selectedJob.id] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: '1300px', margin: '0 auto' }}
    >
      {/* TOAST FEEDBACK */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              background: '#FFFFFF',
              border: `1px solid ${feedback.type === 'error' ? '#FECACA' : '#BBF7D0'}`,
              boxShadow: 'var(--shadow-premium)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {feedback.type === 'error' ? (
              <AlertCircle size={16} style={{ color: 'var(--accent-danger)' }} />
            ) : (
              <CheckCircle2 size={16} style={{ color: 'var(--accent-success)' }} />
            )}
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {feedback.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Job Requisitions & Matches</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
            Discover active roles and evaluate real-time capability fit using explainable AI evidence.
          </p>
        </div>

        {!hasResume && (
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/candidate/resume')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Upload size={15} /> Upload Resume for Match Scores
          </button>
        )}
      </div>

      {!hasResume ? (
        <EmptyState 
          icon="resume"
          title="Match intelligence requires a parsed resume"
          description="Upload your resume to extract verified skills and unlock real-time match calculations against active job requisitions."
          actionLabel="Upload Resume"
          onAction={() => navigate('/candidate/resume')}
        />
      ) : loadingJobs ? (
        <div className="loading-orbit" style={{ padding: '6rem 0' }}>
          <div className="orbit-spinner"><div className="orbit-ring"></div><div className="orbit-ring-inner"></div></div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading active job listings...</span>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState 
          icon="jobs"
          title="No active job requisitions"
          description="There are currently no active job requisitions available. Check back soon for new openings."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: ACTIVE JOBS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Active Opportunities ({jobs.length})
              </span>
            </div>

            {jobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              const isApplied = appliedJobs.includes(job.id);
              const analysis = analysisMap[job.id];

              return (
                <div 
                  key={job.id} 
                  className="glass-card"
                  onClick={() => setSelectedJobId(job.id)}
                  style={{ 
                    padding: '1.5rem', 
                    cursor: 'pointer',
                    border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    background: isSelected ? '#FFFFFF' : '#FAFAFA'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div>
                      <span className="badge badge-violet" style={{ fontSize: '0.65rem', marginBottom: '0.35rem' }}>
                        {job.department}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {job.title}
                      </h3>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {job.location} • {job.workMode} • {job.type} • Min {job.experienceMin} yrs exp
                      </p>
                    </div>

                    {analysis ? (
                      <MatchScore score={analysis.match_score} size={44} strokeWidth={3} />
                    ) : isApplied ? (
                      <span className="badge badge-success">Applied</span>
                    ) : null}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.75rem 0' }}>
                    {job.description?.slice(0, 160)}...
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '1rem' }}>
                    {job.requiredSkills?.slice(0, 5).map((s, idx) => (
                      <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>{s}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <button 
                      type="button"
                      className="btn btn-secondary"
                      onClick={(e) => { e.stopPropagation(); handleAnalyzeJob(job); }}
                      disabled={loadingAnalysis}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Sparkles size={13} /> {analysis ? 'Re-calculate Match' : 'Calculate Match Score'}
                    </button>

                    <button 
                      type="button"
                      className="btn btn-primary"
                      onClick={(e) => { e.stopPropagation(); handleApplyToJob(job); }}
                      disabled={isApplied || applying}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.95rem' }}
                    >
                      {isApplied ? 'Applied ✓' : applying ? 'Submitting...' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: INSPECTION & REAL MATCH BREAKDOWN */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            {selectedJob ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.68rem', marginBottom: '0.4rem' }}>
                    Selected Role
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedJob.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {selectedJob.department} • {selectedJob.location} • {selectedJob.workMode}
                  </p>
                </div>

                {selectedAnalysis ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>AI Match Fit</span>
                        <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {selectedAnalysis.match_score}% Score
                        </h4>
                      </div>
                      <MatchScore score={selectedAnalysis.match_score} size={52} strokeWidth={4} />
                    </div>

                    {selectedAnalysis.matched_skills && (
                      <div>
                        <h5 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d', marginBottom: '0.35rem' }}>
                          Matched Skills ({selectedAnalysis.matched_skills.length})
                        </h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {selectedAnalysis.matched_skills.map((s, idx) => (
                            <span key={idx} className="badge badge-success" style={{ fontSize: '0.725rem' }}>✓ {s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedAnalysis.missing_skills && selectedAnalysis.missing_skills.length > 0 && (
                      <div>
                        <h5 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b91c1c', marginBottom: '0.35rem' }}>
                          Missing Skills ({selectedAnalysis.missing_skills.length})
                        </h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {selectedAnalysis.missing_skills.map((s, idx) => (
                            <span key={idx} className="badge badge-danger" style={{ fontSize: '0.725rem' }}>✕ {s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedAnalysis.explanation && (
                      <div style={{ background: '#EEF2FF', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #C7D2FE' }}>
                        <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
                          Match Explanation
                        </h5>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {selectedAnalysis.explanation.map((exp, i) => (
                            <p key={i}>• {exp}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <Sparkles size={28} style={{ color: 'var(--accent-primary)' }} />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Evaluate Fit for this Role</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Click "Calculate Match Score" on the left to evaluate your Skill DNA against this requisition.
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleAnalyzeJob(selectedJob)}
                      disabled={loadingAnalysis}
                      style={{ marginTop: '0.5rem', padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                    >
                      Calculate Fit Score
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState 
                icon="jobs"
                title="Select a job requisition"
                description="Select an active opportunity on the left to view job requirements and calculate your explainable match fit."
              />
            )}
          </div>

        </div>
      )}
    </motion.div>
  );
};

export default JobMatches;
