import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Calendar, Flame, Trophy } from 'lucide-react';

interface DailyActivity {
  activity_date: string;
  xp_earned: number;
  games_played: number;
  time_spent_minutes: number;
}

export const WeeklyProgressChart = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalXP: 0,
    totalGames: 0,
    totalMinutes: 0,
    avgXPPerDay: 0,
  });

  useEffect(() => {
    if (user) {
      fetchWeeklyData();
    }
  }, [user]);

  const fetchWeeklyData = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 6);

      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .gte('activity_date', weekAgo.toISOString().split('T')[0])
        .lte('activity_date', today.toISOString().split('T')[0])
        .order('activity_date', { ascending: true });

      if (error) throw error;

      // Fill in missing days with zero values
      const filledData: DailyActivity[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const existing = data?.find(d => d.activity_date === dateStr);
        filledData.push({
          activity_date: dateStr,
          xp_earned: existing?.xp_earned || 0,
          games_played: existing?.games_played || 0,
          time_spent_minutes: existing?.time_spent_minutes || 0,
        });
      }

      setWeeklyData(filledData);

      // Calculate stats
      const totalXP = filledData.reduce((sum, d) => sum + d.xp_earned, 0);
      const totalGames = filledData.reduce((sum, d) => sum + d.games_played, 0);
      const totalMinutes = filledData.reduce((sum, d) => sum + d.time_spent_minutes, 0);

      setStats({
        totalXP,
        totalGames,
        totalMinutes,
        avgXPPerDay: Math.round(totalXP / 7),
      });
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return days[date.getDay()];
  };

  const chartData = weeklyData.map(d => ({
    ...d,
    day: formatDate(d.activity_date),
  }));

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Progress Mingguan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 rounded-lg bg-primary/10 text-center">
            <Trophy className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.totalXP}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/10 text-center">
            <Flame className="h-4 w-4 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.totalGames}</p>
            <p className="text-xs text-muted-foreground">Game</p>
          </div>
          <div className="p-3 rounded-lg bg-orange/10 text-center">
            <Calendar className="h-4 w-4 text-orange mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.totalMinutes}</p>
            <p className="text-xs text-muted-foreground">Menit</p>
          </div>
          <div className="p-3 rounded-lg bg-purple/10 text-center">
            <TrendingUp className="h-4 w-4 text-purple mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.avgXPPerDay}</p>
            <p className="text-xs text-muted-foreground">Avg/Hari</p>
          </div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="xp" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="xp">XP</TabsTrigger>
            <TabsTrigger value="games">Game</TabsTrigger>
            <TabsTrigger value="time">Waktu</TabsTrigger>
          </TabsList>
          
          <TabsContent value="xp" className="mt-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="xp_earned" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#xpGradient)"
                    strokeWidth={2}
                    name="XP"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="games" className="mt-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="games_played" 
                    fill="hsl(var(--secondary))" 
                    radius={[4, 4, 0, 0]}
                    name="Game"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="time" className="mt-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="time_spent_minutes" 
                    stroke="hsl(var(--orange))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--orange))' }}
                    name="Menit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
