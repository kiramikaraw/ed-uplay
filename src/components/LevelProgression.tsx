import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Star, Trophy, Zap, Crown, Sparkles, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface LevelConfig {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
  rewards: string[];
}

const LEVELS: LevelConfig[] = [
  { level: 1, name: 'Pemula', minXP: 0, maxXP: 100, icon: '🌱', color: 'from-green-400 to-green-500', rewards: ['Avatar Dasar'] },
  { level: 2, name: 'Penjelajah', minXP: 100, maxXP: 300, icon: '🗺️', color: 'from-blue-400 to-blue-500', rewards: ['Tema Samudera'] },
  { level: 3, name: 'Petualang', minXP: 300, maxXP: 600, icon: '⚔️', color: 'from-purple-400 to-purple-500', rewards: ['Badge Petualang', 'Extra Hint x3'] },
  { level: 4, name: 'Prajurit', minXP: 600, maxXP: 1000, icon: '🛡️', color: 'from-orange-400 to-orange-500', rewards: ['Avatar Prajurit', 'Double XP 1 Hari'] },
  { level: 5, name: 'Ksatria', minXP: 1000, maxXP: 1500, icon: '🏰', color: 'from-red-400 to-red-500', rewards: ['Tema Sunset', 'Shield x2'] },
  { level: 6, name: 'Pahlawan', minXP: 1500, maxXP: 2200, icon: '🦸', color: 'from-indigo-400 to-indigo-500', rewards: ['Avatar Robot', 'Badge Pahlawan'] },
  { level: 7, name: 'Legenda', minXP: 2200, maxXP: 3000, icon: '🌟', color: 'from-yellow-400 to-yellow-500', rewards: ['Tema Galaxy', 'Extra Time x5'] },
  { level: 8, name: 'Master', minXP: 3000, maxXP: 4000, icon: '👑', color: 'from-pink-400 to-pink-500', rewards: ['Avatar Unicorn', 'Badge Master'] },
  { level: 9, name: 'Grandmaster', minXP: 4000, maxXP: 5500, icon: '💎', color: 'from-cyan-400 to-cyan-500', rewards: ['Semua Power-up x3', 'Tema Eksklusif'] },
  { level: 10, name: 'Champion', minXP: 5500, maxXP: 999999, icon: '🏆', color: 'from-amber-400 to-amber-500', rewards: ['Avatar Astronaut', 'Badge Champion', 'Akses VIP'] },
];

export const LevelProgression = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalXP, setTotalXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<LevelConfig | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserXP();
    }
  }, [user]);

  useEffect(() => {
    // Calculate current level based on XP
    const level = LEVELS.find(l => totalXP >= l.minXP && totalXP < l.maxXP) || LEVELS[LEVELS.length - 1];
    
    // Check for level up
    if (level.level > currentLevel.level && currentLevel.level > 0) {
      setNewLevel(level);
      setShowLevelUp(true);
      toast({
        title: `🎉 Level Up! Level ${level.level}`,
        description: `Selamat! Kamu sekarang ${level.name}!`,
      });
    }
    
    setCurrentLevel(level);
  }, [totalXP]);

  const fetchUserXP = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('learning_streaks')
        .select('total_xp')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setTotalXP(data.total_xp);
      } else {
        // Demo XP for testing
        const savedXP = localStorage.getItem(`eduplay_xp_${user.id}`);
        setTotalXP(savedXP ? parseInt(savedXP) : 450);
      }
    } catch (error) {
      // Fallback to localStorage demo
      const savedXP = localStorage.getItem(`eduplay_xp_${user.id}`);
      setTotalXP(savedXP ? parseInt(savedXP) : 450);
    }
  };

  const xpProgress = ((totalXP - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100;
  const xpNeeded = currentLevel.maxXP - totalXP;
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);

  return (
    <>
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-warning" />
            Level & Progression
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Level Display */}
          <div className={`p-4 rounded-xl bg-gradient-to-r ${currentLevel.color} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{currentLevel.icon}</span>
                <div>
                  <p className="text-sm opacity-90">Level {currentLevel.level}</p>
                  <h3 className="text-xl font-bold">{currentLevel.name}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
                <p className="text-sm opacity-90">Total XP</p>
              </div>
            </div>
          </div>

          {/* Progress to Next Level */}
          {nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Menuju Level {nextLevel.level}</span>
                <span className="font-medium">{xpNeeded} XP lagi</span>
              </div>
              <Progress value={xpProgress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentLevel.minXP} XP</span>
                <span>{currentLevel.maxXP} XP</span>
              </div>
            </div>
          )}

          {/* Next Level Rewards Preview */}
          {nextLevel && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Rewards Level {nextLevel.level}:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {nextLevel.rewards.map((reward, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {reward}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Level Milestones */}
          <div className="flex justify-between">
            {LEVELS.slice(0, 5).map((level) => (
              <div
                key={level.level}
                className={`flex flex-col items-center ${
                  level.level <= currentLevel.level ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                  level.level <= currentLevel.level ? `bg-gradient-to-r ${level.color}` : 'bg-muted'
                }`}>
                  {level.level <= currentLevel.level ? level.icon : '🔒'}
                </div>
                <span className="text-xs mt-1">{level.level}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Level Up Animation Modal */}
      <AnimatePresence>
        {showLevelUp && newLevel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setShowLevelUp(false)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-card p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: 3, duration: 0.5 }}
                className="text-7xl mb-4"
              >
                {newLevel.icon}
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-2">Level Up!</h2>
              <p className="text-xl text-muted-foreground mb-4">
                Kamu sekarang <span className="font-bold text-primary">{newLevel.name}</span>
              </p>

              <div className="space-y-2 mb-6">
                <p className="text-sm font-medium">Rewards:</p>
                {newLevel.rewards.map((reward, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.2 }}
                  >
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      {reward}
                    </Badge>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r ${newLevel.color}`}
                onClick={() => setShowLevelUp(false)}
              >
                Lanjutkan! 🚀
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
