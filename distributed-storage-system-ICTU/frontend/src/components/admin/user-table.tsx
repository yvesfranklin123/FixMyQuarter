'use client';

import { User } from '@/types/user';
import { formatBytes, cn } from '@/lib/utils';
import { 
  MoreHorizontal, Shield, Trash2, Ban, 
  User as UserIcon, Mail, HardDrive, activity
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Helper pour la couleur de la barre de stockage
const getStorageColor = (used: number, limit: number) => {
  const ratio = used / limit;
  if (ratio > 0.9) return "bg-red-500";
  if (ratio > 0.7) return "bg-orange-500";
  return "bg-blue-600";
};

export function UserTable({ users }: { users: User[] }) {
  return (
    <div className="w-full relative overflow-hidden rounded-[2rem] border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-xl shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-muted-foreground">Utilisateur</th>
            <th className="px-6 py-5 text-xs uppercase tracking-widest font-black text-muted-foreground">Privilèges</th>
            <th className="px-6 py-5 text-xs uppercase tracking-widest font-black text-muted-foreground">Consommation</th>
            <th className="px-8 py-5 text-xs uppercase tracking-widest font-black text-muted-foreground text-right">Contrôle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
          {users.map((user) => {
            const storagePercent = (user.used_storage / user.storage_limit) * 100;
            const initials = user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();

            return (
              <tr key={user.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all duration-300">
                {/* Utilisateur Identity */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {user.full_name}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Statut & Role */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      user.is_active 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                    )}>
                      {user.is_active ? "Actif" : "Banni"}
                    </span>
                    {user.is_superuser && (
                      <div className="p-1.5 bg-blue-500/10 rounded-lg" title="Administrateur">
                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                    )}
                  </div>
                </td>

                {/* Storage Meter */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2 w-48">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <HardDrive className="w-3 h-3" /> Quota
                      </span>
                      <span className={cn(storagePercent > 90 ? "text-red-500" : "text-gray-900 dark:text-white")}>
                        {Math.round(storagePercent)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                      <div 
                        className={cn("h-full transition-all duration-1000", getStorageColor(user.used_storage, user.storage_limit))} 
                        style={{ width: `${storagePercent}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {formatBytes(user.used_storage)} utilisés sur {formatBytes(user.storage_limit)}
                    </span>
                  </div>
                </td>

                {/* Actions Menu */}
                <td className="px-8 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2.5 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-2xl transition-all outline-none shadow-none hover:shadow-xl">
                      <MoreHorizontal className="w-5 h-5 text-gray-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-gray-200 dark:border-gray-800 shadow-2xl">
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-1.5">Gestion du compte</DropdownMenuLabel>
                      <DropdownMenuItem className="rounded-xl focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:text-blue-600 cursor-pointer">
                        Voir l'activité
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:text-blue-600 cursor-pointer">
                        Modifier le quota
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-2 bg-gray-100 dark:bg-gray-800" />
                      <DropdownMenuItem className="rounded-xl text-orange-600 focus:bg-orange-50 dark:focus:bg-orange-900/20 cursor-pointer">
                        <Ban className="w-4 h-4 mr-2"/> Suspendre l'accès
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer">
                        <Trash2 className="w-4 h-4 mr-2"/> Supprimer définitivement
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Empty State Footer (Optionnel) */}
      {users.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
          <UserIcon className="w-12 h-12 mb-4 opacity-10" />
          <p className="text-sm font-medium">Aucun utilisateur trouvé</p>
        </div>
      )}
    </div>
  );
}