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
import { Trophy, Medal, Award } from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
}

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  total_score: number;
  games_played: number;
}

export function ClassLeaderboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchLeaderboard(selectedClass);
    }
  }, [selectedClass]);

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
      // Get all members of the class
      const { data: members } = await supabase
        .from('class_members')
        .select('student_id')
        .eq('class_id', classId);

      if (!members || members.length === 0) {
        setLeaderboard([]);
        return;
      }

      const studentIds = members.map(m => m.student_id);

      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds);

      // Get game sessions for these students
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('user_id, score')
        .in('user_id', studentIds)
        .eq('completed', true);

      // Aggregate scores
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

      // Build leaderboard
      const leaderboardData: LeaderboardEntry[] = studentIds.map(id => {
        const profile = profiles?.find(p => p.id === id);
        const scores = scoreMap.get(id) || { total_score: 0, games_played: 0 };
        return {
          user_id: id,
          full_name: profile?.full_name || 'Unknown',
          ...scores,
        };
      });

      // Sort by total score descending
      leaderboardData.sort((a, b) => b.total_score - a.total_score);
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
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  if (classes.length === 0) {
    return null;
  }

  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl">Leaderboard Kelas 🏆</h2>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
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
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Belum ada data
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((entry, index) => (
            <div
              key={entry.user_id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                entry.user_id === user?.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(index + 1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {entry.full_name}
                  {entry.user_id === user?.id && (
                    <span className="text-xs text-primary ml-2">(Kamu)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.games_played} game dimainkan
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
    </div>
  );
}
