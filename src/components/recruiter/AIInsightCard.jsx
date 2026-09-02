import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';

const AIInsightCard = ({ title, body, type = 'info' }) => {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          icon: AlertTriangle,
          borderColor: 'rgba(245, 158, 11, 0.25)',
          background: 'rgba(245, 158, 11, 0.03)',
          badgeColor: 'badge-warning',
          iconColor: 'var(--accent-warning)'
        };
      case 'success':
        return {
          icon: Sparkles,
          borderColor: 'rgba(16, 185, 129, 0.25)',
          background: 'rgba(16, 185, 129, 0.03)',
          badgeColor: 'badge-success',
          iconColor: 'var(--accent-success)'
        };
      default:
        return {
          icon: Lightbulb,
          borderColor: 'rgba(6, 182, 212, 0.25)',
          background: 'rgba(6, 182, 212, 0.03)',
          badgeColor: 'badge-cyan',
          iconColor: 'var(--accent-secondary)'
        };
    }
  };

  const config = getStyles();
  const Icon = config.icon;

  return (
    <motion.div
      className="glass-card"
      style={{
        padding: '1.25rem',
        border: `1px solid ${config.borderColor}`,
        background: config.background,
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start'
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div 
        style={{ 
          padding: '0.5rem', 
          borderRadius: 'var(--radius-sm)', 
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: config.iconColor
        }}
      >
        <Icon size={18} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{title}</h4>
          <span className={`badge ${config.badgeColor}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>AI Insight</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{body}</p>
      </div>
    </motion.div>
  );
};

export default AIInsightCard;
