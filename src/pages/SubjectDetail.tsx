import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GameButton } from '@/components/ui/game-button';
import { GameTypeCard } from '@/components/GameTypeCard';
import { Mascot, MascotMessage } from '@/components/Mascot';
import { ArrowLeft } from 'lucide-react';

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
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🎮</span>
            <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EduPlay
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

        {/* Subject Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ backgroundColor: `${subject.color}20` }}
            >
              {subject.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{subject.name}</h1>
              <p className="text-muted-foreground">{topics.length} topik tersedia</p>
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

        {/* Topics */}
        {topics.length > 0 ? (
          <div className="space-y-8">
            {topics.map(topic => (
              <div key={topic.id} className="game-card">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground uppercase">
                      {topic.education_level}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{topic.name}</h2>
                  {topic.description && (
                    <p className="text-muted-foreground mt-1">{topic.description}</p>
                  )}
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
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MascotMessage 
              message="Belum ada topik untuk jenjang ini. Pilih jenjang lain atau cek kembali nanti!"
              mood="thinking"
            />
          </div>
        )}
      </main>
    </div>
  );
}
