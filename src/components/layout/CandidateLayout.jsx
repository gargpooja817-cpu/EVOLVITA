import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CandidateSidebar from './CandidateSidebar';
import CandidateNavbar from './CandidateNavbar';

const CandidateLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-mobile-open' : ''}`}>
      <CandidateSidebar />
      <div className="main-content">
        <CandidateNavbar onToggleSidebar={toggleSidebar} />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CandidateLayout;
