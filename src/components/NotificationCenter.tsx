import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, X, Trophy, Calendar, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const channel = supabase.channel('notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    if (data) setNotifications(data);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-5 w-5 text-accent" />;
      case 'battle': return <Gamepad2 className="h-5 w-5 text-primary" />;
      case 'assignment': return <Calendar className="h-5 w-5 text-secondary" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />{t('notificationCenter')}</SheetTitle>
            {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={markAllAsRead}><CheckCheck className="h-4 w-4 mr-2" />{t('markAllRead')}</Button>}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-50" />
              <p>{t('noNotifications')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <motion.div key={notification.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className={`relative cursor-pointer transition-colors ${!notification.is_read ? 'bg-primary/5 border-primary/20' : ''}`} onClick={() => { markAsRead(notification.id); if (notification.action_url) window.location.href = notification.action_url; }}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}><X className="h-3 w-3" /></Button>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: language === 'id' ? idLocale : undefined })}</p>
                        </div>
                        {!notification.is_read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
