import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GameButton } from '@/components/ui/game-button';
import { Mascot } from '@/components/Mascot';
import { ArrowLeft, Star, Trophy, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Card {
  id: number;
  content: string;
  pair: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Topic {
  id: string;
  name: string;
  education_level: string;
  subject_id: string;
}

export default function MemoryGame() {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (topicId) {
      fetchTopicAndGenerateCards();
    }
  }, [topicId]);

  const fetchTopicAndGenerateCards = async () => {
    try {
      const { data: topicData } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .single();

      if (topicData) {
        setTopic(topicData);
        await generateCards(topicData);
      }
    } catch (error) {
      console.error('Error:', error);
      generateDefaultCards();
    }
  };

  const generateCards = async (topicData: Topic) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-memory-pairs', {
        body: {
          topic: topicData.name,
          educationLevel: topicData.education_level,
          count: 6,
        },
      });

      if (error || !data?.pairs) throw error;
      setupCards(data.pairs);
    } catch {
      generateDefaultCards();
    }
  };

  const generateDefaultCards = () => {
    const defaultPairs = [
      { question: '2 + 2', answer: '4' },
      { question: '3 × 3', answer: '9' },
      { question: '10 - 5', answer: '5' },
      { question: '8 ÷ 2', answer: '4' },
      { question: '5 + 7', answer: '12' },
      { question: '6 × 2', answer: '12' },
    ];
    setupCards(defaultPairs);
  };

  const setupCards = (pairs: Array<{ question: string; answer: string }>) => {
    const cardList: Card[] = [];
    pairs.forEach((pair, index) => {
      cardList.push({
        id: index * 2,
        content: pair.question,
        pair: `pair-${index}`,
        isFlipped: false,
        isMatched: false,
      });
      cardList.push({
        id: index * 2 + 1,
        content: pair.answer,
        pair: `pair-${index}`,
        isFlipped: false,
        isMatched: false,
      });
    });
    
    // Shuffle cards
    const shuffled = cardList.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setGameState('playing');
  };

  const handleCardClick = useCallback((cardId: number) => {
    if (isChecking || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves(m => m + 1);

      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find(c => c.id === firstId)!;
      const secondCard = newCards.find(c => c.id === secondId)!;

      if (firstCard.pair === secondCard.pair) {
        // Match found!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.pair === firstCard.pair ? { ...c, isMatched: true } : c
          ));
          setMatchedPairs(p => p + 1);
          setScore(s => s + 20);
          setFlippedCards([]);
          setIsChecking(false);

          if (matchedPairs + 1 === cards.length / 2) {
            setGameState('finished');
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [cards, flippedCards, isChecking, matchedPairs]);

  const resetGame = () => {
    setCards(cards.map(c => ({ ...c, isFlipped: false, isMatched: false })).sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setScore(0);
    setGameState('playing');
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Mascot size="lg" mood="thinking" animate />
          <p className="mt-4 text-xl font-semibold text-muted-foreground">Menyiapkan kartu...</p>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const stars = moves <= 10 ? 3 : moves <= 15 ? 2 : 1;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full game-card text-center">
          <Mascot size="lg" mood="celebrating" className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2">Hebat! 🎉</h1>
          <p className="text-muted-foreground mb-6">Kamu berhasil mencocokkan semua kartu!</p>

          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <Star key={i} className={cn("w-10 h-10", i <= stars ? "text-accent fill-accent" : "text-muted")} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-2xl font-bold">{score}</p>
              <p className="text-sm text-muted-foreground">Skor</p>
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-2xl font-bold">{moves}</p>
              <p className="text-sm text-muted-foreground">Langkah</p>
            </div>
          </div>

          <div className="space-y-3">
            <GameButton variant="primary" size="lg" className="w-full" onClick={resetGame}>
              <RotateCcw className="w-5 h-5" /> Main Lagi
            </GameButton>
            <Link to={`/subjects/${topic?.subject_id}`}>
              <GameButton variant="outline" size="lg" className="w-full">Kembali</GameButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={`/subjects/${topic?.subject_id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span>Keluar</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <Star className="w-5 h-5 text-accent" />
              <span className="font-bold">{score}</span>
            </div>
            <div className="px-4 py-2 bg-muted rounded-full">
              <span className="font-bold">{moves} langkah</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Memory Game</h1>
          <p className="text-muted-foreground">Cocokkan pasangan soal dan jawaban!</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || card.isFlipped}
              className={cn(
                "aspect-square rounded-xl text-lg font-bold transition-all duration-300 transform",
                card.isMatched && "bg-success/20 border-2 border-success text-success",
                card.isFlipped && !card.isMatched && "bg-primary text-primary-foreground rotate-y-180",
                !card.isFlipped && !card.isMatched && "bg-gradient-to-br from-purple to-primary text-white hover:scale-105"
              )}
            >
              {card.isFlipped || card.isMatched ? card.content : '❓'}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
