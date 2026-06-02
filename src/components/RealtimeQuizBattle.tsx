import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Swords, Users, Trophy, Clock, Zap, Copy, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
}

interface BattleState {
  status: 'waiting' | 'playing' | 'finished';
  currentQuestion: number;
  myScore: number;
  opponentScore: number;
  opponentName: string;
  questions: Question[];
  timeLeft: number;
  myAnswer: string | null;
  opponentAnswered: boolean;
}

export const RealtimeQuizBattle = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [battleCode, setBattleCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sample questions for demo
  const sampleQuestions: Question[] = [
    { id: '1', question_text: 'Berapakah hasil dari 15 × 8?', options: ['100', '120', '115', '125'], correct_answer: '120' },
    { id: '2', question_text: 'Planet terbesar di tata surya adalah?', options: ['Saturnus', 'Jupiter', 'Uranus', 'Neptunus'], correct_answer: 'Jupiter' },
    { id: '3', question_text: 'Siapa penemu lampu pijar?', options: ['Nikola Tesla', 'Thomas Edison', 'Albert Einstein', 'Isaac Newton'], correct_answer: 'Thomas Edison' },
    { id: '4', question_text: 'Ibukota Jepang adalah?', options: ['Kyoto', 'Osaka', 'Tokyo', 'Nagoya'], correct_answer: 'Tokyo' },
    { id: '5', question_text: 'H2O adalah rumus kimia untuk?', options: ['Oksigen', 'Hidrogen', 'Air', 'Karbon Dioksida'], correct_answer: 'Air' },
  ];

  const generateBattleCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createBattle = async () => {
    if (!user) return;
    
    setIsCreating(true);
    const code = generateBattleCode();
    setBattleCode(code);

    // Set up realtime channel
    const channel = supabase.channel(`battle-${code}`, {
      config: { broadcast: { self: true } }
    });

    channel
      .on('broadcast', { event: 'player_joined' }, ({ payload }) => {
        console.log('Player joined:', payload);
        toast({
          title: "Lawan Bergabung! ⚔️",
          description: `${payload.name} siap bertanding!`,
        });
        
        // Start game
        setBattleState({
          status: 'playing',
          currentQuestion: 0,
          myScore: 0,
          opponentScore: 0,
          opponentName: payload.name,
          questions: sampleQuestions,
          timeLeft: 15,
          myAnswer: null,
          opponentAnswered: false,
        });
        
        // Broadcast game start
        channel.send({
          type: 'broadcast',
          event: 'game_start',
          payload: { questions: sampleQuestions }
        });
      })
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        if (payload.playerId !== user.id) {
          setBattleState(prev => prev ? {
            ...prev,
            opponentAnswered: true,
            opponentScore: payload.correct ? prev.opponentScore + 100 : prev.opponentScore
          } : null);
        }
      })
      .on('broadcast', { event: 'next_question' }, () => {
        setBattleState(prev => {
          if (!prev) return null;
          if (prev.currentQuestion >= prev.questions.length - 1) {
            return { ...prev, status: 'finished' };
          }
          return {
            ...prev,
            currentQuestion: prev.currentQuestion + 1,
            timeLeft: 15,
            myAnswer: null,
            opponentAnswered: false,
          };
        });
      })
      .subscribe();

    channelRef.current = channel;

    setBattleState({
      status: 'waiting',
      currentQuestion: 0,
      myScore: 0,
      opponentScore: 0,
      opponentName: '',
      questions: sampleQuestions,
      timeLeft: 15,
      myAnswer: null,
      opponentAnswered: false,
    });

    setIsCreating(false);
  };

  const joinBattle = async () => {
    if (!user || !joinCode) return;
    
    setIsJoining(true);
    
    const channel = supabase.channel(`battle-${joinCode.toUpperCase()}`, {
      config: { broadcast: { self: true } }
    });

    channel
      .on('broadcast', { event: 'game_start' }, ({ payload }) => {
        console.log('Game starting:', payload);
        setBattleState({
          status: 'playing',
          currentQuestion: 0,
          myScore: 0,
          opponentScore: 0,
          opponentName: 'Lawan',
          questions: payload.questions,
          timeLeft: 15,
          myAnswer: null,
          opponentAnswered: false,
        });
      })
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        if (payload.playerId !== user.id) {
          setBattleState(prev => prev ? {
            ...prev,
            opponentAnswered: true,
            opponentScore: payload.correct ? prev.opponentScore + 100 : prev.opponentScore
          } : null);
        }
      })
      .on('broadcast', { event: 'next_question' }, () => {
        setBattleState(prev => {
          if (!prev) return null;
          if (prev.currentQuestion >= prev.questions.length - 1) {
            return { ...prev, status: 'finished' };
          }
          return {
            ...prev,
            currentQuestion: prev.currentQuestion + 1,
            timeLeft: 15,
            myAnswer: null,
            opponentAnswered: false,
          };
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Notify host that we joined
          await channel.send({
            type: 'broadcast',
            event: 'player_joined',
            payload: { name: user.email?.split('@')[0] || 'Player', id: user.id }
          });
        }
      });

    channelRef.current = channel;
    setBattleCode(joinCode.toUpperCase());
    setIsJoining(false);
  };

  const submitAnswer = async (answer: string) => {
    if (!battleState || battleState.myAnswer || !channelRef.current) return;

    const currentQ = battleState.questions[battleState.currentQuestion];
    const isCorrect = answer === currentQ.correct_answer;

    setBattleState(prev => prev ? {
      ...prev,
      myAnswer: answer,
      myScore: isCorrect ? prev.myScore + 100 : prev.myScore
    } : null);

    // Broadcast answer
    await channelRef.current.send({
      type: 'broadcast',
      event: 'answer',
      payload: { playerId: user?.id, correct: isCorrect }
    });

    // Move to next question after delay
    setTimeout(async () => {
      if (channelRef.current) {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'next_question',
          payload: {}
        });
      }
    }, 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(battleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetBattle = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setBattleState(null);
    setBattleCode('');
    setJoinCode('');
  };

  // Timer effect
  useEffect(() => {
    if (battleState?.status === 'playing' && battleState.timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setBattleState(prev => prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [battleState?.status, battleState?.timeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const currentQuestion = battleState?.questions[battleState.currentQuestion];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetBattle(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-destructive to-orange hover:opacity-90">
          <Swords className="h-4 w-4" />
          Realtime Battle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-destructive" />
            Realtime Quiz Battle
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!battleState ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Button 
                onClick={createBattle} 
                className="w-full gap-2" 
                size="lg"
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Buat Battle Baru
              </Button>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">atau</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan kode battle"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-lg tracking-widest font-mono"
                />
                <Button onClick={joinBattle} disabled={joinCode.length < 6 || isJoining}>
                  {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gabung'}
                </Button>
              </div>
            </motion.div>
          ) : battleState.status === 'waiting' ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4 py-8"
            >
              <div className="animate-pulse">
                <Users className="h-16 w-16 mx-auto text-primary" />
              </div>
              <h3 className="text-xl font-bold">Menunggu Lawan...</h3>
              <p className="text-muted-foreground">Bagikan kode ini ke temanmu:</p>
              
              <div className="flex items-center justify-center gap-2">
                <code className="text-3xl font-mono font-bold tracking-widest bg-muted px-4 py-2 rounded-lg">
                  {battleCode}
                </code>
                <Button size="icon" variant="outline" onClick={copyCode}>
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </motion.div>
          ) : battleState.status === 'playing' && currentQuestion ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Score Bar */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="default">{battleState.myScore}</Badge>
                  <span>Kamu</span>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {battleState.timeLeft}s
                </Badge>
                <div className="flex items-center gap-2">
                  <span>{battleState.opponentName || 'Lawan'}</span>
                  <Badge variant="secondary">{battleState.opponentScore}</Badge>
                </div>
              </div>

              <Progress value={((battleState.currentQuestion + 1) / battleState.questions.length) * 100} />

              {/* Question */}
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    Soal {battleState.currentQuestion + 1}/{battleState.questions.length}
                  </p>
                  <h3 className="font-semibold text-lg">{currentQuestion.question_text}</h3>
                </CardContent>
              </Card>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = battleState.myAnswer === option;
                  const isCorrect = option === currentQuestion.correct_answer;
                  const showResult = battleState.myAnswer !== null;

                  return (
                    <Button
                      key={idx}
                      variant={showResult && isCorrect ? "default" : isSelected && !isCorrect ? "destructive" : "outline"}
                      className={`h-auto py-3 ${showResult && isCorrect ? 'bg-success hover:bg-success' : ''}`}
                      onClick={() => submitAnswer(option)}
                      disabled={battleState.myAnswer !== null}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>

              {battleState.opponentAnswered && (
                <p className="text-center text-sm text-muted-foreground animate-pulse">
                  Lawan sudah menjawab!
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4 py-8"
            >
              <Trophy className={`h-20 w-20 mx-auto ${battleState.myScore > battleState.opponentScore ? 'text-warning' : 'text-muted-foreground'}`} />
              
              <h3 className="text-2xl font-bold">
                {battleState.myScore > battleState.opponentScore ? '🎉 Kamu Menang!' : 
                 battleState.myScore < battleState.opponentScore ? '😢 Kamu Kalah' : '🤝 Seri!'}
              </h3>

              <div className="flex justify-center gap-8">
                <div>
                  <p className="text-3xl font-bold text-primary">{battleState.myScore}</p>
                  <p className="text-sm text-muted-foreground">Kamu</p>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">vs</div>
                <div>
                  <p className="text-3xl font-bold text-secondary">{battleState.opponentScore}</p>
                  <p className="text-sm text-muted-foreground">{battleState.opponentName || 'Lawan'}</p>
                </div>
              </div>

              <Button onClick={resetBattle} className="mt-4">
                Main Lagi
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
