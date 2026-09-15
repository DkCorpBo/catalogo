import React from 'react';
import { EstadoPedido } from '@/lib/types';
import { getStatusBadge } from '@/lib/utils/formatters';

interface BadgeProps {
  status?: EstadoPedido;
  text?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'dark';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, text, variant, className = '' }) => {
  if (status) {
    const { label, colorClass } = getStatusBadge(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}>
        {label}
      </span>
    );
  }

  const variantClasses = {
    primary: 'bg-[#3C50E0]/10 text-[#3C50E0] border-[#3C50E0]/30',
    success: 'bg-[#219653]/10 text-[#219653] border-[#219653]/30',
    warning: 'bg-[#FFA70B]/10 text-[#FFA70B] border-[#FFA70B]/30',
    danger: 'bg-[#D34053]/10 text-[#D34053] border-[#D34053]/30',
    dark: 'bg-[#1C2434]/10 text-[#1C2434] border-[#1C2434]/30',
  };

  const selectedClass = variant ? variantClasses[variant] : 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${selectedClass} ${className}`}>
      {text}
    </span>
  );
};
