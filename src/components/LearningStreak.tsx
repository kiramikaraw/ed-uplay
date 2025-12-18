import { useState, useEffect } from 'react';
import { Flame, Trophy, Zap, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  last_activity_date: string | null;
}

export function LearningStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStreak();
    }
  }, [user]);

  const fetchStreak = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_streaks')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setStreak(data);
        const today = new Date().toISOString().split('T')[0];
        setTodayCompleted(data.last_activity_date === today);
      } else {
        setStreak({
          current_streak: 0,
          longest_streak: 0,
          total_xp: 0,
          last_activity_date: null,
        });
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⭐';
    return '✨';
  };

  const getStreakMessage = (streak: number, todayDone: boolean) => {
    if (!todayDone) return 'Mainkan game hari ini untuk lanjutkan streak!';
    if (streak >= 30) return 'LUAR BIASA! Kamu super konsisten! 🏆';
    if (streak >= 14) return 'Mantap! 2 minggu tanpa putus! 🎉';
    if (streak >= 7) return 'Hebat! Seminggu penuh belajar! 💪';
    if (streak >= 3) return 'Bagus! Terus semangat! 🌟';
    return 'Bagus! Terus belajar setiap hari ya!';
  };

  if (loading) {
    return (
      <div className="game-card animate-pulse">
        <div className="h-24 bg-muted rounded-xl" />
      </div>
    );
  }

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;
  const totalXP = streak?.total_xp || 0;

  return (
    <div className="game-card overflow-hidden">
      {/* Header with gradient */}
      <div className="relative -mx-6 -mt-6 mb-4 p-6 bg-gradient-to-br from-orange/20 via-warning/10 to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center ${
              todayCompleted 
                ? 'bg-gradient-to-br from-orange to-warning' 
                : 'bg-muted'
            }`}>
              <Flame className={`w-8 h-8 ${todayCompleted ? 'text-white' : 'text-muted-foreground'}`} />
              {todayCompleted && (
                <span className="absolute -top-1 -right-1 text-xl">{getStreakEmoji(currentStreak)}</span>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-foreground">{currentStreak}</span>
                <span className="text-lg font-semibold text-muted-foreground">hari</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Learning Streak</p>
            </div>
          </div>
          
          {!todayCompleted && (
            <div className="bg-warning/20 text-warning px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              Belum Belajar Hari Ini!
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-center text-muted-foreground mb-4 font-medium">
        {getStreakMessage(currentStreak, todayCompleted)}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-muted/50">
          <Trophy className="w-5 h-5 mx-auto mb-1 text-warning" />
          <p className="text-lg font-bold">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">Rekor</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-muted/50">
          <Zap className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold">{totalXP.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-muted/50">
          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-success" />
          <p className="text-lg font-bold">{Math.floor(totalXP / 100)}</p>
          <p className="text-xs text-muted-foreground">Level</p>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Minggu Ini</p>
        <div className="flex justify-between gap-1">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, index) => {
            const today = new Date().getDay();
            const adjustedToday = today === 0 ? 6 : today - 1; // Convert Sunday=0 to Sunday=6
            const isToday = index === adjustedToday;
            const isPast = index < adjustedToday;
            const isCompleted = isPast || (isToday && todayCompleted);
            
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-success to-green text-white' 
                    : isToday 
                      ? 'bg-warning/20 text-warning ring-2 ring-warning' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? '✓' : day[0]}
                </div>
                <span className={`text-[10px] ${isToday ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
