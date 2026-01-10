'use client';

import { useEffect, useState } from 'react';
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  Search, 
  Zap, 
  AlertTriangle, 
  Info, 
  Clock, 
  ExternalLink,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'system';
  is_read: boolean;
  created_at: string;
  link?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Signal Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      // On suppose une route groupée ou on boucle sur les non-lus
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => api.post(`/notifications/${n.id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast({ title: "Flux synchronisé", description: "Toutes les alertes sont marquées comme lues." });
    } catch (err) {
      toast({ variant: "destructive", title: "Erreur de sync" });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <Zap className="w-5 h-5 text-emerald-500" />;
      case 'system': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="p-8 space-y-10 max-w-5xl mx-auto">
      
      {/* HEADER ONYX */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-zinc-900 border border-white/5 rounded-[1.8rem] shadow-2xl relative group">
            <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bell className="w-8 h-8 text-white relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Signal Center</span>
               <div className="w-1 h-1 rounded-full bg-zinc-800" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Live Feed</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">Notifications</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={markAllAsRead}
            variant="ghost" 
            className="rounded-xl font-black uppercase text-[9px] tracking-[0.2em] text-zinc-500 hover:text-white hover:bg-white/5"
          >
            <CheckCheck className="w-4 h-4 mr-2 text-blue-500" /> Tout marquer comme lu
          </Button>
        </div>
      </div>

      {/* FEED DE NOTIFICATIONS */}
      <div className="relative">
        {/* Ligne verticale de timeline */}
        <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent hidden md:block" />

        <div className="space-y-4 relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Interception des signaux...</p>
            </div>
          ) : notifications.length > 0 ? (
            <AnimatePresence>
              {notifications.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn(
                    "group relative p-6 bg-zinc-950/40 border-white/5 hover:border-white/10 transition-all rounded-[2rem] flex flex-col md:flex-row md:items-center gap-6 overflow-hidden",
                    !notif.is_read && "bg-blue-600/[0.02] border-blue-500/10"
                  )}>
                    {/* Indicateur de lecture (Glow) */}
                    {!notif.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                    )}

                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 shrink-0 shadow-inner">
                      {getIcon(notif.type)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors">
                          {notif.title}
                        </h3>
                        <div className="flex items-center gap-2 text-zinc-600">
                          <Clock className="w-3 h-3" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">{formatDate(notif.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-2xl">
                        {notif.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {notif.link && (
                        <Button variant="secondary" className="h-9 rounded-xl bg-white/5 hover:bg-blue-600 text-white border-none text-[9px] font-black uppercase px-4 transition-all">
                          Examiner <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="py-32 text-center bg-zinc-900/10 rounded-[4rem] border-2 border-dashed border-white/5">
                <Search className="w-12 h-12 text-zinc-800 mx-auto mb-6" />
                <h2 className="text-zinc-500 font-black uppercase tracking-[0.4em] text-xs leading-loose">
                  Secteur Silencieux <br /> Aucun signal intercepté
                </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}