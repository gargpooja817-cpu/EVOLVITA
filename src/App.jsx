import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Auth Context
import { AuthProvider } from './context/AuthContext';

// Import Route Protection
import ProtectedRoute from './components/layout/ProtectedRoute';

// Import Layouts
import RecruiterLayout from './components/layout/RecruiterLayout';
import CandidateLayout from './components/layout/CandidateLayout';

// Import Public/Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChooseRole from './pages/ChooseRole';

// Import Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CreateJob from './pages/recruiter/CreateJob';
import JobsManagement from './pages/recruiter/JobsManagement';
import CandidateDiscovery from './pages/recruiter/CandidateDiscovery';
import CandidateDetails from './pages/recruiter/CandidateDetails';
import BiasAudit from './pages/recruiter/BiasAudit';
import HiringDecisions from './pages/recruiter/HiringDecisions';
import RecruiterSettings from './pages/recruiter/RecruiterSettings';
import ResumeRanker from './pages/recruiter/ResumeRanker';

// Import Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import MyProfile from './pages/candidate/MyProfile';
import ResumeIntelligence from './pages/candidate/ResumeIntelligence';
import JobMatches from './pages/candidate/JobMatches';
import SkillGap from './pages/candidate/SkillGap';
import LearningGrowth from './pages/candidate/LearningGrowth';
import CandidateSettings from './pages/candidate/CandidateSettings';

// Import Styles
import './styles/globals.css';
import './styles/recruiter.css';
import './styles/public.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/choose-role" element={<ChooseRole />} />
          
          {/* Recruiter Workspace Routes (Guarded) */}
          <Route 
            path="/recruiter" 
            element={
              <ProtectedRoute allowedRole="recruiter">
                <RecruiterLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="create-job" element={<CreateJob />} />
            <Route path="jobs" element={<JobsManagement />} />
            <Route path="candidates" element={<CandidateDiscovery />} />
            <Route path="candidates/:id" element={<CandidateDetails />} />
            <Route path="bias-audit" element={<BiasAudit />} />
            <Route path="resume-intelligence" element={<ResumeRanker />} />
            <Route path="decisions" element={<HiringDecisions />} />
            <Route path="settings" element={<RecruiterSettings />} />
          </Route>

          {/* Candidate Workspace Routes (Guarded) */}
          <Route 
            path="/candidate" 
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<CandidateDashboard />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="resume" element={<ResumeIntelligence />} />
            <Route path="jobs" element={<JobMatches />} />
            <Route path="skill-gap" element={<SkillGap />} />
            <Route path="learning" element={<LearningGrowth />} />
            <Route path="settings" element={<CandidateSettings />} />
          </Route>

          {/* Catch all redirect to Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
