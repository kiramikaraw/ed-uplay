import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSound } from '@/hooks/useNotificationSound';

export function BattleNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { playSound } = useNotificationSound();
  const lastBattleRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Subscribe to quiz battles updates
    const channel = supabase
      .channel('battle-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quiz_battles',
          filter: `challenger_id=eq.${user.id}`,
        },
        async (payload) => {
          const battle = payload.new as any;
          
          // Check if someone just joined (status changed to in_progress)
          if (battle.status === 'in_progress' && payload.old?.status === 'waiting') {
            if (lastBattleRef.current !== battle.id) {
              lastBattleRef.current = battle.id;
              
              // Get opponent name
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', battle.opponent_id)
                .maybeSingle();

              playSound('join');
              
              toast({
                title: '⚔️ Lawan Bergabung!',
                description: `${profile?.full_name || 'Seseorang'} bergabung ke battle-mu!`,
                duration: 5000,
              });
            }
          }

          // Check if battle completed
          if (battle.status === 'completed' && payload.old?.status === 'in_progress') {
            const isWinner = battle.winner_id === user.id;
            
            if (isWinner) {
              playSound('win');
              toast({
                title: '🏆 Kamu Menang!',
                description: `Skor akhir: ${battle.challenger_score} vs ${battle.opponent_score}`,
                duration: 5000,
              });
            } else {
              playSound('lose');
              toast({
                title: '💪 Pertandingan Selesai!',
                description: `Skor akhir: ${battle.challenger_score} vs ${battle.opponent_score}`,
                duration: 5000,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quiz_battles',
          filter: `opponent_id=eq.${user.id}`,
        },
        async (payload) => {
          const battle = payload.new as any;

          // Check if battle completed
          if (battle.status === 'completed' && payload.old?.status === 'in_progress') {
            const isWinner = battle.winner_id === user.id;
            
            if (isWinner) {
              playSound('win');
              toast({
                title: '🏆 Kamu Menang!',
                description: `Skor akhir: ${battle.opponent_score} vs ${battle.challenger_score}`,
                duration: 5000,
              });
            } else {
              playSound('lose');
              toast({
                title: '💪 Pertandingan Selesai!',
                description: `Skor akhir: ${battle.opponent_score} vs ${battle.challenger_score}`,
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, playSound]);

  return null; // This is a background component
}
