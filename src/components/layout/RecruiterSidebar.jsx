import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileSpreadsheet, 
  Users, 
  ShieldAlert, 
  UserCheck, 
  Settings, 
  Layers,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const RecruiterSidebar = () => {
  const navigate = useNavigate();
  let authContext = null;
  try {
    authContext = useAuth();
  } catch {
    authContext = null;
  }

  const currentUser = authContext?.currentUser || authService.getCurrentUser();
  const userName = currentUser?.displayName || currentUser?.name || 'Recruiter';
  const userEmail = currentUser?.email || '';
  const avatarUrl = currentUser?.photoURL || currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName || 'Recruiter')}`;

  const primaryNavItems = [
    { name: 'Overview', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { name: 'Resume Ranker', path: '/recruiter/resume-intelligence', icon: FileSpreadsheet },
    { name: 'Candidates', path: '/recruiter/candidates', icon: Users },
    { name: 'Bias Audit', path: '/recruiter/bias-audit', icon: ShieldAlert },
    { name: 'Decisions', path: '/recruiter/decisions', icon: UserCheck }
  ];

  const handleLogout = async () => {
    if (authContext) {
      await authContext.logout();
    } else {
      authService.logout();
    }
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <div className="logo-symbol" style={{ background: 'var(--accent-primary)' }}>
            <Layers size={18} />
          </div>
          <div>
            <span className="logo-wordmark">EVOLVEVITA</span>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Fiori-inspired UX
            </div>
          </div>
        </div>

        {/* Fiori Architecture Badge */}
        <div style={{ padding: '0 0.5rem 0.75rem 0.5rem' }}>
          <div 
            style={{ 
              background: '#F0F9FF', 
              border: '1px solid #BAE6FD', 
              borderRadius: '8px', 
              padding: '0.4rem 0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284C7' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#0369A1' }}>
              SAP Fiori / SAPUI5 UX
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <NavLink
          to="/recruiter/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          style={{ marginBottom: '0.35rem' }}
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

        <div className="profile-card" style={{ padding: '0.4rem 0.5rem', marginBottom: '0.5rem' }}>
          <img 
            src={avatarUrl} 
            alt={userName} 
            className="profile-avatar" 
          />
          <div className="profile-info">
            <span className="profile-name" title={userName}>{userName}</span>
            <span className="profile-role" title={userEmail}>{userEmail || 'Recruiter'}</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="nav-item"
          style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.85rem' }}
        >
          <LogOut size={16} style={{ color: 'var(--accent-danger)' }} />
          <span style={{ color: 'var(--accent-danger)', fontSize: '0.825rem' }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default RecruiterSidebar;
