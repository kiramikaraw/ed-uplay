import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GameButton } from '@/components/ui/game-button';
import { SubjectCard } from '@/components/SubjectCard';
import { Mascot, MascotMessage } from '@/components/Mascot';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface TopicCount {
  subject_id: string;
  count: number;
}

export default function Subjects() {
  const { user, loading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    fetchSubjects();
  }, [selectedLevel]);

  const fetchSubjects = async () => {
    try {
      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

      // Fetch topic counts
      const { data: topicsData } = await supabase
        .from('topics')
        .select('subject_id');

      if (topicsData) {
        const counts: Record<string, number> = {};
        topicsData.forEach(t => {
          counts[t.subject_id] = (counts[t.subject_id] || 0) + 1;
        });
        setTopicCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const levels = [
    { value: 'all', label: 'Semua Jenjang' },
    { value: 'sd', label: 'SD' },
    { value: 'smp', label: 'SMP' },
    { value: 'sma', label: 'SMA' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Mascot size="lg" mood="thinking" />
          <p className="mt-4 text-xl font-semibold text-muted-foreground">Memuat mata pelajaran...</p>
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
        <Link to={user ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mata Pelajaran</h1>
              <p className="text-muted-foreground">Pilih mata pelajaran yang ingin kamu pelajari</p>
            </div>
          </div>
        </div>

        {/* Level Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
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

        {/* Subjects Grid */}
        {subjects.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjects.map(subject => (
              <SubjectCard
                key={subject.id}
                id={subject.id}
                name={subject.name}
                icon={subject.icon || '📚'}
                color={subject.color || '#FF6B6B'}
                topicsCount={topicCounts[subject.id] || 0}
                progress={Math.floor(Math.random() * 100)} // Placeholder progress
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MascotMessage 
              message="Belum ada mata pelajaran yang tersedia. Cek kembali nanti ya!"
              mood="thinking"
            />
          </div>
        )}
      </main>
    </div>
  );
}
