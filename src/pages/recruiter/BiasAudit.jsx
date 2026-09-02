import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import recruiterService from '../../services/recruiterService';

const BiasAudit = () => {
  const [description, setDescription] = useState(
    `EvolveVita is seeking a Full Stack developer to join our engineering pod. You will collaborate with team members, develop scalable APIs in Python and React, and deploy distributed microservices.`
  );

  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [auditResults, setAuditResults] = useState(null);
  const [fairnessScore, setFairnessScore] = useState(100);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!description.trim()) {
      setToast('Please enter a description to analyze.');
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setLoading(true);
    setAnalyzed(false);
    setError(null);

    try {
      const res = await recruiterService.analyzeBias(description);
      setFairnessScore(res.fairness_score || 100);
      setAuditResults(res.issues || []);
      setAnalyzed(true);
      setToast('Linguistic analysis complete!');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Bias analysis error:', err);
      setError(err.message || 'Linguistic analysis failed. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const applyAlternative = (phrase, alternative) => {
    let desc = description;
    const regex = new RegExp(phrase, 'gi');
    desc = desc.replace(regex, alternative);
    setDescription(desc);

    setAuditResults(prev => prev.filter(iss => iss.phrase !== phrase));
    setFairnessScore(prev => Math.min(100, prev + 10));
    setToast('Alternative applied successfully!');
    setTimeout(() => setToast(null), 2500);
  };

  const applyAllSuggestions = async () => {
    if (!auditResults || auditResults.length === 0) return;
    
    setLoading(true);
    try {
      const res = await recruiterService.applyBiasSuggestions(description, auditResults);
      if (res && res.inclusive_version) {
        setDescription(res.inclusive_version);
      }
      setAuditResults([]);
      setFairnessScore(100);
      setToast('All recommendations applied!');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Apply all error:', err);
      // Fallback local substitution
      let desc = description;
      auditResults.forEach(iss => {
        if (iss.phrase && iss.suggestion) {
          const regex = new RegExp(iss.phrase, 'gi');
          desc = desc.replace(regex, iss.suggestion);
        }
      });
      setDescription(desc);
      setAuditResults([]);
      setFairnessScore(100);
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
      style={{ maxWidth: '1350px', margin: '0 auto' }}
    >
      {toast && (
        <div 
          className="glass-panel" 
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '1rem 1.5rem',
            borderLeft: '4px solid var(--accent-primary)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toast}</span>
        </div>
      )}

      <div 
        style={{ 
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem'
        }}
      >
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Bias Intelligence Laboratory</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
          Evaluate job descriptions for gender or age language bias, exclusionary terms, and structural inclusivity.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* LEFT COLUMN: DESCRIPTION EDITOR */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Text Editor Workspace
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {description.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          <textarea 
            aria-label="Job description to analyze"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea"
            style={{ 
              width: '100%', 
              minHeight: '300px', 
              lineHeight: 1.6,
              fontSize: '0.925rem'
            }}
            placeholder="Type or paste a job requisition description here to test for linguistic bias..."
          />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} /> {loading ? 'Running AI Check...' : 'Run Linguistic Check'}
            </button>
            <button className="btn btn-secondary" onClick={() => setDescription('')}>
              Clear Workspace
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: BIAS AUDIT ANALYSIS */}
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '430px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--accent-primary)' }} />
              Fairness Performance
            </h3>
            {analyzed && (
              <span className={`badge ${fairnessScore >= 90 ? 'badge-success' : fairnessScore >= 75 ? 'badge-warning' : 'badge-danger'}`}>
                {fairnessScore}/100 Rating
              </span>
            )}
          </div>

          {!analyzed && !loading && (
            <div style={{ padding: '4rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <AlertTriangle size={36} style={{ color: 'var(--text-muted)' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '320px' }}>
                Input requisition text in the editor on the left and click "Run Linguistic Check" to scan for bias patterns.
              </p>
            </div>
          )}

          {loading && (
            <div className="loading-orbit" style={{ padding: '6rem 0' }}>
              <div className="orbit-spinner">
                <div className="orbit-ring"></div>
                <div className="orbit-ring-inner"></div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Analyzing sentence matrices via backend...</span>
            </div>
          )}

          {analyzed && !loading && auditResults && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {auditResults.length === 0 ? (
                <div 
                  style={{ 
                    padding: '2rem 1.5rem', 
                    background: '#F0FDF4', 
                    border: '1px solid #BBF7D0', 
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <CheckCircle size={32} style={{ color: '#16a34a' }} />
                  <h4 style={{ color: '#15803d', fontWeight: 700 }}>100/100 Fairness Rating</h4>
                  <p style={{ fontSize: '0.8rem', color: '#166534', lineHeight: 1.4 }}>
                    No ageist references, gender-coded terms, or gatekeeping markers detected. Your description is highly inclusive!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Detected Issues ({auditResults.length})
                    </span>
                    <button 
                      onClick={applyAllSuggestions}
                      style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Apply All Suggestions
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                    {auditResults.map((iss, idx) => (
                      <div key={idx} className="glass-card" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                            {iss.category}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => applyAlternative(iss.phrase, iss.suggestion)}
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--accent-primary)',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <RefreshCw size={12} /> Apply Alternative
                          </button>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                          <strong>Flagged phrase:</strong> <em>"{iss.phrase}"</em>
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '0.15rem' }}>
                          <strong>Recommended:</strong> "{iss.suggestion}"
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                          {iss.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                className="btn btn-secondary" 
                onClick={handleAnalyze} 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
              >
                <RefreshCw size={14} /> Re-analyze Text
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BiasAudit;
