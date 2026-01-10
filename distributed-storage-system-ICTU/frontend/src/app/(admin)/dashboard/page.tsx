'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Users, Database, Zap, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatBytes } from '@/lib/utils';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (error) {
        console.error("Nexus Error: Failed to fetch core metrics", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Initialisation du noyau...</p>
    </div>
  );

  const stats = [
    { 
      label: 'Utilisateurs Totaux', 
      value: data?.total_users?.toLocaleString() || '0', 
      trend: `+${data?.active_users_24h} Actifs`, 
      icon: Users, 
      color: 'text-blue-500' 
    },
    { 
      label: 'Infrastructure', 
      value: `${data?.nodes_online} / ${data?.nodes_total}`, 
      trend: 'Nœuds Online', 
      icon: Zap, 
      color: 'text-amber-500' 
    },
    { 
      label: 'Données Indexées', 
      value: formatBytes(data?.total_storage_used_gb * 1024 * 1024 * 1024 || 0), 
      trend: 'Volume Global', 
      icon: Database, 
      color: 'text-purple-500' 
    },
    { 
      label: 'Flux financier', 
      value: `${data?.total_revenue_mrr?.toLocaleString()} €`, 
      trend: 'MRR Stable', 
      icon: Activity, 
      color: 'text-emerald-500' 
    },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <Card key={s.label} className="bg-zinc-900/40 border-white/5 rounded-[2rem] hover:border-red-600/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-8 space-y-4">
              <div className="flex justify-between items-center">
                <div className={`p-3 rounded-2xl bg-black border border-white/5 group-hover:border-red-600/50 transition-colors ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{s.trend}</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{s.label}</p>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase mt-1 text-white">{s.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900/20 border-white/5 rounded-[3rem] h-[500px] relative overflow-hidden flex items-center justify-center border-dashed">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.05),transparent_70%)]" />
        <div className="text-center space-y-4 relative z-10">
          <div className="relative">
            <Activity className="w-12 h-12 text-red-600 mx-auto animate-pulse" />
            <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full" />
          </div>
          <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-500">Live Traffic Monitor</h4>
          <p className="text-[9px] font-bold text-red-600/60 uppercase tracking-widest">Scanning Network Clusters...</p>
        </div>
      </Card>
    </div>
  );
}