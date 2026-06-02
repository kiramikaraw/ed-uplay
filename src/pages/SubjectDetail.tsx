import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GameButton } from '@/components/ui/game-button';
import { Mascot, MascotMessage } from '@/components/Mascot';
import { ProgressBar } from '@/components/ProgressBar';
import { ArrowLeft, ChevronRight, BookOpen, Sparkles, Trophy } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  education_level: string;
}

export default function SubjectDetail() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subjectId) {
      fetchSubjectData();
    }
  }, [subjectId, selectedLevel]);

  const fetchSubjectData = async () => {
    try {
      // Fetch subject
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();

      if (subjectError) throw subjectError;
      setSubject(subjectData);

      // Fetch topics
      let query = supabase
        .from('topics')
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index');

      if (selectedLevel !== 'all') {
        query = query.eq('education_level', selectedLevel as 'sd' | 'smp' | 'sma');
      }

      const { data: topicsData, error: topicsError } = await query;

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);
    } catch (error) {
      console.error('Error fetching subject data:', error);
    } finally {
      setLoading(false);
    }
  };

  const levels = [
    { value: 'all', label: 'Semua' },
    { value: 'sd', label: 'SD' },
    { value: 'smp', label: 'SMP' },
    { value: 'sma', label: 'SMA' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Mascot size="lg" mood="thinking" />
          <p className="mt-4 text-xl font-semibold text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <MascotMessage message="Mata pelajaran tidak ditemukan" mood="thinking" />
          <Link to="/subjects" className="mt-4 inline-block">
            <GameButton variant="primary">Kembali ke Daftar</GameButton>
          </Link>
        </div>
      </div>
    );
  }

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
        {/* Back Button */}
        <Link to="/subjects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Mata Pelajaran
        </Link>

        {/* Subject Banner */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 mb-8 border border-border"
          style={{
            background: `linear-gradient(135deg, ${subject.color}25 0%, ${subject.color}08 60%, transparent 100%)`,
          }}
        >
          <div
            className="absolute -right-16 -top-16 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: subject.color }}
          />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shrink-0"
              style={{ backgroundColor: `${subject.color}30` }}
            >
              {subject.icon}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-background/60 backdrop-blur flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Mata Pelajaran
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{subject.name}</h1>
              <p className="text-muted-foreground">
                {topics.length} modul tersedia · Mulai belajar dan kumpulkan XP!
              </p>
            </div>
          </div>
        </div>

        {/* Subject Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="game-card">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{topics.length}</p>
                <p className="text-xs text-muted-foreground">Total Modul</p>
              </div>
            </div>
          </div>
          <div className="game-card">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xl font-bold">4</p>
                <p className="text-xs text-muted-foreground">Mode Belajar</p>
              </div>
            </div>
          </div>
          <div className="game-card">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-orange" />
              </div>
              <div>
                <p className="text-xl font-bold">XP</p>
                <p className="text-xs text-muted-foreground">Reward tiap modul</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="game-card mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Progress Mata Pelajaran</h3>
            <span className="text-sm text-muted-foreground">0%</span>
          </div>
          <ProgressBar value={0} showLabel={false} />
        </div>

        {/* Level Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {levels.map(level => (
            <button
              key={level.value}
              onClick={() => setSelectedLevel(level.value)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                selectedLevel === level.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>

        {/* Modules List */}
        <h2 className="text-2xl font-bold mb-4">Daftar Modul 📚</h2>
        {topics.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, idx) => (
              <Link
                key={topic.id}
                to={`/modul/${topic.id}`}
                className="game-card group hover:border-primary/40 transition-all hover:-translate-y-1"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0"
                    style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground uppercase">
                        {topic.education_level}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                      {topic.name}
                    </h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </div>
                {topic.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {topic.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3" />
                  <span>4 mode · Quiz, Memory, Drag, Puzzle</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MascotMessage
              message="Belum ada modul untuk jenjang ini. Pilih jenjang lain atau cek kembali nanti!"
              mood="thinking"
            />
          </div>
        )}
      </main>
    </div>
  );
}
