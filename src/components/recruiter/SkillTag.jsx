import React from 'react';
import { X } from 'lucide-react';

const SkillTag = ({ name, onRemove, type = 'active' }) => {
  const getStyleClass = () => {
    switch (type) {
      case 'preferred':
        return 'badge-cyan';
      case 'missing':
        return 'badge-danger';
      default:
        return 'badge-violet';
    }
  };

  return (
    <span 
      className={`badge ${getStyleClass()}`}
      style={{
        padding: '0.35rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontSize: '0.775rem',
        fontWeight: 500,
        height: '28px'
      }}
    >
      <span>{name}</span>
      {onRemove && (
        <button 
          onClick={onRemove}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            padding: '1px',
            color: 'inherit',
            opacity: 0.7,
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
};

export default SkillTag;
