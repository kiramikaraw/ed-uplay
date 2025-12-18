import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GameButton } from '@/components/ui/game-button';
import { Mascot } from '@/components/Mascot';
import { ArrowLeft, Star, Trophy, RotateCcw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PuzzlePiece {
  id: number;
  currentPos: number;
  correctPos: number;
  content: string;
}

interface Topic {
  id: string;
  name: string;
  education_level: string;
  subject_id: string;
}

export default function PuzzleGame() {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [puzzleType, setPuzzleType] = useState<'sequence' | 'word'>('sequence');

  useEffect(() => {
    if (topicId) {
      fetchTopicAndSetup();
    }
  }, [topicId]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const fetchTopicAndSetup = async () => {
    try {
      const { data: topicData } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .single();

      if (topicData) {
        setTopic(topicData);
        setupPuzzle();
      }
    } catch (error) {
      console.error('Error:', error);
      setupPuzzle();
    }
  };

  const setupPuzzle = () => {
    // Number sequence puzzle
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const puzzlePieces: PuzzlePiece[] = numbers.map((num, index) => ({
      id: index,
      currentPos: index,
      correctPos: index,
      content: num,
    }));

    // Shuffle
    for (let i = puzzlePieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [puzzlePieces[i].currentPos, puzzlePieces[j].currentPos] = 
      [puzzlePieces[j].currentPos, puzzlePieces[i].currentPos];
    }

    setPieces(puzzlePieces);
    setGameState('playing');
  };

  const handlePieceClick = (pieceId: number) => {
    if (selectedPiece === null) {
      setSelectedPiece(pieceId);
    } else if (selectedPiece === pieceId) {
      setSelectedPiece(null);
    } else {
      // Swap positions
      const piece1 = pieces.find(p => p.id === selectedPiece)!;
      const piece2 = pieces.find(p => p.id === pieceId)!;

      setPieces(prev => prev.map(p => {
        if (p.id === selectedPiece) return { ...p, currentPos: piece2.currentPos };
        if (p.id === pieceId) return { ...p, currentPos: piece1.currentPos };
        return p;
      }));

      setMoves(m => m + 1);
      setSelectedPiece(null);

      // Check if solved
      setTimeout(() => {
        const updatedPieces = pieces.map(p => {
          if (p.id === selectedPiece) return { ...p, currentPos: piece2.currentPos };
          if (p.id === pieceId) return { ...p, currentPos: piece1.currentPos };
          return p;
        });

        const isSolved = updatedPieces.every(p => p.currentPos === p.correctPos);
        if (isSolved) {
          setGameState('finished');
        }
      }, 100);
    }
  };

  const resetGame = () => {
    setMoves(0);
    setTimeElapsed(0);
    setSelectedPiece(null);
    setupPuzzle();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedPieces = [...pieces].sort((a, b) => a.currentPos - b.currentPos);

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Mascot size="lg" mood="thinking" animate />
          <p className="mt-4 text-xl font-semibold text-muted-foreground">Menyiapkan puzzle...</p>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const score = Math.max(100 - moves * 2 - Math.floor(timeElapsed / 10), 10);
    const stars = moves <= 15 ? 3 : moves <= 25 ? 2 : 1;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full game-card text-center">
          <Mascot size="lg" mood="celebrating" className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2">Puzzle Selesai! 🧩</h1>
          <p className="text-muted-foreground mb-6">Kamu berhasil menyusun puzzle!</p>

          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <Star key={i} className={cn("w-10 h-10", i <= stars ? "text-accent fill-accent" : "text-muted")} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-2xl font-bold">{moves}</p>
              <p className="text-sm text-muted-foreground">Langkah</p>
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-2xl font-bold">{formatTime(timeElapsed)}</p>
              <p className="text-sm text-muted-foreground">Waktu</p>
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
              <Clock className="w-5 h-5" />
              <span className="font-bold">{formatTime(timeElapsed)}</span>
            </div>
            <div className="px-4 py-2 bg-muted rounded-full">
              <span className="font-bold">{moves} langkah</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Puzzle</h1>
          <p className="text-muted-foreground">Susun angka dari 1 sampai 9!</p>
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {sortedPieces.map(piece => {
            const isCorrect = piece.currentPos === piece.correctPos;
            const isSelected = selectedPiece === piece.id;

            return (
              <button
                key={piece.id}
                onClick={() => handlePieceClick(piece.id)}
                className={cn(
                  "aspect-square rounded-xl text-3xl font-bold transition-all",
                  "flex items-center justify-center shadow-lg",
                  isSelected && "ring-4 ring-primary scale-105",
                  isCorrect 
                    ? "bg-success/20 text-success border-2 border-success"
                    : "bg-gradient-to-br from-purple to-primary text-white hover:scale-105"
                )}
              >
                {piece.content}
              </button>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Klik dua kotak untuk menukar posisinya
        </p>
      </main>
    </div>
  );
}
