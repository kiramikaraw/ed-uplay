import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface FuturisticLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function FuturisticLogo({ size = 'md', showIcon = true, className }: FuturisticLogoProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', glow: 'blur-lg' },
    md: { icon: 'w-10 h-10', text: 'text-2xl', glow: 'blur-xl' },
    lg: { icon: 'w-14 h-14', text: 'text-4xl', glow: 'blur-2xl' },
  };

  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      {showIcon && (
        <div className="relative">
          {/* Strong neon glow layers */}
          <div className={cn(
            sizeClasses[size].icon,
            "absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-secondary rounded-full",
            sizeClasses[size].glow,
            "opacity-60 animate-pulse",
            isLoaded ? "scale-100" : "scale-0",
            "transition-all duration-700"
          )} />
          <div className={cn(
            sizeClasses[size].icon,
            "absolute inset-0 bg-primary/50 rounded-full blur-md",
            "animate-[glow-pulse_2s_ease-in-out_infinite]"
          )} />
          
          {/* Icon with entrance animation */}
          <img 
            src="/favicon.svg" 
            alt="Eduverse" 
            className={cn(
              sizeClasses[size].icon,
              "relative z-10 transition-all duration-700",
              "group-hover:scale-110 group-hover:rotate-12",
              isLoaded ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-180 opacity-0",
              "drop-shadow-[0_0_15px_hsl(var(--primary))]"
            )} 
          />
        </div>
      )}
      <div className="relative">
        {/* Multiple neon glow layers for stronger effect */}
        <span className={cn(
          sizeClasses[size].text,
          "font-black tracking-tight absolute inset-0 z-0",
          "bg-gradient-to-r from-primary via-purple-500 to-secondary",
          "bg-clip-text text-transparent blur-lg opacity-70",
          "animate-pulse"
        )}>
          <span className="font-light tracking-wider">Edu</span>
          <span className="font-black">verse</span>
        </span>
        
        <span className={cn(
          sizeClasses[size].text,
          "font-black tracking-tight absolute inset-0 z-0",
          "bg-gradient-to-r from-primary via-purple-500 to-secondary",
          "bg-clip-text text-transparent blur-md opacity-50"
        )}>
          <span className="font-light tracking-wider">Edu</span>
          <span className="font-black">verse</span>
        </span>
        
        {/* Main text with animated gradient */}
        <span className={cn(
          sizeClasses[size].text,
          "font-black tracking-tight relative z-10",
          "bg-gradient-to-r from-primary via-purple-500 to-secondary",
          "bg-[length:200%_100%] animate-gradient-x bg-clip-text text-transparent",
          "drop-shadow-[0_0_20px_hsl(var(--primary)/0.5)]",
          "transition-all duration-700",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <span className="font-light tracking-wider">Edu</span>
          <span className="font-black">verse</span>
        </span>
        
        {/* Hover glow intensifier */}
        <span className={cn(
          sizeClasses[size].text,
          "font-black tracking-tight absolute inset-0 z-0",
          "bg-gradient-to-r from-primary via-purple-500 to-secondary",
          "bg-clip-text text-transparent blur-sm",
          "opacity-0 group-hover:opacity-80 transition-opacity duration-300"
        )}>
          <span className="font-light tracking-wider">Edu</span>
          <span className="font-black">verse</span>
        </span>
      </div>
    </div>
  );
}
