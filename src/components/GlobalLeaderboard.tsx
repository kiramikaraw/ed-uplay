import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, Flame, Star, Gift, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_score: number;
  games_played: number;
  rank: number;
  streak?: number;
}

interface RewardTier {
  rank: number;
  reward: string;
  icon: React.ReactNode;
  color: string;
}

const REWARD_TIERS: RewardTier[] = [
  { rank: 1, reward: '🏆 Juara 1 + 500 Bonus XP', icon: <Crown className="w-5 h-5" />, color: 'from-yellow-400 to-amber-500' },
  { rank: 2, reward: '🥈 Juara 2 + 300 Bonus XP', icon: <Medal className="w-5 h-5" />, color: 'from-gray-300 to-gray-400' },
  { rank: 3, reward: '🥉 Juara 3 + 200 Bonus XP', icon: <Award className="w-5 h-5" />, color: 'from-amber-600 to-amber-700' },
  { rank: 10, reward: '⭐ Top 10 + 100 Bonus XP', icon: <Star className="w-5 h-5" />, color: 'from-purple-400 to-purple-500' },
];

type Period = 'weekly' | 'monthly' | 'all_time';

export function GlobalLeaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('weekly');
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period, user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let dateFilter = new Date();
      
      if (period === 'weekly') {
        dateFilter.setDate(dateFilter.getDate() - 7);
      } else if (period === 'monthly') {
        dateFilter.setMonth(dateFilter.getMonth() - 1);
      } else {
        dateFilter = new Date('2020-01-01');
      }

      // Fetch game sessions within the period
      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('user_id, score, completed')
        .eq('completed', true)
        .gte('completed_at', dateFilter.toISOString());

      if (sessionsError) throw sessionsError;

      // Aggregate scores by user
      const userScores = new Map<string, { total_score: number; games_played: number }>();
      
      sessions?.forEach((session) => {
        const current = userScores.get(session.user_id) || { total_score: 0, games_played: 0 };
        userScores.set(session.user_id, {
          total_score: current.total_score + (session.score || 0),
          games_played: current.games_played + 1,
        });
      });

      // Get user profiles
      const userIds = Array.from(userScores.keys());
      if (userIds.length === 0) {
        setEntries([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      // Get streaks
      const { data: streaks } = await supabase
        .from('learning_streaks')
        .select('user_id, current_streak')
        .in('user_id', userIds);

      const streakMap = new Map(streaks?.map(s => [s.user_id, s.current_streak]) || []);

      // Build leaderboard entries
      const leaderboardEntries: LeaderboardEntry[] = [];
      
      profiles?.forEach((profile) => {
        const scores = userScores.get(profile.id);
        if (scores) {
          leaderboardEntries.push({
            user_id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            total_score: scores.total_score,
            games_played: scores.games_played,
            streak: streakMap.get(profile.id) || 0,
            rank: 0,
          });
        }
      });

      // Sort and assign ranks
      leaderboardEntries.sort((a, b) => b.total_score - a.total_score);
      leaderboardEntries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Find current user's rank
      const myEntry = leaderboardEntries.find(e => e.user_id === user?.id);
      setMyRank(myEntry?.rank || null);

      // Limit to top 20
      setEntries(leaderboardEntries.slice(0, 20));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-300 dark:border-yellow-700';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-300 dark:border-gray-600';
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-300 dark:border-amber-700';
      default:
        return 'bg-muted/30 border-border';
    }
  };

  const getPeriodLabel = (p: Period) => {
    switch (p) {
      case 'weekly':
        return 'Minggu Ini';
      case 'monthly':
        return 'Bulan Ini';
      case 'all_time':
        return 'Sepanjang Masa';
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    if (period === 'weekly') {
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);
      const diff = endOfWeek.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `${days} hari lagi`;
    } else if (period === 'monthly') {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const diff = endOfMonth.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `${days} hari lagi`;
    }
    return null;
  };

  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning/20 to-orange/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Papan Peringkat</h3>
            <p className="text-sm text-muted-foreground">Kompetisi & Hadiah</p>
          </div>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-2 mb-4">
        {(['weekly', 'monthly', 'all_time'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all',
              period === p
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            {getPeriodLabel(p)}
          </button>
        ))}
      </div>

      {/* Time Remaining */}
      {getTimeRemaining() && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Reset dalam {getTimeRemaining()}</span>
        </div>
      )}

      {/* Rewards Preview */}
      <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-accent/20 to-warning/10 border border-accent/30">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5 text-accent" />
          <span className="font-bold text-sm">Hadiah {getPeriodLabel(period)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {REWARD_TIERS.slice(0, 4).map((tier) => (
            <div key={tier.rank} className="flex items-center gap-2 text-xs">
              <div className={cn('w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center text-white', tier.color)}>
                {tier.rank <= 3 ? tier.icon : <span className="text-[10px] font-bold">#{tier.rank}</span>}
              </div>
              <span className="text-muted-foreground truncate">{tier.reward.split('+')[1] || tier.reward}</span>
            </div>
          ))}
        </div>
      </div>

      {/* My Rank */}
      {myRank && (
        <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Peringkatmu</span>
          </div>
          <span className="font-bold text-primary">#{myRank}</span>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada data</p>
            <p className="text-xs">Mainkan game untuk masuk peringkat!</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.user_id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-all',
                getRankBg(entry.rank),
                entry.user_id === user?.id && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                {entry.full_name?.charAt(0).toUpperCase() || '?'}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'font-semibold text-sm truncate',
                  entry.user_id === user?.id && 'text-primary'
                )}>
                  {entry.full_name}
                  {entry.user_id === user?.id && ' (Kamu)'}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{entry.games_played} game</span>
                  {entry.streak && entry.streak > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange" />
                        {entry.streak}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-primary">{entry.total_score.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">poin</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
