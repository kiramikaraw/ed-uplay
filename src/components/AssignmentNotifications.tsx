import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Bell, Clock, BookOpen, CheckCircle } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface Assignment {
  id: string;
  title: string;
  due_date: string | null;
  game_id: string;
  class_name: string;
  game_type: string;
  completed: boolean;
}

export function AssignmentNotifications() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    if (!user) return;

    try {
      // Get student's classes
      const { data: memberships } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', user.id);

      if (!memberships || memberships.length === 0) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      const classIds = memberships.map(m => m.class_id);

      // Get assignments for those classes
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          due_date,
          game_id,
          class_id,
          classes(name),
          games(game_type)
        `)
        .in('class_id', classIds)
        .order('due_date', { ascending: true });

      // Get completed sessions
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('game_id')
        .eq('user_id', user.id)
        .eq('completed', true);

      const completedGameIds = new Set(sessions?.map(s => s.game_id) || []);

      const formattedAssignments: Assignment[] = (assignmentsData || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        due_date: a.due_date,
        game_id: a.game_id,
        class_name: a.classes?.name || 'Unknown',
        game_type: a.games?.game_type || 'quiz',
        completed: completedGameIds.has(a.game_id),
      }));

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDueDateLabel = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    
    if (isPast(date) && !isToday(date)) {
      return { label: 'Terlambat', className: 'text-destructive bg-destructive/10' };
    }
    if (isToday(date)) {
      return { label: 'Hari ini', className: 'text-orange bg-orange/10' };
    }
    if (isTomorrow(date)) {
      return { label: 'Besok', className: 'text-yellow-600 bg-yellow-100' };
    }
    return { 
      label: format(date, 'd MMM', { locale: localeId }), 
      className: 'text-muted-foreground bg-muted' 
    };
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

  const getGameRoute = (gameType: string, gameId: string) => {
    const routes: Record<string, string> = {
      quiz: `/games/quiz/${gameId}`,
      drag_drop: `/games/drag-drop/${gameId}`,
      memory: `/games/memory/${gameId}`,
      puzzle: `/games/puzzle/${gameId}`,
    };
    return routes[gameType] || `/games/quiz/${gameId}`;
  };

  const pendingAssignments = assignments.filter(a => !a.completed);
  const completedAssignments = assignments.filter(a => a.completed);

  if (loading) {
    return (
      <div className="game-card">
        <h2 className="font-bold text-xl mb-4">Tugas 📋</h2>
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="game-card">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-xl">Tugas</h2>
        {pendingAssignments.length > 0 && (
          <span className="ml-auto px-2 py-1 text-xs font-bold rounded-full bg-primary text-primary-foreground">
            {pendingAssignments.length}
          </span>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Belum ada tugas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingAssignments.map((assignment) => {
            const dueLabel = getDueDateLabel(assignment.due_date);
            return (
              <Link
                key={assignment.id}
                to={getGameRoute(assignment.game_type, assignment.game_id)}
                className="block p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.class_name} • {getGameTypeLabel(assignment.game_type)}
                    </p>
                  </div>
                  {dueLabel && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${dueLabel.className}`}>
                      {dueLabel.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {completedAssignments.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Selesai ({completedAssignments.length})</span>
              </div>
              {completedAssignments.slice(0, 3).map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-3 rounded-xl bg-muted/50 opacity-60"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="font-medium truncate text-sm">{assignment.title}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
