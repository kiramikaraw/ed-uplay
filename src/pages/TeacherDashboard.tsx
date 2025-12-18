import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GameButton } from '@/components/ui/game-button';
import { Mascot, MascotMessage } from '@/components/Mascot';
import { ProgressBar } from '@/components/ProgressBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Plus, BookOpen, TrendingUp, LogOut, 
  Copy, UserPlus, BarChart3, FileText, Settings
} from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
  description: string;
  education_level: string;
  join_code: string;
  created_at: string;
  member_count?: number;
}

interface StudentProgress {
  student_id: string;
  student_name: string;
  games_played: number;
  total_score: number;
  avg_score: number;
}

export default function TeacherDashboard() {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state for creating class
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [newClassLevel, setNewClassLevel] = useState<string>('');

  useEffect(() => {
    if (!authLoading && (!user || role !== 'teacher')) {
      navigate('/auth?mode=login');
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (user && role === 'teacher') {
      fetchClasses();
    }
  }, [user, role]);

  const fetchClasses = async () => {
    try {
      const { data: classesData, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get member counts
      const classesWithCounts = await Promise.all(
        (classesData || []).map(async (cls) => {
          const { count } = await supabase
            .from('class_members')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);
          return { ...cls, member_count: count || 0 };
        })
      );

      setClasses(classesWithCounts);
      if (classesWithCounts.length > 0 && !selectedClass) {
        setSelectedClass(classesWithCounts[0]);
        fetchStudentProgress(classesWithCounts[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProgress = async (classId: string) => {
    try {
      // Get class members with their profiles
      const { data: members, error: membersError } = await supabase
        .from('class_members')
        .select('student_id')
        .eq('class_id', classId);

      if (membersError) throw membersError;

      if (!members || members.length === 0) {
        setStudentProgress([]);
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
        .select('user_id, score, completed')
        .in('user_id', studentIds)
        .eq('completed', true);

      // Calculate progress per student
      const progressMap = new Map<string, StudentProgress>();
      
      profiles?.forEach(profile => {
        const studentSessions = sessions?.filter(s => s.user_id === profile.id) || [];
        const totalScore = studentSessions.reduce((sum, s) => sum + (s.score || 0), 0);
        
        progressMap.set(profile.id, {
          student_id: profile.id,
          student_name: profile.full_name,
          games_played: studentSessions.length,
          total_score: totalScore,
          avg_score: studentSessions.length > 0 ? Math.round(totalScore / studentSessions.length) : 0,
        });
      });

      setStudentProgress(Array.from(progressMap.values()));
    } catch (error) {
      console.error('Error fetching student progress:', error);
    }
  };

  const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateClass = async () => {
    if (!newClassName || !newClassLevel) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Isi nama kelas dan jenjang pendidikan',
        variant: 'destructive',
      });
      return;
    }

    try {
      const joinCode = generateJoinCode();
      
      const { data, error } = await supabase
        .from('classes')
        .insert({
          teacher_id: user!.id,
          name: newClassName,
          description: newClassDesc,
          education_level: newClassLevel as 'sd' | 'smp' | 'sma',
          join_code: joinCode,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Kelas berhasil dibuat!',
        description: `Kode bergabung: ${joinCode}`,
      });

      setShowCreateDialog(false);
      setNewClassName('');
      setNewClassDesc('');
      setNewClassLevel('');
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: 'Gagal membuat kelas',
        description: 'Silakan coba lagi',
        variant: 'destructive',
      });
    }
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Kode disalin!',
      description: 'Bagikan kode ini ke siswa untuk bergabung',
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Mascot size="lg" mood="thinking" />
          <p className="mt-4 text-xl font-semibold text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || role !== 'teacher') return null;

  const levelLabels: Record<string, string> = { sd: 'SD', smp: 'SMP', sma: 'SMA' };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🎮</span>
            <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EduPlay
            </span>
            <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded-full">Guru</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/subjects">
              <GameButton variant="ghost" size="sm">
                <BookOpen className="w-4 h-4" />
                Materi
              </GameButton>
            </Link>
            <GameButton variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              Keluar
            </GameButton>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <MascotMessage 
            message="Selamat datang di Dashboard Guru! Pantau progress siswa dan kelola kelas Anda."
            mood="happy"
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Class List */}
          <div className="lg:col-span-1">
            <div className="game-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Kelas Saya</h2>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <GameButton variant="primary" size="sm">
                      <Plus className="w-4 h-4" />
                    </GameButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Buat Kelas Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="className">Nama Kelas</Label>
                        <Input
                          id="className"
                          placeholder="contoh: Kelas 6A"
                          value={newClassName}
                          onChange={(e) => setNewClassName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="classDesc">Deskripsi (opsional)</Label>
                        <Input
                          id="classDesc"
                          placeholder="Deskripsi kelas"
                          value={newClassDesc}
                          onChange={(e) => setNewClassDesc(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Jenjang</Label>
                        <Select value={newClassLevel} onValueChange={setNewClassLevel}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Pilih jenjang" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sd">SD</SelectItem>
                            <SelectItem value="smp">SMP</SelectItem>
                            <SelectItem value="sma">SMA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <GameButton variant="primary" className="w-full" onClick={handleCreateClass}>
                        Buat Kelas
                      </GameButton>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {classes.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Belum ada kelas. Buat kelas pertamamu!
                </p>
              ) : (
                <div className="space-y-2">
                  {classes.map(cls => (
                    <button
                      key={cls.id}
                      onClick={() => {
                        setSelectedClass(cls);
                        fetchStudentProgress(cls.id);
                      }}
                      className={`w-full p-3 rounded-xl text-left transition-colors ${
                        selectedClass?.id === cls.id 
                          ? 'bg-primary/10 border-2 border-primary' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <p className="font-semibold">{cls.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {levelLabels[cls.education_level]} • {cls.member_count} siswa
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedClass ? (
              <>
                {/* Class Info Card */}
                <div className="game-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{selectedClass.name}</h1>
                      <p className="text-muted-foreground">
                        {levelLabels[selectedClass.education_level]} • {selectedClass.member_count} siswa
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-muted p-3 rounded-xl">
                      <div>
                        <p className="text-xs text-muted-foreground">Kode Bergabung</p>
                        <p className="font-mono font-bold text-lg">{selectedClass.join_code}</p>
                      </div>
                      <GameButton 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyJoinCode(selectedClass.join_code)}
                      >
                        <Copy className="w-4 h-4" />
                      </GameButton>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="game-card text-center">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedClass.member_count}</p>
                    <p className="text-sm text-muted-foreground">Siswa</p>
                  </div>
                  <div className="game-card text-center">
                    <BarChart3 className="w-8 h-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {studentProgress.reduce((sum, s) => sum + s.games_played, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Game Dimainkan</p>
                  </div>
                  <div className="game-card text-center">
                    <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {studentProgress.length > 0 
                        ? Math.round(studentProgress.reduce((sum, s) => sum + s.avg_score, 0) / studentProgress.length)
                        : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Rata-rata Skor</p>
                  </div>
                </div>

                {/* Student Progress Table */}
                <div className="game-card">
                  <h2 className="font-bold text-lg mb-4">Progress Siswa</h2>
                  {studentProgress.length === 0 ? (
                    <div className="text-center py-8">
                      <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Belum ada siswa di kelas ini</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Bagikan kode <span className="font-mono font-bold">{selectedClass.join_code}</span> ke siswa
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4">Nama Siswa</th>
                            <th className="text-center py-3 px-4">Game Dimainkan</th>
                            <th className="text-center py-3 px-4">Total Skor</th>
                            <th className="text-center py-3 px-4">Rata-rata</th>
                            <th className="text-center py-3 px-4">Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentProgress.map(student => (
                            <tr key={student.student_id} className="border-b border-border/50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                                    {student.student_name.charAt(0)}
                                  </div>
                                  <span className="font-medium">{student.student_name}</span>
                                </div>
                              </td>
                              <td className="text-center py-3 px-4">{student.games_played}</td>
                              <td className="text-center py-3 px-4 font-semibold">{student.total_score}</td>
                              <td className="text-center py-3 px-4">{student.avg_score}</td>
                              <td className="py-3 px-4 w-32">
                                <ProgressBar 
                                  value={Math.min(student.avg_score, 100)} 
                                  max={100} 
                                  showLabel={false}
                                  size="sm"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="game-card text-center py-12">
                <Mascot size="lg" mood="thinking" className="mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Belum ada kelas</h2>
                <p className="text-muted-foreground mb-6">
                  Buat kelas pertamamu untuk mulai memantau progress siswa
                </p>
                <GameButton variant="primary" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-5 h-5" />
                  Buat Kelas Baru
                </GameButton>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
