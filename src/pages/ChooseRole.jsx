import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, Briefcase, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const ChooseRole = () => {
  const navigate = useNavigate();
  let authContext = null;
  try {
    authContext = useAuth();
  } catch {
    authContext = null;
  }

  const handleRoleSelection = async (role) => {
    try {
      if (authContext?.updateRole) {
        await authContext.updateRole(role);
      } else {
        authService.chooseRole(role);
      }
    } catch (err) {
      console.warn('Role update notice:', err);
      authService.chooseRole(role);
    }

    if (role === 'recruiter') {
      navigate('/recruiter/dashboard');
    } else {
      navigate('/candidate/dashboard');
    }
  };

  return (
    <div className="auth-shell" style={{ flexDirection: 'column', padding: '3rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '580px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div className="logo-symbol" style={{ width: '34px', height: '34px' }}>
            <Layers size={18} />
          </div>
          <span className="logo-wordmark">EVOLVEVITA</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          How will you use EvolveVita?
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
          Select your primary focus to personalize your workforce intelligence tools and workflows.
        </p>
      </div>

      <div className="role-grid">
        
        {/* OPTION 1: CANDIDATE */}
        <motion.div 
          className="glass-panel role-card"
          whileHover={{ y: -4, borderColor: 'var(--border-active)', boxShadow: 'var(--shadow-premium)' }}
          transition={{ duration: 0.2 }}
          onClick={() => handleRoleSelection('candidate')}
        >
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', marginBottom: '1.25rem', border: '1px solid #ddd6fe' }}>
              <UserCheck size={24} />
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.55rem', borderRadius: '9999px', background: '#f5f3ff', color: 'var(--accent-primary)', fontSize: '0.725rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Option 1
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Candidate / Job Seeker
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.5rem' }}>
              Build your profile, discover opportunities, upload project evidence, and understand your skill growth.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {[
                'Build verified Developer DNA',
                'Analyze resumes & skill gaps',
                'Discover matching job requisitions',
                'Track SAP learning milestones'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={(e) => { e.stopPropagation(); handleRoleSelection('candidate'); }}
            style={{ width: '100%', padding: '0.7rem', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            Continue as Candidate <ArrowRight size={15} />
          </button>
        </motion.div>

        {/* OPTION 2: RECRUITER */}
        <motion.div 
          className="glass-panel role-card"
          whileHover={{ y: -4, borderColor: 'var(--border-active)', boxShadow: 'var(--shadow-premium)' }}
          transition={{ duration: 0.2 }}
          onClick={() => handleRoleSelection('recruiter')}
        >
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1', marginBottom: '1.25rem', border: '1px solid #bae6fd' }}>
              <Briefcase size={24} />
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.55rem', borderRadius: '9999px', background: '#f0f9ff', color: '#0369a1', fontSize: '0.725rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Option 2
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Recruiter / Employer
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.5rem' }}>
              Discover talent, analyze resumes, scan descriptions for linguistic bias, and make better hiring decisions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {[
                'Talent Discovery engine & filters',
                'Bulk Resume Intelligence ranker',
                'Linguistic Bias intelligence analyzer',
                'Explainable AI match score evidence'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={15} style={{ color: '#0284c7', flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={(e) => { e.stopPropagation(); handleRoleSelection('recruiter'); }}
            style={{ width: '100%', padding: '0.7rem', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            Continue as Recruiter <ArrowRight size={15} />
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default ChooseRole;
