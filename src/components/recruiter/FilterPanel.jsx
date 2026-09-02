import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  availableSkills, 
  availableRoles 
}) => {

  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleRoleChange = (e) => {
    onFilterChange({ ...filters, role: e.target.value });
  };

  const handleMinScoreChange = (e) => {
    onFilterChange({ ...filters, minScore: parseInt(e.target.value) });
  };

  const handleSkillToggle = (skill) => {
    const isSelected = filters.skills.includes(skill);
    const newSkills = isSelected 
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    onFilterChange({ ...filters, skills: newSkills });
  };

  const handleAvailabilityToggle = (avail) => {
    const isSelected = filters.availability.includes(avail);
    const newAvail = isSelected
      ? filters.availability.filter(a => a !== avail)
      : [...filters.availability, avail];
    onFilterChange({ ...filters, availability: newAvail });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      role: '',
      minScore: 70,
      skills: [],
      availability: []
    });
  };

  return (
    <div className="glass-panel filter-panel">
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
          <SlidersHorizontal size={16} /> Filters
        </span>
        <button 
          onClick={clearFilters}
          style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          Reset All
        </button>
      </div>

      <div className="filter-section">
        <label className="filter-section-title" htmlFor="search-talent">Search Talent</label>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            id="search-talent"
            placeholder="Type name or keywords..." 
            value={filters.search}
            onChange={handleSearchChange}
            style={{ 
              width: '100%', 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '0.45rem 0.5rem 0.45rem 2rem', 
              fontSize: '0.85rem' 
            }}
          />
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-section-title" htmlFor="role-select">Target Role</label>
        <select 
          id="role-select"
          value={filters.role}
          onChange={handleRoleChange}
          style={{ 
            width: '100%', 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '0.45rem', 
            fontSize: '0.85rem',
            color: 'var(--text-primary)'
          }}
        >
          <option value="" style={{ background: '#0e121d' }}>All Roles</option>
          {availableRoles.map((role, idx) => (
            <option key={idx} value={role} style={{ background: '#0e121d' }}>{role}</option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className="filter-section-title">Min Match Score</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>{filters.minScore}%</span>
        </div>
        <input 
          aria-label="Minimum Match Score"
          type="range" 
          min="70" 
          max="100" 
          value={filters.minScore}
          onChange={handleMinScoreChange}
          className="range-slider"
        />
      </div>

      <div className="filter-section">
        <span className="filter-section-title">Verified Skills</span>
        <div className="filter-checkbox-group">
          {availableSkills.map((skill, idx) => (
            <label key={idx} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={filters.skills.includes(skill)}
                onChange={() => handleSkillToggle(skill)}
              />
              <span>{skill}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <span className="filter-section-title">Availability</span>
        <div className="filter-checkbox-group">
          {['Immediate', 'Immediate (2 weeks notice)', 'Available in 1 month', 'Flexible'].map((avail, idx) => (
            <label key={idx} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={filters.availability.includes(avail)}
                onChange={() => handleAvailabilityToggle(avail)}
              />
              <span>{avail}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
