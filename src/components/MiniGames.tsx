import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Timer, Trophy, Zap, RotateCcw, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

// Word Scramble Game
const WORDS = [
  { word: 'MATEMATIKA', hint: 'Ilmu tentang angka dan perhitungan' },
  { word: 'INDONESIA', hint: 'Negara kepulauan terbesar di dunia' },
  { word: 'FOTOSINTESIS', hint: 'Proses tumbuhan membuat makanan' },
  { word: 'DEMOKRASI', hint: 'Sistem pemerintahan dari rakyat' },
  { word: 'GRAVITASI', hint: 'Gaya tarik bumi' },
  { word: 'EKOSISTEM', hint: 'Hubungan makhluk hidup dengan lingkungan' },
  { word: 'REVOLUSI', hint: 'Perubahan besar dan mendasar' },
  { word: 'KONSTITUSI', hint: 'Hukum dasar negara' },
];

// Math Race Questions
const MATH_QUESTIONS = [
  { question: '15 + 27 = ?', answer: 42 },
  { question: '8 × 7 = ?', answer: 56 },
  { question: '100 - 37 = ?', answer: 63 },
  { question: '144 ÷ 12 = ?', answer: 12 },
  { question: '25 × 4 = ?', answer: 100 },
  { question: '81 + 19 = ?', answer: 100 },
  { question: '9 × 9 = ?', answer: 81 },
  { question: '200 - 88 = ?', answer: 112 },
  { question: '6 × 12 = ?', answer: 72 },
  { question: '150 ÷ 5 = ?', answer: 30 },
];

const WordScrambleGame = () => {
  const { toast } = useToast();
  const [currentWord, setCurrentWord] = useState<typeof WORDS[0] | null>(null);
  const [scrambled, setScrambled] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scrambleWord = (word: string) => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  };

  const nextWord = useCallback(() => {
    const available = WORDS.filter(w => w.word !== currentWord?.word);
    const word = available[Math.floor(Math.random() * available.length)];
    setCurrentWord(word);
    setScrambled(scrambleWord(word.word));
    setUserGuess('');
  }, [currentWord]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setHintsUsed(0);
    setIsPlaying(true);
    nextWord();
  };

  const checkAnswer = () => {
    if (userGuess.toUpperCase() === currentWord?.word) {
      setScore(prev => prev + 10);
      toast({ title: "Benar! +10 poin 🎉" });
      nextWord();
    } else {
      toast({ title: "Salah, coba lagi!", variant: "destructive" });
    }
  };

  const useHint = () => {
    if (hintsUsed < 3 && currentWord) {
      setHintsUsed(prev => prev + 1);
      toast({ title: `Hint: ${currentWord.hint}` });
    }
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      toast({ title: `Game Over! Skor: ${score}` });
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, timeLeft, score, toast]);

  return (
    <div className="space-y-4">
      {!isPlaying ? (
        <div className="text-center space-y-4">
          <div className="text-6xl">🔤</div>
          <h3 className="text-xl font-bold">Word Scramble</h3>
          <p className="text-muted-foreground">Susun huruf acak menjadi kata yang benar!</p>
          {score > 0 && <p className="text-lg">Skor terakhir: <span className="font-bold text-primary">{score}</span></p>}
          <Button onClick={startGame} size="lg" className="gap-2">
            <Play className="h-4 w-4" />
            Mulai Bermain
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="gap-1">
              <Trophy className="h-3 w-3" />
              {score}
            </Badge>
            <Badge variant={timeLeft <= 10 ? "destructive" : "outline"} className="gap-1">
              <Timer className="h-3 w-3" />
              {timeLeft}s
            </Badge>
          </div>

          <motion.div
            key={scrambled}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-center"
          >
            <p className="text-3xl font-bold tracking-widest font-mono">{scrambled}</p>
          </motion.div>

          <div className="flex gap-2">
            <Input
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value.toUpperCase())}
              placeholder="Ketik jawabanmu..."
              className="text-center text-lg tracking-widest"
              onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
            />
            <Button onClick={checkAnswer}>Cek</Button>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={useHint} disabled={hintsUsed >= 3}>
              💡 Hint ({3 - hintsUsed})
            </Button>
            <Button variant="ghost" size="sm" onClick={nextWord}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Skip
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const MathRaceGame = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<typeof MATH_QUESTIONS>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    const shuffled = [...MATH_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setUserAnswer('');
    setIsPlaying(true);
  };

  const checkAnswer = () => {
    const correct = parseInt(userAnswer) === questions[currentIndex].answer;
    
    if (correct) {
      const bonus = streak >= 3 ? 5 : 0;
      setScore(prev => prev + 10 + bonus);
      setStreak(prev => prev + 1);
      setTimeLeft(prev => Math.min(30, prev + 3)); // Bonus time
      toast({ title: `Benar! +${10 + bonus} poin ${streak >= 3 ? '🔥' : '✓'}` });
    } else {
      setStreak(0);
      toast({ title: "Salah!", variant: "destructive" });
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
    } else {
      setIsPlaying(false);
      toast({ title: `Selesai! Skor: ${score + (correct ? 10 : 0)}` });
    }
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      toast({ title: `Waktu Habis! Skor: ${score}` });
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, timeLeft, score, toast]);

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-4">
      {!isPlaying ? (
        <div className="text-center space-y-4">
          <div className="text-6xl">🏎️</div>
          <h3 className="text-xl font-bold">Math Race</h3>
          <p className="text-muted-foreground">Jawab soal matematika secepat mungkin!</p>
          {score > 0 && <p className="text-lg">Skor terakhir: <span className="font-bold text-primary">{score}</span></p>}
          <Button onClick={startGame} size="lg" className="gap-2">
            <Zap className="h-4 w-4" />
            Mulai Race
          </Button>
        </div>
      ) : currentQ ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Trophy className="h-3 w-3" />
                {score}
              </Badge>
              {streak >= 3 && (
                <Badge variant="default" className="gap-1 bg-orange text-white">
                  🔥 {streak}
                </Badge>
              )}
            </div>
            <Badge variant={timeLeft <= 5 ? "destructive" : "outline"} className="gap-1">
              <Timer className="h-3 w-3" />
              {timeLeft}s
            </Badge>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Soal {currentIndex + 1} / {questions.length}
          </div>

          <motion.div
            key={currentIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="p-8 rounded-xl bg-gradient-to-br from-warning/20 to-orange/20 text-center"
          >
            <p className="text-4xl font-bold font-mono">{currentQ.question}</p>
          </motion.div>

          <div className="flex gap-2">
            <Input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Jawaban..."
              className="text-center text-2xl font-bold"
              onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
              autoFocus
            />
            <Button onClick={checkAnswer} size="lg">
              →
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const MiniGames = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Gamepad2 className="h-4 w-4" />
          Mini Games
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            Mini Games
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="word" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="word" className="gap-2">
              🔤 Word Scramble
            </TabsTrigger>
            <TabsTrigger value="math" className="gap-2">
              🏎️ Math Race
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="word" className="mt-4">
            <WordScrambleGame />
          </TabsContent>
          
          <TabsContent value="math" className="mt-4">
            <MathRaceGame />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
