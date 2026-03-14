import { riskConfig } from '../data/mockData';

export default function RiskIndicator({ level, showLabel = true, size = 'md' }) {
  const normalizedLevel = (level || '').toLowerCase();
  const config = riskConfig[normalizedLevel] || riskConfig.low;

  const sizeClasses = {
    sm: { dot: 'w-2 h-2', text: 'text-xs', padding: 'px-2 py-0.5' },
    md: { dot: 'w-2.5 h-2.5', text: 'text-xs font-medium', padding: 'px-2.5 py-1' },
    lg: { dot: 'w-3 h-3', text: 'text-sm font-semibold', padding: 'px-3 py-1.5' },
  };

  const sz = sizeClasses[size] || sizeClasses.md;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.badge} ${config.border} ${sz.padding}`}>
      <span className={`${sz.dot} rounded-full ${config.dot} animate-pulse-slow flex-shrink-0`} />
      {showLabel && <span className={sz.text}>{config.label}</span>}
    </span>
  );
}
