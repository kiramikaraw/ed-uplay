import { motion } from 'framer-motion';
import { Video, Brain, FileText, Trophy } from 'lucide-react';

export function HeroVisual() {
  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto">
      {/* Soft gradient backdrop - purple/cyan */}
      <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-purple/20 via-secondary/15 to-purple/20 blur-2xl" />
      <div className="absolute inset-[12%] rounded-full bg-gradient-to-br from-purple/10 via-secondary/10 to-purple/10 backdrop-blur-sm border border-white/30" />

      {/* Atom orbits - cyan/blue */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[18%]"
      >
        <div className="w-full h-full rounded-full border-2 border-secondary/50" />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[18%]"
        style={{ transform: 'rotate(60deg)' }}
      >
        <div className="w-full h-full rounded-full border-2 border-secondary/40" style={{ transform: 'rotateX(70deg)' }} />
      </motion.div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[18%]"
      >
        <div className="w-full h-full rounded-full border-2 border-secondary/40" style={{ transform: 'rotateX(70deg) rotateZ(60deg)' }} />
      </motion.div>

      {/* Center hexagon with E */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative"
        >
          <svg width="180" height="200" viewBox="0 0 180 200" className="drop-shadow-[0_0_30px_hsl(var(--primary)/0.6)]">
            <defs>
              <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="50%" stopColor="hsl(var(--purple))" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" />
              </linearGradient>
            </defs>
            <polygon
              points="90,10 170,55 170,145 90,190 10,145 10,55"
              fill="url(#hexGrad)"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x="90"
              y="130"
              textAnchor="middle"
              fontSize="110"
              fontWeight="900"
              fill="white"
              fontFamily="system-ui, sans-serif"
            >
              E
            </text>
          </svg>
        </motion.div>
      </div>

      {/* Brand text under logo */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[18%] text-center pointer-events-none">
        <div className="text-2xl md:text-3xl font-black tracking-[0.2em] bg-gradient-to-r from-primary via-purple to-secondary bg-clip-text text-transparent">
          EDUVERSE
        </div>
        <div className="text-[10px] md:text-xs tracking-[0.3em] text-primary/70 mt-1 font-semibold">
          LEARN · PLAY · GROW
        </div>
      </div>

      {/* Floating cards */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[18%] left-[2%] w-16 h-16 rounded-2xl bg-card shadow-xl border border-border flex items-center justify-center"
      >
        <Video className="w-7 h-7 text-primary" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-[38%] left-[-4%] w-14 h-14 rounded-2xl bg-card shadow-xl border border-border flex items-center justify-center"
      >
        <Brain className="w-6 h-6 text-purple" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-[18%] right-[2%] w-16 h-16 rounded-2xl bg-card shadow-xl border border-border flex items-center justify-center"
      >
        <FileText className="w-7 h-7 text-secondary" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute bottom-[22%] right-[-4%] w-16 h-16 rounded-2xl bg-card shadow-xl border border-border flex items-center justify-center"
      >
        <Trophy className="w-7 h-7 text-warning" />
      </motion.div>

      {/* Tiny accents */}
      <div className="absolute top-[12%] right-[18%] w-2.5 h-2.5 rounded-full bg-secondary/60" />
      <div className="absolute bottom-[28%] left-[20%] w-2 h-2 rounded-full bg-primary/60" />
    </div>
  );
}
