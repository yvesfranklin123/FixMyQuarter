'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { 
  NameType, 
  ValueType 
} from 'recharts/types/component/DefaultTooltipContent';
import { motion } from 'framer-motion';
import { TrendingUp, Database } from 'lucide-react';

interface StorageData {
  date: string;
  used: number; // en GB
}

/**
 * Tooltip Personnalisé avec Typage Fixé
 * On utilise ValueType et NameType pour satisfaire TS sur payload et label
 */
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-3 shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
          <p className="text-sm font-black text-gray-900 dark:text-white">
            {payload[0].value} <span className="font-medium text-xs text-muted-foreground">GB</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function StorageChart({ data }: { data: StorageData[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group h-[400px] w-full bg-white dark:bg-gray-950 p-6 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
    >
      {/* Glow Effect Background */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <Database className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
              Analyse de Croissance
            </h3>
            <p className="text-xs text-muted-foreground font-medium">Consommation de l'infrastructure</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">+12.5%</span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="4 4" 
              vertical={false} 
              stroke="currentColor" 
              className="text-gray-100 dark:text-gray-800/50" 
            />
            
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
              dy={15}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
            />
            
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{
                stroke: '#3b82f6',
                strokeWidth: 2,
                strokeDasharray: '6 6'
              }}
            />
            
            <Area 
              type="monotone" 
              dataKey="used" 
              stroke="#3b82f6" 
              strokeWidth={4}
              strokeLinecap="round"
              fillOpacity={1} 
              fill="url(#colorUsed)" 
              animationDuration={2500}
              activeDot={{
                r: 6,
                strokeWidth: 0,
                fill: '#3b82f6',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend / Stats Grid */}
      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Stockage Utilisé</span>
        </div>
        <div className="flex items-center gap-2 opacity-40">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Capacité Max</span>
        </div>
      </div>
    </motion.div>
  );
}