import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Scroll, Check, Gift, Star, Flame, Brain, Trophy, Swords, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Quest {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'games' | 'score' | 'streak' | 'time' | 'battle';
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

const generateDailyQuests = (seed: number): Omit<Quest, 'current' | 'completed' | 'claimed'>[] => {
  const allQuests = [
    { id: 'q1', title: 'Pelajar Rajin', description: 'Selesaikan 3 game hari ini', icon: <Brain className="h-4 w-4" />, type: 'games' as const, target: 3, reward: 50 },
    { id: 'q2', title: 'Pengejar Skor', description: 'Kumpulkan total 200 poin', icon: <Star className="h-4 w-4" />, type: 'score' as const, target: 200, reward: 75 },
    { id: 'q3', title: 'Konsisten', description: 'Jaga streak belajarmu', icon: <Flame className="h-4 w-4" />, type: 'streak' as const, target: 1, reward: 30 },
    { id: 'q4', title: 'Fokus Master', description: 'Belajar selama 30 menit', icon: <Clock className="h-4 w-4" />, type: 'time' as const, target: 30, reward: 60 },
    { id: 'q5', title: 'Petarung', description: 'Menangkan 1 quiz battle', icon: <Swords className="h-4 w-4" />, type: 'battle' as const, target: 1, reward: 100 },
    { id: 'q6', title: 'Juara Harian', description: 'Selesaikan 5 game hari ini', icon: <Trophy className="h-4 w-4" />, type: 'games' as const, target: 5, reward: 100 },
    { id: 'q7', title: 'Skor Tinggi', description: 'Kumpulkan total 500 poin', icon: <Star className="h-4 w-4" />, type: 'score' as const, target: 500, reward: 150 },
    { id: 'q8', title: 'Maraton Belajar', description: 'Belajar selama 60 menit', icon: <Clock className="h-4 w-4" />, type: 'time' as const, target: 60, reward: 120 },
  ];

  // Use seed to shuffle and pick 4 quests
  const shuffled = [...allQuests].sort(() => (seed % 7) / 10 - 0.5);
  return shuffled.slice(0, 4);
};

export const DailyQuests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [totalRewardsClaimed, setTotalRewardsClaimed] = useState(0);

  useEffect(() => {
    if (user) {
      initializeQuests();
    }
  }, [user]);

  const initializeQuests = () => {
    // Generate quests based on today's date
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // Load saved progress from localStorage
    const savedData = localStorage.getItem(`eduplay_quests_${user?.id}_${seed}`);
    
    if (savedData) {
      setQuests(JSON.parse(savedData));
    } else {
      const dailyQuests = generateDailyQuests(seed);
      
      // Simulate some progress for demo
      const questsWithProgress: Quest[] = dailyQuests.map(q => ({
        ...q,
        current: Math.floor(Math.random() * q.target),
        completed: false,
        claimed: false,
      }));

      // Check if any are completed
      questsWithProgress.forEach(q => {
        q.completed = q.current >= q.target;
      });

      setQuests(questsWithProgress);
    }
  };

  const claimReward = (questId: string) => {
    setQuests(prev => {
      const updated = prev.map(q => {
        if (q.id === questId && q.completed && !q.claimed) {
          setTotalRewardsClaimed(t => t + q.reward);
          toast({
            title: `+${q.reward} XP! 🎉`,
            description: `Quest "${q.title}" selesai!`,
          });
          return { ...q, claimed: true };
        }
        return q;
      });
      
      // Save to localStorage
      const today = new Date();
      const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
      localStorage.setItem(`eduplay_quests_${user?.id}_${seed}`, JSON.stringify(updated));
      
      return updated;
    });
  };

  const completedCount = quests.filter(q => q.completed).length;
  const claimedCount = quests.filter(q => q.claimed).length;
  const allClaimed = claimedCount === quests.length;

  // Calculate time until reset
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const hoursLeft = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
  const minutesLeft = Math.floor(((tomorrow.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scroll className="h-5 w-5 text-warning" />
            Quest Harian
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Reset: {hoursLeft}j {minutesLeft}m
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress Overview */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-warning/20 to-orange/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{completedCount}/{quests.length} Quest Selesai</span>
            <Badge variant="secondary" className="gap-1">
              <Gift className="h-3 w-3" />
              {totalRewardsClaimed} XP
            </Badge>
          </div>
          <Progress value={(completedCount / quests.length) * 100} className="h-2" />
        </div>

        {/* Quest List */}
        <div className="space-y-2">
          <AnimatePresence>
            {quests.map((quest, index) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border transition-all ${
                  quest.claimed 
                    ? 'bg-success/10 border-success/30' 
                    : quest.completed 
                      ? 'bg-warning/10 border-warning/30' 
                      : 'bg-muted/50 border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      quest.claimed ? 'bg-success/20 text-success' :
                      quest.completed ? 'bg-warning/20 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {quest.claimed ? <Check className="h-4 w-4" /> : quest.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${quest.claimed ? 'line-through text-muted-foreground' : ''}`}>
                        {quest.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{quest.description}</p>
                      
                      {!quest.claimed && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{quest.current}/{quest.target}</span>
                            <span className="text-warning">+{quest.reward} XP</span>
                          </div>
                          <Progress 
                            value={Math.min((quest.current / quest.target) * 100, 100)} 
                            className="h-1.5" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {quest.completed && !quest.claimed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <Button 
                        size="sm" 
                        className="bg-warning hover:bg-warning/90 text-warning-foreground"
                        onClick={() => claimReward(quest.id)}
                      >
                        <Gift className="h-3 w-3 mr-1" />
                        Klaim
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* All Complete Bonus */}
        {allClaimed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-gradient-to-r from-purple/20 to-primary/20 text-center"
          >
            <Trophy className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="font-bold">Semua Quest Selesai! 🎉</p>
            <p className="text-sm text-muted-foreground">Kembali besok untuk quest baru!</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
