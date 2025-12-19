import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, RotateCcw, Check, X, Brain, Flame, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: number; // 1-5, affects review interval
  nextReview: Date;
  correctCount: number;
  incorrectCount: number;
}

const SAMPLE_CARDS: Flashcard[] = [
  { id: '1', front: 'Apa rumus luas lingkaran?', back: 'πr² (pi dikali jari-jari kuadrat)', category: 'Matematika', difficulty: 1, nextReview: new Date(), correctCount: 0, incorrectCount: 0 },
  { id: '2', front: 'Siapa presiden pertama Indonesia?', back: 'Ir. Soekarno', category: 'Sejarah', difficulty: 1, nextReview: new Date(), correctCount: 0, incorrectCount: 0 },
  { id: '3', front: 'Apa fungsi klorofil?', back: 'Menyerap cahaya untuk fotosintesis', category: 'IPA', difficulty: 1, nextReview: new Date(), correctCount: 0, incorrectCount: 0 },
  { id: '4', front: 'What is "buku" in English?', back: 'Book', category: 'English', difficulty: 1, nextReview: new Date(), correctCount: 0, incorrectCount: 0 },
  { id: '5', front: 'Berapa hasil 15 × 12?', back: '180', category: 'Matematika', difficulty: 1, nextReview: new Date(), correctCount: 0, incorrectCount: 0 },
  { id: '6', front: 'Planet terdekat dengan matahari?', back: 'Merkurius', category: 'IPA', difficulty: 1, nextReview: new Date(), correctCount: 0, incorrectCount: 0 },
  { id: '7', front: 'Kapan proklamasi kemerdekaan RI?', back: '17 Agustus 1945', category: 'Sejarah', difficulty: 1, nextReview: new Date(), correctCount: 0, incorrectCount: 0 },
  { id: '8', front: 'Rumus kecepatan?', back: 'v = s/t (jarak dibagi waktu)', category: 'IPA', difficulty: 1, nextReview: new Date(), correctCount: 0, incorrectCount: 0 },
];

export const FlashcardSystem = () => {
  const { toast } = useToast();
  const [cards, setCards] = useState<Flashcard[]>(SAMPLE_CARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [streak, setStreak] = useState(0);

  const categories = ['all', ...new Set(cards.map(c => c.category))];

  const getDueCards = useCallback(() => {
    const now = new Date();
    const filtered = selectedCategory === 'all' 
      ? cards 
      : cards.filter(c => c.category === selectedCategory);
    return filtered.filter(c => new Date(c.nextReview) <= now);
  }, [cards, selectedCategory]);

  const startStudySession = () => {
    const dueCards = getDueCards();
    if (dueCards.length === 0) {
      toast({
        title: "Tidak ada kartu untuk direview",
        description: "Semua kartu sudah direview! Kembali nanti.",
      });
      return;
    }
    setStudyCards(dueCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0 });
    setStreak(0);
    setIsStudying(true);
  };

  const handleAnswer = (correct: boolean) => {
    const card = studyCards[currentIndex];
    
    // Update card difficulty and next review based on spaced repetition
    const newDifficulty = correct 
      ? Math.min(5, card.difficulty + 1) 
      : Math.max(1, card.difficulty - 1);
    
    // Calculate next review interval (in hours)
    const intervals = [1, 4, 24, 72, 168]; // 1h, 4h, 1d, 3d, 7d
    const hoursUntilReview = intervals[newDifficulty - 1];
    const nextReview = new Date(Date.now() + hoursUntilReview * 60 * 60 * 1000);

    // Update card in state
    setCards(prev => prev.map(c => 
      c.id === card.id 
        ? { 
            ...c, 
            difficulty: newDifficulty, 
            nextReview,
            correctCount: correct ? c.correctCount + 1 : c.correctCount,
            incorrectCount: correct ? c.incorrectCount : c.incorrectCount + 1,
          } 
        : c
    ));

    // Update session stats
    setSessionStats(prev => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: correct ? prev.incorrect : prev.incorrect + 1,
    }));

    // Update streak
    if (correct) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Move to next card or end session
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsStudying(false);
      toast({
        title: "Sesi Selesai! 🎉",
        description: `Benar: ${sessionStats.correct + (correct ? 1 : 0)}, Salah: ${sessionStats.incorrect + (correct ? 0 : 1)}`,
      });
    }
  };

  const currentCard = studyCards[currentIndex];
  const dueCount = getDueCards().length;
  const masteredCount = cards.filter(c => c.difficulty >= 4).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Flashcards
          {dueCount > 0 && (
            <Badge variant="destructive" className="ml-1">{dueCount}</Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Flashcard Study
          </DialogTitle>
        </DialogHeader>

        {!isStudying ? (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-primary/10 text-center">
                <p className="text-2xl font-bold text-primary">{cards.length}</p>
                <p className="text-xs text-muted-foreground">Total Kartu</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/10 text-center">
                <p className="text-2xl font-bold text-warning">{dueCount}</p>
                <p className="text-xs text-muted-foreground">Perlu Review</p>
              </div>
              <div className="p-3 rounded-lg bg-success/10 text-center">
                <p className="text-2xl font-bold text-success">{masteredCount}</p>
                <p className="text-xs text-muted-foreground">Dikuasai</p>
              </div>
            </div>

            {/* Category Filter */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full flex-wrap h-auto gap-1">
                {categories.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="text-xs">
                    {cat === 'all' ? 'Semua' : cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Start Button */}
            <Button 
              onClick={startStudySession} 
              className="w-full gap-2" 
              size="lg"
              disabled={dueCount === 0}
            >
              <Brain className="h-5 w-5" />
              Mulai Review ({dueCount} kartu)
            </Button>

            {/* Card List Preview */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {getDueCards().slice(0, 5).map(card => (
                <div key={card.id} className="p-2 rounded-lg bg-muted text-sm flex justify-between items-center">
                  <span className="truncate flex-1">{card.front}</span>
                  <Badge variant="outline" className="ml-2 text-xs">{card.category}</Badge>
                </div>
              ))}
            </div>
          </div>
        ) : currentCard ? (
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm">
              <span>{currentIndex + 1} / {studyCards.length}</span>
              {streak > 2 && (
                <Badge variant="secondary" className="gap-1">
                  <Flame className="h-3 w-3 text-orange" />
                  {streak} streak!
                </Badge>
              )}
            </div>
            <Progress value={((currentIndex + 1) / studyCards.length) * 100} />

            {/* Flashcard */}
            <div 
              className="relative h-48 cursor-pointer perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isFlipped ? 'back' : 'front'}
                  initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 p-6 rounded-xl flex flex-col items-center justify-center text-center ${
                    isFlipped 
                      ? 'bg-gradient-to-br from-success/20 to-success/5 border-success/30' 
                      : 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30'
                  } border-2`}
                >
                  <Badge variant="outline" className="mb-3 text-xs">
                    {currentCard.category}
                  </Badge>
                  <p className={`font-medium ${isFlipped ? 'text-success' : ''}`}>
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                  {!isFlipped && (
                    <p className="text-xs text-muted-foreground mt-4">
                      Tap untuk melihat jawaban
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Answer Buttons */}
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Button 
                  variant="outline" 
                  className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleAnswer(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Salah
                </Button>
                <Button 
                  className="flex-1 bg-success hover:bg-success/90"
                  onClick={() => handleAnswer(true)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Benar
                </Button>
              </motion.div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
