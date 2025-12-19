import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Clock, Check, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  scheduled_date: string;
  scheduled_time?: string;
  duration_minutes: number;
  is_completed: boolean;
}

export default function StudyCalendar() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ title: '', description: '', scheduled_date: '', scheduled_time: '', duration_minutes: 30 });
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => { if (user) fetchSchedules(); }, [user]);

  const fetchSchedules = async () => {
    if (!user) return;
    const { data } = await supabase.from('study_schedule').select('*').eq('user_id', user.id).gte('scheduled_date', new Date().toISOString().split('T')[0]).order('scheduled_date', { ascending: true }).order('scheduled_time', { ascending: true }).limit(10);
    if (data) setSchedules(data);
  };

  const addSchedule = async () => {
    if (!user || !newSchedule.title || !newSchedule.scheduled_date) return;
    const { error } = await supabase.from('study_schedule').insert({ user_id: user.id, ...newSchedule });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: t('success') }); fetchSchedules(); setIsOpen(false); setNewSchedule({ title: '', description: '', scheduled_date: '', scheduled_time: '', duration_minutes: 30 }); }
  };

  const toggleComplete = async (id: string, current: boolean) => {
    await supabase.from('study_schedule').update({ is_completed: !current }).eq('id', id);
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, is_completed: !current } : s)));
  };

  const deleteSchedule = async (id: string) => {
    await supabase.from('study_schedule').delete().eq('id', id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    toast({ title: 'Jadwal dihapus' });
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return t('today');
    if (isTomorrow(date)) return 'Besok';
    return format(date, 'EEE, d MMM', { locale: language === 'id' ? idLocale : undefined });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />{t('schedule')}</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />{t('addSchedule')}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t('addSchedule')}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Judul</Label><Input value={newSchedule.title} onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })} placeholder="Belajar Matematika" /></div>
                <div><Label>Tanggal</Label><Input type="date" value={newSchedule.scheduled_date} onChange={(e) => setNewSchedule({ ...newSchedule, scheduled_date: e.target.value })} /></div>
                <div><Label>Waktu</Label><Input type="time" value={newSchedule.scheduled_time} onChange={(e) => setNewSchedule({ ...newSchedule, scheduled_time: e.target.value })} /></div>
                <div><Label>Durasi (menit)</Label><Input type="number" value={newSchedule.duration_minutes} onChange={(e) => setNewSchedule({ ...newSchedule, duration_minutes: parseInt(e.target.value) || 30 })} /></div>
                <Button onClick={addSchedule} className="w-full">{t('save')}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Belum ada jadwal</p></div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule, index) => (
              <motion.div key={schedule.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={`p-3 rounded-lg border ${schedule.is_completed ? 'bg-muted/50 opacity-60' : 'bg-card'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleComplete(schedule.id, schedule.is_completed)}>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${schedule.is_completed ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                        {schedule.is_completed && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </Button>
                    <div>
                      <p className={`font-medium ${schedule.is_completed ? 'line-through' : ''}`}>{schedule.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{getDateLabel(schedule.scheduled_date)}</Badge>
                        {schedule.scheduled_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{schedule.scheduled_time}</span>}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteSchedule(schedule.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
