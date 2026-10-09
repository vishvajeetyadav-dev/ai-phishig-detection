import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/types';

const riskConfig: Record<RiskLevel, { bg: string; text: string; border: string; label: string }> = {
  LOW: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/30',
    label: 'Low Risk',
  },
  MEDIUM: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/30',
    label: 'Medium Risk',
  },
  HIGH: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/30',
    label: 'High Risk',
  },
  CRITICAL: {
    bg: 'bg-danger/10',
    text: 'text-danger',
    border: 'border-danger/30',
    label: 'Critical Risk',
  },
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const config = riskConfig[level];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function riskColor(score: number): string {
  if (score >= 75) return 'hsl(var(--danger))';
  if (score >= 50) return 'hsl(24 95% 53%)';
  if (score >= 25) return 'hsl(var(--warning))';
  return 'hsl(var(--success))';
}

export { riskConfig };
