import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Clock, Award, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

export default function StudentAnalyticsReport() {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [stats, setStats] = useState({ accuracy: 0, timeSpent: 0, topicsCompleted: 0 });
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => { if (user) fetchAnalytics(); }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;
    const { data: sessions } = await supabase.from('game_sessions').select('score, correct_answers, total_questions, time_spent_seconds, completed_at').eq('user_id', user.id).eq('completed', true).order('completed_at', { ascending: false }).limit(50);

    if (sessions && sessions.length > 0) {
      const totalCorrect = sessions.reduce((sum, s) => sum + (s.correct_answers || 0), 0);
      const totalQuestions = sessions.reduce((sum, s) => sum + (s.total_questions || 0), 0);
      const totalTime = sessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0);
      setStats({ accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0, timeSpent: Math.round(totalTime / 60), topicsCompleted: sessions.length });

      const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      const weekData = days.map((day, index) => {
        const dayScore = sessions.filter((s) => s.completed_at && new Date(s.completed_at).getDay() === (index + 1) % 7).reduce((sum, s) => sum + (s.score || 0), 0);
        return { day, score: dayScore };
      });
      setWeeklyData(weekData);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];
  const pieData = [
    { name: 'Benar', value: stats.accuracy },
    { name: 'Salah', value: 100 - stats.accuracy }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />{t('weeklyReport')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center p-4 bg-muted rounded-lg">
            <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.accuracy}%</p>
            <p className="text-xs text-muted-foreground">{t('accuracy')}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center p-4 bg-muted rounded-lg">
            <Clock className="h-6 w-6 mx-auto mb-2 text-secondary" />
            <p className="text-2xl font-bold">{stats.timeSpent}</p>
            <p className="text-xs text-muted-foreground">Menit Belajar</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center p-4 bg-muted rounded-lg">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{stats.topicsCompleted}</p>
            <p className="text-xs text-muted-foreground">Game Selesai</p>
          </motion.div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-primary/5 rounded-lg">
          <h4 className="font-semibold flex items-center gap-2 mb-2"><Award className="h-4 w-4" />{t('recommendations')}</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Tingkatkan latihan di topik yang masih lemah</li>
            <li>• Coba tantangan harian untuk bonus poin</li>
            <li>• Ajak teman untuk Quiz Battle</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
