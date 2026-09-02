import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Search, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle,
  FileSpreadsheet,
  Network,
  Cpu,
  Layers,
  Check,
  TrendingUp,
  CheckCircle2,
  Database,
  Server,
  Layout,
  ExternalLink,
  Lock,
  ArrowDown
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#0B1020', color: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER NAV */}
      <header 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1.25rem 2rem', 
          maxWidth: '1200px', 
          margin: '0 auto', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(11, 16, 32, 0.85)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div 
            style={{ 
              width: '34px', 
              height: '34px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#FFFFFF',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Layers size={18} />
          </div>
          <div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.04em', color: '#FFFFFF' }}>
              EVOLVEVITA
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.875rem' }} className="marketing-nav-links">
          <a href="#platform" style={{ color: '#94A3B8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#FFFFFF'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Platform</a>
          <a href="#features" style={{ color: '#94A3B8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#FFFFFF'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Intelligence</a>
          <a href="#architecture" style={{ color: '#818CF8', fontWeight: 600, transition: 'color 0.2s' }}>Enterprise Architecture</a>
          <a href="#how-it-works" style={{ color: '#94A3B8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#FFFFFF'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>How It Works</a>
        </nav>

        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              color: '#CBD5E1', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/signup')}
            style={{ 
              padding: '0.55rem 1.35rem', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', 
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.35)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* HERO SECTION — DARK SOPHISTICATION */}
      <section 
        style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '5.5rem 2rem 4.5rem 2rem', 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 0.8fr', 
          gap: '3.5rem', 
          alignItems: 'center',
          position: 'relative'
        }}
        className="marketing-hero"
      >
        {/* Ambient Glows */}
        <div 
          style={{ 
            position: 'absolute', 
            top: '10%', 
            left: '5%', 
            width: '380px', 
            height: '380px', 
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', 
            pointerEvents: 'none', 
            filter: 'blur(50px)' 
          }} 
        />
        <div 
          style={{ 
            position: 'absolute', 
            bottom: '10%', 
            right: '10%', 
            width: '320px', 
            height: '320px', 
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)', 
            pointerEvents: 'none', 
            filter: 'blur(50px)' 
          }} 
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '0.35rem 0.85rem', 
              borderRadius: '9999px', 
              background: 'rgba(99, 102, 241, 0.12)', 
              border: '1px solid rgba(99, 102, 241, 0.35)', 
              color: '#A5B4FC', 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              marginBottom: '1.5rem',
              letterSpacing: '0.02em'
            }}
          >
            <Sparkles size={13} style={{ color: '#818CF8' }} /> Enterprise Workforce Intelligence Platform
          </div>

          <h1 
            style={{ 
              fontSize: 'clamp(2.4rem, 4.5vw, 3.5rem)', 
              fontWeight: 800, 
              lineHeight: 1.12, 
              fontFamily: 'Outfit', 
              letterSpacing: '-0.03em', 
              marginBottom: '1.25rem',
              color: '#FFFFFF'
            }}
          >
            AI understands skills. <br />
            SAP provides architecture. <br />
            <span style={{ background: 'linear-gradient(135deg, #818CF8 0%, #38BDF8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Humans make the hiring decision.
            </span>
          </h1>

          <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.25rem', maxWidth: '540px' }}>
            Transform unstructured resumes into explainable Skill DNA, detect linguistic bias in job requisitions, and power enterprise hiring with verified capability evidence.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/signup')}
              style={{ 
                padding: '0.8rem 1.8rem', 
                fontSize: '0.95rem', 
                fontWeight: 600, 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', 
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Get Started Free <ArrowRight size={16} />
            </button>

            <a 
              href="#architecture" 
              style={{ 
                padding: '0.8rem 1.6rem', 
                fontSize: '0.95rem', 
                fontWeight: 600, 
                borderRadius: '8px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                color: '#CBD5E1',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none'
              }}
            >
              View SAP Architecture <ArrowDown size={15} />
            </a>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[
              'Explainable AI Matching',
              'Linguistic Bias Neutralizer',
              'SAP CAP Architecture',
              'Human-in-the-Loop Decisions'
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 }}>
                <CheckCircle2 size={15} style={{ color: '#818CF8' }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HERO LIVE EXPLAINABILITY CARD */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
          <div 
            style={{ 
              background: 'rgba(17, 24, 39, 0.85)', 
              border: '1px solid rgba(99, 102, 241, 0.3)', 
              borderRadius: '16px', 
              padding: '2rem', 
              width: '100%', 
              maxWidth: '440px',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.15)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E2E8F0', letterSpacing: '0.02em' }}>
                  AI Intelligence Engine
                </span>
              </div>
              <span style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid #6366F1', color: '#C7D2FE', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.725rem', fontWeight: 700 }}>
                Explainable Match
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #38BDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#FFFFFF', fontSize: '1rem' }}>
                JD
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>Candidate Talent Profile</h4>
                <p style={{ fontSize: '0.775rem', color: '#94A3B8' }}>AI/ML Engineer (NLP & LLMs)</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(11, 16, 32, 0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Verified Evidence Signals
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#CBD5E1' }}>
                <Check size={14} style={{ color: '#10B981' }} /> 5 verified LLM & Python repository records
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#CBD5E1' }}>
                <Check size={14} style={{ color: '#10B981' }} /> SAP CAP & Cloud integration readiness
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#CBD5E1' }}>
                <Check size={14} style={{ color: '#10B981' }} /> Zero linguistic barrier flags detected
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem', color: '#94A3B8' }}>
              <span>Recommendation: <strong style={{ color: '#38BDF8' }}>Strong Match (92%)</strong></span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>Human Review Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* PART G — ENTERPRISE ARCHITECTURE SECTION */}
      <section 
        id="architecture" 
        style={{ 
          background: 'linear-gradient(180deg, #0B1020 0%, #111827 50%, #0B1020 100%)', 
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '5.5rem 2rem'
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '0.3rem 0.8rem', 
                borderRadius: '9999px', 
                background: 'rgba(99, 102, 241, 0.12)', 
                border: '1px solid rgba(99, 102, 241, 0.3)', 
                color: '#A5B4FC', 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              <Server size={12} /> System Design & Governance
            </div>
            
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'Outfit', color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Enterprise Architecture
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
              EvolveVita is architected to combine modular AI intelligence with SAP enterprise layers for mission-critical workforce decisions.
            </p>
          </div>

          {/* VISUAL ARCHITECTURE DIAGRAM */}
          <div 
            style={{ 
              background: 'rgba(17, 24, 39, 0.7)', 
              border: '1px solid rgba(99, 102, 241, 0.25)', 
              borderRadius: '16px', 
              padding: '3rem 2rem', 
              marginBottom: '3rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', maxWidth: '780px', margin: '0 auto' }}>
              
              {/* TOP NODE: EVOLVEVITA */}
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, #6366F1, #4338CA)', 
                  color: '#FFFFFF', 
                  padding: '0.85rem 2.25rem', 
                  borderRadius: '10px', 
                  fontWeight: 800, 
                  fontFamily: 'Outfit', 
                  fontSize: '1.15rem', 
                  letterSpacing: '0.05em',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Layers size={18} /> EVOLVEVITA
              </div>

              {/* CONNECTING LINE */}
              <div style={{ width: '2px', height: '24px', background: 'linear-gradient(180deg, #6366F1, rgba(99, 102, 241, 0.4))' }} />

              {/* TWO EXPERIENCES ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%' }}>
                
                {/* CANDIDATE EXPERIENCE */}
                <div 
                  style={{ 
                    background: 'rgba(15, 23, 42, 0.8)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '10px', 
                    padding: '1.25rem', 
                    textAlign: 'center' 
                  }}
                >
                  <div style={{ fontSize: '0.725rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Talent & Learning</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.2rem' }}>CANDIDATE EXPERIENCE</h4>
                  <p style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '0.35rem' }}>Skill DNA • Gap Analysis • Growth Roadmap</p>
                </div>

                {/* RECRUITER EXPERIENCE */}
                <div 
                  style={{ 
                    background: 'rgba(15, 23, 42, 0.8)', 
                    border: '1px solid rgba(99, 102, 241, 0.4)', 
                    borderRadius: '10px', 
                    padding: '1.25rem', 
                    textAlign: 'center' 
                  }}
                >
                  <div style={{ fontSize: '0.725rem', color: '#38BDF8', textTransform: 'uppercase', fontWeight: 700 }}>SAP Fiori / SAPUI5</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.2rem' }}>RECRUITER EXPERIENCE</h4>
                  <p style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '0.35rem' }}>Page Headers • Filter Bars • Object Pages</p>
                </div>

              </div>

              {/* CONNECTING LINE */}
              <div style={{ width: '2px', height: '24px', background: 'rgba(99, 102, 241, 0.4)' }} />

              {/* AI ENGINE */}
              <div 
                style={{ 
                  background: 'rgba(30, 41, 59, 0.9)', 
                  border: '1px solid rgba(56, 189, 248, 0.3)', 
                  padding: '0.85rem 2.5rem', 
                  borderRadius: '10px', 
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '480px'
                }}
              >
                <div style={{ fontSize: '0.725rem', color: '#38BDF8', textTransform: 'uppercase', fontWeight: 700 }}>Intelligence Layer</div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>AI ENGINE</h4>
                <p style={{ fontSize: '0.775rem', color: '#94A3B8' }}>Resume Parsing • Skill Extraction • Explainable Matchmaking</p>
              </div>

              {/* CONNECTING LINE */}
              <div style={{ width: '2px', height: '24px', background: 'rgba(99, 102, 241, 0.4)' }} />

              {/* SAP CAP SERVICE LAYER */}
              <div 
                style={{ 
                  background: 'rgba(30, 41, 59, 0.9)', 
                  border: '1px solid rgba(99, 102, 241, 0.4)', 
                  padding: '0.85rem 2.5rem', 
                  borderRadius: '10px', 
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '480px'
                }}
              >
                <div style={{ fontSize: '0.725rem', color: '#A5B4FC', textTransform: 'uppercase', fontWeight: 700 }}>Service Layer</div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>SAP CAP</h4>
                <p style={{ fontSize: '0.775rem', color: '#94A3B8' }}>Core Data Services (CDS) • OData V4 • Business Logic</p>
              </div>

              {/* CONNECTING LINE */}
              <div style={{ width: '2px', height: '24px', background: 'rgba(99, 102, 241, 0.4)' }} />

              {/* SAP HANA CLOUD PERSISTENCE */}
              <div 
                style={{ 
                  background: 'rgba(30, 41, 59, 0.9)', 
                  border: '1px solid rgba(16, 185, 129, 0.4)', 
                  padding: '0.85rem 2.5rem', 
                  borderRadius: '10px', 
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '480px'
                }}
              >
                <div style={{ fontSize: '0.725rem', color: '#34D399', textTransform: 'uppercase', fontWeight: 700 }}>Persistence Layer</div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>SAP HANA CLOUD</h4>
                <p style={{ fontSize: '0.775rem', color: '#94A3B8' }}>In-Memory Column Store • Calculation Views • Vector Similarity</p>
              </div>

            </div>
          </div>

          {/* THREE ARCHITECTURE CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            
            {/* CARD 1: SAP CAP */}
            <div 
              style={{ 
                background: 'rgba(17, 24, 39, 0.7)', 
                border: '1px solid rgba(99, 102, 241, 0.25)', 
                borderRadius: '12px', 
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8' }}>
                    <Server size={20} />
                  </div>
                  <span style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid #6366F1', color: '#C7D2FE', padding: '3px 9px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                    Architecture Ready
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.35rem' }}>
                  SAP CAP
                </h3>
                <p style={{ fontSize: '0.775rem', color: '#818CF8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Service & Business Layer
                </p>
                <p style={{ fontSize: '0.825rem', color: '#94A3B8', lineHeight: 1.55 }}>
                  Declarative CDS domain models defining candidate profiles, requisitions, and match coefficients with explicit OData service projections.
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.75rem', color: '#64748B' }}>
                Artifacts: <code style={{ color: '#A5B4FC' }}>sap/cap/db/schema.cds</code>
              </div>
            </div>

            {/* CARD 2: SAP HANA CLOUD */}
            <div 
              style={{ 
                background: 'rgba(17, 24, 39, 0.7)', 
                border: '1px solid rgba(16, 185, 129, 0.25)', 
                borderRadius: '12px', 
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34D399' }}>
                    <Database size={20} />
                  </div>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#A7F3D0', padding: '3px 9px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                    HANA Cloud Ready
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.35rem' }}>
                  SAP HANA Cloud
                </h3>
                <p style={{ fontSize: '0.775rem', color: '#34D399', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Enterprise Persistence
                </p>
                <p style={{ fontSize: '0.825rem', color: '#94A3B8', lineHeight: 1.55 }}>
                  In-memory multi-model persistence target supporting relational column tables, graphical calculation views, and native vector embeddings.
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.75rem', color: '#64748B' }}>
                Artifacts: <code style={{ color: '#A7F3D0' }}>sap/HANA_ARCHITECTURE.md</code>
              </div>
            </div>

            {/* CARD 3: SAP FIORI / SAPUI5 */}
            <div 
              style={{ 
                background: 'rgba(17, 24, 39, 0.7)', 
                border: '1px solid rgba(56, 189, 248, 0.25)', 
                borderRadius: '12px', 
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
                    <Layout size={20} />
                  </div>
                  <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0EA5E9', color: '#BAE6FD', padding: '3px 9px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                    Fiori-inspired Prototype
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.35rem' }}>
                  SAP Fiori / SAPUI5
                </h3>
                <p style={{ fontSize: '0.775rem', color: '#38BDF8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Recruiter Experience
                </p>
                <p style={{ fontSize: '0.825rem', color: '#94A3B8', lineHeight: 1.55 }}>
                  Enterprise recruiter UX applying Fiori principles: semantic status indicators, Object Page details, structured filter bars, and decision logs.
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.75rem', color: '#64748B' }}>
                Patterns: <code style={{ color: '#BAE6FD' }}>src/pages/recruiter/</code>
              </div>
            </div>

          </div>

          {/* HONEST TECHNICAL IMPLEMENTATION NOTE */}
          <div 
            style={{ 
              background: 'rgba(30, 41, 59, 0.6)', 
              borderLeft: '4px solid #818CF8', 
              borderRadius: '0 8px 8px 0', 
              padding: '1.25rem 1.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <Lock size={18} style={{ color: '#818CF8', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Technical Implementation Note
              </span>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', marginTop: '0.25rem', lineHeight: 1.5 }}>
                “SAP environment access was unavailable during the prototype phase. EvolveVita is architected for integration with SAP CAP, SAP HANA Cloud, and SAP Fiori/SAPUI5 when the required SAP environment is provisioned.”
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION — PROBLEM & SOLUTION */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '5rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', fontFamily: 'Outfit', color: '#FFFFFF', marginBottom: '3rem' }}>
          Traditional Hiring Relies on Broken Signals
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {[
            { title: 'Keyword Dependency', desc: 'ATS filters reject talented developers over missing keyword strings rather than verified capabilities.', icon: FileSpreadsheet },
            { title: 'Hidden Capabilities', desc: 'Candidates lack avenues to showcase verified code repositories, project evidence, or upskilling milestones.', icon: Network },
            { title: 'Unclear AI Scoring', desc: 'Black-box algorithms score resumes without explaining match rationales or actionable skill gap breakdowns.', icon: Cpu },
            { title: 'Linguistic Sourcing Bias', desc: 'Job postings carry unconscious demographic or gatekeeping phrasing that limits qualified applicants.', icon: AlertTriangle }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx} 
                style={{ 
                  background: 'rgba(17, 24, 39, 0.6)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  borderRadius: '12px', 
                  padding: '1.5rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem' 
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8' }}>
                  <Icon size={18} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>{card.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.5 }}>{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION — HOW IT WORKS */}
      <section id="how-it-works" style={{ background: '#111827', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', fontFamily: 'Outfit', color: '#FFFFFF', marginBottom: '3rem' }}>
            How EvolveVita Works
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { step: '01', title: 'Understand the Role', desc: 'EvolveVita analyzes job requisitions to build required skills criteria and detect linguistic bias.' },
              { step: '02', title: 'Analyze Skills and Evidence', desc: 'Upload resumes or portfolios. The engine indexes projects, code evidence, and certifications.' },
              { step: '03', title: 'Match Talent Intelligently', desc: 'Calculate scores based on skill overlap, experience parameters, and verified upskilling.' },
              { step: '04', title: 'Explain the Recommendation', desc: 'Generate transparent rationales outlining concrete strengths and skill gaps.' },
              { step: '05', title: 'Human Makes the Decision', desc: 'AI recommends and assists. The hiring team registers the final authorized decision.' }
            ].map((step, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: 'rgba(15, 23, 42, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  borderRadius: '10px', 
                  padding: '1.25rem 1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#818CF8', fontFamily: 'Outfit', width: '2rem' }}>
                  {step.step}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.2rem' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{step.desc}</p>
                </div>
                <CheckCircle size={18} style={{ color: '#10B981' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION — TWO-SIDED PLATFORM */}
      <section id="platform" style={{ maxWidth: '1120px', margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="two-col">
          
          {/* FOR RECRUITERS */}
          <div 
            style={{ 
              background: 'rgba(17, 24, 39, 0.7)', 
              border: '1px solid rgba(99, 102, 241, 0.3)', 
              borderRadius: '16px', 
              padding: '2.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid #6366F1', color: '#C7D2FE', padding: '3px 8px', borderRadius: '9999px', fontSize: '0.725rem', fontWeight: 700, marginBottom: '1rem', display: 'inline-block' }}>
                Enterprise Sourcing (SAP Fiori)
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', color: '#FFFFFF', marginBottom: '0.75rem' }}>For Recruiters</h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.25rem', lineHeight: 1.55 }}>
                Discover talent pipelines, run bulk resume ranking, audit descriptions for linguistic inclusivity, and log hiring decisions with full transparency.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#CBD5E1', paddingLeft: '1.25rem' }}>
                <li>Talent Discovery engine with advanced filters</li>
                <li>Bulk Resume Intelligence ranker</li>
                <li>Linguistic Bias Intelligence analyzer</li>
                <li>Explainable match score evidence summaries</li>
              </ul>
            </div>
            <button 
              onClick={() => navigate('/login')}
              style={{ 
                padding: '0.65rem 1.25rem', 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)', 
                color: '#FFFFFF', 
                border: 'none', 
                cursor: 'pointer',
                width: 'fit-content',
                marginTop: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Access Recruiter Workspace <ArrowRight size={14} />
            </button>
          </div>

          {/* FOR CANDIDATES */}
          <div 
            style={{ 
              background: 'rgba(17, 24, 39, 0.7)', 
              border: '1px solid rgba(56, 189, 248, 0.3)', 
              borderRadius: '16px', 
              padding: '2.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0EA5E9', color: '#BAE6FD', padding: '3px 8px', borderRadius: '9999px', fontSize: '0.725rem', fontWeight: 700, marginBottom: '1rem', display: 'inline-block' }}>
                Talent & Growth
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', color: '#FFFFFF', marginBottom: '0.75rem' }}>For Candidates</h3>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.25rem', lineHeight: 1.55 }}>
                Build your developer profile, understand skill gaps against target jobs, discover matching opportunities, and record learning growth.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#CBD5E1', paddingLeft: '1.25rem' }}>
                <li>Index resume PDF/DOCX into Developer DNA</li>
                <li>Skill Gap analysis against market roles</li>
                <li>Match score breakdown against active jobs</li>
                <li>Learning Journey progress tracking</li>
              </ul>
            </div>
            <button 
              onClick={() => navigate('/login')}
              style={{ 
                padding: '0.65rem 1.25rem', 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                borderRadius: '8px', 
                background: 'rgba(255, 255, 255, 0.08)', 
                color: '#FFFFFF', 
                border: '1px solid rgba(255, 255, 255, 0.15)', 
                cursor: 'pointer',
                width: 'fit-content',
                marginTop: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Access Candidate Workspace <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section 
        style={{ 
          textAlign: 'center', 
          padding: '5.5rem 2rem', 
          background: 'linear-gradient(180deg, #111827 0%, #0B1020 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit', color: '#FFFFFF', marginBottom: '0.75rem' }}>
          Build a smarter, skills-first workforce.
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '520px', margin: '0 auto 2rem auto' }}>
          Start mapping workforce evidence, optimizing inclusivity in job descriptions, and verifying skill DNA today.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/signup')}
            style={{ 
              padding: '0.8rem 1.8rem', 
              fontSize: '0.95rem', 
              fontWeight: 600, 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #6366F1, #4F46E5)', 
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Get Started Free
          </button>
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              padding: '0.8rem 1.8rem', 
              fontSize: '0.95rem', 
              fontWeight: 600, 
              borderRadius: '8px', 
              background: 'rgba(255, 255, 255, 0.05)', 
              color: '#CBD5E1',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              cursor: 'pointer'
            }}
          >
            Sign In to Workspace
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '2rem', fontSize: '0.8rem', color: '#64748B', background: '#070B14' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#FFFFFF' }}>
            <Layers size={16} /> EVOLVEVITA
          </div>
          <div>AI Intelligence for Better Workforce Decisions. Architected for SAP CAP, SAP HANA Cloud & SAP Fiori.</div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <a href="#platform" style={{ color: '#94A3B8' }}>Platform</a>
            <a href="#features" style={{ color: '#94A3B8' }}>Intelligence</a>
            <a href="#architecture" style={{ color: '#94A3B8' }}>Architecture</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
