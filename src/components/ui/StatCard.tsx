import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtext?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtext,
  variant = 'default',
}) => {
  const iconBgClasses = {
    default: 'bg-[#3C50E0]/10 text-[#3C50E0]',
    success: 'bg-[#219653]/10 text-[#219653]',
    warning: 'bg-[#FFA70B]/10 text-[#FFA70B]',
    danger: 'bg-[#D34053]/10 text-[#D34053]',
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase text-[#64748B] tracking-wider">{title}</p>
        <h4 className="text-2xl font-extrabold text-[#1C2434] mt-1">{value}</h4>
        {subtext && <p className="text-xs text-[#64748B] mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-full ${iconBgClasses[variant]}`}>
        {icon}
      </div>
    </div>
  );
};
