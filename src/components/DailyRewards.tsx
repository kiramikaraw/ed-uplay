import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Gift, Calendar, Coins, Star, Flame, Check, Lock, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DailyReward {
  day: number;
  coins: number;
  bonus?: string;
}

const DAILY_REWARDS: DailyReward[] = [
  { day: 1, coins: 50 },
  { day: 2, coins: 75 },
  { day: 3, coins: 100 },
  { day: 4, coins: 150 },
  { day: 5, coins: 200, bonus: 'XP Boost' },
  { day: 6, coins: 250 },
  { day: 7, coins: 500, bonus: 'Mystery Box' },
];

const DailyRewards = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [claimedToday, setClaimedToday] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user && isOpen) {
      loadDailyRewardData();
    }
  }, [user, isOpen]);

  const loadDailyRewardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Check if claimed today
      const { data: todayReward } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('user_id', user?.id)
        .eq('reward_date', today)
        .single();

      if (todayReward) {
        setClaimedToday(true);
        setCurrentStreak(todayReward.streak_day);
        return;
      }

      // Check yesterday's streak
      const { data: yesterdayReward } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('user_id', user?.id)
        .eq('reward_date', yesterday)
        .single();

      if (yesterdayReward) {
        setCurrentStreak(yesterdayReward.streak_day);
      } else {
        // Check if there's any previous streak
        const { data: lastReward } = await supabase
          .from('daily_rewards')
          .select('*')
          .eq('user_id', user?.id)
          .order('reward_date', { ascending: false })
          .limit(1)
          .single();

        if (lastReward) {
          const lastDate = new Date(lastReward.reward_date);
          const diffDays = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
          if (diffDays > 1) {
            setCurrentStreak(0); // Streak broken
          } else {
            setCurrentStreak(lastReward.streak_day);
          }
        }
      }
    } catch (error) {
      console.error('Error loading daily rewards:', error);
    }
  };

  const claimDailyReward = async () => {
    if (!user || claimedToday || claiming) return;

    setClaiming(true);
    const today = new Date().toISOString().split('T')[0];
    const newStreakDay = (currentStreak % 7) + 1;
    const reward = DAILY_REWARDS[newStreakDay - 1];

    try {
      // Insert daily reward record
      await supabase.from('daily_rewards').insert({
        user_id: user.id,
        reward_date: today,
        streak_day: newStreakDay,
        reward_type: 'coins',
        reward_amount: reward.coins,
      });

      // Update user coins
      const { data: coinsData } = await supabase
        .from('user_coins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (coinsData) {
        await supabase
          .from('user_coins')
          .update({
            balance: coinsData.balance + reward.coins,
            total_earned: coinsData.total_earned + reward.coins,
          })
          .eq('user_id', user.id);
      } else {
        await supabase.from('user_coins').insert({
          user_id: user.id,
          balance: 1500 + reward.coins,
          total_earned: reward.coins,
        });
      }

      setClaimedToday(true);
      setCurrentStreak(newStreakDay);
      setEarnedCoins(reward.coins);
      setShowRewardAnimation(true);

      setTimeout(() => setShowRewardAnimation(false), 3000);

      toast.success(`Dapat ${reward.coins} coins!${reward.bonus ? ` + ${reward.bonus}` : ''}`);
    } catch (error) {
      toast.error('Gagal klaim hadiah');
    } finally {
      setClaiming(false);
    }
  };

  const todayRewardIndex = currentStreak % 7;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-amber-500/50 hover:bg-amber-500/10 relative">
          <Gift className="h-4 w-4 text-amber-500" />
          Hadiah Harian
          {!claimedToday && user && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-amber-500" />
            Hadiah Harian
          </DialogTitle>
        </DialogHeader>

        {/* Reward Animation */}
        <AnimatePresence>
          {showRewardAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 z-50 rounded-lg"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="text-center"
              >
                <Sparkles className="h-16 w-16 text-amber-500 mx-auto" />
                <p className="text-3xl font-bold mt-2">+{earnedCoins}</p>
                <p className="text-amber-500">Coins!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streak Info */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="font-semibold">Streak Harian</p>
                  <p className="text-sm text-muted-foreground">Login setiap hari!</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1 bg-orange-500 text-white">
                {currentStreak} Hari
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Daily Rewards Grid */}
        <div className="grid grid-cols-7 gap-2">
          {DAILY_REWARDS.map((reward, index) => {
            const isClaimed = claimedToday ? index < todayRewardIndex : index < todayRewardIndex;
            const isToday = index === todayRewardIndex;
            const isLocked = index > todayRewardIndex;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`text-center p-2 ${
                    isToday
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/50'
                      : isClaimed
                      ? 'bg-green-500/10 border-green-500/50'
                      : isLocked
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <p className="text-xs text-muted-foreground mb-1">Hari {reward.day}</p>
                  {isClaimed ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : isLocked ? (
                    <Lock className="h-5 w-5 text-muted-foreground mx-auto" />
                  ) : (
                    <Coins className="h-5 w-5 text-amber-500 mx-auto" />
                  )}
                  <p className="text-xs font-semibold mt-1">{reward.coins}</p>
                  {reward.bonus && (
                    <Badge variant="secondary" className="text-[8px] mt-1 px-1">
                      <Star className="h-2 w-2 mr-0.5" />
                      Bonus
                    </Badge>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Claim Button */}
        <Button
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          size="lg"
          onClick={claimDailyReward}
          disabled={claimedToday || claiming}
        >
          {claiming ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Mengklaim...
            </>
          ) : claimedToday ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Sudah Diklaim Hari Ini
            </>
          ) : (
            <>
              <Gift className="h-4 w-4 mr-2" />
              Klaim {DAILY_REWARDS[todayRewardIndex]?.coins} Coins
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Login setiap hari untuk menjaga streak dan dapat bonus lebih besar!
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default DailyRewards;
