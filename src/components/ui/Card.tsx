import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, action, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-5 md:p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0]">
          <div>
            {title && <h3 className="text-lg font-bold text-[#1C2434]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
