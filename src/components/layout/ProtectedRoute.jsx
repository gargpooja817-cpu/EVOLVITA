import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const ProtectedRoute = ({ children, allowedRole }) => {
  let authContext = null;
  try {
    authContext = useAuth();
  } catch {
    authContext = null;
  }

  const currentUser = authContext?.currentUser || authService.getCurrentUser();
  const isAuthenticated = authContext ? authContext.isAuthenticated : authService.isAuthenticated();
  const currentRole = authContext?.role || currentUser?.role;

  if (authContext?.loading) {
    return (
      <div className="loading-orbit" style={{ margin: '5rem auto', width: 'fit-content' }}>
        <div className="orbit-spinner"></div>
        <span>Verifying session security...</span>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // User logged in but hasn't completed role selection
  if (!currentRole) {
    return <Navigate to="/choose-role" replace />;
  }

  // Enforce role-aware routing
  if (allowedRole && currentRole.toLowerCase() !== allowedRole.toLowerCase()) {
    if (currentRole.toLowerCase() === 'recruiter') {
      return <Navigate to="/recruiter/dashboard" replace />;
    }
    if (currentRole.toLowerCase() === 'candidate') {
      return <Navigate to="/candidate/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
