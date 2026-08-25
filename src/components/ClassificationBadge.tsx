import React from 'react';
import { QueryClassification } from '../types';
import { Sparkles, Globe, Search, Database, CheckCircle2 } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ClassificationBadgeProps {
  classification: QueryClassification;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}

export const ClassificationBadge: React.FC<ClassificationBadgeProps> = ({
  classification,
  showTooltip = true,
  size = 'sm',
}) => {
  const configs: Record<
    QueryClassification,
    {
      label: string;
      icon: React.ElementType;
      bg: string;
      text: string;
      border: string;
      tooltip: string;
    }
  > = {
    'Observed Gemini Search Query': {
      label: 'Observed Gemini Search Query',
      icon: Globe,
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      tooltip:
        'A verified search query actually executed by the Gemini grounded-search API during live analysis.',
    },
    'AI-Predicted Fan-out': {
      label: 'AI-Predicted Fan-out',
      icon: Sparkles,
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      tooltip:
        'A model-predicted related search query based on intent, entities, and traveller information needs. Clearly distinguished from observed queries.',
    },
    'SERP-Validated Query': {
      label: 'SERP-Validated Query',
      icon: Search,
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      text: 'text-blue-800',
      border: 'border-blue-200',
      tooltip:
        'Supported by Google autocomplete, related searches, People Also Ask, or live SERP features.',
    },
    'GSC-Observed Query': {
      label: 'GSC-Observed Query',
      icon: Database,
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      text: 'text-amber-800',
      border: 'border-amber-200',
      tooltip:
        'Directly observed from connected or uploaded Google Search Console performance data.',
    },
    'Human-Approved Opportunity': {
      label: 'Human-Approved Opportunity',
      icon: CheckCircle2,
      bg: 'bg-teal-50 text-teal-800 border-teal-200',
      text: 'text-teal-800',
      border: 'border-teal-200',
      tooltip:
        'A query or topic manually vetted and approved by the user or content strategist for execution.',
    },
  };

  const config = configs[classification] || configs['AI-Predicted Fan-out'];
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  const badgeContent = (
    <span
      className={`inline-flex items-center rounded-md border font-medium whitespace-nowrap select-none ${config.bg} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );

  if (!showTooltip) return badgeContent;

  return <Tooltip content={config.tooltip}>{badgeContent}</Tooltip>;
};
