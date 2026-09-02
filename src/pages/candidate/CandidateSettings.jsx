import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Sliders, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const CandidateSettings = () => {
  let authContext = null;
  try {
    authContext = useAuth();
  } catch {
    authContext = null;
  }

  const currentUser = authContext?.currentUser || authService.getCurrentUser() || {
    name: 'Candidate',
    email: '',
    title: 'Candidate Profile'
  };

  const [name, setName] = useState(currentUser.displayName || currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [title, setTitle] = useState(currentUser.title || 'Candidate Profile');
  const [notifications, setNotifications] = useState({
    onJobMatch: true,
    onStatusChange: true,
    onDigest: false
  });

  const [toast, setToast] = useState(false);

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      name,
      displayName: name,
      email,
      title
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
              Settings saved successfully
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="settings-header">
        <h1 className="settings-title">Account Configurations</h1>
        <p className="settings-subtitle">
          Configure your candidate profile details, notification preferences, and account metadata.
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="settings-grid">
        
        {/* LEFT COLUMN */}
        <div className="settings-column">
          
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: '#EEF2FF', color: 'var(--accent-primary)' }}>
                <User size={18} />
              </div>
              <h2 className="settings-card-title">Profile Information</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="settings-field-group">
                <label className="settings-label" htmlFor="candidate-name-input">
                  Full Name
                </label>
                <input 
                  type="text" 
                  id="candidate-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="settings-input"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="settings-field-group">
                <label className="settings-label" htmlFor="candidate-title-input">
                  Professional Headline
                </label>
                <input 
                  type="text" 
                  id="candidate-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="settings-input"
                  placeholder="e.g. AI/ML Engineer / Full Stack Developer"
                  required
                />
              </div>

              <div className="settings-field-group">
                <label className="settings-label" htmlFor="candidate-email-input">
                  Email Address
                </label>
                <input 
                  type="email" 
                  id="candidate-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="settings-input"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="settings-column">
          
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: '#F0F9FF', color: '#0284C7' }}>
                <Bell size={18} />
              </div>
              <h2 className="settings-card-title">Notification Preferences</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-title">New Match Alerts</span>
                  <span className="toggle-description">
                    Notify when a job requisition matches your verified skills with high confidence.
                  </span>
                </div>
                <label className="switch-control">
                  <input 
                    type="checkbox" 
                    checked={notifications.onJobMatch}
                    onChange={() => handleNotificationChange('onJobMatch')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-title">Recruiter Status Updates</span>
                  <span className="toggle-description">
                    Notify when your application pipeline status changes.
                  </span>
                </div>
                <label className="switch-control">
                  <input 
                    type="checkbox" 
                    checked={notifications.onStatusChange}
                    onChange={() => handleNotificationChange('onStatusChange')}
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

export default CandidateSettings;
