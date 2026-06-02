import { motion } from 'framer-motion';
import { Video, Brain, FileText, Trophy } from 'lucide-react';

export function HeroVisual() {
  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto">
      {/* Soft gradient backdrop */}
      <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-purple/15 via-secondary/10 to-purple/15 blur-2xl" />
      <div className="absolute inset-[12%] rounded-full bg-gradient-to-br from-purple/10 via-secondary/10 to-purple/10 backdrop-blur-sm border border-white/40" />

      {/* Atom orbits as SVG ellipses with cyan nodes */}
      <div className="absolute inset-[14%]">
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
          {/* Orbit 1 */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '100px 100px' }}
          >
            <ellipse
              cx="100"
              cy="100"
              rx="90"
              ry="36"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="1.5"
              opacity="0.75"
              transform="rotate(-20 100 100)"
            />
            <circle cx="190" cy="100" r="4" fill="hsl(var(--secondary))" transform="rotate(-20 100 100)" />
          </motion.g>

          {/* Orbit 2 */}
          <motion.g
            animate={{ rotate: -360 }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '100px 100px' }}
          >
            <ellipse
              cx="100"
              cy="100"
              rx="90"
              ry="36"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="1.5"
              opacity="0.7"
              transform="rotate(40 100 100)"
            />
            <circle cx="10" cy="100" r="3.5" fill="hsl(var(--secondary))" transform="rotate(40 100 100)" />
          </motion.g>

          {/* Orbit 3 */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '100px 100px' }}
          >
            <ellipse
              cx="100"
              cy="100"
              rx="90"
              ry="36"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="1.5"
              opacity="0.7"
              transform="rotate(100 100 100)"
            />
            <circle cx="190" cy="100" r="4" fill="hsl(var(--secondary))" transform="rotate(100 100 100)" />
          </motion.g>
        </svg>
      </div>

      {/* Center hexagon with E */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative"
        >
          <svg width="170" height="190" viewBox="0 0 180 200" className="drop-shadow-[0_0_25px_hsl(var(--purple)/0.5)]">
            <defs>
              <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--purple))" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" />
              </linearGradient>
            </defs>
            <polygon
              points="90,10 170,55 170,145 90,190 10,145 10,55"
              fill="url(#hexGrad)"
              stroke="white"
              strokeWidth="2.5"
            />
            <text
              x="90"
              y="132"
              textAnchor="middle"
              fontSize="115"
              fontWeight="700"
              fill="white"
              fontFamily="'Poppins', 'Nunito', system-ui, sans-serif"
            >
              E
            </text>
          </svg>
        </motion.div>
      </div>

      {/* Brand text under logo */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[16%] text-center pointer-events-none">
        <div
          className="text-3xl md:text-4xl tracking-[0.25em] bg-gradient-to-r from-purple to-secondary bg-clip-text text-transparent"
          style={{ fontFamily: "'Poppins', 'Nunito', sans-serif", fontWeight: 600 }}
        >
          EDUVERSE
        </div>
        <div
          className="text-[10px] md:text-[11px] tracking-[0.35em] text-purple/70 mt-1.5"
          style={{ fontFamily: "'Poppins', 'Nunito', sans-serif", fontWeight: 500 }}
        >
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
      <div className="absolute bottom-[28%] left-[20%] w-2 h-2 rounded-full bg-secondary/60" />
    </div>
  );
}
