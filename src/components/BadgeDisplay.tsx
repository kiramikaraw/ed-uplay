import { cn } from '@/lib/utils';
import { Star, Trophy, Crown, Medal, Flame } from 'lucide-react';

interface BadgeProps {
  name: string;
  description: string;
  icon: string;
  earned?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  trophy: Trophy,
  crown: Crown,
  medal: Medal,
  fire: Flame,
};

export function Badge({ name, description, icon, earned = false, size = 'md' }: BadgeProps) {
  const Icon = iconMap[icon] || Star;

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'rounded-full flex items-center justify-center transition-all',
          sizeClasses[size],
          earned
            ? 'bg-gradient-to-br from-accent to-orange shadow-lg shadow-accent/30'
            : 'bg-muted opacity-50 grayscale'
        )}
      >
        <Icon className={cn(iconSizes[size], earned ? 'text-foreground' : 'text-muted-foreground')} />
      </div>
      <div className="text-center">
        <p className={cn('font-bold text-sm', earned ? 'text-foreground' : 'text-muted-foreground')}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground max-w-24">{description}</p>
      </div>
    </div>
  );
}

export function BadgeGrid({ badges }: { badges: BadgeProps[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {badges.map((badge, index) => (
        <Badge key={index} {...badge} />
      ))}
    </div>
  );
}
