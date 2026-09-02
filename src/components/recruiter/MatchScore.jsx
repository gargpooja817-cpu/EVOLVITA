import React from 'react';

const MatchScore = ({ score, size = 56, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (val) => {
    if (val >= 90) return 'var(--accent-primary)';
    if (val >= 80) return 'var(--accent-secondary)';
    return 'var(--text-secondary)';
  };

  const getGlow = (val) => {
    if (val >= 90) return 'drop-shadow(0px 0px 6px rgba(124, 58, 237, 0.6))';
    if (val >= 80) return 'drop-shadow(0px 0px 6px rgba(6, 182, 212, 0.5))';
    return 'none';
  };

  const scoreColor = getColor(score);
  const glowShadow = getGlow(score);

  return (
    <div className="candidate-score-radial" style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          className="match-score-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          className="match-score-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            filter: glowShadow,
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      </svg>
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span 
          style={{ 
            fontFamily: "'Outfit', sans-serif", 
            fontWeight: 800, 
            fontSize: size > 60 ? '1.1rem' : '0.85rem',
            color: scoreColor,
            textShadow: score >= 90 ? '0 0 8px rgba(124, 58, 237, 0.2)' : 'none'
          }}
        >
          {score}
        </span>
        {size > 60 && <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '-2px' }}>Match</span>}
      </div>
    </div>
  );
};

export default MatchScore;
