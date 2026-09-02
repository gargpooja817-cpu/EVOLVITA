import React, { useState, useEffect } from 'react';

const AnimatedCounter = ({ value, duration = 1000, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const strVal = String(value);
    const numMatch = strVal.match(/^(\d+)/);
    
    if (!numMatch) {
      setCount(value);
      return;
    }
    
    const end = parseInt(numMatch[1], 10);
    const suffixStr = strVal.replace(/^^\d+\s*/, '');
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeVal = progress * (2 - progress);
      const current = Math.floor(easeVal * end);
      
      setCount(`${current}${suffixStr ? ' ' + suffixStr : ''}`);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{count}</span>;
};

export default AnimatedCounter;
