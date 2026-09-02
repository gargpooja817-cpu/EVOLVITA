import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileCode, Award, BookOpen, Clock, ArrowRight } from 'lucide-react';
import MatchScore from './MatchScore';
import SkillTag from './SkillTag';

const CandidateCard = ({ candidate }) => {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate(`/recruiter/candidates/${candidate.id}`);
  };

  // Get total completed or active SAP journeys
  const sapCount = candidate.sapLearningEvidence ? candidate.sapLearningEvidence.length : 0;
  const certCount = candidate.certifications ? candidate.certifications.length : 0;
  const projCount = candidate.projects ? candidate.projects.length : 0;

  return (
    <motion.div 
      className="glass-card candidate-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <div className="candidate-card-top">
          <img 
            src={candidate.avatar} 
            alt={candidate.name} 
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-subtle)' }}
          />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{candidate.name}</h3>
            <p className="candidate-role">{candidate.targetRole}</p>
          </div>
          <div className="candidate-score-radial">
            <MatchScore score={candidate.matchScore} size={48} strokeWidth={3.5} />
          </div>
        </div>

        <div className="candidate-skills-wrap">
          {candidate.skillsDNA.slice(0, 3).map((skill, idx) => (
            <SkillTag key={idx} name={skill.name} type="preferred" />
          ))}
          {candidate.skillsDNA.length > 3 && (
            <span className="badge badge-secondary" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
              +{candidate.skillsDNA.length - 3} more
            </span>
          )}
        </div>

        <div className="candidate-stats">
          <div className="candidate-stat-item">
            <span className="candidate-stat-val" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <FileCode size={13} style={{ color: 'var(--text-secondary)' }} />
              {projCount}
            </span>
            <span className="candidate-stat-lbl">Projects</span>
          </div>
          <div className="candidate-stat-item">
            <span className="candidate-stat-val" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Award size={13} style={{ color: 'var(--text-secondary)' }} />
              {certCount}
            </span>
            <span className="candidate-stat-lbl">Certs</span>
          </div>
          <div className="candidate-stat-item">
            <span className="candidate-stat-val" style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-secondary)' }}>
              <BookOpen size={13} />
              {sapCount}
            </span>
            <span className="candidate-stat-lbl">SAP Paths</span>
          </div>
        </div>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginTop: '0.5rem'
        }}
      >
        <span 
          style={{ 
            fontSize: '0.725rem', 
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Clock size={12} />
          {candidate.availability}
        </span>

        <button 
          className="btn btn-primary" 
          onClick={handleExplore}
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
        >
          Explore Profile <ArrowRight size={13} />
        </button>
      </div>
    </motion.div>
  );
};

export default CandidateCard;
