import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, Medal, Award, Crown, Gift, Star, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ClassData {
  id: string;
  name: string;
}

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  total_score: number;
  games_played: number;
  rank: number;
  is_current_user: boolean;
  streak: number;
}

interface WeeklyReward {
  rank: number;
  reward: string;
  xp: number;
  icon: React.ReactNode;
}

const weeklyRewards: WeeklyReward[] = [
  { rank: 1, reward: 'Juara 1', xp: 500, icon: <Crown className="w-4 h-4 text-yellow-500" /> },
  { rank: 2, reward: 'Juara 2', xp: 300, icon: <Medal className="w-4 h-4 text-slate-400" /> },
  { rank: 3, reward: 'Juara 3', xp: 200, icon: <Medal className="w-4 h-4 text-amber-700" /> },
];

export function ClassLeaderboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [daysUntilReset, setDaysUntilReset] = useState(0);

  useEffect(() => {
    if (user) {
      fetchClasses();
      calculateDaysUntilReset();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchLeaderboard(selectedClass);
    }
  }, [selectedClass]);

  const calculateDaysUntilReset = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    setDaysUntilReset(daysUntilMonday);
  };

  const fetchClasses = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('class_members')
      .select('class_id, classes(id, name)')
      .eq('student_id', user.id);

    if (data) {
      const classList = data
        .map((m: any) => m.classes)
        .filter(Boolean);
      setClasses(classList);
      if (classList.length > 0 && !selectedClass) {
        setSelectedClass(classList[0].id);
      }
    }
  };

  const fetchLeaderboard = async (classId: string) => {
    setLoading(true);
    try {
      const { data: members } = await supabase
        .from('class_members')
        .select('student_id')
        .eq('class_id', classId);

      if (!members || members.length === 0) {
        setLeaderboard([]);
        return;
      }

      const studentIds = members.map(m => m.student_id);

      // Get this week's start date
      const now = new Date();
      const dayOfWeek = now.getDay();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - dayOfWeek);
      weekStart.setHours(0, 0, 0, 0);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds);

      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('user_id, score')
        .in('user_id', studentIds)
        .eq('completed', true)
        .gte('completed_at', weekStart.toISOString());

      const { data: streaks } = await supabase
        .from('learning_streaks')
        .select('user_id, current_streak')
        .in('user_id', studentIds);

      const streakMap = new Map(streaks?.map(s => [s.user_id, s.current_streak]) || []);

      const scoreMap = new Map<string, { total_score: number; games_played: number }>();
      
      studentIds.forEach(id => {
        scoreMap.set(id, { total_score: 0, games_played: 0 });
      });

      sessions?.forEach(session => {
        const current = scoreMap.get(session.user_id) || { total_score: 0, games_played: 0 };
        scoreMap.set(session.user_id, {
          total_score: current.total_score + (session.score || 0),
          games_played: current.games_played + 1,
        });
      });

      const leaderboardData: LeaderboardEntry[] = studentIds.map(id => {
        const profile = profiles?.find(p => p.id === id);
        const scores = scoreMap.get(id) || { total_score: 0, games_played: 0 };
        return {
          user_id: id,
          full_name: profile?.full_name || 'Unknown',
          ...scores,
          rank: 0,
          is_current_user: id === user?.id,
          streak: streakMap.get(id) || 0,
        };
      });

      leaderboardData.sort((a, b) => b.total_score - a.total_score);
      leaderboardData.forEach((entry, index) => {
        entry.rank = index + 1;
      });
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const currentUserRank = leaderboard.find(e => e.is_current_user)?.rank || 0;

  if (classes.length === 0) {
    return null;
  }

  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboard Kelas
        </h2>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Reset {daysUntilReset}h
        </div>
      </div>

      {classes.length > 1 && (
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full mb-4">
            <SelectValue placeholder="Pilih kelas" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Weekly Rewards Preview */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 border border-yellow-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-semibold">Hadiah Mingguan</span>
        </div>
        <div className="flex gap-3">
          {weeklyRewards.map((reward) => (
            <div key={reward.rank} className="flex items-center gap-1 text-xs">
              {reward.icon}
              <span className="text-muted-foreground">+{reward.xp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current User Position */}
      {currentUserRank > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Posisi Kamu</span>
            </div>
            <span className="text-xl font-bold text-primary">#{currentUserRank}</span>
          </div>
          {currentUserRank <= 3 && (
            <p className="text-xs text-muted-foreground mt-1">
              🎉 Masuk 3 besar! Pertahankan!
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Belum ada data minggu ini
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((entry) => (
            <div
              key={entry.user_id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                entry.is_current_user
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {entry.full_name}
                  {entry.is_current_user && (
                    <span className="text-xs text-primary ml-2">(Kamu)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.games_played} game • 🔥 {entry.streak}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">
                  {entry.total_score.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">poin</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress to Next Rank */}
      {currentUserRank > 1 && leaderboard.length > 1 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Ke #{currentUserRank - 1}</span>
            <span className="font-medium">
              {(() => {
                const curr = leaderboard[currentUserRank - 1]?.total_score || 0;
                const next = leaderboard[currentUserRank - 2]?.total_score || 0;
                return (next - curr).toLocaleString();
              })()} poin lagi
            </span>
          </div>
          <Progress 
            value={(() => {
              const curr = leaderboard[currentUserRank - 1]?.total_score || 0;
              const next = leaderboard[currentUserRank - 2]?.total_score || 0;
              const prev = leaderboard[currentUserRank]?.total_score || 0;
              if (next === prev) return 100;
              return ((curr - prev) / (next - prev)) * 100;
            })()}
            className="h-2"
          />
        </div>
      )}
    </div>
  );
}
