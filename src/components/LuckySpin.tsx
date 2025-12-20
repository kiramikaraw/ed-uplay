import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Dices, Coins, Star, Zap, Crown, Gift, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface SpinReward {
  label: string;
  coins: number;
  probability: number;
  color: string;
  icon: React.ReactNode;
}

const SPIN_REWARDS: SpinReward[] = [
  { label: '50 Coins', coins: 50, probability: 30, color: 'bg-gray-500', icon: <Coins className="h-4 w-4" /> },
  { label: '100 Coins', coins: 100, probability: 25, color: 'bg-blue-500', icon: <Coins className="h-4 w-4" /> },
  { label: '200 Coins', coins: 200, probability: 20, color: 'bg-green-500', icon: <Coins className="h-4 w-4" /> },
  { label: '500 Coins', coins: 500, probability: 12, color: 'bg-purple-500', icon: <Star className="h-4 w-4" /> },
  { label: '1000 Coins', coins: 1000, probability: 8, color: 'bg-amber-500', icon: <Zap className="h-4 w-4" /> },
  { label: '2500 Coins', coins: 2500, probability: 4, color: 'bg-pink-500', icon: <Crown className="h-4 w-4" /> },
  { label: '5000 Coins', coins: 5000, probability: 1, color: 'bg-gradient-to-r from-amber-500 to-orange-500', icon: <Gift className="h-4 w-4" /> },
];

const LuckySpin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [freeSpinsToday, setFreeSpinsToday] = useState(0);
  const [result, setResult] = useState<SpinReward | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const wheelRef = useRef<HTMLDivElement>(null);

  const maxFreeSpins = isPremium ? 3 : 1;

  useEffect(() => {
    if (user && isOpen) {
      loadSpinHistory();
    }
  }, [user, isOpen]);

  const loadSpinHistory = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('lucky_spin_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('spin_date', today)
        .eq('is_premium_spin', false);

      setFreeSpinsToday(count || 0);
    } catch (error) {
      console.error('Error loading spin history:', error);
    }
  };

  const selectReward = (): SpinReward => {
    const random = Math.random() * 100;
    let cumulative = 0;
    for (const reward of SPIN_REWARDS) {
      cumulative += reward.probability;
      if (random <= cumulative) {
        return reward;
      }
    }
    return SPIN_REWARDS[0];
  };

  const spin = async () => {
    if (!user || spinning || freeSpinsToday >= maxFreeSpins) return;

    setSpinning(true);
    setShowResult(false);

    const selectedReward = selectReward();
    const rewardIndex = SPIN_REWARDS.indexOf(selectedReward);
    const segmentAngle = 360 / SPIN_REWARDS.length;
    const targetAngle = 360 - (rewardIndex * segmentAngle + segmentAngle / 2);
    const spins = 5 + Math.random() * 3;
    const finalRotation = rotation + (spins * 360) + targetAngle;

    setRotation(finalRotation);

    // Wait for animation
    setTimeout(async () => {
      setResult(selectedReward);
      setShowResult(true);

      try {
        const today = new Date().toISOString().split('T')[0];

        // Record spin
        await supabase.from('lucky_spin_history').insert({
          user_id: user.id,
          spin_date: today,
          reward_type: 'coins',
          reward_amount: selectedReward.coins,
          is_premium_spin: false,
        });

        // Update coins
        const { data: coinsData } = await supabase
          .from('user_coins')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (coinsData) {
          await supabase
            .from('user_coins')
            .update({
              balance: coinsData.balance + selectedReward.coins,
              total_earned: coinsData.total_earned + selectedReward.coins,
            })
            .eq('user_id', user.id);
        }

        setFreeSpinsToday(prev => prev + 1);
        toast.success(`Selamat! Kamu dapat ${selectedReward.coins} coins!`);
      } catch (error) {
        toast.error('Gagal menyimpan hasil spin');
      }

      setSpinning(false);
    }, 5000);
  };

  const segmentAngle = 360 / SPIN_REWARDS.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-pink-500/50 hover:bg-pink-500/10">
          <Dices className="h-4 w-4 text-pink-500" />
          Lucky Spin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Dices className="h-6 w-6 text-pink-500" />
            Lucky Spin
            <Badge variant="secondary" className="ml-2">
              {maxFreeSpins - freeSpinsToday} spin gratis
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex items-center justify-center py-8">
          {/* Pointer */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-amber-500" />
          </div>

          {/* Wheel */}
          <motion.div
            ref={wheelRef}
            animate={{ rotate: rotation }}
            transition={{ duration: 5, ease: [0.17, 0.67, 0.12, 0.99] }}
            className="relative w-64 h-64 rounded-full border-4 border-amber-500 shadow-lg overflow-hidden"
            style={{ transformOrigin: 'center' }}
          >
            {SPIN_REWARDS.map((reward, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = (index + 1) * segmentAngle;
              const midAngle = (startAngle + endAngle) / 2;
              const rad = (midAngle * Math.PI) / 180;
              const x = 50 + 35 * Math.cos(rad - Math.PI / 2);
              const y = 50 + 35 * Math.sin(rad - Math.PI / 2);

              return (
                <div
                  key={index}
                  className={`absolute w-full h-full ${reward.color}`}
                  style={{
                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180)}%)`,
                  }}
                >
                  <div
                    className="absolute text-white text-xs font-bold flex flex-col items-center"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: `translate(-50%, -50%) rotate(${midAngle}deg)`,
                    }}
                  >
                    {reward.icon}
                    <span className="mt-1">{reward.coins}</span>
                  </div>
                </div>
              );
            })}

            {/* Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-4 border-amber-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-amber-500" />
            </div>
          </motion.div>
        </div>

        {/* Result */}
        {showResult && result && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-4"
          >
            <p className="text-lg font-semibold">🎉 Selamat!</p>
            <p className="text-3xl font-bold text-amber-500">+{result.coins} Coins</p>
          </motion.div>
        )}

        {/* Spin Button */}
        <Button
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          size="lg"
          onClick={spin}
          disabled={spinning || freeSpinsToday >= maxFreeSpins}
        >
          {spinning ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Memutar...
            </>
          ) : freeSpinsToday >= maxFreeSpins ? (
            isPremium ? 'Kembali besok!' : 'Upgrade Premium untuk spin lebih banyak!'
          ) : (
            <>
              <Dices className="h-4 w-4 mr-2" />
              SPIN! ({maxFreeSpins - freeSpinsToday} tersisa)
            </>
          )}
        </Button>

        {!isPremium && (
          <p className="text-xs text-center text-muted-foreground">
            Premium users dapat 3x spin gratis per hari!
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LuckySpin;
