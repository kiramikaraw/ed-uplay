import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MessageSquare, Plus, Send, User, Clock, 
  ChevronRight, ArrowLeft, Loader2 
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface ClassData {
  id: string;
  name: string;
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  user_id: string;
  user_name: string;
  created_at: string;
  reply_count: number;
}

interface Reply {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  created_at: string;
}

export function DiscussionForum() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);
  
  const [newReply, setNewReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchDiscussions(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    if (!user) return;

    try {
      if (role === 'teacher') {
        const { data } = await supabase
          .from('classes')
          .select('id, name')
          .eq('teacher_id', user.id);
        setClasses(data || []);
        if (data && data.length > 0) {
          setSelectedClass(data[0].id);
        }
      } else {
        const { data } = await supabase
          .from('class_members')
          .select('class_id, classes(id, name)')
          .eq('student_id', user.id);
        
        const classList = (data || [])
          .map((m: any) => m.classes)
          .filter(Boolean);
        setClasses(classList);
        if (classList.length > 0) {
          setSelectedClass(classList[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async (classId: string) => {
    try {
      const { data: discussionsData } = await supabase
        .from('discussions')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (!discussionsData) {
        setDiscussions([]);
        return;
      }

      // Get user profiles
      const userIds = [...new Set(discussionsData.map(d => d.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      // Get reply counts
      const discussionIds = discussionsData.map(d => d.id);
      const { data: replyCounts } = await supabase
        .from('discussion_replies')
        .select('discussion_id')
        .in('discussion_id', discussionIds);

      const replyCountMap = new Map<string, number>();
      replyCounts?.forEach(r => {
        replyCountMap.set(r.discussion_id, (replyCountMap.get(r.discussion_id) || 0) + 1);
      });

      const formattedDiscussions: Discussion[] = discussionsData.map(d => ({
        id: d.id,
        title: d.title,
        content: d.content,
        user_id: d.user_id,
        user_name: profileMap.get(d.user_id) || 'Unknown',
        created_at: d.created_at,
        reply_count: replyCountMap.get(d.id) || 0,
      }));

      setDiscussions(formattedDiscussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };

  const fetchReplies = async (discussionId: string) => {
    setLoadingReplies(true);
    try {
      const { data: repliesData } = await supabase
        .from('discussion_replies')
        .select('*')
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });

      if (!repliesData) {
        setReplies([]);
        return;
      }

      const userIds = [...new Set(repliesData.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const formattedReplies: Reply[] = repliesData.map(r => ({
        id: r.id,
        content: r.content,
        user_id: r.user_id,
        user_name: profileMap.get(r.user_id) || 'Unknown',
        created_at: r.created_at,
      }));

      setReplies(formattedReplies);
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!user || !newTitle.trim() || !newContent.trim() || !selectedClass) {
      toast({
        title: 'Error',
        description: 'Isi judul dan konten diskusi',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase
        .from('discussions')
        .insert({
          class_id: selectedClass,
          user_id: user.id,
          title: newTitle.trim(),
          content: newContent.trim(),
        });

      if (error) throw error;

      toast({
        title: 'Berhasil!',
        description: 'Diskusi baru telah dibuat',
      });

      setNewTitle('');
      setNewContent('');
      setShowNewDiscussion(false);
      fetchDiscussions(selectedClass);
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat diskusi',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async () => {
    if (!user || !newReply.trim() || !selectedDiscussion) {
      return;
    }

    setSendingReply(true);
    try {
      const { error } = await supabase
        .from('discussion_replies')
        .insert({
          discussion_id: selectedDiscussion.id,
          user_id: user.id,
          content: newReply.trim(),
        });

      if (error) throw error;

      setNewReply('');
      fetchReplies(selectedDiscussion.id);
      fetchDiscussions(selectedClass);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengirim balasan',
        variant: 'destructive',
      });
    } finally {
      setSendingReply(false);
    }
  };

  const openDiscussion = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    fetchReplies(discussion.id);
  };

  if (loading) {
    return (
      <div className="game-card">
        <h2 className="font-bold text-xl mb-4">Forum Diskusi 💬</h2>
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="game-card">
        <h2 className="font-bold text-xl mb-4">Forum Diskusi 💬</h2>
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Gabung kelas untuk akses forum</p>
        </div>
      </div>
    );
  }

  // Discussion Detail View
  if (selectedDiscussion) {
    return (
      <div className="game-card">
        <button
          onClick={() => setSelectedDiscussion(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="mb-6">
          <h2 className="font-bold text-xl">{selectedDiscussion.title}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <User className="w-4 h-4" />
            <span>{selectedDiscussion.user_name}</span>
            <span>•</span>
            <Clock className="w-4 h-4" />
            <span>{format(new Date(selectedDiscussion.created_at), 'd MMM yyyy HH:mm', { locale: localeId })}</span>
          </div>
          <p className="mt-4 text-foreground">{selectedDiscussion.content}</p>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="font-semibold mb-4">Balasan ({replies.length})</h3>

          {loadingReplies ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
              {replies.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Belum ada balasan</p>
              ) : (
                replies.map((reply) => (
                  <div key={reply.id} className="p-3 rounded-xl bg-muted">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <User className="w-3 h-3" />
                      <span className="font-medium text-foreground">{reply.user_name}</span>
                      <span>•</span>
                      <span>{format(new Date(reply.created_at), 'd MMM HH:mm', { locale: localeId })}</span>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Tulis balasan..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
            />
            <Button onClick={handleSendReply} disabled={sendingReply || !newReply.trim()}>
              {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Discussion List View
  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Forum Diskusi
        </h2>
        <Dialog open={showNewDiscussion} onOpenChange={setShowNewDiscussion}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Diskusi Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Diskusi Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Judul diskusi"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Tulis pertanyaan atau topik diskusi..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={handleCreateDiscussion} 
                disabled={creating}
                className="w-full"
              >
                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Buat Diskusi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {classes.length > 1 && (
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="mb-4">
            <SelectValue placeholder="Pilih kelas" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {discussions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Belum ada diskusi</p>
          <p className="text-sm">Mulai diskusi baru!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {discussions.map((discussion) => (
            <button
              key={discussion.id}
              onClick={() => openDiscussion(discussion)}
              className="w-full p-4 rounded-xl bg-muted hover:bg-muted/80 text-left transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{discussion.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{discussion.content}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <User className="w-3 h-3" />
                    <span>{discussion.user_name}</span>
                    <span>•</span>
                    <span>{format(new Date(discussion.created_at), 'd MMM', { locale: localeId })}</span>
                    <span>•</span>
                    <MessageSquare className="w-3 h-3" />
                    <span>{discussion.reply_count} balasan</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
