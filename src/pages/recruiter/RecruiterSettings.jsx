import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Sliders, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const RecruiterSettings = () => {
  let authContext = null;
  try {
    authContext = useAuth();
  } catch {
    authContext = null;
  }

  const currentUser = authContext?.currentUser || authService.getCurrentUser() || {
    name: 'Recruiter Admin',
    email: 'recruiter@evolvevita.com',
    title: 'Talent Acquisition'
  };

  const [profile, setProfile] = useState({
    name: currentUser.displayName || currentUser.name || 'Recruiter Admin',
    role: currentUser.title || 'Talent Acquisition Lead',
    company: 'EvolveVita Platform',
    email: currentUser.email || 'recruiter@evolvevita.com'
  });

  const [threshold, setThreshold] = useState(80);
  const [notifications, setNotifications] = useState({
    onHighMatch: true,
    onBiasWarning: true,
    onHiringPending: false
  });

  const [toast, setToast] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      name: profile.name,
      displayName: profile.name,
      email: profile.email,
      title: profile.role
    };
    localStorage.setItem('evolvevita_auth_user', JSON.stringify(updatedUser));
    localStorage.setItem('evolvevita_user', JSON.stringify(updatedUser));
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <motion.div
      className="settings-container"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ maxWidth: '1000px', margin: '0 auto' }}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              padding: '0.85rem 1.25rem',
              background: '#FFFFFF',
              border: '1px solid #BBF7D0',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-premium)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <Check size={14} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>
              Configurations saved successfully
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="settings-header">
        <h1 className="settings-title">Platform Configurations</h1>
        <p className="settings-subtitle">
          Configure recruiter credentials, automated intelligence thresholds, and system notifications.
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="settings-grid">
        
        {/* LEFT COLUMN */}
        <div className="settings-column">
          
          {/* CARD 1: RECRUITER PROFILE */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: '#EEF2FF', color: 'var(--accent-primary)' }}>
                <User size={18} />
              </div>
              <h2 className="settings-card-title">Recruiter Profile</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="settings-field-group">
                <label className="settings-label" htmlFor="recruiter-name-input">
                  Full Name
                </label>
                <input 
                  type="text" 
                  id="recruiter-name-input"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="settings-input"
                  placeholder="Recruiter Full Name"
                  required
                />
              </div>

              <div className="settings-field-group">
                <label className="settings-label" htmlFor="recruiter-role-input">
                  Job Title
                </label>
                <input 
                  type="text" 
                  id="recruiter-role-input"
                  name="role"
                  value={profile.role}
                  onChange={handleProfileChange}
                  className="settings-input"
                  placeholder="e.g. Lead Technical Recruiter"
                  required
                />
              </div>

              <div className="settings-field-group">
                <label className="settings-label" htmlFor="recruiter-company-input">
                  Organization / Company
                </label>
                <input 
                  type="text" 
                  id="recruiter-company-input"
                  name="company"
                  value={profile.company}
                  onChange={handleProfileChange}
                  className="settings-input"
                  placeholder="Organization name"
                  required
                />
              </div>

              <div className="settings-field-group">
                <label className="settings-label" htmlFor="recruiter-email-input">
                  Work Email
                </label>
                <input 
                  type="email" 
                  id="recruiter-email-input"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="settings-input"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="settings-column">
          
          {/* CARD 2: INTELLIGENCE ENGINE SETTINGS */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: '#F0FDF4', color: '#059669' }}>
                <Sliders size={18} />
              </div>
              <h2 className="settings-card-title">Ranking Sensitivity</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="slider-container">
                <div className="slider-header">
                  <span className="slider-label">High Confidence Match Threshold</span>
                  <span className="slider-value-badge">{threshold}% Fit</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="95" 
                  step="5"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="range-slider"
                />
                <span className="slider-helper-text">
                  Candidates with match scores at or above {threshold}% are highlighted as high confidence matches.
                </span>
              </div>
            </div>
          </div>

          {/* CARD 3: NOTIFICATIONS */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: '#F0F9FF', color: '#0284C7' }}>
                <Bell size={18} />
              </div>
              <h2 className="settings-card-title">Notification Alerts</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-title">Candidate Pipeline Alerts</span>
                  <span className="toggle-description">
                    Notify when incoming resumes meet the high-confidence match threshold.
                  </span>
                </div>
                <label className="switch-control">
                  <input 
                    type="checkbox" 
                    checked={notifications.onHighMatch}
                    onChange={() => handleNotificationChange('onHighMatch')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-title">Linguistic Bias Flag</span>
                  <span className="toggle-description">
                    Alert when a job description is saved with fairness rating below 85/100.
                  </span>
                </div>
                <label className="switch-control">
                  <input 
                    type="checkbox" 
                    checked={notifications.onBiasWarning}
                    onChange={() => handleNotificationChange('onBiasWarning')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="settings-save-btn">
            <Check size={16} />
            <span>Save Configurations</span>
          </button>

        </div>

      </form>
    </motion.div>
  );
};

export default RecruiterSettings;
