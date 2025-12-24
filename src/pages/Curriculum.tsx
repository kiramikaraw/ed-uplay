import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, GraduationCap, ArrowLeft, ChevronRight,
  Play, Video, FileText, Trophy, Star, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LearningPath } from '@/components/LearningPath';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Subject {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface Topic {
  id: string;
  name: string;
  description: string | null;
  subject_id: string;
  education_level: string;
  order_index: number;
}

interface UserProgress {
  topic_id: string;
  mastery_level: number;
  games_played: number;
}

export default function Curriculum() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [educationLevel, setEducationLevel] = useState<string>('sd');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [educationLevel]);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchData = async () => {
    const [subjectsRes, topicsRes] = await Promise.all([
      supabase.from('subjects').select('*'),
      supabase.from('topics').select('*').eq('education_level', educationLevel as 'sd' | 'smp' | 'sma').order('order_index')
    ]);

    if (subjectsRes.data) {
      setSubjects(subjectsRes.data);
      if (subjectsRes.data.length > 0 && !selectedSubject) {
        setSelectedSubject(subjectsRes.data[0]);
      }
    }
    if (topicsRes.data) {
      setTopics(topicsRes.data);
    }
    setLoading(false);
  };

  const fetchProgress = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_progress')
      .select('topic_id, mastery_level, games_played')
      .eq('user_id', user.id);

    if (data) {
      const progressMap: Record<string, UserProgress> = {};
      data.forEach(p => {
        progressMap[p.topic_id] = p;
      });
      setProgress(progressMap);
    }
  };

  const getSubjectTopics = (subjectId: string) => {
    return topics.filter(t => t.subject_id === subjectId);
  };

  const getSubjectProgress = (subjectId: string) => {
    const subjectTopics = getSubjectTopics(subjectId);
    if (subjectTopics.length === 0) return 0;
    
    const totalMastery = subjectTopics.reduce((sum, t) => {
      return sum + (progress[t.id]?.mastery_level || 0);
    }, 0);
    
    return (totalMastery / (subjectTopics.length * 100)) * 100;
  };

  const educationLevels = [
    { value: 'sd', label: 'SD', description: 'Sekolah Dasar' },
    { value: 'smp', label: 'SMP', description: 'Sekolah Menengah Pertama' },
    { value: 'sma', label: 'SMA', description: 'Sekolah Menengah Atas' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Kurikulum & Learning Path
              </h1>
              <p className="text-muted-foreground">
                Belajar terstruktur sesuai kurikulum nasional
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Education Level Selector */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {educationLevels.map((level) => (
            <motion.button
              key={level.value}
              onClick={() => setEducationLevel(level.value)}
              className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all ${
                educationLevel === level.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <GraduationCap className={`w-8 h-8 mb-2 ${
                educationLevel === level.value ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <h3 className="font-bold text-lg">{level.label}</h3>
              <p className="text-sm text-muted-foreground">{level.description}</p>
            </motion.button>
          ))}
        </div>

        <Tabs defaultValue="subjects" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="subjects">Mata Pelajaran</TabsTrigger>
            <TabsTrigger value="path">Learning Path</TabsTrigger>
          </TabsList>

          {/* Subjects Tab */}
          <TabsContent value="subjects">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Subject List */}
              <div className="space-y-3">
                {subjects.map((subject) => {
                  const subjectProgress = getSubjectProgress(subject.id);
                  const isSelected = selectedSubject?.id === subject.id;

                  return (
                    <motion.button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{subject.icon || '📚'}</span>
                        <div className="flex-1">
                          <h3 className="font-medium">{subject.name}</h3>
                          <Progress value={subjectProgress} className="h-1 mt-2" />
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-transform ${
                          isSelected ? 'rotate-90 text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Topic List */}
              <div className="lg:col-span-3">
                {selectedSubject && (
                  <div className="game-card">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl">{selectedSubject.icon || '📚'}</span>
                      <div>
                        <h2 className="text-xl font-bold">{selectedSubject.name}</h2>
                        <p className="text-muted-foreground">
                          {getSubjectTopics(selectedSubject.id).length} topik tersedia
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {getSubjectTopics(selectedSubject.id).map((topic, index) => {
                        const topicProgress = progress[topic.id];
                        const mastery = topicProgress?.mastery_level || 0;

                        return (
                          <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              to={`/subjects/${topic.id}`}
                              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                mastery >= 80 ? 'bg-green-500/20 text-green-500' :
                                mastery >= 50 ? 'bg-yellow-500/20 text-yellow-500' :
                                'bg-muted-foreground/20 text-muted-foreground'
                              }`}>
                                {mastery >= 80 ? (
                                  <Trophy className="w-5 h-5" />
                                ) : mastery >= 50 ? (
                                  <Star className="w-5 h-5" />
                                ) : (
                                  <span className="font-bold">{index + 1}</span>
                                )}
                              </div>

                              <div className="flex-1">
                                <h3 className="font-medium">{topic.name}</h3>
                                {topic.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {topic.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2">
                                  <Progress value={mastery} className="h-1 flex-1 max-w-xs" />
                                  <span className="text-sm text-muted-foreground">{mastery}%</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  Video
                                </Badge>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  Quiz
                                </Badge>
                              </div>

                              <Play className="w-5 h-5 text-primary" />
                            </Link>
                          </motion.div>
                        );
                      })}

                      {getSubjectTopics(selectedSubject.id).length === 0 && (
                        <div className="text-center py-12">
                          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            Belum ada topik untuk mata pelajaran ini
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Learning Path Tab */}
          <TabsContent value="path">
            <LearningPath 
              subjectId={selectedSubject?.id} 
              educationLevel={educationLevel} 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
