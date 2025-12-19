import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Clock, Filter, Bell, Users, Save, Loader2, Eye, Ban, Timer } from 'lucide-react';

interface ChildControl {
  child_id: string;
  child_name: string;
  daily_time_limit_minutes: number;
  allowed_start_time: string;
  allowed_end_time: string;
  blocked_game_types: string[];
  content_filter_level: string;
  notifications_enabled: boolean;
}

interface DailyActivity {
  activity_date: string;
  time_spent_minutes: number;
  games_played: number;
  xp_earned: number;
}

export const ParentalControls = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [children, setChildren] = useState<ChildControl[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state for editing
  const [timeLimit, setTimeLimit] = useState(120);
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('21:00');
  const [blockedTypes, setBlockedTypes] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState('moderate');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (user && role === 'parent') {
      loadChildren();
    }
  }, [user, role]);

  useEffect(() => {
    if (selectedChild) {
      loadChildSettings(selectedChild);
      loadChildActivities(selectedChild);
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: childrenData } = await supabase
        .from('parent_children')
        .select(`
          child_id,
          profiles!parent_children_child_id_fkey(full_name)
        `)
        .eq('parent_id', user.id);

      if (childrenData && childrenData.length > 0) {
        const childList = childrenData.map(c => ({
          child_id: c.child_id,
          child_name: (c.profiles as any)?.full_name || 'Anak',
          daily_time_limit_minutes: 120,
          allowed_start_time: '06:00',
          allowed_end_time: '21:00',
          blocked_game_types: [],
          content_filter_level: 'moderate',
          notifications_enabled: true,
        }));
        setChildren(childList);
        setSelectedChild(childList[0].child_id);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildSettings = async (childId: string) => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('parental_controls')
        .select('*')
        .eq('parent_id', user.id)
        .eq('child_id', childId)
        .maybeSingle();

      if (data) {
        setTimeLimit(data.daily_time_limit_minutes || 120);
        setStartTime(data.allowed_start_time || '06:00');
        setEndTime(data.allowed_end_time || '21:00');
        setBlockedTypes(data.blocked_game_types || []);
        setFilterLevel(data.content_filter_level || 'moderate');
        setNotifications(data.notifications_enabled ?? true);
      } else {
        // Reset to defaults
        setTimeLimit(120);
        setStartTime('06:00');
        setEndTime('21:00');
        setBlockedTypes([]);
        setFilterLevel('moderate');
        setNotifications(true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadChildActivities = async (childId: string) => {
    try {
      const { data } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', childId)
        .order('activity_date', { ascending: false })
        .limit(7);

      if (data) {
        setActivities(data);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const saveSettings = async () => {
    if (!user || !selectedChild) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('parental_controls')
        .upsert({
          parent_id: user.id,
          child_id: selectedChild,
          daily_time_limit_minutes: timeLimit,
          allowed_start_time: startTime,
          allowed_end_time: endTime,
          blocked_game_types: blockedTypes,
          content_filter_level: filterLevel,
          notifications_enabled: notifications,
        }, {
          onConflict: 'parent_id,child_id'
        });

      if (error) throw error;

      toast({
        title: "Pengaturan Disimpan ✓",
        description: "Kontrol orang tua berhasil diperbarui",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan, coba lagi",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleGameType = (type: string) => {
    setBlockedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const gameTypes = [
    { id: 'quiz', label: 'Quiz', icon: '❓' },
    { id: 'memory', label: 'Memory', icon: '🧠' },
    { id: 'drag_drop', label: 'Drag & Drop', icon: '🎯' },
    { id: 'puzzle', label: 'Puzzle', icon: '🧩' },
  ];

  const selectedChildData = children.find(c => c.child_id === selectedChild);

  if (role !== 'parent') {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Fitur ini hanya untuk akun orang tua</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Shield className="h-4 w-4" />
          Kontrol Orang Tua
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Kontrol Orang Tua
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : children.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Belum ada anak yang terhubung</p>
            <p className="text-sm">Hubungkan akun anak di pengaturan profil</p>
          </div>
        ) : (
          <>
            {/* Child Selector */}
            <div className="mb-4">
              <Label>Pilih Anak</Label>
              <Select value={selectedChild || ''} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih anak" />
                </SelectTrigger>
                <SelectContent>
                  {children.map(child => (
                    <SelectItem key={child.child_id} value={child.child_id}>
                      {child.child_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="limits" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="limits" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Batas Waktu
                </TabsTrigger>
                <TabsTrigger value="content" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Konten
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Aktivitas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="limits" className="space-y-6 mt-4">
                {/* Daily Time Limit */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      Batas Waktu Harian
                    </Label>
                    <span className="text-sm font-medium">{timeLimit} menit</span>
                  </div>
                  <Slider
                    value={[timeLimit]}
                    onValueChange={([v]) => setTimeLimit(v)}
                    max={480}
                    min={15}
                    step={15}
                  />
                  <p className="text-xs text-muted-foreground">
                    Anak dapat bermain maksimal {Math.floor(timeLimit / 60)} jam {timeLimit % 60} menit per hari
                  </p>
                </div>

                {/* Allowed Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jam Mulai</Label>
                    <Input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Jam Selesai</Label>
                    <Input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anak hanya dapat mengakses aplikasi dari {startTime} sampai {endTime}
                </p>

                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notifikasi
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Terima notifikasi aktivitas anak
                    </p>
                  </div>
                  <Switch 
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6 mt-4">
                {/* Content Filter Level */}
                <div className="space-y-2">
                  <Label>Tingkat Filter Konten</Label>
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strict">Ketat - Hanya konten edukatif dasar</SelectItem>
                      <SelectItem value="moderate">Sedang - Konten sesuai usia</SelectItem>
                      <SelectItem value="relaxed">Longgar - Semua konten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Blocked Game Types */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Ban className="h-4 w-4" />
                    Blokir Tipe Game
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {gameTypes.map(type => (
                      <div
                        key={type.id}
                        onClick={() => toggleGameType(type.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          blockedTypes.includes(type.id)
                            ? 'bg-destructive/10 border-destructive'
                            : 'bg-card border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{type.icon}</span>
                          <span className="text-sm font-medium">{type.label}</span>
                          {blockedTypes.includes(type.id) && (
                            <Ban className="h-4 w-4 text-destructive ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Aktivitas 7 Hari Terakhir</h4>
                  {activities.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Belum ada aktivitas tercatat
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {activities.map((activity, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {new Date(activity.activity_date).toLocaleDateString('id-ID', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.games_played} game dimainkan
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">{activity.time_spent_minutes} menit</p>
                            <p className="text-xs text-muted-foreground">+{activity.xp_earned} XP</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="mt-6 pt-4 border-t">
              <Button 
                className="w-full gap-2" 
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan Pengaturan
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};