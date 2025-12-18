import { cn } from '@/lib/utils';

interface MascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mood?: 'happy' | 'excited' | 'thinking' | 'celebrating';
  className?: string;
  animate?: boolean;
}

export function Mascot({ size = 'md', mood = 'happy', className, animate = true }: MascotProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-3xl',
    md: 'w-24 h-24 text-5xl',
    lg: 'w-32 h-32 text-6xl',
    xl: 'w-48 h-48 text-8xl',
  };

  const moodEmojis = {
    happy: '🦊',
    excited: '🎉',
    thinking: '🤔',
    celebrating: '🏆',
  };

  return (
    <div 
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-accent to-orange',
        sizeClasses[size],
        animate && 'float-animation',
        className
      )}
    >
      <span className={cn(animate && mood === 'celebrating' && 'mascot-wave')}>
        {moodEmojis[mood]}
      </span>
    </div>
  );
}

export function MascotMessage({ 
  message, 
  mood = 'happy' 
}: { 
  message: string; 
  mood?: 'happy' | 'excited' | 'thinking' | 'celebrating';
}) {
  return (
    <div className="flex items-start gap-4">
      <Mascot size="sm" mood={mood} />
      <div className="relative bg-card rounded-2xl rounded-tl-none p-4 shadow-lg max-w-md">
        <div className="absolute -left-2 top-0 w-4 h-4 bg-card transform rotate-45" />
        <p className="font-medium text-card-foreground relative z-10">{message}</p>
      </div>
    </div>
  );
}
