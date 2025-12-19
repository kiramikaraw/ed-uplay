import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, Eye, Activity, TrendingUp, Clock, CheckCircle, 
  AlertCircle, Wifi, WifiOff, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentStatus {
  id: string;
  name: string;
  isOnline: boolean;
  lastActivity: Date | null;
  currentGame: string | null;
  todayScore: number;
  todayGames: number;
  streak: number;
}

interface ClassData {
  id: string;
  name: string;
  studentCount: number;
}

export const ClassroomLiveView = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<StudentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentStatuses();
      
      // Set up realtime subscription for presence
      const channel = supabase.channel(`classroom-${selectedClass}`)
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          updateOnlineStatus(state);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('Student joined:', newPresences);
          setStudents(prev => prev.map(s => {
            const joined = newPresences.find((p: any) => p.user_id === s.id);
            return joined ? { ...s, isOnline: true, lastActivity: new Date() } : s;
          }));
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          console.log('Student left:', leftPresences);
          setStudents(prev => prev.map(s => {
            const left = leftPresences.find((p: any) => p.user_id === s.id);
            return left ? { ...s, isOnline: false } : s;
          }));
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    if (!user) return;

    try {
      const { data: classesData, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('teacher_id', user.id);

      if (error) throw error;

      // Get student counts
      const classesWithCounts = await Promise.all(
        (classesData || []).map(async (cls) => {
          const { count } = await supabase
            .from('class_members')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);
          
          return { ...cls, studentCount: count || 0 };
        })
      );

      setClasses(classesWithCounts);
      if (classesWithCounts.length > 0) {
        setSelectedClass(classesWithCounts[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentStatuses = async () => {
    if (!selectedClass) return;

    try {
      // Get class members with profiles
      const { data: members, error } = await supabase
        .from('class_members')
        .select('student_id')
        .eq('class_id', selectedClass);

      if (error) throw error;

      const studentIds = members?.map(m => m.student_id) || [];
      
      if (studentIds.length === 0) {
        setStudents([]);
        return;
      }

      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds);

      // Get today's game sessions
      const today = new Date().toISOString().split('T')[0];
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('user_id, score, completed')
        .in('user_id', studentIds)
        .gte('started_at', today)
        .eq('completed', true);

      // Get streaks
      const { data: streaks } = await supabase
        .from('learning_streaks')
        .select('user_id, current_streak')
        .in('user_id', studentIds);

      // Combine data
      const studentStatuses: StudentStatus[] = (profiles || []).map(profile => {
        const userSessions = sessions?.filter(s => s.user_id === profile.id) || [];
        const userStreak = streaks?.find(s => s.user_id === profile.id);
        
        return {
          id: profile.id,
          name: profile.full_name,
          isOnline: Math.random() > 0.5, // Demo: random online status
          lastActivity: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 3600000) : null,
          currentGame: Math.random() > 0.7 ? 'Quiz Matematika' : null,
          todayScore: userSessions.reduce((sum, s) => sum + (s.score || 0), 0),
          todayGames: userSessions.length,
          streak: userStreak?.current_streak || 0,
        };
      });

      setStudents(studentStatuses.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0)));
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching student statuses:', error);
    }
  };

  const updateOnlineStatus = (state: Record<string, any[]>) => {
    const onlineUserIds = Object.values(state).flat().map((p: any) => p.user_id);
    setStudents(prev => prev.map(s => ({
      ...s,
      isOnline: onlineUserIds.includes(s.id)
    })));
  };

  const onlineCount = students.filter(s => s.isOnline).length;
  const activelyPlayingCount = students.filter(s => s.currentGame).length;
  const totalTodayScore = students.reduce((sum, s) => sum + s.todayScore, 0);
  const avgGamesPerStudent = students.length > 0 
    ? (students.reduce((sum, s) => sum + s.todayGames, 0) / students.length).toFixed(1) 
    : '0';

  const selectedClassData = classes.find(c => c.id === selectedClass);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (classes.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Belum ada kelas yang dibuat</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Classroom Live View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Update: {lastRefresh.toLocaleTimeString()}
            </Badge>
            <Button size="icon" variant="ghost" onClick={fetchStudentStatuses}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Class Selector */}
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kelas" />
          </SelectTrigger>
          <SelectContent>
            {classes.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name} ({cls.studentCount} siswa)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 rounded-lg bg-success/10 text-center">
            <Wifi className="h-4 w-4 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{onlineCount}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-center">
            <Activity className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{activelyPlayingCount}</p>
            <p className="text-xs text-muted-foreground">Bermain</p>
          </div>
          <div className="p-2 rounded-lg bg-warning/10 text-center">
            <TrendingUp className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{totalTodayScore}</p>
            <p className="text-xs text-muted-foreground">Total Skor</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/10 text-center">
            <CheckCircle className="h-4 w-4 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold text-secondary">{avgGamesPerStudent}</p>
            <p className="text-xs text-muted-foreground">Avg Game</p>
          </div>
        </div>

        {/* Student List */}
        <div className="max-h-80 overflow-y-auto space-y-2">
          <AnimatePresence>
            {students.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg border transition-all ${
                  student.isOnline 
                    ? 'bg-success/5 border-success/20' 
                    : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        student.isOnline ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      {student.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      {student.currentGame ? (
                        <p className="text-xs text-success flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {student.currentGame}
                        </p>
                      ) : student.isOnline ? (
                        <p className="text-xs text-muted-foreground">Online</p>
                      ) : student.lastActivity ? (
                        <p className="text-xs text-muted-foreground">
                          Terakhir: {new Date(student.lastActivity).toLocaleTimeString()}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Belum aktif hari ini</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-sm font-medium">{student.todayScore}</p>
                      <p className="text-xs text-muted-foreground">Skor</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{student.todayGames}</p>
                      <p className="text-xs text-muted-foreground">Game</p>
                    </div>
                    {student.streak > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        🔥 {student.streak}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {students.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Belum ada siswa di kelas ini</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
