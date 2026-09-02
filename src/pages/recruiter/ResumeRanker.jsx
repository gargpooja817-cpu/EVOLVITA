import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Sparkles, 
  Briefcase, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight, 
  Search,
  Eye,
  X,
  PlusCircle,
  RefreshCw,
  Award,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  UserCheck
} from 'lucide-react';

import recruiterService from '../../services/recruiterService';
import candidateService from '../../services/candidateService';
import MatchScore from '../../components/recruiter/MatchScore';
import EmptyState from '../../components/common/EmptyState';

const ResumeRanker = () => {
  const navigate = useNavigate();

  // Config States
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [pastedDesc, setPastedDesc] = useState('');
  const [jobMode, setJobMode] = useState('select'); // 'select' or 'paste'
  const [jobsLoading, setJobsLoading] = useState(true);

  // Files state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Sourcing Results
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Active modal details candidate
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Sourcing filters
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    const initData = async () => {
      try {
        const list = await recruiterService.getJobs();
        const activeList = (list || []).filter(j => j.status === 'Active');
        setJobs(activeList);
        if (activeList.length > 0) {
          setSelectedJobId(activeList[0].id);
        }
      } catch (err) {
        console.warn("Notice: could not retrieve jobs from backend:", err);
      } finally {
        setJobsLoading(false);
      }
    };
    initData();
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
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    setError(null);
    const validFiles = files.filter(file => {
      const name = file.name.toLowerCase();
      return name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.txt');
    });

    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Only PDF, DOCX, and TXT are supported.');
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusLabel = (score) => {
    if (score >= 85) return 'Strong Match';
    if (score >= 70) return 'Moderate Match';
    if (score >= 50) return 'Needs Review';
    return 'Low Match';
  };

  const getEvidenceStrength = (cand) => {
    const matchedCount = cand.matched_skills?.length || 0;
    if (matchedCount >= 4) return 'High';
    if (matchedCount >= 2) return 'Medium';
    return 'Basic';
  };

  // Validation Flags
  const hasJob = jobMode === 'select' ? Boolean(selectedJobId) : Boolean(pastedDesc.trim());
  const hasResumes = uploadedFiles.length > 0;
  const canAnalyze = hasJob && hasResumes;

  const runAnalysis = async () => {
    if (!hasJob) {
      setError(jobMode === 'select' 
        ? 'Select a job requisition before analyzing candidates.' 
        : 'Add job requirements before running candidate intelligence.');
      return;
    }
    if (!hasResumes) {
      setError('Upload resumes or select applicants before analysis.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    const steps = [
      'Parsing uploaded resumes...',
      'Extracting technology skill profiles...',
      'Evaluating requirements alignment...',
      'Generating explainable ranking coefficients...'
    ];

    let currentStep = 0;
    setLoadingStep(steps[currentStep]);
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setLoadingStep(steps[currentStep]);
      }
    }, 1000);

    try {
      const formData = new FormData();
      if (jobMode === 'select') {
        formData.append('job_id', selectedJobId);
      } else {
        formData.append('job_description', pastedDesc);
      }

      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await recruiterService.rankResumes(formData);
      clearInterval(stepInterval);
      setResults(response.results || []);
    } catch (err) {
      console.error("[Analysis execution error]", err);
      clearInterval(stepInterval);
      setError('Intelligence service is currently unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (candidate, decision) => {
    try {
      if (candidate.candidate_id) {
        await candidateService.updateCandidate(candidate.candidate_id, {
          decisionStatus: decision,
          recruiterNotes: `Decision logged as "${decision}" via Resume Ranker.`
        }).catch(() => {});
      }
      setToast(`Candidate ${candidate.name} updated to "${decision}".`);
      setTimeout(() => setToast(null), 3000);
      setSelectedCandidate(null);
    } catch (err) {
      console.warn('Decision update note:', err);
    }
  };

  const filteredResults = results ? results.filter(cand => {
    const matchesSearch = !searchQuery || 
      cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cand.matched_skills && cand.matched_skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesScore = (cand.overall_match_score || 0) >= minScore;
    return matchesSearch && matchesScore;
  }) : [];

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: '1350px', margin: '0 auto' }}
    >
      {/* TOAST FEEDBACK */}
      {toast && (
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
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toast}</span>
        </div>
      )}

      {/* SAP FIORI ENTERPRISE PAGE HEADER */}
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
            <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              SAP Fiori / SAPUI5 Recruiter Experience
            </span>
            <span className="badge badge-secondary" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              Fiori-inspired Prototype
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
            Resume Ranker
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.2rem' }}>
            Analyze applicants against verified job requirements.
          </p>
        </div>

        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/recruiter/create-job')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusCircle size={15} /> Create Job Requisition
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.35fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: SETUP JOB & RESUMES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* STEP 1: JOB REQUISITION SELECTION */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span className="badge badge-violet" style={{ fontSize: '0.7rem' }}>Step 1</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Job Requisition</h3>
            </div>

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
                Select Job Requisition
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
                Custom Job Description
              </button>
            </div>

            {jobMode === 'select' ? (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="ranker-job-select">Select Job Requisition</label>
                {jobsLoading ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading active jobs...</p>
                ) : jobs.length === 0 ? (
                  <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      No job requisitions yet.
                    </p>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => navigate('/recruiter/create-job')}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    >
                      Create your first job
                    </button>
                  </div>
                ) : (
                  <select
                    id="ranker-job-select"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="form-select"
                  >
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.department} • {j.location})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="ranker-jd-paste">Custom Job Description</label>
                <textarea
                  id="ranker-jd-paste"
                  value={pastedDesc}
                  onChange={(e) => setPastedDesc(e.target.value)}
                  placeholder="Paste complete role requirements and specifications..."
                  className="form-textarea"
                  style={{ minHeight: '120px', fontSize: '0.85rem' }}
                />
              </div>
            )}
          </div>

          {/* STEP 2: RESUME UPLOAD */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Step 2</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Upload Resumes</h3>
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
              onClick={() => document.getElementById('recruiter-resumes-input').click()}
            >
              <input 
                type="file" 
                id="recruiter-resumes-input" 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
                accept=".pdf,.docx,.txt"
                multiple
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                  <Upload size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Upload candidate resumes
                  </span>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Select PDF, DOCX, or TXT files for AI analysis
                  </p>
                </div>
              </div>
            </div>

            {/* Uploaded Files Queue */}
            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {uploadedFiles.map((f, index) => (
                  <div 
                    key={index}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      background: '#F8FAFC',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={15} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ fontWeight: 600 }}>{f.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({(f.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveFile(index)}
                      style={{ color: 'var(--accent-danger)', padding: '2px 6px' }}
                      title="Remove file"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 3: ACTION BUTTON */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={runAnalysis}
                disabled={loading || !canAnalyze}
                style={{ width: '100%', padding: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={15} className="spinner" /> {loadingStep || 'Running Candidate Intelligence...'}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Analyze Candidates
                  </>
                )}
              </button>

              {!canAnalyze && (
                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                  {!hasJob 
                    ? 'Select a job requisition before analyzing candidates.' 
                    : 'Upload resumes before analysis.'}
                </p>
              )}
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: SAP FIORI ENTERPRISE TABLE RESULTS */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={18} style={{ color: 'var(--accent-primary)' }} />
                Candidate Rankings
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Explainable fit coefficients evaluated against verified requisitions.
              </p>
            </div>
            {results && <span className="badge badge-success">{results.length} Candidates Evaluated</span>}
          </div>

          {loading ? (
            <div className="loading-orbit" style={{ padding: '6rem 0' }}>
              <div className="orbit-spinner"><div className="orbit-ring"></div><div className="orbit-ring-inner"></div></div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>{loadingStep}</span>
            </div>
          ) : !results ? (
            <EmptyState 
              icon="resume"
              title="No candidates analyzed yet"
              description="Select a job requisition, upload resumes on the left, and click 'Analyze Candidates' to generate explainable candidate rankings."
            />
          ) : results.length === 0 ? (
            <EmptyState 
              icon="default"
              title="No candidate matches found"
              description="No candidate resumes were parsed successfully. Please check your uploaded files."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Filter Bar */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flexGrow: 1, minWidth: '180px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by candidate name or skill..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    style={{ width: '100%', paddingLeft: '2.25rem', height: '36px', fontSize: '0.8rem' }}
                  />
                </div>

                <select 
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  className="form-select"
                  style={{ width: 'auto', height: '36px', fontSize: '0.8rem' }}
                >
                  <option value={0}>All Scores</option>
                  <option value={60}>Score ≥ 60%</option>
                  <option value={75}>Score ≥ 75%</option>
                  <option value={85}>Score ≥ 85%</option>
                </select>
              </div>

              {/* Fiori-Style Responsive Enterprise Table */}
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Rank</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Candidate</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Match Score</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Evidence Strength</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((cand, idx) => {
                      const rank = cand.ranking || idx + 1;
                      const score = cand.overall_match_score || 0;
                      const evidence = getEvidenceStrength(cand);
                      const status = getStatusLabel(score);

                      return (
                        <tr 
                          key={cand.candidate_id || idx}
                          style={{ 
                            borderBottom: '1px solid var(--border-subtle)',
                            background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                          onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'}
                        >
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                            #{rank}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cand.name}</div>
                            {cand.email && <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{cand.email}</div>}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <MatchScore score={score} size={36} strokeWidth={3} />
                              <span style={{ fontWeight: 700 }}>{score}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span 
                              className={`badge ${evidence === 'High' ? 'badge-success' : evidence === 'Medium' ? 'badge-cyan' : 'badge-secondary'}`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              {evidence}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span 
                              className={`badge ${score >= 85 ? 'badge-success' : score >= 70 ? 'badge-cyan' : score >= 50 ? 'badge-warning' : 'badge-danger'}`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              {status}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <button 
                              className="btn btn-secondary"
                              onClick={() => setSelectedCandidate(cand)}
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Eye size={13} /> View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* OBJECT-PAGE STYLE CANDIDATE DETAILS MODAL */}
      <AnimatePresence>
        {selectedCandidate && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setSelectedCandidate(null)}
          >
            <motion.div 
              className="glass-panel"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '720px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem',
                boxShadow: 'var(--shadow-premium)',
                background: '#FFFFFF'
              }}
            >
              {/* OBJECT PAGE HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <span className="badge badge-cyan" style={{ fontSize: '0.68rem', marginBottom: '0.4rem' }}>
                    Object Page Candidate Inspection
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedCandidate.name}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Rank #{selectedCandidate.ranking || 1} • Overall Fit Score: <strong>{selectedCandidate.overall_match_score}%</strong>
                  </p>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="btn-ghost" style={{ padding: '0.35rem' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Score Breakdown Section */}
                {selectedCandidate.score_breakdown && (
                  <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      Fit Breakdown
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                      <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'Outfit' }}>
                          {selectedCandidate.score_breakdown.skills}%
                        </span>
                        <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Skills Overlap</p>
                      </div>
                      <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', fontFamily: 'Outfit' }}>
                          {selectedCandidate.score_breakdown.experience}%
                        </span>
                        <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Experience Fit</p>
                      </div>
                      <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-secondary)', fontFamily: 'Outfit' }}>
                          {selectedCandidate.score_breakdown.keywords}%
                        </span>
                        <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Evidence Signals</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills Overlap */}
                {selectedCandidate.matched_skills && (
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', marginBottom: '0.4rem' }}>
                      Verified Matched Skills ({selectedCandidate.matched_skills.length})
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {selectedCandidate.matched_skills.map((s, idx) => (
                        <span key={idx} className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ {s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {selectedCandidate.missing_skills && selectedCandidate.missing_skills.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c', marginBottom: '0.4rem' }}>
                      Missing Requisition Skills ({selectedCandidate.missing_skills.length})
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {selectedCandidate.missing_skills.map((s, idx) => (
                        <span key={idx} className="badge badge-danger" style={{ fontSize: '0.75rem' }}>✕ {s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Ranking Explanation */}
                {selectedCandidate.explanation && (
                  <div style={{ background: '#EEF2FF', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #C7D2FE' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.35rem' }}>
                      AI Match Explanation
                    </h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {selectedCandidate.explanation}
                    </p>
                  </div>
                )}

                {/* Human-in-the-Loop Actions */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>
                    Human Decision Action
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleDecision(selectedCandidate, 'Shortlisted')}
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckCircle2 size={15} /> Shortlist Candidate
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleDecision(selectedCandidate, 'Needs Review')}
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.825rem' }}
                    >
                      Keep in Review
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleDecision(selectedCandidate, 'Rejected')}
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.825rem', color: 'var(--accent-danger)' }}
                    >
                      Decline
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResumeRanker;
