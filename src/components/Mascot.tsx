import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

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

interface MascotMessageProps {
  message: string;
  mood?: 'happy' | 'excited' | 'thinking' | 'celebrating';
  type?: 'greeting' | 'tip' | 'encouragement' | 'achievement';
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const mascotColors: Record<string, string> = {
  greeting: 'from-orange-500/20 to-amber-500/20 border-orange-500/30',
  tip: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  encouragement: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  achievement: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
};

export function MascotMessage({ 
  message, 
  mood = 'happy',
  type = 'greeting',
  dismissible = true,
  autoHide = false,
  autoHideDelay = 5000,
}: MascotMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => setVisible(false), autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`relative p-4 rounded-2xl bg-gradient-to-r ${mascotColors[type]} border backdrop-blur-sm`}
      >
        <div className="flex items-start gap-3">
          <Mascot size="sm" mood={mood} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-semibold text-sm">Foxy</span>
              <Sparkles className="w-3 h-3 text-yellow-500" />
            </div>
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
          {dismissible && (
            <button
              onClick={() => setVisible(false)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Floating mascot helper
export function FloatingMascot() {
  const [showTip, setShowTip] = useState(false);
  const [tipMessage, setTipMessage] = useState('');

  const tips = [
    'Coba selesaikan Daily Challenge untuk bonus poin! 🎯',
    'Streak 7 hari berturut-turut untuk badge spesial! 🔥',
    'Gabung study group untuk belajar bareng teman! 👥',
    'Quiz Battle seru bareng teman! Tantang mereka! ⚔️',
    'Jangan lupa istirahat ya! Fokus 25 menit, istirahat 5 menit 😊',
  ];

  const showRandomTip = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setTipMessage(randomTip);
    setShowTip(true);
    setTimeout(() => setShowTip(false), 5000);
  };

  return (
    <div className="fixed bottom-20 left-4 z-40">
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="absolute bottom-16 left-0 w-64 p-3 rounded-xl bg-background border border-border shadow-lg"
          >
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <p className="text-sm">{tipMessage}</p>
            </div>
            <div className="absolute -bottom-2 left-6 w-4 h-4 rotate-45 bg-background border-r border-b border-border" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={showRandomTip}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg flex items-center justify-center text-2xl hover:shadow-xl transition-shadow"
      >
        🦊
      </motion.button>
    </div>
  );
}
