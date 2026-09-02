import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, Check, Wifi, WifiOff, LogOut, User } from 'lucide-react';
import { checkBackendHealth } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const RecruiterNavbar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [notifications, setNotifications] = useState([]);

  let authContext = null;
  try {
    authContext = useAuth();
  } catch {
    authContext = null;
  }
  const currentUser = authContext?.currentUser || authService.getCurrentUser();
  const userName = currentUser?.displayName || currentUser?.name || 'Recruiter';
  const userEmail = currentUser?.email || 'recruiter@evolvevita.com';
  const avatarUrl = currentUser?.photoURL || currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`;

  useEffect(() => {
    let isMounted = true;
    const verifyHealth = async () => {
      const online = await checkBackendHealth();
      if (isMounted) setIsBackendOnline(online);
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Talent Dashboard';
    if (path.includes('/create-job')) return 'Create Job Requisition';
    if (path.includes('/jobs')) return 'Active Job Listings';
    if (path.includes('/candidates/')) return 'Candidate Profile & Evidence';
    if (path.includes('/candidates')) return 'Talent Discovery';
    if (path.includes('/bias-audit')) return 'Bias Intelligence Analyzer';
    if (path.includes('/resume-intelligence')) return 'Resume Intelligence & Ranking';
    if (path.includes('/decisions')) return 'Hiring Decisions Center';
    if (path.includes('/settings')) return 'Platform Configurations';
    return 'Recruiter Hub';
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = async () => {
    if (authContext) {
      await authContext.logout();
    } else {
      authService.logout();
    }
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-toggle" onClick={onToggleSidebar} aria-label="Toggle Navigation">
          <Menu size={20} />
        </button>
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>

      <div className="navbar-right">
        {/* Backend health status indicator */}
        <div 
          className={isBackendOnline ? "badge badge-success" : "badge badge-warning"} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
          title={isBackendOnline ? "Backend services connected" : "Backend services unavailable (http://127.0.0.1:8001)"}
        >
          {isBackendOnline ? (
            <>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a' }}></div>
              <span>Engine Online</span>
            </>
          ) : (
            <>
              <WifiOff size={13} style={{ color: '#d97706' }} />
              <span>Backend Offline</span>
            </>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button 
            className="nav-action-btn"
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span 
                className="badge badge-danger" 
                style={{ 
                  position: 'absolute', 
                  top: '-4px', 
                  right: '-4px', 
                  padding: '2px 5px',
                  fontSize: '10px',
                  minWidth: '16px',
                  justifyContent: 'center'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div 
              className="glass-panel" 
              style={{
                position: 'absolute',
                top: '42px',
                right: '0',
                width: '300px',
                padding: '1rem',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: 'var(--shadow-premium)'
              }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '0.5rem'
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                    No new notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      style={{ 
                        fontSize: '0.775rem', 
                        padding: '0.5rem', 
                        background: n.read ? '#ffffff' : '#f5f3ff',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: n.read ? 'none' : '3px solid var(--accent-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem'
                      }}
                    >
                      <span style={{ color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: n.read ? 400 : 600 }}>{n.message}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <img 
              src={avatarUrl} 
              alt={userName} 
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-subtle)' }}
            />
          </button>

          {showUserMenu && (
            <div 
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '42px',
                right: '0',
                width: '220px',
                padding: '0.5rem',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                boxShadow: 'var(--shadow-premium)'
              }}
            >
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{userName}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userEmail}</div>
              </div>
              <button 
                onClick={() => { setShowUserMenu(false); navigate('/recruiter/settings'); }}
                className="btn-ghost"
                style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'left', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}
              >
                <User size={14} /> Profile & Settings
              </button>
              <button 
                onClick={handleLogout}
                className="btn-ghost"
                style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'left', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-danger)', width: '100%' }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default RecruiterNavbar;
