import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GameButton } from '@/components/ui/game-button';
import { Mascot, MascotMessage } from '@/components/Mascot';
import { ProgressBar } from '@/components/ProgressBar';
import { ArrowLeft, Clock, Star, CheckCircle2, XCircle, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface Topic {
  id: string;
  name: string;
  education_level: string;
  subject_id: string;
}

export default function QuizGame() {
  const { topicId, gameId } = useParams<{ topicId: string; gameId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    if (topicId) {
      fetchTopicAndQuestions();
    }
  }, [topicId]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(null); // Time's up
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isAnswered, currentIndex]);

  const fetchTopicAndQuestions = async () => {
    try {
      // Fetch topic
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .single();

      if (topicError) throw topicError;
      setTopic(topicData);

      // Generate questions using AI
      await generateQuestions(topicData);
    } catch (error) {
      console.error('Error fetching topic:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  const generateQuestions = async (topicData: Topic) => {
    setLoadingQuestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {
          topic: topicData.name,
          educationLevel: topicData.education_level,
          count: 5,
        },
      });

      if (error) throw error;

      if (data?.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setGameState('playing');
        
        // Create game session
        if (user) {
          const { data: session } = await supabase
            .from('game_sessions')
            .insert({
              user_id: user.id,
              game_id: gameId || topicId, // Use topicId as fallback
              total_questions: data.questions.length,
            })
            .select()
            .single();
          
          if (session) {
            setSessionId(session.id);
          }
        }
      } else {
        throw new Error('No questions generated');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback to sample questions
      const sampleQuestions: Question[] = [
        {
          id: '1',
          question_text: `Soal contoh untuk topik ${topicData.name}. Berapakah 2 + 2?`,
          options: ['3', '4', '5', '6'],
          correct_answer: '4',
          explanation: '2 + 2 = 4',
        },
        {
          id: '2',
          question_text: 'Berapakah 5 x 3?',
          options: ['10', '12', '15', '18'],
          correct_answer: '15',
          explanation: '5 x 3 = 15',
        },
        {
          id: '3',
          question_text: 'Berapakah 10 - 4?',
          options: ['4', '5', '6', '7'],
          correct_answer: '6',
          explanation: '10 - 4 = 6',
        },
      ];
      setQuestions(sampleQuestions);
      setGameState('playing');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswer = useCallback((answer: string | null) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = answer === currentQuestion.correct_answer;

    if (isCorrect) {
      setScore((prev) => prev + 10 + Math.floor(timeLeft / 3));
      setCorrectCount((prev) => prev + 1);
    }
  }, [isAnswered, questions, currentIndex, timeLeft]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameState('finished');

    // Update game session
    if (sessionId && user) {
      await supabase
        .from('game_sessions')
        .update({
          score,
          correct_answers: correctCount,
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId);
    }
  };

  if (gameState === 'loading' || loadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Mascot size="lg" mood="thinking" animate />
          <p className="mt-4 text-xl font-semibold text-muted-foreground">
            {loadingQuestions ? 'AI sedang membuat soal...' : 'Memuat...'}
          </p>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const mood = percentage >= 80 ? 'celebrating' : percentage >= 50 ? 'happy' : 'thinking';

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="game-card text-center">
            <Mascot size="lg" mood={mood} className="mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold mb-2">
              {percentage >= 80 ? 'Luar Biasa! 🎉' : percentage >= 50 ? 'Bagus! 👍' : 'Tetap Semangat! 💪'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {percentage >= 80 
                ? 'Kamu hebat sekali!' 
                : percentage >= 50 
                  ? 'Terus berlatih ya!' 
                  : 'Ayo coba lagi!'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-muted rounded-xl">
                <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold">{score}</p>
                <p className="text-sm text-muted-foreground">Skor</p>
              </div>
              <div className="p-4 bg-muted rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold">{correctCount}/{questions.length}</p>
                <p className="text-sm text-muted-foreground">Benar</p>
              </div>
            </div>

            <div className="space-y-3">
              <GameButton 
                variant="primary" 
                size="lg" 
                className="w-full"
                onClick={() => window.location.reload()}
              >
                <Sparkles className="w-5 h-5" />
                Main Lagi
              </GameButton>
              <Link to={`/subjects/${topic?.subject_id}`} className="block">
                <GameButton variant="outline" size="lg" className="w-full">
                  Kembali ke Topik
                </GameButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={`/subjects/${topic?.subject_id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Keluar</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                <Star className="w-5 h-5 text-accent" />
                <span className="font-bold">{score}</span>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full",
                timeLeft <= 10 ? "bg-destructive/20 text-destructive" : "bg-muted"
              )}>
                <Clock className="w-5 h-5" />
                <span className="font-bold">{timeLeft}s</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Soal {currentIndex + 1} dari {questions.length}</span>
            <span className="font-medium">{topic?.name}</span>
          </div>
          <ProgressBar 
            value={currentIndex + 1} 
            max={questions.length} 
            showLabel={false}
          />
        </div>

        {/* Question */}
        <div className="game-card mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-center">
            {currentQuestion.question_text}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correct_answer;
            const showResult = isAnswered;

            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left font-medium transition-all",
                  "hover:border-primary/50 hover:bg-primary/5",
                  !showResult && isSelected && "border-primary bg-primary/10",
                  !showResult && !isSelected && "border-border bg-card",
                  showResult && isCorrect && "border-success bg-success/10 text-success",
                  showResult && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-destructive",
                  showResult && !isSelected && !isCorrect && "opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    !showResult && "bg-muted",
                    showResult && isCorrect && "bg-success text-success-foreground",
                    showResult && isSelected && !isCorrect && "bg-destructive text-destructive-foreground"
                  )}>
                    {showResult && isCorrect ? <CheckCircle2 className="w-5 h-5" /> : 
                     showResult && isSelected && !isCorrect ? <XCircle className="w-5 h-5" /> :
                     String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation & Next Button */}
        {isAnswered && (
          <div className="animate-fade-in">
            {currentQuestion.explanation && (
              <div className="game-card mb-4 bg-muted/50">
                <p className="text-sm">
                  <span className="font-bold">Penjelasan: </span>
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
            <GameButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleNext}
            >
              {currentIndex < questions.length - 1 ? 'Soal Berikutnya →' : 'Lihat Hasil'}
            </GameButton>
          </div>
        )}
      </main>
    </div>
  );
}
