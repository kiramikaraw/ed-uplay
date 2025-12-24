import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { GameButton } from '@/components/ui/game-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mascot, MascotMessage } from '@/components/Mascot';
import { ProgressBar } from '@/components/ProgressBar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User, LogOut, Plus, Trophy, Brain, Target, Clock,
  ChevronRight, Loader2, UserPlus, X
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface ChildData {
  id: string;
  full_name: string;
  education_level: string | null;
  total_score: number;
  games_played: number;
  badges_earned: number;
}

interface ChildSession {
  id: string;
  game_title: string;
  score: number;
  completed_at: string;
}

export default function ParentDashboard() {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [children, setChildren] = useState<ChildData[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [childSessions, setChildSessions] = useState<ChildSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  const [showAddChild, setShowAddChild] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || role !== 'parent')) {
      navigate('/auth?mode=login');
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (user && role === 'parent') {
      fetchChildren();
    }
  }, [user, role]);

  const fetchChildren = async () => {
    if (!user) return;

    try {
      const { data: relations } = await supabase
        .from('parent_children')
        .select('child_id')
        .eq('parent_id', user.id);

      if (!relations || relations.length === 0) {
        setChildren([]);
        setLoading(false);
        return;
      }

      const childIds = relations.map(r => r.child_id);

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, education_level')
        .in('id', childIds);

      // Fetch stats for each child
      const childrenData: ChildData[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get game sessions
          const { data: sessions } = await supabase
            .from('game_sessions')
            .select('score')
            .eq('user_id', profile.id)
            .eq('completed', true);

          // Get badges
          const { count: badgeCount } = await supabase
            .from('user_badges')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          const totalScore = sessions?.reduce((sum, s) => sum + (s.score || 0), 0) || 0;

          return {
            id: profile.id,
            full_name: profile.full_name,
            education_level: profile.education_level,
            total_score: totalScore,
            games_played: sessions?.length || 0,
            badges_earned: badgeCount || 0,
          };
        })
      );

      setChildren(childrenData);
      if (childrenData.length > 0 && !selectedChild) {
        selectChild(childrenData[0]);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectChild = async (child: ChildData) => {
    setSelectedChild(child);
    setLoadingSessions(true);

    try {
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select(`
          id,
          score,
          completed_at,
          games(title)
        `)
        .eq('user_id', child.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(10);

      const formattedSessions: ChildSession[] = (sessions || []).map((s: any) => ({
        id: s.id,
        game_title: s.games?.title || 'Game',
        score: s.score || 0,
        completed_at: s.completed_at,
      }));

      setChildSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching child sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleAddChild = async () => {
    if (!user || !childEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Masukkan email anak',
        variant: 'destructive',
      });
      return;
    }

    setAdding(true);
    try {
      // Find user by email in auth (we'll search profiles by checking if exists)
      // Since we can't query auth.users, we'll need the child to share their user ID
      // For now, we'll search by name match in profiles (simplified approach)
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', `%${childEmail.trim()}%`)
        .limit(5);

      if (profileError || !profiles || profiles.length === 0) {
        toast({
          title: 'Tidak ditemukan',
          description: 'Anak dengan nama tersebut tidak ditemukan. Pastikan nama sesuai.',
          variant: 'destructive',
        });
        return;
      }

      // Check if already linked
      const { data: existing } = await supabase
        .from('parent_children')
        .select('id')
        .eq('parent_id', user.id)
        .eq('child_id', profiles[0].id)
        .single();

      if (existing) {
        toast({
          title: 'Info',
          description: 'Anak sudah terhubung dengan akun Anda',
        });
        return;
      }

      // Add relationship
      const { error } = await supabase
        .from('parent_children')
        .insert({
          parent_id: user.id,
          child_id: profiles[0].id,
        });

      if (error) throw error;

      toast({
        title: 'Berhasil!',
        description: `${profiles[0].full_name} berhasil ditambahkan`,
      });

      setChildEmail('');
      setShowAddChild(false);
      fetchChildren();
    } catch (error) {
      console.error('Error adding child:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan anak',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveChild = async (childId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('parent_children')
        .delete()
        .eq('parent_id', user.id)
        .eq('child_id', childId);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Anak telah dihapus dari daftar',
      });

      setSelectedChild(null);
      fetchChildren();
    } catch (error) {
      console.error('Error removing child:', error);
    }
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

  if (!user || role !== 'parent') return null;

  const levelLabels: Record<string, string> = { sd: 'SD', smp: 'SMP', sma: 'SMA' };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Eduverse" className="w-10 h-10" />
            <span className="font-bold text-2xl bg-gradient-to-r from-primary via-purple to-secondary bg-clip-text text-transparent">
              Eduverse
            </span>
            <span className="text-sm bg-purple text-white px-2 py-1 rounded-full">Orang Tua</span>
          </Link>
          <nav className="flex items-center gap-4">
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
            message="Selamat datang! Pantau progress belajar anak Anda di sini."
            mood="happy"
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Children List */}
          <div className="lg:col-span-1">
            <div className="game-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Anak Saya</h2>
                <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
                  <DialogTrigger asChild>
                    <GameButton variant="primary" size="sm">
                      <Plus className="w-4 h-4" />
                    </GameButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Anak</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Masukkan nama anak yang terdaftar di Eduverse
                        </p>
                        <Input
                          placeholder="Nama anak"
                          value={childEmail}
                          onChange={(e) => setChildEmail(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddChild} disabled={adding} className="w-full">
                        {adding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Tambah Anak
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {children.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">Belum ada anak terdaftar</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tambahkan anak untuk memantau progress belajarnya
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => selectChild(child)}
                      className={`w-full p-3 rounded-xl text-left transition-colors ${
                        selectedChild?.id === child.id
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                          {child.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{child.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {child.education_level ? levelLabels[child.education_level] : '-'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedChild ? (
              <>
                {/* Child Info */}
                <div className="game-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                        {selectedChild.full_name.charAt(0)}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold">{selectedChild.full_name}</h1>
                        <p className="text-muted-foreground">
                          {selectedChild.education_level ? levelLabels[selectedChild.education_level] : 'Belum diatur'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveChild(selectedChild.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="game-card text-center">
                    <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedChild.total_score.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Poin</p>
                  </div>
                  <div className="game-card text-center">
                    <Brain className="w-8 h-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedChild.games_played}</p>
                    <p className="text-sm text-muted-foreground">Game Selesai</p>
                  </div>
                  <div className="game-card text-center">
                    <Target className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{selectedChild.badges_earned}</p>
                    <p className="text-sm text-muted-foreground">Badge</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="game-card">
                  <h2 className="font-bold text-lg mb-4">Aktivitas Terakhir</h2>
                  
                  {loadingSessions ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                  ) : childSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Belum ada aktivitas</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {childSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted"
                        >
                          <div>
                            <p className="font-medium">{session.game_title}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(session.completed_at), 'd MMM yyyy, HH:mm', { locale: localeId })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{session.score}</p>
                            <p className="text-xs text-muted-foreground">poin</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="game-card text-center py-12">
                <Mascot size="lg" mood="thinking" className="mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Pilih atau tambahkan anak</h2>
                <p className="text-muted-foreground">
                  Tambahkan anak untuk memantau progress belajarnya
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
