import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Globe, Palette, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AvatarUpload } from '@/components/AvatarUpload';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    school_name: '',
    education_level: 'sd' as 'sd' | 'smp' | 'sma',
    avatar_url: ''
  });
  const [preferences, setPreferences] = useState({
    notification_email: true,
    notification_push: true
  });
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadPreferences();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile({
        full_name: data.full_name || '',
        school_name: data.school_name || '',
        education_level: data.education_level || 'sd',
        avatar_url: data.avatar_url || ''
      });
    }
  };

  const loadPreferences = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle();
    if (data) {
      setPreferences({
        notification_email: data.notification_email,
        notification_push: data.notification_push
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      school_name: profile.school_name,
      education_level: profile.education_level
    }).eq('id', user.id);
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('success'), description: 'Profil berhasil diperbarui' });
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('user_preferences').upsert({
      user_id: user.id,
      notification_email: preferences.notification_email,
      notification_push: preferences.notification_push,
      language
    }, { onConflict: 'user_id' });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('success'), description: 'Pengaturan berhasil disimpan' });
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Error', description: 'Password tidak cocok', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('success'), description: 'Password berhasil diubah' });
      setPasswords({ new: '', confirm: '' });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{t('settings')}</h1>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />{t('profile')}</TabsTrigger>
            <TabsTrigger value="preferences"><Bell className="h-4 w-4 mr-2" />{t('settings')}</TabsTrigger>
            <TabsTrigger value="security"><Lock className="h-4 w-4 mr-2" />Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle>{t('editProfile')}</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <AvatarUpload
                    currentUrl={profile.avatar_url}
                    fallback={profile.full_name?.charAt(0) || 'U'}
                    onUploadComplete={(url) => setProfile({ ...profile, avatar_url: url })}
                  />
                  <div>
                    <h3 className="font-semibold">{profile.full_name || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Klik ikon kamera untuk ganti foto</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('fullName')}</Label>
                    <Input id="fullName" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school">{t('schoolName')}</Label>
                    <Input id="school" value={profile.school_name} onChange={(e) => setProfile({ ...profile, school_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('educationLevel')}</Label>
                    <Select value={profile.education_level} onValueChange={(v) => setProfile({ ...profile, education_level: v as 'sd' | 'smp' | 'sma' })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sd">{t('sd')}</SelectItem>
                        <SelectItem value="smp">{t('smp')}</SelectItem>
                        <SelectItem value="sma">{t('sma')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
                  <Save className="mr-2 h-4 w-4" />{t('save')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />{t('language')}</CardTitle></CardHeader>
                <CardContent>
                  <Select value={language} onValueChange={(v) => setLanguage(v as 'id' | 'en')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />{t('theme')}</CardTitle></CardHeader>
                <CardContent><ThemeToggle /></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />{t('notifications')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div><p className="font-medium">{t('emailNotifications')}</p></div>
                    <Switch checked={preferences.notification_email} onCheckedChange={(v) => setPreferences({ ...preferences, notification_email: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="font-medium">{t('pushNotifications')}</p></div>
                    <Switch checked={preferences.notification_push} onCheckedChange={(v) => setPreferences({ ...preferences, notification_push: v })} />
                  </div>
                </CardContent>
              </Card>
              <Button onClick={handleSavePreferences} disabled={loading} className="w-full">
                <Save className="mr-2 h-4 w-4" />{t('save')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader><CardTitle>{t('changePassword')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('newPassword')}</Label>
                  <Input id="newPassword" type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                  <Input id="confirmPassword" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                </div>
                <Button onClick={handleChangePassword} disabled={loading || !passwords.new} className="w-full">
                  <Lock className="mr-2 h-4 w-4" />{t('changePassword')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
