import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  BookOpen, 
  Award, 
  RefreshCw, 
  Upload, 
  Briefcase,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import candidateService from '../../services/candidateService';
import recruiterService from '../../services/recruiterService';
import EmptyState from '../../components/common/EmptyState';

const SkillGap = () => {
  const navigate = useNavigate();

  // Load candidate profile/resume from localStorage
  const [candidateResume, setCandidateResume] = useState(null);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [customSkillsInput, setCustomSkillsInput] = useState('');
  const [selectionType, setSelectionType] = useState('job'); // 'job' or 'custom'

  const [loading, setLoading] = useState(false);
  const [gapData, setGapData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedResume = localStorage.getItem('evolvevita_candidate_resume');
    if (savedResume) {
      try {
        setCandidateResume(JSON.parse(savedResume));
      } catch {}
    }

    const savedGap = localStorage.getItem('evolvevita_last_skillgap_result');
    if (savedGap) {
      try {
        setGapData(JSON.parse(savedGap));
      } catch {}
    }

    const loadJobs = async () => {
      try {
        const jobs = await recruiterService.getJobs();
        const active = (jobs || []).filter(j => j.status === 'Active');
        setAvailableJobs(active);
        if (active.length > 0) {
          setSelectedJobId(active[0].id);
        }
      } catch (err) {
        console.warn('Could not load jobs from backend:', err);
      }
    };
    loadJobs();
  }, []);

  const candidateSkills = candidateResume?.skills || [];
  const hasResume = candidateSkills.length > 0;

  const handleRunAnalysis = async () => {
    if (!hasResume) {
      setError('Please upload your resume to provide candidate skills for analysis.');
      return;
    }

    let targetRole = 'Target Role';
    let requiredSkills = [];

    if (selectionType === 'job') {
      const job = availableJobs.find(j => j.id === selectedJobId);
      if (!job) {
        setError('Please select a job requisition.');
        return;
      }
      targetRole = job.title;
      requiredSkills = job.requiredSkills || [];
    } else {
      if (!customRoleTitle.trim()) {
        setError('Please enter a target role name.');
        return;
      }
      targetRole = customRoleTitle.trim();
      requiredSkills = customSkillsInput.split(',').map(s => s.trim()).filter(Boolean);
      if (requiredSkills.length === 0) {
        setError('Please enter at least one required skill (comma-separated).');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const res = await candidateService.getSkillsGap(candidateSkills, targetRole, requiredSkills);
      const fullData = {
        ...res,
        target_role: targetRole,
        candidate_skills: candidateSkills,
        required_skills: requiredSkills
      };
      setGapData(fullData);
      localStorage.setItem('evolvevita_last_skillgap_result', JSON.stringify(fullData));
    } catch (err) {
      console.error('[Skill Gap Analysis Error]', err);
      setError(err.message || 'Failed to analyze skill gaps. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

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
          paddingBottom: '1rem'
        }}
      >
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Skill Gap Analysis</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
          Evaluate your verified skills against target role requirements to identify high-impact learning priorities.
        </p>
      </div>

      {/* IF NO RESUME / SKILLS ARE AVAILABLE -> EMPTY STATE */}
      {!hasResume ? (
        <EmptyState 
          icon="skills"
          title="Skill gap analysis requires a parsed resume"
          description="Upload your resume to extract your verified Skill DNA and evaluate capability gaps against market opportunities."
          actionLabel="Upload Resume"
          onAction={() => navigate('/candidate/resume')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: TARGET ROLE CONFIG */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span className="badge badge-violet" style={{ fontSize: '0.7rem' }}>Step 1</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Choose Target Role</h3>
              </div>

              {/* Mode Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setSelectionType('job')}
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    background: selectionType === 'job' ? '#EEF2FF' : '#F8FAFC',
                    color: selectionType === 'job' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: selectionType === 'job' ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)'
                  }}
                >
                  From Active Jobs
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setSelectionType('custom')}
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    background: selectionType === 'custom' ? '#EEF2FF' : '#F8FAFC',
                    color: selectionType === 'custom' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: selectionType === 'custom' ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)'
                  }}
                >
                  Custom Target Role
                </button>
              </div>

              {selectionType === 'job' ? (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="gap-job-select">Select Active Job Requisition</label>
                  {availableJobs.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No active jobs found. Switch to "Custom Target Role" to test any role.</p>
                  ) : (
                    <select
                      id="gap-job-select"
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      className="form-select"
                    >
                      {availableJobs.map(j => (
                        <option key={j.id} value={j.id}>
                          {j.title} ({j.department} • {j.location})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="custom-role-title">Target Role Title</label>
                    <input 
                      type="text"
                      id="custom-role-title"
                      value={customRoleTitle}
                      onChange={(e) => setCustomRoleTitle(e.target.value)}
                      placeholder="e.g. Senior Cloud Architect"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="custom-role-skills">Required Skills (comma-separated)</label>
                    <input 
                      type="text"
                      id="custom-role-skills"
                      value={customSkillsInput}
                      onChange={(e) => setCustomSkillsInput(e.target.value)}
                      placeholder="e.g. Kubernetes, Terraform, Go, AWS, Docker"
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRunAnalysis}
                  disabled={loading}
                  style={{ width: '100%', padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="spinner" /> Evaluating Skill Alignment...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Analyze Skill Gaps
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Candidate Current Verified Skills */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Your Verified Skills</h3>
                <span className="badge badge-success">{candidateSkills.length} Skills</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {candidateSkills.map((sk, idx) => (
                  <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{sk}</span>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: REAL GAP ANALYSIS RESULTS */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={18} style={{ color: 'var(--accent-primary)' }} />
                  Analysis Results
                </h3>
                {gapData && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target: {gapData.target_role}</span>}
              </div>
              {gapData && <span className="badge badge-violet">Live Analysis</span>}
            </div>

            {!gapData ? (
              <EmptyState 
                icon="skills"
                title="Ready for Skill Gap Evaluation"
                description="Select a target role on the left and click 'Analyze Skill Gaps' to calculate matched and missing capabilities."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* MATCHED SKILLS */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                    <CheckCircle size={15} /> Matched Skills ({gapData.matched_skills?.length || 0})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {gapData.matched_skills && gapData.matched_skills.length > 0 ? (
                      gapData.matched_skills.map((s, idx) => (
                        <span key={idx} className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ {s}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No direct skill overlap found</span>
                    )}
                  </div>
                </div>

                {/* MISSING SKILLS */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                    <AlertTriangle size={15} /> High-Impact Missing Skills ({gapData.missing_skills?.length || 0})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {gapData.missing_skills && gapData.missing_skills.length > 0 ? (
                      gapData.missing_skills.map((s, idx) => (
                        <span key={idx} className="badge badge-danger" style={{ fontSize: '0.75rem' }}>✕ {s}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>✓ All required skills matched!</span>
                    )}
                  </div>
                </div>

                {/* GROWTH ROADMAP GUIDANCE */}
                {gapData.growth_path && gapData.growth_path.length > 0 && (
                  <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                      <BookOpen size={16} style={{ color: 'var(--accent-primary)' }} /> Recommended Action Plan
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {gapData.growth_path.map((pathItem, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{idx + 1}.</span>
                          <span>{pathItem}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/candidate/learning')}
                      style={{ marginTop: '1.25rem', padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      View Full Learning Roadmap <ArrowRight size={14} />
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      )}
    </motion.div>
  );
};

export default SkillGap;
