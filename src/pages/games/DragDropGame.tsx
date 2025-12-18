import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GameButton } from '@/components/ui/game-button';
import { Mascot } from '@/components/Mascot';
import { ArrowLeft, Star, Trophy, CheckCircle2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragItem {
  id: string;
  content: string;
  category: string;
}

interface DropZone {
  id: string;
  name: string;
  items: DragItem[];
}

interface Topic {
  id: string;
  name: string;
  education_level: string;
  subject_id: string;
}

export default function DragDropGame() {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [items, setItems] = useState<DragItem[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [score, setScore] = useState(0);
  const [correctPlacements, setCorrectPlacements] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'finished'>('loading');

  useEffect(() => {
    if (topicId) {
      fetchTopicAndSetup();
    }
  }, [topicId]);

  const fetchTopicAndSetup = async () => {
    try {
      const { data: topicData } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .single();

      if (topicData) {
        setTopic(topicData);
        setupDefaultGame();
      }
    } catch (error) {
      console.error('Error:', error);
      setupDefaultGame();
    }
  };

  const setupDefaultGame = () => {
    // Default: categorize numbers (odd vs even)
    const defaultItems: DragItem[] = [
      { id: '1', content: '2', category: 'genap' },
      { id: '2', content: '7', category: 'ganjil' },
      { id: '3', content: '4', category: 'genap' },
      { id: '4', content: '9', category: 'ganjil' },
      { id: '5', content: '6', category: 'genap' },
      { id: '6', content: '3', category: 'ganjil' },
      { id: '7', content: '8', category: 'genap' },
      { id: '8', content: '5', category: 'ganjil' },
    ].sort(() => Math.random() - 0.5);

    setItems(defaultItems);
    setDropZones([
      { id: 'ganjil', name: 'Bilangan Ganjil', items: [] },
      { id: 'genap', name: 'Bilangan Genap', items: [] },
    ]);
    setGameState('playing');
  };

  const handleDragStart = (item: DragItem) => {
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = (zoneId: string) => {
    if (!draggedItem) return;

    const isCorrect = draggedItem.category === zoneId;

    // Remove from items
    setItems(prev => prev.filter(i => i.id !== draggedItem.id));

    // Add to drop zone
    setDropZones(prev => prev.map(zone => 
      zone.id === zoneId 
        ? { ...zone, items: [...zone.items, draggedItem] }
        : zone
    ));

    if (isCorrect) {
      setScore(s => s + 10);
      setCorrectPlacements(c => c + 1);
    }

    // Check if game finished
    if (items.length === 1) {
      setTimeout(() => setGameState('finished'), 500);
    }

    setDraggedItem(null);
  };

  const resetGame = () => {
    setupDefaultGame();
    setScore(0);
    setCorrectPlacements(0);
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Mascot size="lg" mood="thinking" animate />
          <p className="mt-4 text-xl font-semibold text-muted-foreground">Menyiapkan game...</p>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const totalItems = dropZones.reduce((sum, z) => sum + z.items.length, 0);
    const percentage = Math.round((correctPlacements / totalItems) * 100);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full game-card text-center">
          <Mascot size="lg" mood={percentage >= 80 ? "celebrating" : "happy"} className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2">
            {percentage >= 80 ? 'Luar Biasa! 🎉' : 'Bagus! 👍'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {correctPlacements} dari {totalItems} item benar
          </p>

          <div className="p-6 bg-muted rounded-xl mb-6">
            <Trophy className="w-12 h-12 text-accent mx-auto mb-2" />
            <p className="text-3xl font-bold">{score}</p>
            <p className="text-sm text-muted-foreground">Skor</p>
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
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
            <Star className="w-5 h-5 text-accent" />
            <span className="font-bold">{score}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Drag & Drop</h1>
          <p className="text-muted-foreground">Seret item ke kategori yang benar!</p>
        </div>

        {/* Items to drag */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {items.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item)}
              onDragEnd={handleDragEnd}
              className={cn(
                "w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary text-white",
                "flex items-center justify-center text-2xl font-bold cursor-grab",
                "hover:scale-110 transition-transform shadow-lg",
                draggedItem?.id === item.id && "opacity-50"
              )}
            >
              {item.content}
            </div>
          ))}
        </div>

        {/* Drop zones */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {dropZones.map(zone => (
            <div
              key={zone.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(zone.id)}
              className={cn(
                "min-h-[200px] rounded-2xl border-2 border-dashed p-4 transition-colors",
                draggedItem ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <h3 className="text-lg font-bold text-center mb-4">{zone.name}</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {zone.items.map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold",
                      item.category === zone.id 
                        ? "bg-success/20 text-success border border-success"
                        : "bg-destructive/20 text-destructive border border-destructive"
                    )}
                  >
                    {item.content}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
