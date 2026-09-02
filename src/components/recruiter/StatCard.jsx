import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedCounter from '../common/AnimatedCounter';

const StatCard = ({ label, value, trend, trendUp, icon: Icon }) => {
  return (
    <motion.div 
      className="glass-card stat-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value"><AnimatedCounter value={value} /></span>
        {trend && (
          <div className={`stat-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
            {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="stat-icon-wrapper">
        <Icon size={22} />
      </div>
    </motion.div>
  );
};

export default StatCard;
