import { useState, useEffect } from 'react';
import { Swords, Users, Copy, Trophy, Loader2, Play, Share2 } from 'lucide-react';
import { GameButton } from '@/components/ui/game-button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Game {
  id: string;
  title: string;
  game_type: string;
}

interface Battle {
  id: string;
  battle_code: string;
  status: string;
  challenger_score: number;
  opponent_score: number;
  game: Game;
}

export function QuizBattle() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGames();
      fetchBattles();
      subscribeToUpdates();
    }
  }, [user]);

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('id, title, game_type')
      .eq('game_type', 'quiz')
      .limit(20);
    
    if (data) setGames(data);
  };

  const fetchBattles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('quiz_battles')
      .select(`
        id,
        battle_code,
        status,
        challenger_score,
        opponent_score,
        challenger_id,
        opponent_id,
        game_id
      `)
      .or(`challenger_id.eq.${user?.id},opponent_id.eq.${user?.id}`)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      // Fetch game details separately
      const gameIds = [...new Set(data.map(b => b.game_id))];
      const { data: gamesData } = await supabase
        .from('games')
        .select('id, title, game_type')
        .in('id', gameIds);
      
      const gamesMap = new Map(gamesData?.map(g => [g.id, g]) || []);
      
      const battlesWithGames = data.map(b => ({
        ...b,
        game: gamesMap.get(b.game_id) || { id: b.game_id, title: 'Unknown', game_type: 'quiz' }
      }));
      
      setBattles(battlesWithGames as Battle[]);
    }
    setLoading(false);
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('quiz-battles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_battles',
        },
        () => {
          fetchBattles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const generateBattleCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createBattle = async () => {
    if (!selectedGame || !user) return;
    
    setIsCreating(true);
    try {
      const battleCode = generateBattleCode();
      
      const { data, error } = await supabase
        .from('quiz_battles')
        .insert({
          game_id: selectedGame,
          challenger_id: user.id,
          battle_code: battleCode,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '⚔️ Battle Dibuat!',
        description: `Kode battle: ${battleCode}. Bagikan ke temanmu!`,
      });

      // Copy to clipboard
      navigator.clipboard.writeText(battleCode);
      
      setDialogOpen(false);
      fetchBattles();
    } catch (error) {
      console.error('Error creating battle:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat battle',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const joinBattle = async () => {
    if (!joinCode || !user) return;
    
    setIsJoining(true);
    try {
      // Find the battle
      const { data: battle, error: findError } = await supabase
        .from('quiz_battles')
        .select('*')
        .eq('battle_code', joinCode.toUpperCase())
        .eq('status', 'waiting')
        .maybeSingle();

      if (findError || !battle) {
        throw new Error('Battle tidak ditemukan atau sudah dimulai');
      }

      if (battle.challenger_id === user.id) {
        throw new Error('Kamu tidak bisa join battle sendiri!');
      }

      // Join the battle
      const { error: updateError } = await supabase
        .from('quiz_battles')
        .update({
          opponent_id: user.id,
          status: 'in_progress',
        })
        .eq('id', battle.id);

      if (updateError) throw updateError;

      toast({
        title: '🎮 Joined Battle!',
        description: 'Battle dimulai! Semoga beruntung!',
      });

      setJoinCode('');
      setDialogOpen(false);
      fetchBattles();
    } catch (error) {
      console.error('Error joining battle:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal join battle',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  const copyBattleCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: '📋 Disalin!',
      description: 'Kode battle disalin ke clipboard',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-full font-semibold">Menunggu</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-semibold">Berlangsung</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full font-semibold">Selesai</span>;
      default:
        return null;
    }
  };

  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple/20 flex items-center justify-center">
            <Swords className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Quiz Battle</h3>
            <p className="text-sm text-muted-foreground">Tantang temanmu!</p>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <GameButton variant="primary" size="sm">
              <Play className="w-4 h-4" />
              Battle!
            </GameButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-primary" />
                Quiz Battle
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 pt-4">
              {/* Create Battle */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="text-lg">🎮</span>
                  Buat Battle Baru
                </h4>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary"
                >
                  <option value="">Pilih Quiz...</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.title}
                    </option>
                  ))}
                </select>
                <GameButton
                  variant="primary"
                  className="w-full"
                  onClick={createBattle}
                  disabled={!selectedGame || isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Swords className="w-4 h-4" />
                      Buat Battle
                    </>
                  )}
                </GameButton>
              </div>

              {/* Join Battle */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="text-lg">🤝</span>
                  Gabung Battle
                </h4>
                <Input
                  placeholder="Masukkan kode battle..."
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={6}
                />
                <GameButton
                  variant="secondary"
                  className="w-full"
                  onClick={joinBattle}
                  disabled={joinCode.length < 6 || isJoining}
                >
                  {isJoining ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Gabung Battle
                    </>
                  )}
                </GameButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Battles */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">Battle Aktif</h4>
        
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : battles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Swords className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada battle</p>
            <p className="text-xs">Buat battle dan tantang temanmu!</p>
          </div>
        ) : (
          battles.map((battle) => (
            <div
              key={battle.id}
              className="p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm truncate flex-1">{battle.game?.title}</span>
                {getStatusBadge(battle.status)}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <code className="bg-background px-2 py-1 rounded text-xs font-mono">
                    {battle.battle_code}
                  </code>
                  {battle.status === 'waiting' && (
                    <button
                      onClick={() => copyBattleCode(battle.battle_code)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
                
                {battle.status === 'completed' && (
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-warning" />
                    <span className="font-bold">{battle.challenger_score}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-bold">{battle.opponent_score}</span>
                  </div>
                )}
                
                {battle.status === 'waiting' && (
                  <GameButton variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </GameButton>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
