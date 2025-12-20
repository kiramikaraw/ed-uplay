import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sword, Crown, Gift, Lock, Check, Sparkles, Star, Coins, Palette, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface BattlePassReward {
  id: string;
  level: number;
  reward_type: string;
  reward_value: { amount?: number; item_id?: string; name?: string };
  is_premium: boolean;
}

interface UserBattlePass {
  id: string;
  current_level: number;
  current_xp: number;
  is_premium: boolean;
  claimed_rewards: number[];
}

interface Season {
  id: string;
  name: string;
  description: string;
  starts_at: string;
  ends_at: string;
}

// Sample rewards for display
const SAMPLE_REWARDS: Omit<BattlePassReward, 'id'>[] = Array.from({ length: 50 }, (_, i) => ({
  level: i + 1,
  reward_type: i % 5 === 0 ? 'avatar' : i % 3 === 0 ? 'theme' : 'coins',
  reward_value: {
    amount: i % 5 === 0 ? undefined : (i + 1) * 50,
    item_id: i % 5 === 0 ? `avatar_${i}` : i % 3 === 0 ? `theme_${i}` : undefined,
    name: i % 5 === 0 ? `Avatar Level ${i + 1}` : i % 3 === 0 ? `Tema ${i + 1}` : undefined,
  },
  is_premium: i % 2 === 0 && i > 5,
}));

const XP_PER_LEVEL = 1000;

const BattlePass = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [season, setSeason] = useState<Season | null>(null);
  const [rewards, setRewards] = useState<BattlePassReward[]>([]);
  const [userProgress, setUserProgress] = useState<UserBattlePass | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingReward, setClaimingReward] = useState<number | null>(null);
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  useEffect(() => {
    if (user && isOpen) {
      loadBattlePassData();
    }
  }, [user, isOpen]);

  const loadBattlePassData = async () => {
    try {
      // Load active season
      const { data: seasonData } = await supabase
        .from('battle_pass_seasons')
        .select('*')
        .eq('is_active', true)
        .single();

      if (seasonData) {
        setSeason(seasonData);

        // Load rewards for season
        const { data: rewardsData } = await supabase
          .from('battle_pass_rewards')
          .select('*')
          .eq('season_id', seasonData.id)
          .order('level', { ascending: true });

        // Use sample rewards if no rewards in DB
        if (rewardsData && rewardsData.length > 0) {
          setRewards(rewardsData as unknown as BattlePassReward[]);
        } else {
          setRewards(SAMPLE_REWARDS.map((r, i) => ({ ...r, id: `sample_${i}` })));
        }

        // Load user progress
        const { data: progressData } = await supabase
          .from('user_battle_pass')
          .select('*')
          .eq('user_id', user?.id)
          .eq('season_id', seasonData.id)
          .single();

        if (progressData) {
          setUserProgress(progressData);
        } else {
          // Create new progress
          const { data: newProgress } = await supabase
            .from('user_battle_pass')
            .insert({
              user_id: user?.id,
              season_id: seasonData.id,
              current_level: 1,
              current_xp: 0,
              is_premium: isPremium,
              claimed_rewards: [],
            })
            .select()
            .single();

          if (newProgress) {
            setUserProgress(newProgress);
          }
        }
      }
    } catch (error) {
      console.error('Error loading battle pass:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (level: number, reward: BattlePassReward) => {
    if (!userProgress || !user) return;

    if (level > userProgress.current_level) {
      toast.error('Kamu belum mencapai level ini!');
      return;
    }

    if (reward.is_premium && !userProgress.is_premium) {
      toast.error('Upgrade ke Premium untuk klaim reward ini!');
      return;
    }

    if (userProgress.claimed_rewards.includes(level)) {
      toast.info('Reward sudah diklaim!');
      return;
    }

    setClaimingReward(level);

    try {
      const newClaimedRewards = [...userProgress.claimed_rewards, level];

      await supabase
        .from('user_battle_pass')
        .update({ claimed_rewards: newClaimedRewards })
        .eq('id', userProgress.id);

      // Award coins if reward type is coins
      if (reward.reward_type === 'coins' && reward.reward_value.amount) {
        // Award coins directly

        // Update user coins directly
        const { data: coinsData } = await supabase
          .from('user_coins')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (coinsData) {
          await supabase
            .from('user_coins')
            .update({
              balance: coinsData.balance + reward.reward_value.amount,
              total_earned: coinsData.total_earned + reward.reward_value.amount,
            })
            .eq('user_id', user.id);
        }
      }

      setUserProgress({ ...userProgress, claimed_rewards: newClaimedRewards });
      toast.success(`Berhasil klaim ${reward.reward_value.name || reward.reward_value.amount + ' coins'}!`);
    } catch (error) {
      toast.error('Gagal klaim reward');
    } finally {
      setClaimingReward(null);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'coins':
        return <Coins className="h-6 w-6 text-amber-500" />;
      case 'avatar':
        return <Star className="h-6 w-6 text-purple-500" />;
      case 'theme':
        return <Palette className="h-6 w-6 text-pink-500" />;
      case 'powerup':
        return <Zap className="h-6 w-6 text-blue-500" />;
      default:
        return <Gift className="h-6 w-6 text-green-500" />;
    }
  };

  const daysRemaining = season
    ? Math.max(0, Math.ceil((new Date(season.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const xpProgress = userProgress ? (userProgress.current_xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-purple-500/50 hover:bg-purple-500/10">
          <Sword className="h-4 w-4 text-purple-500" />
          Battle Pass
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sword className="h-6 w-6 text-purple-500" />
            {season?.name || 'Battle Pass'}
            <Badge variant="secondary" className="ml-2">
              {daysRemaining} hari tersisa
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* User Progress */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {userProgress?.current_level || 1}
                </div>
                <div>
                  <p className="font-semibold">Level {userProgress?.current_level || 1}</p>
                  <p className="text-sm text-muted-foreground">
                    {userProgress?.current_xp || 0} / {XP_PER_LEVEL} XP
                  </p>
                </div>
              </div>
              {!userProgress?.is_premium && (
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Premium
                </Button>
              )}
            </div>
            <Progress value={xpProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* Rewards Grid */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-5 gap-3">
            {(rewards.length > 0 ? rewards : SAMPLE_REWARDS.map((r, i) => ({ ...r, id: `sample_${i}` }))).map((reward) => {
              const isUnlocked = (userProgress?.current_level || 0) >= reward.level;
              const isClaimed = userProgress?.claimed_rewards.includes(reward.level);
              const canClaim = isUnlocked && !isClaimed && (!reward.is_premium || userProgress?.is_premium);

              return (
                <motion.div
                  key={reward.id}
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      reward.is_premium
                        ? 'border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-orange-500/5'
                        : ''
                    } ${isUnlocked ? '' : 'opacity-50'} ${isClaimed ? 'bg-green-500/10 border-green-500/50' : ''}`}
                    onClick={() => canClaim && claimReward(reward.level, reward)}
                  >
                    <CardContent className="p-3 text-center">
                      {reward.is_premium && (
                        <Crown className="h-3 w-3 text-amber-500 absolute top-1 right-1" />
                      )}
                      <div className="text-xs text-muted-foreground mb-1">Lvl {reward.level}</div>
                      <div className="flex justify-center mb-1">
                        {getRewardIcon(reward.reward_type)}
                      </div>
                      <div className="text-xs font-medium truncate">
                        {reward.reward_value.name || `${reward.reward_value.amount} coins`}
                      </div>
                      {isClaimed && (
                        <Badge variant="secondary" className="mt-1 bg-green-500 text-white text-[10px]">
                          <Check className="h-2 w-2 mr-1" />
                          Diklaim
                        </Badge>
                      )}
                      {!isUnlocked && (
                        <Lock className="h-4 w-4 text-muted-foreground mx-auto mt-1" />
                      )}
                      {claimingReward === reward.level && (
                        <Sparkles className="h-4 w-4 text-amber-500 mx-auto mt-1 animate-spin" />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default BattlePass;
