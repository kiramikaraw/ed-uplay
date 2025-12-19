import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, BookmarkCheck, Trash2, Gamepad2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface BookmarkedGame {
  id: string;
  game_id: string;
  games: { id: string; title: string; game_type: string; difficulty: string; topic_id: string; };
}

export default function ContentBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { if (user) fetchBookmarks(); }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('bookmarks').select('id, game_id, games (id, title, game_type, difficulty, topic_id)').eq('user_id', user.id).not('game_id', 'is', null);
    if (data) setBookmarks(data as any);
    setLoading(false);
  };

  const removeBookmark = async (id: string) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { setBookmarks((prev) => prev.filter((b) => b.id !== id)); toast({ title: t('success'), description: 'Bookmark dihapus' }); }
  };

  const playGame = (game: any) => navigate(`/play/${game.game_type}/${game.topic_id}/${game.id}`);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) { case 'easy': return 'bg-green/20 text-green'; case 'medium': return 'bg-accent/20 text-accent'; case 'hard': return 'bg-destructive/20 text-destructive'; default: return ''; }
  };

  if (loading) return <Card><CardContent className="p-6 text-center"><div className="animate-pulse">Loading...</div></CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookmarkCheck className="h-5 w-5 text-primary" />
          {t('bookmarks')}
          {bookmarks.length > 0 && <Badge variant="secondary">{bookmarks.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookmarks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('noBookmarks')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {bookmarks.map((bookmark, index) => (
                <motion.div key={bookmark.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.05 }}>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1"><Gamepad2 className="h-4 w-4" /><h4 className="font-medium truncate">{bookmark.games?.title}</h4></div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">{bookmark.games?.game_type?.replace('_', ' ')}</Badge>
                            <Badge className={`text-xs ${getDifficultyColor(bookmark.games?.difficulty)}`}>{bookmark.games?.difficulty}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => playGame(bookmark.games)}><Play className="h-4 w-4 mr-1" />Main</Button>
                          <Button variant="ghost" size="icon" onClick={() => removeBookmark(bookmark.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function useBookmark() {
  const { user } = useAuth();
  const { toast } = useToast();

  const addGameBookmark = async (gameId: string) => {
    if (!user) { toast({ title: 'Login diperlukan', variant: 'destructive' }); return false; }
    const { error } = await supabase.from('bookmarks').insert({ user_id: user.id, game_id: gameId });
    if (error) { if (error.code === '23505') toast({ title: 'Sudah di-bookmark' }); else toast({ title: 'Error', description: error.message, variant: 'destructive' }); return false; }
    toast({ title: 'Ditambahkan ke bookmark' }); return true;
  };

  const removeGameBookmark = async (gameId: string) => {
    if (!user) return false;
    const { error } = await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('game_id', gameId);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return false; }
    toast({ title: 'Dihapus dari bookmark' }); return true;
  };

  return { addGameBookmark, removeGameBookmark };
}
