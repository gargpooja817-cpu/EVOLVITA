import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, FileText, AlertTriangle } from 'lucide-react';

const DecisionModal = ({ isOpen, onClose, candidate, onSave }) => {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (candidate) {
      setStatus(candidate.decisionStatus || 'Needs Review');
      setNotes(candidate.recruiterNotes || '');
    }
  }, [candidate, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(candidate.id, status, notes);
    onClose();
  };

  if (!isOpen || !candidate) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="glass-panel modal-content"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="modal-header">
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} className="glow-text-cyan" style={{ color: 'var(--accent-secondary)' }} />
              Log Hiring Decision
            </h3>
            <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <img 
              src={candidate.avatar} 
              alt={candidate.name} 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{candidate.name}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{candidate.targetRole}</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <span className="badge badge-violet">Score {candidate.matchScore}%</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="decision-status-select">Hiring Action</label>
              <select 
                id="decision-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select"
                style={{ background: '#111625', width: '100%' }}
              >
                <option value="Shortlisted">Shortlist Candidate</option>
                <option value="Interview">Schedule Interview</option>
                <option value="Needs Review">Mark as Needs Review</option>
                <option value="Rejected">Decline Application</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="decision-notes-textarea">Evaluation Notes</label>
              <textarea 
                id="decision-notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document key highlights, skills observed, or scheduling instructions..."
                className="form-textarea"
                style={{ minHeight: '120px' }}
                required
              />
            </div>

            <div 
              style={{ 
                background: 'rgba(6, 182, 212, 0.03)', 
                border: '1px solid rgba(6, 182, 212, 0.15)',
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start'
              }}
            >
              <AlertTriangle size={16} style={{ color: 'var(--accent-secondary)', marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>AI recommendation transparency:</strong> EvolveVita provides match scores based on project evidence. The final decision is entirely logged and authorized by you.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                style={{ padding: '0.6rem 1.2rem' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle size={16} /> Save Decision
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DecisionModal;
