import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import RecruiterSidebar from './RecruiterSidebar';
import RecruiterNavbar from './RecruiterNavbar';

const RecruiterLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-mobile-open' : ''}`}>
      <RecruiterSidebar />
      <div className="main-content">
        <RecruiterNavbar onToggleSidebar={toggleSidebar} />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RecruiterLayout;
