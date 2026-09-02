import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Briefcase, 
  Users, 
  Sparkles, 
  BookOpen, 
  Layers, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const iconMap = {
  resume: FileText,
  jobs: Briefcase,
  candidates: Users,
  matches: Sparkles,
  skills: BookOpen,
  decisions: Layers,
  default: AlertCircle
};

export const EmptyState = ({
  icon = 'default',
  CustomIcon = null,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  className = '',
  style = {}
}) => {
  const IconComponent = CustomIcon || iconMap[icon] || iconMap.default;

  return (
    <motion.div 
      className={`glass-panel ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        maxWidth: '620px',
        margin: '1.5rem auto',
        border: '1px dashed var(--border-active)',
        background: '#FFFFFF',
        ...style
      }}
    >
      <div 
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'var(--accent-primary-soft)',
          border: '1px solid #ddd6fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          marginBottom: '0.25rem'
        }}
      >
        <IconComponent size={26} />
      </div>

      <div style={{ maxWidth: '460px' }}>
        <h3 
          style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'Outfit',
            marginBottom: '0.35rem'
          }}
        >
          {title}
        </h3>
        <p 
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55
          }}
        >
          {description}
        </p>
      </div>

      {(actionLabel || secondaryLabel) && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionLabel && onAction && (
            <button 
              type="button"
              className="btn btn-primary"
              onClick={onAction}
              style={{ padding: '0.55rem 1.3rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {actionLabel} <ArrowRight size={14} />
            </button>
          )}

          {secondaryLabel && onSecondary && (
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={onSecondary}
              style={{ padding: '0.55rem 1.3rem', fontSize: '0.85rem' }}
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
