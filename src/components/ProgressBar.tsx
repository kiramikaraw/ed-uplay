import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  variant = 'primary',
  size = 'md',
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const variantStyles = {
    default: 'bg-muted-foreground',
    success: 'bg-success',
    warning: 'bg-warning',
    primary: 'bg-gradient-to-r from-primary to-secondary',
  };

  const sizeStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-bold text-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            variantStyles[variant],
            animated && 'relative overflow-hidden'
          )}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
