import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ProgressBar';
import { 
  User, Trophy, Brain, Target, Clock, TrendingUp, 
  ChevronDown, ChevronUp, Award, Gamepad2 
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface StudentProgressReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  classId: string;
}

interface GameSession {
  id: string;
  game_title: string;
  game_type: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_spent_seconds: number;
  completed_at: string;
}

interface TopicProgress {
  topic_id: string;
  topic_name: string;
  subject_name: string;
  games_played: number;
  total_score: number;
  mastery_level: number;
}

interface BadgeEarned {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

export function StudentProgressReport({
  open,
  onOpenChange,
  studentId,
  studentName,
  classId,
}: StudentProgressReportProps) {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [badges, setBadges] = useState<BadgeEarned[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState(false);

  useEffect(() => {
    if (open && studentId) {
      fetchStudentData();
    }
  }, [open, studentId]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Fetch game sessions with game details
      const { data: sessionsData } = await supabase
        .from('game_sessions')
        .select(`
          id,
          score,
          correct_answers,
          total_questions,
          time_spent_seconds,
          completed_at,
          games(title, game_type)
        `)
        .eq('user_id', studentId)
        .eq('completed', true)
        .order('completed_at', { ascending: false });

      const formattedSessions: GameSession[] = (sessionsData || []).map((s: any) => ({
        id: s.id,
        game_title: s.games?.title || 'Unknown Game',
        game_type: s.games?.game_type || 'quiz',
        score: s.score || 0,
        correct_answers: s.correct_answers || 0,
        total_questions: s.total_questions || 0,
        time_spent_seconds: s.time_spent_seconds || 0,
        completed_at: s.completed_at,
      }));
      setSessions(formattedSessions);

      // Fetch topic progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select(`
          topic_id,
          games_played,
          total_score,
          mastery_level,
          topics(name, subjects(name))
        `)
        .eq('user_id', studentId);

      const formattedProgress: TopicProgress[] = (progressData || []).map((p: any) => ({
        topic_id: p.topic_id,
        topic_name: p.topics?.name || 'Unknown',
        subject_name: p.topics?.subjects?.name || 'Unknown',
        games_played: p.games_played || 0,
        total_score: p.total_score || 0,
        mastery_level: p.mastery_level || 0,
      }));
      setTopicProgress(formattedProgress);

      // Fetch earned badges
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select(`
          earned_at,
          badges(id, name, description, icon)
        `)
        .eq('user_id', studentId)
        .order('earned_at', { ascending: false });

      const formattedBadges: BadgeEarned[] = (badgesData || []).map((b: any) => ({
        id: b.badges?.id || '',
        name: b.badges?.name || 'Badge',
        description: b.badges?.description || '',
        icon: b.badges?.icon || '🏆',
        earned_at: b.earned_at,
      }));
      setBadges(formattedBadges);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGameTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      quiz: 'Quiz',
      drag_drop: 'Drag & Drop',
      memory: 'Memory',
      puzzle: 'Puzzle',
    };
    return labels[type] || type;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
  const totalGames = sessions.length;
  const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
  const totalTime = sessions.reduce((sum, s) => sum + s.time_spent_seconds, 0);
  const avgAccuracy = sessions.length > 0 
    ? Math.round(
        (sessions.reduce((sum, s) => sum + (s.total_questions > 0 ? s.correct_answers / s.total_questions : 0), 0) / sessions.length) * 100
      )
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Laporan Progress: {studentName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <Trophy className="w-6 h-6 text-primary mb-2" />
                <p className="text-2xl font-bold">{totalScore.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Poin</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                <Gamepad2 className="w-6 h-6 text-secondary mb-2" />
                <p className="text-2xl font-bold">{totalGames}</p>
                <p className="text-sm text-muted-foreground">Game Selesai</p>
              </div>
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <Target className="w-6 h-6 text-green-500 mb-2" />
                <p className="text-2xl font-bold">{avgAccuracy}%</p>
                <p className="text-sm text-muted-foreground">Akurasi</p>
              </div>
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <Clock className="w-6 h-6 text-orange-500 mb-2" />
                <p className="text-2xl font-bold">{formatTime(totalTime)}</p>
                <p className="text-sm text-muted-foreground">Total Waktu</p>
              </div>
            </div>

            {/* Topic Progress */}
            {topicProgress.length > 0 && (
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Progress per Topik
                </h3>
                <div className="space-y-3">
                  {topicProgress.map((tp) => (
                    <div key={tp.topic_id} className="p-3 rounded-xl bg-muted">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-medium">{tp.topic_name}</p>
                          <p className="text-xs text-muted-foreground">{tp.subject_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{tp.total_score} poin</p>
                          <p className="text-xs text-muted-foreground">{tp.games_played} game</p>
                        </div>
                      </div>
                      <ProgressBar 
                        value={Math.min(tp.mastery_level, 100)} 
                        showLabel={false}
                        variant={tp.mastery_level >= 80 ? 'success' : tp.mastery_level >= 50 ? 'warning' : 'default'}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Penguasaan: {tp.mastery_level}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Badge Diperoleh ({badges.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {badges.map((badge) => (
                    <div 
                      key={badge.id}
                      className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center"
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <p className="font-medium text-sm mt-1">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Game Sessions */}
            <div>
              <button
                onClick={() => setExpandedSessions(!expandedSessions)}
                className="w-full flex items-center justify-between font-bold mb-3"
              >
                <span className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Riwayat Game ({sessions.length})
                </span>
                {expandedSessions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {expandedSessions && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sessions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Belum ada riwayat game</p>
                  ) : (
                    sessions.map((session) => (
                      <div 
                        key={session.id}
                        className="p-3 rounded-xl bg-muted flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{session.game_title}</p>
                          <p className="text-xs text-muted-foreground">
                            {getGameTypeLabel(session.game_type)} • {session.completed_at && format(new Date(session.completed_at), 'd MMM yyyy', { locale: localeId })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{session.score} poin</p>
                          <p className="text-xs text-muted-foreground">
                            {session.correct_answers}/{session.total_questions} benar
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
