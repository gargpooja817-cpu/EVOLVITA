import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Code, 
  Award, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Layers, 
  ArrowRight,
  Sparkles,
  Target
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

const LearningGrowth = () => {
  const navigate = useNavigate();

  const [skillGapData, setSkillGapData] = useState(null);
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    const savedGap = localStorage.getItem('evolvevita_last_skillgap_result');
    if (savedGap) {
      try {
        setSkillGapData(JSON.parse(savedGap));
      } catch {}
    }

    const savedResume = localStorage.getItem('evolvevita_candidate_resume');
    if (savedResume) {
      try {
        setResumeData(JSON.parse(savedResume));
      } catch {}
    }
  }, []);

  const hasAnalysis = Boolean(skillGapData && (skillGapData.missing_skills || skillGapData.growth_path));
  const missingSkills = skillGapData?.missing_skills || [];
  const developingSkills = skillGapData?.developing_skills || [];
  const targetRole = skillGapData?.target_role || 'Target Role';

  // Construct structured phases strictly based on real missing and developing skills
  const phases = [];

  if (hasAnalysis) {
    // 1. Foundation Phase
    if (missingSkills.length > 0) {
      phases.push({
        phase: 'Phase 1: Foundation',
        title: `Core Fundamentals: ${missingSkills.slice(0, 2).join(' & ')}`,
        category: 'Foundational Knowledge',
        skills: missingSkills.slice(0, 2),
        color: '#4F46E5',
        description: `Study official architecture documentation and syntax foundations for ${missingSkills.slice(0, 2).join(', ')}.`,
        actionItems: [
          `Review core language and framework references for ${missingSkills[0]}.`,
          missingSkills[1] ? `Complete beginner-to-intermediate tutorials on ${missingSkills[1]}.` : 'Review foundational design patterns.'
        ]
      });
    }

    // 2. Core Engineering Phase
    const coreMissing = missingSkills.length > 2 ? missingSkills.slice(2) : missingSkills.slice(0, 1);
    if (coreMissing.length > 0) {
      phases.push({
        phase: 'Phase 2: Core Engineering',
        title: `Application Systems: ${coreMissing.join(', ')}`,
        category: 'Applied Frameworks',
        skills: coreMissing,
        color: '#0284C7',
        description: `Build functional services integrating ${coreMissing.join(' with ')} to meet enterprise requisition requirements.`,
        actionItems: [
          `Implement REST/GraphQL endpoints using ${coreMissing[0]}.`,
          'Write automated unit tests verifying schema correctness.'
        ]
      });
    }

    // 3. Applied Projects Phase
    phases.push({
      phase: 'Phase 3: Applied Projects',
      title: `Portfolio Evidence: ${targetRole} Project`,
      category: 'Evidence Catalog',
      skills: missingSkills.concat(developingSkills).slice(0, 3),
      color: '#059669',
      description: `Create an open-source GitHub repository demonstrating an end-to-end implementation for ${targetRole}.`,
      actionItems: [
        `Publish a public repository with clean architecture diagrams.`,
        'Add live deployment link to your EvolveVita profile.'
      ]
    });

    // 4. Advanced Skills Phase
    if (developingSkills.length > 0) {
      phases.push({
        phase: 'Phase 4: Advanced Specialization',
        title: `Ecosystem Mastery: ${developingSkills.join(', ')}`,
        category: 'Specialized Capabilities',
        skills: developingSkills,
        color: '#D97706',
        description: `Deepen expertise in complementary high-demand technologies (${developingSkills.join(', ')}).`,
        actionItems: [
          `Explore optimization, containerization, and production scalability.`,
          'Obtain verified certification or complete relevant learning journeys.'
        ]
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: '1300px', margin: '0 auto' }}
    >
      {/* PAGE HEADER */}
      <div 
        style={{ 
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem'
        }}
      >
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Learning Growth & Career Roadmap</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
          Personalized step-by-step upskilling roadmap generated dynamically from your real skill gap analysis.
        </p>
      </div>

      {!hasAnalysis ? (
        <EmptyState 
          icon="skills"
          title="No skill gap analysis generated yet"
          description="Complete a Skill Gap Analysis against a target role to generate a personalized step-by-step learning roadmap based on actual missing capabilities."
          actionLabel="Run Skill Gap Analysis"
          onAction={() => navigate('/candidate/skill-gap')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* TOP OVERVIEW CARD */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>Active Learning Roadmap</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Target Role: {targetRole}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Curated phases addressing {missingSkills.length} identified missing skill{missingSkills.length !== 1 ? 's' : ''}.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/candidate/skill-gap')}>
                <Target size={15} /> Re-evaluate Skill Gap
              </button>
            </div>
          </div>

          {/* ROADMAP PHASES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {phases.map((phase, idx) => (
              <div 
                key={idx} 
                className="glass-panel" 
                style={{ 
                  padding: '1.75rem 2rem', 
                  borderLeft: `4px solid ${phase.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: phase.color, textTransform: 'uppercase' }}>
                      {phase.phase} • {phase.category}
                    </span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {phase.title}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {phase.skills.map((sk, sIdx) => (
                      <span key={sIdx} className="badge badge-secondary" style={{ fontSize: '0.725rem' }}>{sk}</span>
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {phase.description}
                </p>

                <div style={{ background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                    Key Action Items
                  </span>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {phase.actionItems.map((item, aIdx) => (
                      <li key={aIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </motion.div>
  );
};

export default LearningGrowth;
