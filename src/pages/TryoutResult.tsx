import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, Target, Clock, CheckCircle2, XCircle, 
  ChevronDown, ChevronUp, BarChart3, Share2, 
  Download, ArrowLeft, Medal, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SessionResult {
  id: string;
  total_score: number;
  percentage: number;
  ranking: number | null;
  started_at: string;
  completed_at: string;
  package: {
    title: string;
    total_questions: number;
  };
}

interface SectionResult {
  name: string;
  correct: number;
  total: number;
  percentage: number;
}

interface QuestionResult {
  id: string;
  question_text: string;
  correct_answer: string;
  user_answer: string | null;
  is_correct: boolean;
  explanation: string | null;
  options: any[];
  section_name: string;
}

export default function TryoutResult() {
  const { packageId, sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<SessionResult | null>(null);
  const [sectionResults, setSectionResults] = useState<SectionResult[]>([]);
  const [questions, setQuestions] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    fetchResults();
  }, [user, sessionId]);

  const fetchResults = async () => {
    if (!sessionId || !user) return;

    // Fetch session with package info
    const { data: sessionData } = await supabase
      .from('tryout_sessions')
      .select(`
        *,
        package:tryout_packages(title, total_questions)
      `)
      .eq('id', sessionId)
      .single();

    if (!sessionData) {
      navigate('/tryout');
      return;
    }

    setSession({
      ...sessionData,
      package: sessionData.package as { title: string; total_questions: number }
    });

    // Fetch all answers with questions
    const { data: answersData } = await supabase
      .from('tryout_answers')
      .select(`
        *,
        question:tryout_questions(
          id, question_text, correct_answer, explanation, options,
          section:tryout_sections(name)
        )
      `)
      .eq('session_id', sessionId);

    if (answersData) {
      const questionsWithResults: QuestionResult[] = answersData.map(a => ({
        id: a.question?.id || '',
        question_text: a.question?.question_text || '',
        correct_answer: a.question?.correct_answer || '',
        user_answer: a.user_answer,
        is_correct: a.is_correct || false,
        explanation: a.question?.explanation,
        options: Array.isArray(a.question?.options) ? a.question.options : [],
        section_name: a.question?.section?.name || ''
      }));

      setQuestions(questionsWithResults);

      // Calculate section results
      const sectionMap: Record<string, { correct: number; total: number }> = {};
      questionsWithResults.forEach(q => {
        if (!sectionMap[q.section_name]) {
          sectionMap[q.section_name] = { correct: 0, total: 0 };
        }
        sectionMap[q.section_name].total++;
        if (q.is_correct) {
          sectionMap[q.section_name].correct++;
        }
      });

      const sections: SectionResult[] = Object.entries(sectionMap).map(([name, data]) => ({
        name,
        correct: data.correct,
        total: data.total,
        percentage: (data.correct / data.total) * 100
      }));

      setSectionResults(sections);
    }

    setLoading(false);
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', color: 'text-green-500', message: 'Excellent!' };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-500', message: 'Great job!' };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-500', message: 'Good effort!' };
    if (percentage >= 60) return { grade: 'D', color: 'text-orange-500', message: 'Keep practicing!' };
    return { grade: 'E', color: 'text-red-500', message: 'Need more practice!' };
  };

  const formatDuration = (start: string, end: string) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes} menit ${seconds} detik`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) return null;

  const gradeInfo = getGrade(session.percentage);
  const correctCount = questions.filter(q => q.is_correct).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/tryout">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Hasil Tryout</h1>
              <p className="text-muted-foreground">{session.package.title}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Bagikan
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Score Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
            <span className={`text-6xl font-bold ${gradeInfo.color}`}>
              {gradeInfo.grade}
            </span>
          </div>
          
          <h2 className="text-3xl font-bold mb-2">{session.percentage.toFixed(1)}%</h2>
          <p className="text-xl text-muted-foreground mb-4">{gradeInfo.message}</p>
          
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-2xl font-bold">{correctCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Benar</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-red-500">
                <XCircle className="w-5 h-5" />
                <span className="text-2xl font-bold">{questions.length - correctCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Salah</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-bold">
                  {formatDuration(session.started_at, session.completed_at).split(' ')[0]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Menit</p>
            </div>
          </div>

          {session.ranking && (
            <div className="mt-6 inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-600 px-4 py-2 rounded-full">
              <Medal className="w-5 h-5" />
              <span className="font-bold">Ranking #{session.ranking}</span>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Section Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analisis Per Bagian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sectionResults.map((section, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{section.name}</span>
                      <span className="text-sm">
                        {section.correct}/{section.total} ({section.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress 
                      value={section.percentage} 
                      className={`h-3 ${
                        section.percentage >= 70 ? '[&>div]:bg-green-500' :
                        section.percentage >= 50 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                      }`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Detailed Answers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Pembahasan Soal
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAnswers(!showAnswers)}
                  >
                    {showAnswers ? 'Sembunyikan' : 'Tampilkan'} Pembahasan
                  </Button>
                </CardTitle>
              </CardHeader>
              {showAnswers && (
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {questions.map((q, index) => (
                      <AccordionItem key={q.id} value={q.id} className="border rounded-lg">
                        <AccordionTrigger className="px-4 hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            {q.is_correct ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )}
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Soal {index + 1} • {q.section_name}
                              </span>
                              <p className="font-medium line-clamp-1">{q.question_text}</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-4">
                            {/* Options */}
                            <div className="space-y-2">
                              {q.options.map((opt: { label: string; value: string }, optIndex: number) => {
                                const isCorrect = opt.value === q.correct_answer;
                                const isUserAnswer = opt.value === q.user_answer;
                                
                                return (
                                  <div
                                    key={optIndex}
                                    className={`p-3 rounded-lg border-2 ${
                                      isCorrect 
                                        ? 'border-green-500 bg-green-500/10' 
                                        : isUserAnswer && !isCorrect
                                          ? 'border-red-500 bg-red-500/10'
                                          : 'border-border'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold">
                                        {String.fromCharCode(65 + optIndex)}.
                                      </span>
                                      <span>{opt.label}</span>
                                      {isCorrect && (
                                        <Badge variant="default" className="ml-auto bg-green-500">
                                          Benar
                                        </Badge>
                                      )}
                                      {isUserAnswer && !isCorrect && (
                                        <Badge variant="destructive" className="ml-auto">
                                          Jawabanmu
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation */}
                            {q.explanation && (
                              <div className="p-4 bg-muted rounded-lg">
                                <p className="font-medium mb-2">Pembahasan:</p>
                                <p className="text-muted-foreground">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Link to={`/tryout/${packageId}/start`} className="block">
                  <Button className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ulangi Tryout
                  </Button>
                </Link>
                <Link to="/tryout" className="block">
                  <Button variant="outline" className="w-full">
                    Tryout Lainnya
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Tips Peningkatan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {sectionResults
                  .filter(s => s.percentage < 70)
                  .map((section, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">{section.name}</p>
                      <p className="text-muted-foreground">
                        Perlu latihan lebih di bagian ini. Coba pelajari materi terkait.
                      </p>
                    </div>
                  ))}
                {sectionResults.every(s => s.percentage >= 70) && (
                  <p className="text-green-600">
                    Bagus! Kamu sudah menguasai semua bagian dengan baik. Tetap pertahankan!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
