'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Check, Trash2, Info, AlertTriangle, Zap, ExternalLink, Loader2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'system';
  is_read: boolean;
  created_at: string;
  link?: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // --- RÉCUPÉRATION DES NOTIFICATIONS ---
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Nexus Notif Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optionnel : Polling toutes les 60 secondes pour les nouvelles alertes
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- ACTION : MARQUER COMME LU ---
  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error("Read Error:", err);
    }
  };

  // --- STYLE SELON LE TYPE ---
  const getNotifStyle = (type: string) => {
    switch (type) {
      case 'warning': return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'success': return { icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'system': return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      default: return { icon: Info, color: 'text-zinc-400', bg: 'bg-white/5' };
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2.5 text-zinc-500 hover:text-white transition-all group outline-none">
          <Bell className={cn("w-5 h-5 transition-transform", unreadCount > 0 && "group-hover:rotate-12")} />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-96 bg-zinc-950/90 backdrop-blur-2xl border-white/10 rounded-[2rem] p-4 mt-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-2 pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Flux de signaux</span>
            <span className="text-sm font-black italic text-white uppercase tracking-tighter">Notifications</span>
          </div>
          {unreadCount > 0 && (
            <div className="bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
              <span className="text-[8px] font-black text-blue-500 uppercase">{unreadCount} Nouveaux</span>
            </div>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/5 mb-2" />

        <div className="max-h-[400px] overflow-y-auto pr-2 no-scrollbar space-y-2">
          {isLoading ? (
            <div className="py-10 flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Scan du réseau...</span>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => {
              const style = getNotifStyle(notif.type);
              return (
                <DropdownMenuItem 
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={cn(
                    "relative flex flex-col items-start gap-1 p-4 rounded-2xl border border-transparent transition-all cursor-pointer focus:bg-white/5 focus:border-white/10",
                    !notif.is_read && "bg-blue-500/[0.03] border-blue-500/10"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg", style.bg)}>
                        <style.icon className={cn("w-3.5 h-3.5", style.color)} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white leading-none">
                        {notif.title}
                      </span>
                    </div>
                    <span className="text-[8px] font-bold text-zinc-600 uppercase">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  
                  <p className="text-xs text-zinc-500 leading-relaxed pl-8 pr-4">
                    {notif.message}
                  </p>

                  {notif.link && (
                    <button className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase tracking-tighter pl-8 mt-1 hover:text-blue-400">
                      Ouvrir le fragment <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}

                  {!notif.is_read && (
                    <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(37,99,235,1)]" />
                  )}
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <BellOff className="w-5 h-5 text-zinc-700" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 leading-tight">
                Silence Réseau <br /> Aucun signal entrant
              </p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-white/5 mt-4" />
            <div className="pt-2">
              <Button 
                variant="ghost" 
                className="w-full rounded-xl h-10 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5"
              >
                Tout marquer comme lu
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}