import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Award, 
  BookOpen, 
  Briefcase, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Layers,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import candidateService from '../../services/candidateService';
import recruiterService from '../../services/recruiterService';
import MatchScore from '../../components/recruiter/MatchScore';

const ResumeIntelligence = () => {
  // Step 1 & 2: Resume file & parsed data
  const [file, setFile] = useState(null);
  const [parsingLoading, setParsingLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Step 4: Job Context
  const [availableJobs, setAvailableJobs] = useState([]);
  const [jobMode, setJobMode] = useState('select'); // 'select' or 'paste'
  const [selectedJobId, setSelectedJobId] = useState('');
  const [pastedJobDesc, setPastedJobDesc] = useState('');
  const [jobsLoading, setJobsLoading] = useState(true);

  // Step 5 & 6: Match Analysis
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [matchError, setMatchError] = useState(null);

  useEffect(() => {
    // Load previously parsed resume if present
    const savedResume = localStorage.getItem('evolvevita_candidate_resume');
    if (savedResume) {
      try {
        setParsedData(JSON.parse(savedResume));
      } catch {}
    }

    const savedMatch = localStorage.getItem('evolvevita_last_match_result');
    if (savedMatch) {
      try {
        setMatchResult(JSON.parse(savedMatch));
      } catch {}
    }

    // Load available active jobs from backend
    const loadJobs = async () => {
      try {
        const jobs = await recruiterService.getJobs();
        const active = jobs.filter(j => j.status === 'Active');
        setAvailableJobs(active);
        if (active.length > 0) {
          setSelectedJobId(active[0].id);
        }
      } catch (err) {
        console.warn('Could not load jobs from backend:', err);
      } finally {
        setJobsLoading(false);
      }
    };
    loadJobs();
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndProcessFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndProcessFile(selectedFile);
    }
  };

  const validateAndProcessFile = (selectedFile) => {
    setParseError(null);
    const name = selectedFile.name.toLowerCase();
    if (name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.txt')) {
      setFile(selectedFile);
    } else {
      setParseError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      setFile(null);
    }
  };

  // STEP 2: Parse resume using real backend API
  const handleParseResume = async () => {
    if (!file) return;

    setParsingLoading(true);
    setParseError(null);
    setMatchResult(null);

    try {
      const data = await candidateService.parseResume(file);
      setParsedData(data);
      localStorage.setItem('evolvevita_candidate_resume', JSON.stringify(data));
    } catch (err) {
      console.error('[Resume Parsing Error]', err);
      setParseError(err.message || 'Failed to parse resume file. Please ensure the backend is running.');
    } finally {
      setParsingLoading(false);
    }
  };

  // STEP 6: Call real backend match analysis API
  const handleAnalyzeMatch = async () => {
    if (!parsedData || !parsedData.skills || parsedData.skills.length === 0) {
      setMatchError('Please upload and parse your resume first.');
      return;
    }

    let jobTitle = 'Target Role';
    let requiredSkills = [];
    let preferredSkills = [];
    let expMin = 0;
    let expMax = 10;

    if (jobMode === 'select') {
      const chosenJob = availableJobs.find(j => j.id === selectedJobId);
      if (!chosenJob) {
        setMatchError('Please select a valid job requisition.');
        return;
      }
      jobTitle = chosenJob.title;
      requiredSkills = chosenJob.requiredSkills || [];
      preferredSkills = chosenJob.preferredSkills || [];
      expMin = chosenJob.experienceMin || 0;
      expMax = chosenJob.experienceMax || 10;
    } else {
      if (!pastedJobDesc.trim()) {
        setMatchError('Please paste a job description.');
        return;
      }
      // Analyze the pasted job description first via backend API
      try {
        setMatchLoading(true);
        const jdAnalysis = await recruiterService.analyzeJobDescription(pastedJobDesc);
        jobTitle = jdAnalysis.job_title || 'Pasted Job Requisition';
        requiredSkills = jdAnalysis.required_skills || [];
        preferredSkills = jdAnalysis.preferred_skills || [];
        expMin = jdAnalysis.experience_required?.minimum || 0;
        expMax = jdAnalysis.experience_required?.maximum || 10;
      } catch (err) {
        console.error('Job analysis failed:', err);
        setMatchError('Failed to analyze the pasted job description. ' + (err.message || ''));
        setMatchLoading(false);
        return;
      }
    }

    setMatchLoading(true);
    setMatchError(null);

    try {
      const matchInput = {
        candidate_name: parsedData.candidate_name || 'Candidate',
        skills: parsedData.skills || [],
        experience_years: parsedData.experience ? parsedData.experience.length * 1.5 : 3.0,
        projects: parsedData.projects || [],
        certifications: parsedData.certifications || [],
        sap_learning_evidence: [],
        job_title: jobTitle,
        required_skills: requiredSkills,
        preferred_skills: preferredSkills,
        experience_min: expMin,
        experience_max: expMax
      };

      const result = await candidateService.matchCandidate(matchInput);
      const fullResult = {
        ...result,
        job_title: jobTitle
      };
      setMatchResult(fullResult);
      localStorage.setItem('evolvevita_last_match_result', JSON.stringify(fullResult));
    } catch (err) {
      console.error('[Match Analysis Error]', err);
      setMatchError(err.message || 'Failed to generate match analysis. Please check your backend connection.');
    } finally {
      setMatchLoading(false);
    }
  };

  const canAnalyze = Boolean(
    parsedData && 
    parsedData.skills && 
    parsedData.skills.length > 0 && 
    ((jobMode === 'select' && selectedJobId) || (jobMode === 'paste' && pastedJobDesc.trim()))
  );

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
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Resume Intelligence & Matching</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
          Upload your resume and compare against job requisitions using our AI matching engine.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: UPLOAD & JOB CONTEXT CONFIGURATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* STEP 1: RESUME UPLOADER */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span className="badge badge-violet" style={{ fontSize: '0.7rem' }}>Step 1 & 2</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Upload & Parse Resume</h3>
            </div>

            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragOver ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                background: '#FAFAFA',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('resume-file-input').click()}
            >
              <input 
                type="file" 
                id="resume-file-input" 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
                accept=".pdf,.docx,.txt"
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                  <Upload size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {file ? file.name : 'Click to select or drag & drop resume'}
                  </span>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Supported formats: PDF, DOCX, TXT (up to 5MB)
                  </p>
                </div>
              </div>
            </div>

            {file && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{file.name}</span>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={handleParseResume}
                  disabled={parsingLoading}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
                >
                  {parsingLoading ? 'Parsing with AI...' : 'Parse Resume'}
                </button>
              </div>
            )}

            {parseError && (
              <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{parseError}</span>
              </div>
            )}
          </div>

          {/* STEP 4: JOB CONTEXT SELECTION */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Step 4</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Provide Target Job Context</h3>
            </div>

            {/* Selection Mode Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setJobMode('select')}
                style={{
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  background: jobMode === 'select' ? '#EEF2FF' : '#F8FAFC',
                  color: jobMode === 'select' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: jobMode === 'select' ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)'
                }}
              >
                Option A: Select Active Job
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setJobMode('paste')}
                style={{
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  background: jobMode === 'paste' ? '#EEF2FF' : '#F8FAFC',
                  color: jobMode === 'paste' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: jobMode === 'paste' ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)'
                }}
              >
                Option B: Paste Job Description
              </button>
            </div>

            {jobMode === 'select' ? (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="select-job-dropdown">Select Available Job Requisition</label>
                {jobsLoading ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading active jobs...</p>
                ) : availableJobs.length === 0 ? (
                  <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    No active jobs created yet. Switch to "Option B: Paste Job Description" to analyze any role description.
                  </div>
                ) : (
                  <select
                    id="select-job-dropdown"
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
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="paste-jd-text">Paste Job Description Text</label>
                <textarea
                  id="paste-jd-text"
                  value={pastedJobDesc}
                  onChange={(e) => setPastedJobDesc(e.target.value)}
                  placeholder="Paste complete job description requirements here..."
                  className="form-textarea"
                  style={{ minHeight: '120px', fontSize: '0.85rem' }}
                />
              </div>
            )}

            {/* STEP 5: ACTION BUTTON */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAnalyzeMatch}
                disabled={!canAnalyze || matchLoading}
                style={{ width: '100%', padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {matchLoading ? (
                  <>
                    <RefreshCw size={15} className="spinner" /> Calculating Match Parameters...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Analyze Match Fit
                  </>
                )}
              </button>

              {!canAnalyze && (
                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                  {!parsedData ? 'Upload and parse a resume' : 'Select a job or paste description'} to enable match analysis.
                </p>
              )}
            </div>

            {matchError && (
              <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{matchError}</span>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: REAL RESULTS DISPLAY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* EXTRACTED RESUME INFORMATION (STEP 3) */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCheck size={18} style={{ color: parsedData ? '#16a34a' : 'var(--text-muted)' }} />
                Extracted Resume Data
              </h3>
              {parsedData && <span className="badge badge-success">Extraction Complete</span>}
            </div>

            {!parsedData ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <Upload size={32} style={{ color: 'var(--text-muted)' }} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>No resume uploaded yet</h4>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                  Upload your resume in PDF, DOCX, or TXT format on the left to extract skills, projects, and credentials.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Extracted Name</span>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.15rem' }}>{parsedData.candidate_name}</h4>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                    {parsedData.email && `Email: ${parsedData.email}`} {parsedData.phone && `• Phone: ${parsedData.phone}`}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    Extracted Skills ({parsedData.skills?.length || 0})
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {parsedData.skills && parsedData.skills.length > 0 ? (
                      parsedData.skills.map((sk, idx) => (
                        <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{sk}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No explicit skills detected</span>
                    )}
                  </div>
                </div>

                {parsedData.projects && parsedData.projects.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      Extracted Projects ({parsedData.projects.length})
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {parsedData.projects.map((p, i) => (
                        <div key={i} className="glass-card" style={{ padding: '0.75rem' }}>
                          <span style={{ fontSize: '0.825rem', fontWeight: 700 }}>{p.name}</span>
                          {p.description && <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {parsedData.certifications && parsedData.certifications.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      Extracted Certifications ({parsedData.certifications.length})
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {parsedData.certifications.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem' }}>
                          <Award size={14} style={{ color: 'var(--accent-primary)' }} />
                          <span>{c.name}</span>
                          <span style={{ color: 'var(--text-muted)' }}>({c.issuer})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 7: REAL MATCH ANALYSIS RESULTS */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-secondary)' }} />
                Match Fit Intelligence
              </h3>
              {matchResult && <span className="badge badge-violet">Live Backend Result</span>}
            </div>

            {!matchResult ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <Briefcase size={32} style={{ color: 'var(--text-muted)' }} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Ready for Match Analysis</h4>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                  Provide your resume and job requirements to generate a real-time explainable match score.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Evaluated Job</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{matchResult.job_title}</h4>
                  </div>
                  <MatchScore score={matchResult.match_score} size={54} strokeWidth={4} />
                </div>

                {/* Strengths */}
                {matchResult.strengths && matchResult.strengths.length > 0 && (
                  <div style={{ background: '#F0FDF4', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                    <h5 style={{ fontSize: '0.775rem', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.35rem' }}>
                      <CheckCircle size={13} /> Fit Strengths
                    </h5>
                    <ul style={{ paddingLeft: '1rem', fontSize: '0.75rem', color: '#166534', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {matchResult.strengths.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skill Gaps */}
                {matchResult.missing_skills && matchResult.missing_skills.length > 0 && (
                  <div style={{ background: '#FEF2F2', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #FECACA' }}>
                    <h5 style={{ fontSize: '0.775rem', fontWeight: 700, color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.35rem' }}>
                      <AlertTriangle size={13} /> Missing Skills ({matchResult.missing_skills.length})
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {matchResult.missing_skills.map((sk, i) => (
                        <span key={i} className="badge badge-danger" style={{ fontSize: '0.7rem' }}>{sk}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {matchResult.explanation && matchResult.explanation.length > 0 && (
                  <div>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Evaluation Details
                    </h5>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.45, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {matchResult.explanation.map((exp, i) => (
                        <p key={i}>• {exp}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default ResumeIntelligence;
