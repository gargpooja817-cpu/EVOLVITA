import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Check, 
  AlertCircle, 
  Bookmark, 
  Send, 
  RefreshCw, 
  X,
  ArrowLeft,
  Briefcase,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Plus
} from 'lucide-react';
import recruiterService from '../../services/recruiterService';

const CreateJob = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    type: 'Full-time',
    location: '',
    workMode: 'Hybrid',
    expMin: 2,
    expMax: 6,
    description: '',
    preferences: ''
  });

  const [skills, setSkills] = useState(['React', 'TypeScript', 'Node.js']);
  const [preferredSkills, setPreferredSkills] = useState(['Docker', 'GraphQL']);
  const [newSkill, setNewSkill] = useState('');
  const [newPrefSkill, setNewPrefSkill] = useState('');
  
  // AI Audit State
  const [loading, setLoading] = useState(false);
  const [audited, setAudited] = useState(false);
  const [inclusivityScore, setInclusivityScore] = useState(100);
  const [issues, setIssues] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Feedback Toast State
  const [feedback, setFeedback] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills(prev => [...prev, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleAddPrefSkill = (e) => {
    e.preventDefault();
    const trimmed = newPrefSkill.trim();
    if (trimmed && !preferredSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setPreferredSkills(prev => [...prev, trimmed]);
      setNewPrefSkill('');
    }
  };

  const handleRemovePrefSkill = (skillToRemove) => {
    setPreferredSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const triggerAudit = async () => {
    if (!formData.description.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a job description to run the AI Inclusivity Audit.' });
      setTimeout(() => setFeedback(null), 3500);
      return;
    }

    setLoading(true);
    setAudited(false);

    try {
      const [analysisRes, biasRes] = await Promise.all([
        recruiterService.analyzeJobDescription(formData.description),
        recruiterService.analyzeBias(formData.description)
      ]);

      setInclusivityScore(biasRes.fairness_score || 100);
      
      const formattedIssues = (biasRes.issues || []).map((iss, index) => ({
        id: `bias-${index}-${Date.now()}`,
        category: iss.category,
        phrase: iss.phrase,
        issue: iss.explanation,
        alternative: iss.suggestion
      }));
      setIssues(formattedIssues);

      const parsed = [
        ...(analysisRes.required_skills || [])
      ];
      if (parsed.length > 0) {
        setSkills(prev => [...new Set([...prev, ...parsed])]);
      }
      if (analysisRes.preferred_skills && analysisRes.preferred_skills.length > 0) {
        setPreferredSkills(prev => [...new Set([...prev, ...analysisRes.preferred_skills])]);
      }

      setFeedback({ type: 'success', message: 'AI Job analysis complete! Skills & inclusivity score updated.' });
      setAudited(true);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error('Job analysis error:', err);
      setFeedback({ type: 'error', message: 'AI Analysis service unavailable. You can still publish the job.' });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const applyAlternative = (phrase, alternative) => {
    let desc = formData.description;
    const regex = new RegExp(phrase, 'gi');
    desc = desc.replace(regex, alternative);
    setFormData(prev => ({ ...prev, description: desc }));

    setIssues(prev => prev.filter(iss => iss.phrase !== phrase));
    setInclusivityScore(prev => Math.min(100, prev + 10));
    setFeedback({ type: 'success', message: `Replaced "${phrase}" with "${alternative}".` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (status = 'Active') => {
    if (!formData.title.trim()) {
      setFeedback({ type: 'error', message: 'Job Title is required.' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    if (!formData.location.trim()) {
      setFeedback({ type: 'error', message: 'Location is required.' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    if (!formData.description.trim()) {
      setFeedback({ type: 'error', message: 'Job Description is required.' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    if (skills.length === 0) {
      setFeedback({ type: 'error', message: 'At least one required skill is needed.' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setSubmitting(true);
    const payload = {
      title: formData.title.trim(),
      department: formData.department,
      location: formData.location.trim(),
      type: formData.type,
      workMode: formData.workMode,
      experienceMin: parseInt(formData.expMin, 10) || 0,
      experienceMax: parseInt(formData.expMax, 10) || 10,
      requiredSkills: skills,
      preferredSkills: preferredSkills,
      description: formData.description.trim(),
      status: status
    };

    try {
      await recruiterService.createJob(payload);
      setFeedback({
        type: 'success',
        message: status === 'Active' ? 'Job requisition published successfully!' : 'Job requisition draft saved!'
      });
      setTimeout(() => {
        navigate('/recruiter/jobs');
      }, 1000);
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to save job requisition. Please check backend connection.'
      });
      setTimeout(() => setFeedback(null), 4000);
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ maxWidth: '920px', margin: '0 auto', paddingBottom: '3rem' }}
    >
      {/* FEEDBACK TOAST */}
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <button 
            onClick={() => navigate('/recruiter/jobs')}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem', padding: '0.35rem 0.75rem', marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={13} /> Back to Jobs
          </button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
            Create Job
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Create a structured role and define requirements for intelligent candidate matching.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSave('Draft')}
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Bookmark size={15} /> Save Draft
          </button>
          <button 
            type="button"
            className="btn btn-primary"
            onClick={() => handleSave('Active')}
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={15} /> {submitting ? 'Publishing...' : 'Publish Job'}
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* SECTION 1: JOB BASICS */}
        <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--accent-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <Briefcase size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Job Basics</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Core job title, department, work arrangement, and experience requirements.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* ROW 1: Job Title | Department | Employment Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="job-title-input">Job Title *</label>
                <input 
                  type="text"
                  id="job-title-input"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Senior AI/ML Platform Engineer"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="dept-select">Department *</label>
                <select 
                  id="dept-select"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Security">Security</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="type-select">Employment Type *</label>
                <select 
                  id="type-select"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            {/* ROW 2: Work Mode | Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="workmode-select">Work Mode *</label>
                <select 
                  id="workmode-select"
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="location-input">Location *</label>
                <input 
                  type="text"
                  id="location-input"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. San Francisco, CA / Seattle, WA"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* ROW 3: Min Experience | Max Experience */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="expmin-input">Min Experience (Years)</label>
                <input 
                  type="number"
                  id="expmin-input"
                  name="expMin"
                  min="0"
                  max="20"
                  value={formData.expMin}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="expmax-input">Max Experience (Years)</label>
                <input 
                  type="number"
                  id="expmax-input"
                  name="expMax"
                  min="0"
                  max="30"
                  value={formData.expMax}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: JOB DESCRIPTION */}
        <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--accent-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <Layers size={16} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Job Description</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Full description of responsibilities, requirements, and mission.</p>
              </div>
            </div>

            <button 
              type="button"
              className="btn btn-secondary"
              onClick={triggerAudit}
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
            >
              <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
              {loading ? 'Analyzing Linguistic Inclusivity...' : 'Analyze Job Requirements'}
            </button>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <textarea 
              name="description"
              rows={7}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide comprehensive job description requirements and responsibilities... (Click 'Analyze Job Requirements' above to extract skills and detect linguistic bias)"
              className="form-input"
              style={{ resize: 'vertical', lineHeight: 1.6 }}
              required
            />
          </div>

          {/* AUDIT RESULTS CARD */}
          {audited && (
            <div 
              style={{ 
                marginTop: '1.25rem', 
                padding: '1.25rem', 
                background: inclusivityScore >= 80 ? '#F0FDF4' : '#FFFBEB',
                border: `1px solid ${inclusivityScore >= 80 ? '#BBF7D0' : '#FDE68A'}`,
                borderRadius: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} style={{ color: inclusivityScore >= 80 ? '#15803d' : '#b45309' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: inclusivityScore >= 80 ? '#166534' : '#92400e' }}>
                    Fairness & Inclusivity Score: {inclusivityScore}/100
                  </span>
                </div>
                <span className={`badge ${inclusivityScore >= 80 ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                  {inclusivityScore >= 80 ? 'Inclusive Description' : 'Optimization Suggestions Found'}
                </span>
              </div>

              {issues.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                    Neutral alternatives detected for exclusionary phrases:
                  </p>
                  {issues.map(iss => (
                    <div 
                      key={iss.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#FFFFFF',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <span style={{ textDecoration: 'line-through', color: '#DC2626', fontWeight: 600, fontSize: '0.8rem' }}>
                          "{iss.phrase}"
                        </span>
                        <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>→</span>
                        <span style={{ color: '#16A34A', fontWeight: 600, fontSize: '0.8rem' }}>
                          "{iss.alternative}"
                        </span>
                        <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {iss.issue}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => applyAlternative(iss.phrase, iss.alternative)}
                        style={{ fontSize: '0.725rem', padding: '0.3rem 0.65rem', whiteSpace: 'nowrap' }}
                      >
                        Apply Suggestion
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: '#166534' }}>
                  ✓ Neutral linguistic patterns detected. No exclusionary language flags.
                </p>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: REQUIRED SKILLS */}
        <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--accent-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <Check size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Required Skills</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mandatory technical skills used by the AI matcher to evaluate candidate resumes.</p>
            </div>
          </div>

          {/* SKILL CHIPS */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem', minHeight: '36px', alignItems: 'center' }}>
            {skills.map(sk => (
              <span 
                key={sk}
                className="badge badge-cyan"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {sk}
                <button 
                  type="button" 
                  onClick={() => handleRemoveSkill(sk)} 
                  style={{ color: 'inherit', display: 'flex', alignItems: 'center', padding: 0 }}
                  aria-label={`Remove skill ${sk}`}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
            {skills.length === 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No required skills added yet. Type a skill below and click Add.</span>
            )}
          </div>

          <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.75rem', maxWidth: '440px' }}>
            <input 
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. PyTorch, Kubernetes, React"
              className="form-input"
              style={{ flexGrow: 1 }}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={14} /> Add Skill
            </button>
          </form>
        </div>

        {/* SECTION 4: ADDITIONAL PREFERENCES */}
        <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--accent-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <Bookmark size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Additional Preferences</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bonus qualifications that elevate a candidate's readiness score.</p>
            </div>
          </div>

          {/* PREFERRED SKILL CHIPS */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem', minHeight: '36px', alignItems: 'center' }}>
            {preferredSkills.map(sk => (
              <span 
                key={sk}
                className="badge badge-secondary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {sk}
                <button 
                  type="button" 
                  onClick={() => handleRemovePrefSkill(sk)} 
                  style={{ color: 'inherit', display: 'flex', alignItems: 'center', padding: 0 }}
                  aria-label={`Remove preferred skill ${sk}`}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
            {preferredSkills.length === 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No preferred skills added.</span>
            )}
          </div>

          <form onSubmit={handleAddPrefSkill} style={{ display: 'flex', gap: '0.75rem', maxWidth: '440px' }}>
            <input 
              type="text"
              value={newPrefSkill}
              onChange={(e) => setNewPrefSkill(e.target.value)}
              placeholder="e.g. AWS, CI/CD, SAP BTP"
              className="form-input"
              style={{ flexGrow: 1 }}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={14} /> Add Preferred
            </button>
          </form>
        </div>

        {/* BOTTOM ACTION AREA */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderTop: '1px solid var(--border-subtle)', 
            paddingTop: '1.5rem',
            marginTop: '0.5rem'
          }}
        >
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/recruiter/jobs')}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => handleSave('Draft')}
              disabled={submitting}
            >
              <Bookmark size={15} /> Save Draft
            </button>
            <button 
              type="button"
              className="btn btn-primary"
              onClick={() => handleSave('Active')}
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1.4rem' }}
            >
              <Send size={15} /> {submitting ? 'Publishing...' : 'Publish Job'}
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default CreateJob;
