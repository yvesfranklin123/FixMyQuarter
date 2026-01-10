'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // Assure-toi que cn est importé ici

interface BreadcrumbItem {
  id: string;
  name: string;
}

// L'EXPORT DOIT ÊTRE EXACTEMENT COMME CECI :
export function FolderBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-1 bg-zinc-900/40 backdrop-blur-md p-1.5 rounded-2xl w-fit border border-white/5">
      <Link 
        href="/drive" 
        className={cn(
          "p-2 rounded-xl transition-all duration-200 group",
          pathname === '/drive' 
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
            : "text-zinc-500 hover:bg-white/5 hover:text-white"
        )}
      >
        <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={item.id} className="flex items-center space-x-1">
            <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
            <Link 
              href={`/drive/${item.id}`}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200",
                isLast 
                  ? "bg-zinc-800 text-blue-400 shadow-inner border border-white/5" 
                  : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
              )}
            >
              {item.name}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}