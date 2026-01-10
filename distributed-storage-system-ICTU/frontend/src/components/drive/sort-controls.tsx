'use client';

import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  ArrowUpAz, 
  Calendar, 
  Database,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/use-app-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

export function SortControls() {
  const { viewMode, setViewMode } = useAppStore();

  return (
    <div className="flex items-center justify-between bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl p-2 rounded-[1.5rem] border border-gray-200 dark:border-gray-800 shadow-xl">
      
      {/* SEGMENTED CONTROL : VIEW MODE */}
      <div className="relative flex bg-gray-100/50 dark:bg-gray-900/50 p-1 rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
        {/* Pilule coulissante animée */}
        <motion.div
          layout
          className="absolute inset-y-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm z-0"
          initial={false}
          animate={{
            x: viewMode === 'grid' ? 0 : '100%',
            width: 'calc(50% - 4px)'
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        <button 
          onClick={() => setViewMode('grid')}
          className={cn(
            "relative z-10 flex items-center justify-center h-8 w-10 transition-colors",
            viewMode === 'grid' ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground hover:text-gray-900 dark:hover:text-white"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        <button 
          onClick={() => setViewMode('list')}
          className={cn(
            "relative z-10 flex items-center justify-center h-8 w-10 transition-colors",
            viewMode === 'list' ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground hover:text-gray-900 dark:hover:text-white"
          )}
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* DROPDOWN : SORT OPTIONS */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-2xl h-10 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3 group transition-all"
          >
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-500 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-700 dark:text-gray-300">
                Trier par
              </span>
            </div>
            <div className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
              Nom
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-gray-200 dark:border-gray-800 shadow-2xl">
          <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Critère de tri
          </DropdownMenuLabel>
          
          <DropdownMenuItem className="rounded-xl flex items-center justify-between py-2.5 cursor-pointer">
            <div className="flex items-center gap-3">
              <ArrowUpAz className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-sm">Nom du fichier</span>
            </div>
            <Check className="w-4 h-4 text-blue-500" />
          </DropdownMenuItem>

          <DropdownMenuItem className="rounded-xl flex items-center justify-between py-2.5 cursor-pointer">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-sm">Taille</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className="rounded-xl flex items-center justify-between py-2.5 cursor-pointer">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-sm">Date de modification</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuItem className="rounded-xl flex items-center gap-3 py-2.5 cursor-pointer">
            <div className="flex flex-col">
              <span className="font-bold text-xs uppercase tracking-widest">Ordre décroissant</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}