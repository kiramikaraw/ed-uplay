import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Award, Lock, CheckCircle, Sparkles } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  earned: boolean;
  progress: number;
}

export function AchievementSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    games_played: 0,
    total_score: 0,
    perfect_games: 0,
    streak_days: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      // Fetch all badges
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .order('requirement_value', { ascending: true });

      // Fetch user's earned badges
      const { data: earnedBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

      const earnedIds = new Set(earnedBadges?.map(b => b.badge_id) || []);

      // Fetch user stats
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('score, correct_answers, total_questions, completed')
        .eq('user_id', user.id)
        .eq('completed', true);

      const gamesPlayed = sessions?.length || 0;
      const totalScore = sessions?.reduce((sum, s) => sum + (s.score || 0), 0) || 0;
      const perfectGames = sessions?.filter(s => s.correct_answers === s.total_questions && s.total_questions > 0).length || 0;

      setStats({
        games_played: gamesPlayed,
        total_score: totalScore,
        perfect_games: perfectGames,
        streak_days: 0, // Would need more complex calculation
      });

      // Map achievements with progress
      const achievementsData: Achievement[] = (badges || []).map(badge => {
        let progress = 0;
        switch (badge.requirement_type) {
          case 'games_played':
            progress = Math.min((gamesPlayed / badge.requirement_value) * 100, 100);
            break;
          case 'total_score':
            progress = Math.min((totalScore / badge.requirement_value) * 100, 100);
            break;
          case 'perfect_games':
            progress = Math.min((perfectGames / badge.requirement_value) * 100, 100);
            break;
          default:
            progress = 0;
        }

        return {
          id: badge.id,
          name: badge.name,
          description: badge.description || '',
          icon: badge.icon || '🏆',
          requirement_type: badge.requirement_type,
          requirement_value: badge.requirement_value,
          earned: earnedIds.has(badge.id),
          progress: Math.round(progress),
        };
      });

      setAchievements(achievementsData);

      // Check and award new achievements
      await checkAndAwardAchievements(achievementsData);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardAchievements = async (achievementsList: Achievement[]) => {
    if (!user) return;

    const newAchievements: Achievement[] = [];

    for (const achievement of achievementsList) {
      if (!achievement.earned && achievement.progress >= 100) {
        // Award the badge
        const { error } = await supabase
          .from('user_badges')
          .insert({
            user_id: user.id,
            badge_id: achievement.id,
          });

        if (!error) {
          newAchievements.push(achievement);
        }
      }
    }

    // Show toast for newly earned achievements
    if (newAchievements.length > 0) {
      toast({
        title: '🎉 Achievement Unlocked!',
        description: `Kamu mendapatkan: ${newAchievements.map(a => a.name).join(', ')}`,
      });

      // Refresh to update UI
      fetchAchievements();
    }
  };

  const getRequirementLabel = (type: string, value: number) => {
    switch (type) {
      case 'games_played':
        return `Mainkan ${value} game`;
      case 'total_score':
        return `Kumpulkan ${value.toLocaleString()} poin`;
      case 'perfect_games':
        return `Selesaikan ${value} game dengan sempurna`;
      case 'streak_days':
        return `Bermain ${value} hari berturut-turut`;
      default:
        return `${type}: ${value}`;
    }
  };

  if (loading) {
    return (
      <div className="game-card">
        <h2 className="font-bold text-xl mb-4">Achievements 🏆</h2>
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Achievements
        </h2>
        <span className="text-sm text-muted-foreground">
          {earnedCount}/{achievements.length}
        </span>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Belum ada achievement</p>
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border transition-all ${
                achievement.earned
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-muted/50 border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`text-3xl ${!achievement.earned && 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{achievement.name}</h3>
                    {achievement.earned ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getRequirementLabel(achievement.requirement_type, achievement.requirement_value)}
                  </p>
                  
                  {!achievement.earned && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
