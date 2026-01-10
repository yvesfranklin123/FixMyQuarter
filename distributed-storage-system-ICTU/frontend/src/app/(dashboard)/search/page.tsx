'use client';

import { useState } from 'react';
import { 
  Search as SearchIcon, 
  Filter, 
  LayoutGrid, 
  List as ListIcon, 
  FileSearch, 
  Zap, 
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileGrid } from '@/components/drive/file-grid';
import { useAppStore } from '@/store/use-app-store';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const { viewMode, setViewMode, setFiles } = useAppStore();
  const [localQuery, setLocalQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // --- LOGIQUE DE RECHERCHE DÉDIÉE ---
  const handleDeepSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.length < 2) return;

    setIsSearching(true);
    try {
      const res = await api.get(`/search/files?query=${localQuery}`);
      setFiles(res.data);
    } catch (err) {
      console.error("Deep Search Error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setLocalQuery('');
    // Optionnel : Recharger la racine
  };

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      
      {/* 1. HEADER : CONSOLE DE RECHERCHE */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-zinc-900 border border-white/5 rounded-[1.8rem] shadow-2xl relative group">
            <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-100" />
            <FileSearch className="w-8 h-8 text-blue-500 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Scanner Global</span>
               <div className="w-1 h-1 rounded-full bg-zinc-800" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Nexus Indexer</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">
              Deep Search
            </h1>
          </div>
        </div>

        {/* BARRE DE RECHERCHE LOCALE */}
        <form onSubmit={handleDeepSearch} className="relative group max-w-2xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2rem] blur opacity-75 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200" />
          <div className="relative flex items-center bg-zinc-950 border border-white/10 rounded-[1.8rem] overflow-hidden p-2">
            <SearchIcon className="w-5 h-5 text-zinc-600 ml-4" />
            <Input 
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Nom du fragment, extension, métadonnées..."
              className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-zinc-700 font-bold tracking-wide h-12"
            />
            {localQuery && (
                <button 
                  type="button" 
                  onClick={clearSearch}
                  className="p-2 hover:bg-white/5 rounded-full mr-2 text-zinc-500"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
            <button 
              type="submit"
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lancer le Scan'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. BARRE D'OUTILS DE FILTRAGE */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-zinc-500">
                <Filter className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Filtres Actifs :</span>
            </div>
            <div className="flex gap-2">
                {['Images', 'Docs', 'Videos'].map(filter => (
                    <span key={filter} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-bold text-zinc-400 uppercase tracking-tighter hover:border-blue-500/50 cursor-pointer transition-colors">
                        {filter}
                    </span>
                ))}
            </div>
        </div>

        <div className="flex items-center bg-zinc-900/50 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setViewMode('grid')}
            className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-blue-600 text-white" : "text-zinc-600 hover:text-white")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-blue-600 text-white" : "text-zinc-600 hover:text-white")}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. RÉSULTATS */}
      <section>
        <div className="flex items-center gap-3 mb-8">
            <Zap className="w-4 h-4 text-blue-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Résultats du cluster</h2>
        </div>

        <AnimatePresence mode="wait">
          <FileGrid folderId="root" isLoading={isSearching} />
        </AnimatePresence>
      </section>

    </div>
  );
}