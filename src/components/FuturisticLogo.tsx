import { cn } from '@/lib/utils';

interface FuturisticLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function FuturisticLogo({ size = 'md', showIcon = true, className }: FuturisticLogoProps) {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-2xl' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl' },
  };

  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      {showIcon && (
        <div className="relative">
          <img 
            src="/favicon.svg" 
            alt="Eduverse" 
            className={cn(
              sizeClasses[size].icon,
              "relative z-10 transition-transform duration-300 group-hover:scale-110"
            )} 
          />
          {/* Glow effect behind icon */}
          <div className={cn(
            sizeClasses[size].icon,
            "absolute inset-0 bg-primary/40 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          )} />
        </div>
      )}
      <div className="relative">
        {/* Main text with animated gradient */}
        <span className={cn(
          sizeClasses[size].text,
          "font-black tracking-tight relative z-10",
          "bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--purple))] to-[hsl(var(--secondary))]",
          "bg-[length:200%_100%] animate-gradient-x bg-clip-text text-transparent",
          "drop-shadow-sm"
        )}>
          <span className="font-light tracking-wider">Edu</span>
          <span className="font-black">verse</span>
        </span>
        
        {/* Subtle glow effect on hover */}
        <span className={cn(
          sizeClasses[size].text,
          "font-black tracking-tight absolute inset-0 z-0",
          "bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--purple))] to-[hsl(var(--secondary))]",
          "bg-clip-text text-transparent blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300"
        )}>
          <span className="font-light tracking-wider">Edu</span>
          <span className="font-black">verse</span>
        </span>
      </div>
    </div>
  );
}
