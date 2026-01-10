'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Activity,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { api } from '@/lib/api';

export default function FinancePage() {
  const [financeData, setFinanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Données de simulation pour le graphique (à lier à ton backend plus tard)
  const revenueData = [
    { month: 'JAN', amount: 4200 },
    { month: 'FEB', amount: 3800 },
    { month: 'MAR', amount: 5100 },
    { month: 'APR', amount: 4900 },
    { month: 'MAY', amount: 6200 },
    { month: 'JUN', amount: 7500 },
  ];

  const transactions = [
    { id: 'TX-9842', user: 'alice@nexus.com', plan: 'Pro Node', amount: '+29.99€', status: 'SUCCESS', date: 'Il y a 2 min' },
    { id: 'TX-9841', user: 'bob@orbit.io', plan: 'Enterprise', amount: '+149.00€', status: 'SUCCESS', date: 'Il y a 15 min' },
    { id: 'TX-9840', user: 'malware@bot.net', plan: 'Basic', amount: '0.00€', status: 'REJECTED', date: 'Il y a 42 min' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Flux Financiers</h1>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Moniteur de revenus MRR & Transactions</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-zinc-400">
            <Download className="w-3 h-3" /> Export Ledger
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <Filter className="w-3 h-3" /> Configurer Plans
          </button>
        </div>
      </div>

      {/* 2. STATS RAPIDES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/40 border-white/5 rounded-[2rem] p-8 relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <div className="p-3 w-fit rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Monthly Recurring Revenue</p>
                <h3 className="text-3xl font-black italic tracking-tighter text-white">12,500.42€</h3>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
              <ArrowUpRight className="w-3 h-3" /> +12.4%
            </span>
          </div>
        </Card>

        <Card className="bg-zinc-900/40 border-white/5 rounded-[2rem] p-8 relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <div className="p-3 w-fit rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Abonnements Actifs</p>
                <h3 className="text-3xl font-black italic tracking-tighter text-white">1,248</h3>
              </div>
            </div>
            <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg italic">
              Level_03
            </span>
          </div>
        </Card>

        <Card className="bg-zinc-900/40 border-white/5 rounded-[2rem] p-8 relative overflow-hidden text-red-600">
            <div className="absolute inset-0 bg-red-600/[0.02] animate-pulse" />
            <div className="relative z-10 space-y-4">
              <div className="p-3 w-fit rounded-2xl bg-red-600/10 border border-red-600/20">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-red-600/50">Taux de Churn</p>
                <h3 className="text-3xl font-black italic tracking-tighter text-white">0.8%</h3>
              </div>
            </div>
        </Card>
      </div>

      {/* 3. GRAPHIQUE DE REVENUS */}
      <Card className="bg-zinc-900/20 border-white/5 rounded-[3rem] p-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <TrendingUp className="text-emerald-500" />
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white">Analyse de Croissance Semestrielle</h4>
          </div>
          <div className="flex gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Live Ledger</span>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="month" stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#ffffff05'}}
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {revenueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === revenueData.length - 1 ? '#10b981' : '#3f3f46'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 4. DERNIÈRES TRANSACTIONS */}
      <div className="space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 ml-4">Registres de paiement récents</h4>
        <div className="grid gap-4">
          {transactions.map((tx, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className={`w-2 h-2 rounded-full ${tx.status === 'SUCCESS' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-600 shadow-[0_0_10px_#dc2626]'}`} />
                <div className="space-y-1">
                  <p className="text-xs font-black text-white uppercase tracking-tighter italic">{tx.user}</p>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{tx.id} • {tx.plan}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-black text-white">{tx.amount}</p>
                <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">{tx.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}