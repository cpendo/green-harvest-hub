import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success';
  className?: string;
}

const variantStyles = {
  default: 'bg-card',
  primary: 'bg-primary text-primary-foreground',
  accent: 'bg-gradient-to-br from-accent to-amber-400 text-accent-foreground',
  success: 'bg-success text-success-foreground',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const isPrimary = variant !== 'default';

  return (
    <div
      className={cn(
        'stat-card',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p
            className={cn(
              'text-sm font-medium',
              isPrimary ? 'opacity-80' : 'text-muted-foreground'
            )}
          >
            {title}
          </p>
          <p className="text-2xl font-bold font-display">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs font-medium flex items-center gap-1',
                isPrimary
                  ? 'opacity-80'
                  : trend.isPositive
                  ? 'text-success'
                  : 'text-destructive'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% from last month</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-lg',
            isPrimary ? 'bg-white/20' : 'bg-primary/10'
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5',
              isPrimary ? 'text-current' : 'text-primary'
            )}
          />
        </div>
      </div>
    </div>
  );
}
