import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', interactive = false, style }) => {
  return (
    <div 
      className={`glass-panel ${interactive ? 'glass-panel-interactive' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
