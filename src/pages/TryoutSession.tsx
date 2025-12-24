import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle,
  CheckCircle2, XCircle, BookmarkPlus, Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Question {
  id: string;
  section_id: string;
  question_text: string;
  question_type: string;
  options: any[];
  correct_answer: string;
  explanation: string | null;
  difficulty: string;
  points: number;
  image_url: string | null;
  order_index: number;
}

interface Section {
  id: string;
  name: string;
  duration_minutes: number;
  order_index: number;
  questions: Question[];
}

interface UserAnswer {
  question_id: string;
  answer: string | null;
  flagged: boolean;
}

export default function TryoutSession() {
  const { packageId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);

  const currentSection = sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
  const answeredCount = Object.values(answers).filter(a => a.answer !== null).length;

  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    initializeSession();
  }, [user, packageId]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const initializeSession = async () => {
    if (!packageId || !user) return;

    // Fetch sections and questions
    const { data: sectionsData } = await supabase
      .from('tryout_sections')
      .select('*')
      .eq('package_id', packageId)
      .order('order_index');

    if (!sectionsData || sectionsData.length === 0) {
      toast.error('Paket tryout tidak ditemukan');
      navigate('/tryout');
      return;
    }

    // Fetch questions for each section
    const sectionsWithQuestions = await Promise.all(
      sectionsData.map(async (section) => {
        const { data: questions } = await supabase
          .from('tryout_questions')
          .select('*')
          .eq('section_id', section.id)
          .order('order_index');

        return {
          ...section,
          questions: (questions || []).map(q => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : []
          }))
        };
      })
    );

    setSections(sectionsWithQuestions);

    // Calculate total time
    const totalMinutes = sectionsData.reduce((sum, s) => sum + s.duration_minutes, 0);
    setTimeLeft(totalMinutes * 60);

    // Create or resume session
    const { data: existingSession } = await supabase
      .from('tryout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('package_id', packageId)
      .eq('status', 'in_progress')
      .maybeSingle();

    if (existingSession) {
      setSessionId(existingSession.id);
      // Load existing answers
      const { data: existingAnswers } = await supabase
        .from('tryout_answers')
        .select('*')
        .eq('session_id', existingSession.id);

      if (existingAnswers) {
        const answersMap: Record<string, UserAnswer> = {};
        existingAnswers.forEach(a => {
          answersMap[a.question_id] = {
            question_id: a.question_id,
            answer: a.user_answer,
            flagged: false
          };
        });
        setAnswers(answersMap);
      }
    } else {
      const { data: newSession, error } = await supabase
        .from('tryout_sessions')
        .insert({
          user_id: user.id,
          package_id: packageId,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) {
        toast.error('Gagal memulai tryout');
        navigate('/tryout');
        return;
      }

      setSessionId(newSession.id);
    }

    setLoading(false);
  };

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion || !sessionId) return;

    const newAnswer: UserAnswer = {
      question_id: currentQuestion.id,
      answer,
      flagged: answers[currentQuestion.id]?.flagged || false
    };

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: newAnswer
    }));

    // Save to database
    await supabase
      .from('tryout_answers')
      .upsert({
        session_id: sessionId,
        question_id: currentQuestion.id,
        user_answer: answer
      }, { onConflict: 'session_id,question_id' });
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        question_id: currentQuestion.id,
        answer: prev[currentQuestion.id]?.answer || null,
        flagged: !prev[currentQuestion.id]?.flagged
      }
    }));
  };

  const navigateQuestion = (direction: 'prev' | 'next') => {
    if (!currentSection) return;

    if (direction === 'next') {
      if (currentQuestionIndex < currentSection.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else if (currentSectionIndex < sections.length - 1) {
        setCurrentSectionIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
      }
    } else {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      } else if (currentSectionIndex > 0) {
        setCurrentSectionIndex(prev => prev - 1);
        setCurrentQuestionIndex(sections[currentSectionIndex - 1].questions.length - 1);
      }
    }
  };

  const goToQuestion = (sectionIndex: number, questionIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentQuestionIndex(questionIndex);
    setShowNavigator(false);
  };

  const handleSubmit = async () => {
    if (!sessionId || !user) return;

    // Calculate score
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    sections.forEach(section => {
      section.questions.forEach(q => {
        totalPoints += q.points;
        const userAnswer = answers[q.id]?.answer;
        if (userAnswer === q.correct_answer) {
          correctCount++;
          earnedPoints += q.points;
        }
      });
    });

    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    // Update session
    await supabase
      .from('tryout_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_score: earnedPoints,
        percentage
      })
      .eq('id', sessionId);

    toast.success('Tryout selesai!');
    navigate(`/tryout/${packageId}/result/${sessionId}`);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat soal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                {currentSection?.name}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Soal {currentQuestionIndex + 1} dari {currentSection?.questions.length}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeLeft < 300 ? 'bg-destructive/10 text-destructive' : 'bg-muted'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono font-bold text-lg">
                  {formatTime(timeLeft)}
                </span>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowNavigator(!showNavigator)}
              >
                Navigator
              </Button>

              <Button
                variant="destructive"
                onClick={() => setShowSubmitDialog(true)}
              >
                Selesai
              </Button>
            </div>
          </div>

          {/* Progress */}
          <Progress 
            value={(answeredCount / totalQuestions) * 100} 
            className="h-1 mt-3"
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="game-card"
              >
                {/* Question */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant={
                      currentQuestion.difficulty === 'hard' ? 'destructive' :
                      currentQuestion.difficulty === 'medium' ? 'default' : 'secondary'
                    }>
                      {currentQuestion.difficulty === 'hard' ? 'Sulit' :
                       currentQuestion.difficulty === 'medium' ? 'Sedang' : 'Mudah'}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFlag}
                    >
                      {answers[currentQuestion.id]?.flagged ? (
                        <Bookmark className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <BookmarkPlus className="w-5 h-5" />
                      )}
                    </Button>
                  </div>

                  <p className="text-lg whitespace-pre-wrap">
                    {currentQuestion.question_text}
                  </p>

                  {currentQuestion.image_url && (
                    <img 
                      src={currentQuestion.image_url} 
                      alt="Question" 
                      className="mt-4 max-w-md rounded-lg"
                    />
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option: { label: string; value: string }, index: number) => {
                    const isSelected = answers[currentQuestion.id]?.answer === option.value;
                    
                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswer(option.value)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option.label}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => navigateQuestion('prev')}
                    disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Sebelumnya
                  </Button>

                  <Button
                    onClick={() => navigateQuestion('next')}
                    disabled={
                      currentSectionIndex === sections.length - 1 && 
                      currentQuestionIndex === currentSection.questions.length - 1
                    }
                  >
                    Selanjutnya
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Question Navigator */}
        <AnimatePresence>
          {showNavigator && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="w-80 game-card h-fit sticky top-24"
            >
              <h3 className="font-bold mb-4">Navigasi Soal</h3>
              
              {sections.map((section, sIdx) => (
                <div key={section.id} className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {section.name}
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {section.questions.map((q, qIdx) => {
                      const answer = answers[q.id];
                      const isCurrent = sIdx === currentSectionIndex && qIdx === currentQuestionIndex;
                      
                      return (
                        <button
                          key={q.id}
                          onClick={() => goToQuestion(sIdx, qIdx)}
                          className={`
                            w-10 h-10 rounded-lg font-medium text-sm transition-all
                            ${isCurrent ? 'ring-2 ring-primary' : ''}
                            ${answer?.flagged ? 'bg-yellow-500 text-white' :
                              answer?.answer ? 'bg-green-500 text-white' : 'bg-muted'}
                          `}
                        >
                          {qIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span>Sudah dijawab</span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <div className="w-4 h-4 rounded bg-yellow-500" />
                  <span>Ditandai</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded bg-muted" />
                  <span>Belum dijawab</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Selesaikan Tryout?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>Kamu telah menjawab {answeredCount} dari {totalQuestions} soal.</p>
                {answeredCount < totalQuestions && (
                  <p className="text-yellow-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Masih ada {totalQuestions - answeredCount} soal yang belum dijawab!
                  </p>
                )}
                <p>Apakah kamu yakin ingin menyelesaikan tryout ini?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kembali</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Ya, Selesaikan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
