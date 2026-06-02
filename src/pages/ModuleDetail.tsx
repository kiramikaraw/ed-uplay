import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GameButton } from '@/components/ui/game-button';
import { GameTypeCard } from '@/components/GameTypeCard';
import { Mascot, MascotMessage } from '@/components/Mascot';
import { ProgressBar } from '@/components/ProgressBar';
import { ArrowLeft, BookOpen, Trophy, Target, Clock, Sparkles } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  description: string | null;
  education_level: string;
  subject_id: string;
  order_index: number | null;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function ModuleDetail() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ played: 0, bestScore: 0 });

  useEffect(() => {
    if (moduleId) fetchData();
  }, [moduleId]);

  const fetchData = async () => {
    try {
      const { data: topicData, error } = await supabase
        .from('topics')
        .select('*')
        .eq('id', moduleId)
        .single();
      if (error) throw error;
      setTopic(topicData);

      if (topicData?.subject_id) {
        const { data: subjectData } = await supabase
          .from('subjects')
          .select('*')
          .eq('id', topicData.subject_id)
          .single();
        if (subjectData) setSubject(subjectData);
      }

      // Stats per module not tracked yet; placeholder counts.
      setStats({ played: 0, bestScore: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const gameTypes: Array<{ type: 'quiz' | 'drag_drop' | 'memory' | 'puzzle'; title: string; description: string }> = [
    { type: 'quiz', title: 'Quiz', description: 'Jawab pertanyaan dengan cepat dan tepat' },
    { type: 'memory', title: 'Memory Game', description: 'Cocokkan kartu yang berpasangan' },
    { type: 'drag_drop', title: 'Drag & Drop', description: 'Susun dan kelompokkan dengan benar' },
    { type: 'puzzle', title: 'Puzzle', description: 'Pecahkan teka-teki yang menantang' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Mascot size="lg" mood="thinking" />
          <p className="mt-4 text-xl font-semibold text-muted-foreground">Memuat modul...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <MascotMessage message="Modul tidak ditemukan" mood="thinking" />
          <Link to="/subjects" className="mt-4 inline-block">
            <GameButton variant="primary">Kembali ke Mata Pelajaran</GameButton>
          </Link>
        </div>
      </div>
    );
  }

  const accent = subject?.color || '#7C3AED';
  const progress = stats.played > 0 ? Math.min(100, stats.played * 20) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Eduverse" className="w-10 h-10" />
            <span className="font-bold text-2xl bg-gradient-to-r from-primary via-purple to-secondary bg-clip-text text-transparent">
              Eduverse
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            {user && (
              <Link to="/dashboard">
                <GameButton variant="ghost" size="sm">Dashboard</GameButton>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link
          to={subject ? `/subjects/${subject.id}` : '/subjects'}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke {subject?.name || 'Mata Pelajaran'}
        </Link>

        {/* Module Banner */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 mb-8 border border-border"
          style={{
            background: `linear-gradient(135deg, ${accent}20 0%, ${accent}05 60%, transparent 100%)`,
          }}
        >
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full opacity-20 blur-3xl"
               style={{ backgroundColor: accent }} />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shrink-0"
              style={{ backgroundColor: `${accent}25` }}
            >
              {subject?.icon || '📘'}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-background/60 backdrop-blur uppercase">
                  {topic.education_level}
                </span>
                {subject && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-background/60 backdrop-blur">
                    {subject.name}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-background/60 backdrop-blur flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Modul
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{topic.name}</h1>
              {topic.description && (
                <p className="text-muted-foreground max-w-2xl">{topic.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="game-card">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.played}</p>
                <p className="text-xs text-muted-foreground">Sesi dimainkan</p>
              </div>
            </div>
          </div>
          <div className="game-card">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-orange" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.bestScore}</p>
                <p className="text-xs text-muted-foreground">Skor terbaik</p>
              </div>
            </div>
          </div>
          <div className="game-card">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xl font-bold">~10m</p>
                <p className="text-xs text-muted-foreground">Estimasi</p>
              </div>
            </div>
          </div>
          <div className="game-card">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple" />
              </div>
              <div>
                <p className="text-xl font-bold">4</p>
                <p className="text-xs text-muted-foreground">Mode belajar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="game-card mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Progress Modul</h3>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <ProgressBar value={progress} showLabel={false} />
        </div>

        {/* Learning Modes */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Pilih Mode Belajar 🎮</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gameTypes.map(game => (
            <GameTypeCard
              key={game.type}
              type={game.type}
              title={game.title}
              description={game.description}
              difficulty="medium"
              topicId={topic.id}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
