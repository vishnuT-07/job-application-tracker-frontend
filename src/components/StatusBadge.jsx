import React from 'react';
import { 
  FileText, 
  HelpCircle, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  MinusCircle 
} from 'lucide-react';

export const STATUS_CONFIG = {
  APPLIED: {
    label: 'Applied',
    bg: '#E0F2FE',
    color: '#0369A1',
    border: '#BAE6FD',
    icon: FileText,
  },
  ASSESSMENT: {
    label: 'Assessment',
    bg: '#EDE9FE',
    color: '#6D28D9',
    border: '#DDD6FE',
    icon: HelpCircle,
  },
  INTERVIEW: {
    label: 'Interview',
    bg: '#FEF3C7',
    color: '#B45309',
    border: '#FDE68A',
    icon: Calendar,
  },
  OFFER: {
    label: 'Offer',
    bg: '#DCFCE7',
    color: '#15803D',
    border: '#BBF7D0',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    bg: '#FEE2E2',
    color: '#B91C1C',
    border: '#FECACA',
    icon: XCircle,
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    bg: '#F3F4F6',
    color: '#4B5563',
    border: '#E5E7EB',
    icon: MinusCircle,
  },
};

export default function StatusBadge({ status, size = 'normal' }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bg: '#F3F4F6',
    color: '#4B5563',
    border: '#E5E7EB',
    icon: FileText,
  };

  const Icon = config.icon;
  const isSmall = size === 'small';

  return (
    <span
      className={`status-badge ${isSmall ? 'status-badge-sm' : ''}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
    >
      <Icon size={isSmall ? 12 : 14} style={{ marginRight: '5px' }} />
      {config.label}
    </span>
  );
}
