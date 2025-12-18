import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Zap, Trophy, Clock, Play, CheckCircle, Gift 
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface DailyChallenge {
  id: string;
  challenge_date: string;
  game_id: string;
  bonus_points: number;
  game_title: string;
  game_type: string;
  completed: boolean;
}

export function DailyChallenge() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchTodayChallenge();
      fetchStreak();
    }
  }, [user]);

  const fetchTodayChallenge = async () => {
    if (!user) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data: challengeData } = await supabase
        .from('daily_challenges')
        .select(`
          id,
          challenge_date,
          game_id,
          bonus_points,
          games(title, game_type)
        `)
        .eq('challenge_date', today)
        .single();

      if (challengeData) {
        // Check if completed
        const { data: completion } = await supabase
          .from('daily_challenge_completions')
          .select('id')
          .eq('challenge_id', challengeData.id)
          .eq('user_id', user.id)
          .single();

        setChallenge({
          id: challengeData.id,
          challenge_date: challengeData.challenge_date,
          game_id: challengeData.game_id,
          bonus_points: challengeData.bonus_points,
          game_title: (challengeData as any).games?.title || 'Challenge',
          game_type: (challengeData as any).games?.game_type || 'quiz',
          completed: !!completion,
        });
      }
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreak = async () => {
    if (!user) return;

    try {
      const { data: completions } = await supabase
        .from('daily_challenge_completions')
        .select('completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(30);

      if (!completions || completions.length === 0) {
        setStreak(0);
        return;
      }

      // Calculate consecutive days
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < completions.length; i++) {
        const completionDate = new Date(completions[i].completed_at);
        completionDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (completionDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else if (i === 0 && completionDate.getTime() === today.getTime() - 86400000) {
          // Yesterday counts for streak
          currentStreak++;
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  const getGameRoute = (gameType: string, gameId: string) => {
    const routes: Record<string, string> = {
      quiz: `/games/quiz/${gameId}`,
      drag_drop: `/games/drag-drop/${gameId}`,
      memory: `/games/memory/${gameId}`,
      puzzle: `/games/puzzle/${gameId}`,
    };
    return routes[gameType] || `/games/quiz/${gameId}`;
  };

  if (loading) {
    return (
      <div className="game-card">
        <h2 className="font-bold text-xl mb-4">Daily Challenge ⚡</h2>
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="game-card overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Daily Challenge
        </h2>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500">
          <Trophy className="w-4 h-4" />
          <span className="font-bold">{streak}</span>
          <span className="text-xs">hari</span>
        </div>
      </div>

      {!challenge ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Tidak ada challenge hari ini</p>
          <p className="text-sm text-muted-foreground">Cek lagi besok!</p>
        </div>
      ) : challenge.completed ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="font-bold text-lg text-green-500">Challenge Selesai!</h3>
          <p className="text-muted-foreground">
            +{challenge.bonus_points} bonus poin diperoleh
          </p>
          <div className="mt-4 p-3 rounded-xl bg-muted">
            <p className="text-sm">
              Streak kamu: <span className="font-bold text-orange-500">{streak} hari</span>
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-yellow-500">+{challenge.bonus_points} Bonus Poin</span>
            </div>
            <h3 className="font-bold text-lg">{challenge.game_title}</h3>
            <p className="text-sm text-muted-foreground">
              Selesaikan challenge hari ini untuk bonus poin!
            </p>
          </div>

          <Link to={getGameRoute(challenge.game_type, challenge.game_id)}>
            <Button className="w-full gap-2" size="lg">
              <Play className="w-5 h-5" />
              Mulai Challenge
            </Button>
          </Link>

          <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Reset dalam {24 - new Date().getHours()} jam
          </p>
        </div>
      )}
    </div>
  );
}
