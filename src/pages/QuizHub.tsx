import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Search, 
  BookOpen, 
  Trophy, 
  Zap, 
  Clock, 
  Target,
  GraduationCap,
  Flame,
  Star,
  Play,
  Filter,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import QuizModeSelector from '@/components/QuizModeSelector';

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
  education_level: 'sd' | 'smp' | 'sma';
  subject_id: string;
  subjects?: Subject;
}

interface TopicStats {
  topic_id: string;
  total_attempts: number;
  correct_answers: number;
  mastery_score: number;
}

const QuizHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicStats, setTopicStats] = useState<Map<string, TopicStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<'sd' | 'smp' | 'sma'>('sd');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedLevel, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

      // Fetch topics for selected level
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*, subjects(*)')
        .eq('education_level', selectedLevel)
        .order('order_index');

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);

      // Fetch user's topic statistics if logged in
      if (user) {
        const { data: statsData, error: statsError } = await supabase
          .from('topic_statistics')
          .select('*')
          .eq('user_id', user.id);

        if (!statsError && statsData) {
          const statsMap = new Map<string, TopicStats>();
          statsData.forEach(stat => {
            statsMap.set(stat.topic_id, stat as TopicStats);
          });
          setTopicStats(statsMap);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'sd': return 'SD (Kelas 1-6)';
      case 'smp': return 'SMP (Kelas 7-9)';
      case 'sma': return 'SMA (Kelas 10-12)';
      default: return level;
    }
  };

  const getSubjectIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Calculator: BookOpen,
      FlaskConical: BookOpen,
      Book: BookOpen,
      Globe: BookOpen,
      Languages: BookOpen,
    };
    return icons[iconName] || BookOpen;
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSubject = !selectedSubject || topic.subject_id === selectedSubject;
    const matchesSearch = !searchQuery || 
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const groupedTopics = filteredTopics.reduce((acc, topic) => {
    const subjectId = topic.subject_id;
    if (!acc[subjectId]) {
      acc[subjectId] = [];
    }
    acc[subjectId].push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  const handleTopicClick = (topic: Topic) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/auth');
      return;
    }
    setSelectedTopic(topic);
    setShowModeSelector(true);
  };

  const handleModeSelect = (mode: string) => {
    if (selectedTopic) {
      navigate(`/play/quiz/${selectedTopic.id}?mode=${mode}`);
    }
    setShowModeSelector(false);
  };

  const getMasteryColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getMasteryLabel = (score: number) => {
    if (score >= 80) return 'Mahir';
    if (score >= 60) return 'Cukup';
    if (score >= 40) return 'Perlu Latihan';
    return 'Pemula';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Quiz Hub
                </h1>
                <p className="text-sm text-muted-foreground">Latihan soal lengkap SD - SMA</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            {user && (
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-orange-500/10">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Streak</p>
                    <p className="font-bold">7 hari</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                    <p className="font-bold">2,450</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Level Selection */}
        <div className="mb-6">
          <Tabs value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as 'sd' | 'smp' | 'sma')}>
            <TabsList className="grid w-full grid-cols-3 h-14">
              <TabsTrigger value="sd" className="flex flex-col gap-0.5 h-full">
                <GraduationCap className="h-4 w-4" />
                <span className="text-xs">SD</span>
              </TabsTrigger>
              <TabsTrigger value="smp" className="flex flex-col gap-0.5 h-full">
                <GraduationCap className="h-4 w-4" />
                <span className="text-xs">SMP</span>
              </TabsTrigger>
              <TabsTrigger value="sma" className="flex flex-col gap-0.5 h-full">
                <GraduationCap className="h-4 w-4" />
                <span className="text-xs">SMA</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari topik atau materi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={!selectedSubject ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSubject(null)}
              className="whitespace-nowrap"
            >
              Semua
            </Button>
            {subjects.map((subject) => (
              <Button
                key={subject.id}
                variant={selectedSubject === subject.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSubject(subject.id)}
                className="whitespace-nowrap"
              >
                {subject.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Practice Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Latihan Cepat
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-green-500/20 bg-green-500/5">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                  <Play className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold text-sm">5 Soal</h3>
                <p className="text-xs text-muted-foreground">~5 menit</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold text-sm">10 Soal</h3>
                <p className="text-xs text-muted-foreground">~10 menit</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-purple-500/20 bg-purple-500/5">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-semibold text-sm">20 Soal</h3>
                <p className="text-xs text-muted-foreground">~20 menit</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-orange-500/20 bg-orange-500/5">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-sm">Simulasi Ujian</h3>
                <p className="text-xs text-muted-foreground">~60 menit</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Topics by Subject */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTopics).map(([subjectId, subjectTopics]) => {
              const subject = subjects.find(s => s.id === subjectId);
              if (!subject) return null;

              return (
                <div key={subjectId}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {subject.name}
                    </h2>
                    <Badge variant="secondary">{subjectTopics.length} topik</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectTopics.map((topic) => {
                      const stats = topicStats.get(topic.id);
                      const mastery = stats?.mastery_score || 0;
                      
                      return (
                        <Card 
                          key={topic.id} 
                          className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 group"
                          onClick={() => handleTopicClick(topic)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold group-hover:text-primary transition-colors">
                                  {topic.name}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {topic.description}
                                </p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            
                            {stats && (
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                  <Star className={`h-4 w-4 ${getMasteryColor(mastery)}`} />
                                  <span className={`text-sm font-medium ${getMasteryColor(mastery)}`}>
                                    {getMasteryLabel(mastery)}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {stats.total_attempts} latihan
                                </span>
                              </div>
                            )}
                            
                            {!stats && (
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <Badge variant="outline" className="text-xs">
                                  Belum dikerjakan
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredTopics.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tidak ada topik ditemukan</h3>
                <p className="text-muted-foreground">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Quiz Mode Selector Modal */}
      {showModeSelector && selectedTopic && (
        <QuizModeSelector
          topic={selectedTopic}
          onSelect={handleModeSelect}
          onClose={() => setShowModeSelector(false)}
        />
      )}
    </div>
  );
};

export default QuizHub;
