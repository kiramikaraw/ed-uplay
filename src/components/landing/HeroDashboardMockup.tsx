import { motion } from 'framer-motion';
import { Brain, Flame, Trophy, Sparkles, Target, CheckCircle2, Zap, BookOpen } from 'lucide-react';

/**
 * Mockup dashboard untuk Hero section — meniru tampilan SaaS modern
 * dengan progress, AI tutor chip, XP bar, mini leaderboard, daily challenge,
 * dan floating animation cards.
 */
export function HeroDashboardMockup() {
  return (
    <div className="relative w-full max-w-[560px] mx-auto">
      {/* Glow background */}
      <div className="absolute -inset-8 bg-gradient-to-br from-primary/30 via-purple/20 to-secondary/30 rounded-[3rem] blur-3xl opacity-60" />

      {/* Main dashboard card */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative rounded-3xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-card/80">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/70" />
          </div>
          <div className="text-xs text-muted-foreground font-mono">eduverse.id/dashboard</div>
          <div className="w-10" />
        </div>

        {/* Content grid */}
        <div className="p-5 space-y-4">
          {/* Greeting + level */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Selamat datang kembali</div>
              <div className="font-bold text-base">Halo, Andini! 👋</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-purple/20 border border-primary/30">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold">Lv. 12</span>
            </div>
          </div>

          {/* XP progress */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-purple/5 to-secondary/10 p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">XP Progress</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">2,340 / 3,000</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ duration: 1.2, delay: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-primary via-purple to-secondary"
              />
            </div>
          </div>

          {/* 2x2 widget grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Daily Challenge */}
            <div className="rounded-2xl p-3 bg-card border border-border/60">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-orange/15 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-orange" />
                </div>
                <span className="text-xs font-semibold">Daily</span>
              </div>
              <div className="text-base font-black">5/7</div>
              <div className="text-[10px] text-muted-foreground">Challenge selesai</div>
            </div>

            {/* Streak */}
            <div className="rounded-2xl p-3 bg-card border border-border/60">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-warning/15 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 text-warning" />
                </div>
                <span className="text-xs font-semibold">Streak</span>
              </div>
              <div className="text-base font-black">21 hari</div>
              <div className="text-[10px] text-muted-foreground">Belajar berturut</div>
            </div>

            {/* Modul */}
            <div className="rounded-2xl p-3 bg-card border border-border/60">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-secondary/15 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-secondary" />
                </div>
                <span className="text-xs font-semibold">Matematika</span>
              </div>
              <div className="text-base font-black">68%</div>
              <div className="h-1 mt-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[68%] rounded-full bg-secondary" />
              </div>
            </div>

            {/* AI Tutor chip */}
            <div className="rounded-2xl p-3 bg-gradient-to-br from-purple/15 to-primary/10 border border-purple/30">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-purple/20 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-purple" />
                </div>
                <span className="text-xs font-semibold">AI Tutor</span>
              </div>
              <div className="text-[10px] text-foreground leading-tight">
                "Mau bahas integral hari ini?"
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[9px] text-success font-semibold">Online</span>
              </div>
            </div>
          </div>

          {/* Mini leaderboard */}
          <div className="rounded-2xl p-3 bg-card border border-border/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-warning" />
                <span className="text-xs font-semibold">Leaderboard Mingguan</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Top 100</span>
            </div>
            <div className="space-y-1.5">
              {[
                { rank: 1, name: 'Reza P.', xp: '4.2k', medal: '🥇' },
                { rank: 2, name: 'Andini', xp: '3.8k', medal: '🥈', me: true },
                { rank: 3, name: 'Dimas K.', xp: '3.5k', medal: '🥉' },
              ].map((row) => (
                <div
                  key={row.rank}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs ${
                    row.me ? 'bg-primary/10 border border-primary/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{row.medal}</span>
                    <span className={`font-semibold ${row.me ? 'text-primary' : ''}`}>{row.name}</span>
                  </div>
                  <span className="font-mono text-muted-foreground">{row.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating cards */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -left-6 px-3 py-2 rounded-2xl bg-card/95 backdrop-blur-md shadow-xl border border-success/40 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-success/20 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-success" />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground leading-none">Earned</div>
          <div className="text-sm font-black text-success leading-tight">+50 XP</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-1/3 -right-8 px-3 py-2 rounded-2xl bg-card/95 backdrop-blur-md shadow-xl border border-primary/40 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground leading-none">Daily</div>
          <div className="text-xs font-bold leading-tight">Challenge Done!</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-2 -left-8 px-3 py-2 rounded-2xl bg-card/95 backdrop-blur-md shadow-xl border border-purple/40 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-purple/20 flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-purple" />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground leading-none">AI Tutor</div>
          <div className="text-xs font-bold leading-tight text-purple">Active Now</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute -bottom-4 right-0 px-3 py-2 rounded-2xl bg-card/95 backdrop-blur-md shadow-xl border border-warning/40 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-warning/20 flex items-center justify-center">
          <Trophy className="w-3.5 h-3.5 text-warning" />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground leading-none">This Week</div>
          <div className="text-xs font-bold leading-tight">Rank #12 🔥</div>
        </div>
      </motion.div>
    </div>
  );
}
