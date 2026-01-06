import React from 'react';
import { Clock, Check, FileEdit, AlertCircle, Send } from 'lucide-react';

type PostStatus = 'draft' | 'scheduled' | 'published' | 'awaiting' | 'failed' | string;

interface StatusBadgeProps {
  status: PostStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<string, { 
  label: string; 
  icon: React.ElementType;
  bg: string;
  text: string;
  darkBg: string;
  darkText: string;
}> = {
  draft: {
    label: 'Draft',
    icon: FileEdit,
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    darkBg: 'dark:bg-slate-800/50',
    darkText: 'dark:text-slate-400',
  },
  scheduled: {
    label: 'Scheduled',
    icon: Clock,
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    darkBg: 'dark:bg-emerald-900/30',
    darkText: 'dark:text-emerald-400',
  },
  published: {
    label: 'Published',
    icon: Check,
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    darkBg: 'dark:bg-blue-900/30',
    darkText: 'dark:text-blue-400',
  },
  posted: {
    label: 'Posted',
    icon: Send,
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    darkBg: 'dark:bg-blue-900/30',
    darkText: 'dark:text-blue-400',
  },
  awaiting: {
    label: 'Awaiting',
    icon: Clock,
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    darkBg: 'dark:bg-amber-900/30',
    darkText: 'dark:text-amber-400',
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    bg: 'bg-red-100',
    text: 'text-red-700',
    darkBg: 'dark:bg-red-900/30',
    darkText: 'dark:text-red-400',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const iconSizes = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const config = statusConfig[status.toLowerCase()] || statusConfig.draft;
  const Icon = config.icon;
  
  return (
    <span className={`
      inline-flex items-center gap-1 font-medium rounded-full
      ${config.bg} ${config.text} ${config.darkBg} ${config.darkText}
      ${sizeClasses[size]}
    `}>
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;