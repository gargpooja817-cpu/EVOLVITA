import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  FileSpreadsheet, 
  Sparkles, 
  Network, 
  BookOpen, 
  Settings, 
  Layers,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const CandidateSidebar = () => {
  const navigate = useNavigate();
  let authContext = null;
  try {
    authContext = useAuth();
  } catch {
    authContext = null;
  }

  const currentUser = authContext?.currentUser || authService.getCurrentUser();
  const userName = currentUser?.displayName || currentUser?.name || 'Candidate';
  const userEmail = currentUser?.email || '';
  const avatarUrl = currentUser?.photoURL || currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName || 'User')}`;

  const navItems = [
    { name: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/candidate/profile', icon: User },
    { name: 'Resume Intelligence', path: '/candidate/resume', icon: FileSpreadsheet },
    { name: 'Job Matches', path: '/candidate/jobs', icon: Sparkles },
    { name: 'Skill Gap', path: '/candidate/skill-gap', icon: Network },
    { name: 'Learning Growth', path: '/candidate/learning', icon: BookOpen },
    { name: 'Settings', path: '/candidate/settings', icon: Settings }
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
          <span className="logo-wordmark">EVOLVEVITA</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
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
        <div className="profile-card" style={{ padding: '0.4rem 0.5rem', marginBottom: '0.5rem' }}>
          <img 
            src={avatarUrl} 
            alt={userName} 
            className="profile-avatar" 
          />
          <div className="profile-info">
            <span className="profile-name" title={userName}>{userName}</span>
            <span className="profile-role" title={userEmail}>{userEmail || 'Candidate Account'}</span>
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

export default CandidateSidebar;
