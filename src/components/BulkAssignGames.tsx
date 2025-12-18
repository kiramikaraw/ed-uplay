import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GameButton } from '@/components/ui/game-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Gamepad2, Users, Calendar, CheckCircle } from 'lucide-react';

interface BulkAssignGamesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GameData {
  id: string;
  title: string;
  game_type: string;
  topic?: { name: string };
}

interface ClassData {
  id: string;
  name: string;
  education_level: string;
  member_count?: number;
}

export function BulkAssignGames({ open, onOpenChange }: BulkAssignGamesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [games, setGames] = useState<GameData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch games
      const { data: gamesData } = await supabase
        .from('games')
        .select(`
          id,
          title,
          game_type,
          topics:topic_id (name)
        `)
        .order('created_at', { ascending: false });

      // Fetch teacher's classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user!.id);

      // Get member counts
      const classesWithCounts = await Promise.all(
        (classesData || []).map(async (cls) => {
          const { count } = await supabase
            .from('class_members')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);
          return { ...cls, member_count: count || 0 };
        })
      );

      setGames((gamesData || []).map(g => ({
        ...g,
        topic: Array.isArray(g.topics) ? g.topics[0] : g.topics,
      })));
      setClasses(classesWithCounts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGame = (gameId: string) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const selectAllGames = () => {
    setSelectedGames(games.map(g => g.id));
  };

  const selectAllClasses = () => {
    setSelectedClasses(classes.map(c => c.id));
  };

  const handleAssign = async () => {
    if (selectedGames.length === 0 || selectedClasses.length === 0) {
      toast({
        title: 'Pilih game dan kelas',
        description: 'Minimal pilih 1 game dan 1 kelas',
        variant: 'destructive',
      });
      return;
    }

    setAssigning(true);
    let success = 0;
    let failed = 0;

    for (const gameId of selectedGames) {
      for (const classId of selectedClasses) {
        try {
          const game = games.find(g => g.id === gameId);
          const { error } = await supabase
            .from('assignments')
            .insert({
              game_id: gameId,
              class_id: classId,
              title: game?.title || 'Assignment',
              due_date: dueDate || null,
            });

          if (error) {
            // Check if already exists
            if (error.code === '23505') {
              // Duplicate - count as success
              success++;
            } else {
              failed++;
              console.error('Error creating assignment:', error);
            }
          } else {
            success++;
          }
        } catch (err) {
          failed++;
        }
      }
    }

    setAssigning(false);
    
    toast({
      title: 'Assignment selesai',
      description: `${success} assignment berhasil dibuat`,
    });

    if (success > 0) {
      onOpenChange(false);
      setSelectedGames([]);
      setSelectedClasses([]);
      setDueDate('');
    }
  };

  const gameTypeLabels: Record<string, string> = {
    quiz: '📝 Kuis',
    memory: '🧠 Memory',
    drag_drop: '🎯 Drag & Drop',
    puzzle: '🧩 Puzzle',
  };

  const levelLabels: Record<string, string> = { sd: 'SD', smp: 'SMP', sma: 'SMA' };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary" />
            Bulk Assign Games
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Select Games */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  Pilih Game ({selectedGames.length}/{games.length})
                </Label>
                <GameButton variant="ghost" size="sm" onClick={selectAllGames}>
                  Pilih Semua
                </GameButton>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {games.map(game => (
                  <div
                    key={game.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      selectedGames.includes(game.id)
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                    onClick={() => toggleGame(game.id)}
                  >
                    <Checkbox
                      checked={selectedGames.includes(game.id)}
                      onCheckedChange={() => toggleGame(game.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{game.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {gameTypeLabels[game.game_type] || game.game_type}
                        {game.topic && ` • ${game.topic.name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {games.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Belum ada game. Buat game terlebih dahulu.
                </p>
              )}
            </div>

            {/* Select Classes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Pilih Kelas ({selectedClasses.length}/{classes.length})
                </Label>
                <GameButton variant="ghost" size="sm" onClick={selectAllClasses}>
                  Pilih Semua
                </GameButton>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {classes.map(cls => (
                  <div
                    key={cls.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      selectedClasses.includes(cls.id)
                        ? 'bg-secondary/10 border-2 border-secondary'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                    onClick={() => toggleClass(cls.id)}
                  >
                    <Checkbox
                      checked={selectedClasses.includes(cls.id)}
                      onCheckedChange={() => toggleClass(cls.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{cls.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {levelLabels[cls.education_level]} • {cls.member_count} siswa
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {classes.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Belum ada kelas. Buat kelas terlebih dahulu.
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Batas Waktu (opsional)
              </Label>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Summary & Submit */}
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Akan dibuat {selectedGames.length * selectedClasses.length} assignment
              </p>
              <p className="text-sm">
                {selectedGames.length} game × {selectedClasses.length} kelas
              </p>
            </div>

            <GameButton 
              variant="primary" 
              className="w-full"
              onClick={handleAssign}
              disabled={assigning || selectedGames.length === 0 || selectedClasses.length === 0}
            >
              {assigning ? 'Meng-assign...' : 'Assign Games'}
            </GameButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
