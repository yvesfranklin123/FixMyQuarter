"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Node } from "@/shared/types";
import { NodeCard } from "@/modules/nodes/components/NodeCard";
import { CreateNodeDialog } from "@/modules/nodes/components/CreateNodeDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, Layers, LogOut, LayoutDashboard, 
  Zap, ShieldCheck, Activity, Cpu, Globe, 
  Database, Search, Filter, Trash2, FolderOpen
} from "lucide-react";
import Link from "next/link";

// --- COMPOSANT ARRIÈRE-PLAN ANIMÉ ---
const AnimatedParticles = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="fixed inset-0 bg-[#0f172a]" />;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/5 rounded-full blur-3xl"
          initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", scale: Math.random() * 1.5 }}
          animate={{ y: ["-10%", "110%"], opacity: [0, 0.3, 0] }}
          transition={{ duration: Math.random() * 15 + 10, repeat: Infinity, ease: "linear" }}
          style={{ width: '120px', height: '120px' }}
        />
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"id" | "load">("id");
  const [systemStatus, setSystemStatus] = useState("Initializing...");
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const { toast } = useToast();

  // Correction Hydratation : L'heure n'est affichée qu'après le montage client
  useEffect(() => {
    setLastSyncTime(new Date().toLocaleTimeString());
  }, []);

  // --- FILTRAGE ET TRI ---
  const filteredNodes = useMemo(() => {
    let result = nodes.filter(node => 
      node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.ip.includes(searchQuery)
    );

    if (sortBy === "load") {
      result = [...result].sort((a, b) => {
        const loadA = a.used_capacity / (parseInt(a.max_capacity) || 1);
        const loadB = b.used_capacity / (parseInt(b.max_capacity) || 1);
        return loadB - loadA;
      });
    }
    return result;
  }, [nodes, searchQuery, sortBy]);

  // --- STATISTIQUES GLOBALES ---
  const stats = useMemo(() => {
    const total = nodes.reduce((acc, n) => acc + (parseInt(n.max_capacity) || 0), 0);
    const used = nodes.reduce((acc, n) => acc + n.used_capacity, 0);
    return {
      total,
      used,
      load: total > 0 ? (used / total) * 100 : 0,
      online: nodes.filter(n => n.status === "ONLINE").length
    };
  }, [nodes]);

  // --- ACTIONS ---
  const fetchNodes = async () => {
    setLoading(true);
    try {
      setSystemStatus("gRPC Gateway: Syncing...");
      const res = await axios.get("/api/nodes");
      setNodes(res.data);
      setSystemStatus("gRPC Gateway: Connected");
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      setSystemStatus("Service Offline");
      toast({ variant: "destructive", title: "RPC Error", description: "Gateway timeout." });
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIQUE DE SUPPRESSION AMÉLIORÉE ---
  const deleteNode = async (id: string) => {
    try {
      // 1. Appel API réel (DELETE /api/nodes/:id)
      await axios.delete(`/api/nodes/${id}`);
      
      // 2. Mise à jour immédiate du State local (Déclenche l'animation de sortie)
      setNodes((prev) => prev.filter((n) => n.id !== id));

      // 3. Notification de succès
      toast({ 
        title: "Termination Successful", 
        description: `Node ${id} has been decommissioned from the mesh.` 
      });
      
    } catch (err: any) {
      console.error("Deletion Error:", err);
      toast({ 
        variant: "destructive", 
        title: "System Refusal", 
        description: err.response?.data?.message || "The gRPC Agent rejected the termination signal." 
      });
    }
  };

  const openFileExplorer = (nodeId: string) => {
    toast({ title: "Explorer", description: `Browsing data on ${nodeId}...` });
  };

  useEffect(() => { fetchNodes(); }, []);

  return (
    <div className="relative min-h-screen bg-[#0f172a] text-slate-100 selection:bg-blue-500/30 overflow-x-hidden font-sans">
      <AnimatedParticles />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.15),transparent)] z-0" />
      
      <div className="relative z-10">
        <nav className="border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl shadow-lg shadow-blue-900/20">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-white uppercase italic">Nexus<span className="text-blue-500">Cloud</span></span>
            </div>

            <div className="flex items-center gap-6">
              <div className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${systemStatus.includes("Connected") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                <div className={`h-2 w-2 rounded-full ${systemStatus.includes("Connected") ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{systemStatus}</span>
              </div>
              <Link href="/"><Button variant="ghost" size="sm" className="text-slate-400 hover:text-white font-bold transition-all"><LogOut className="h-4 w-4 mr-2" /> Logout</Button></Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto p-8 space-y-12 pb-24">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
               <div className="inline-flex items-center gap-2 text-blue-400 font-bold text-[10px] tracking-[0.4em] uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                 <LayoutDashboard className="h-3.5 w-3.5" /> Management Console
               </div>
               <h1 className="text-5xl font-black tracking-tight text-white leading-tight">Cluster <br/> Infrastructure</h1>
            </div>
            <div className="flex items-center gap-6 bg-slate-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
              <div className="text-right border-r border-white/10 pr-6">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Latency</p>
                <p className="text-sm font-mono text-emerald-400">0.24ms</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Last Sync</p>
                <p className="text-sm font-mono text-blue-400">{lastSyncTime || "--:--:--"}</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Total Capacity", value: `${stats.total} GB`, icon: Database, color: "text-blue-500" },
              { label: "Storage Used", value: `${stats.used.toFixed(1)} GB`, icon: Cpu, color: "text-indigo-400" },
              { label: "Global Load", value: `${stats.load.toFixed(1)}%`, icon: Activity, color: stats.load > 85 ? "text-rose-500" : "text-emerald-400" },
              { label: "Live Nodes", value: `${stats.online}/${nodes.length}`, icon: Globe, color: "text-sky-400" }
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-slate-900/30 border border-white/5 p-6 rounded-[2.5rem] backdrop-blur-sm group hover:border-blue-500/30 transition-all shadow-xl"
              >
                <div className={`p-3 w-fit rounded-2xl bg-white/5 mb-4 group-hover:scale-110 transition-transform ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/20 p-4 rounded-[2rem] border border-white/5">
            <div className="flex flex-1 gap-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input placeholder="Search Node ID..." className="pl-12 bg-slate-950/50 border-white/10 h-14 rounded-2xl focus:ring-blue-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Button variant="outline" className={`h-14 px-6 rounded-2xl border-white/10 font-bold ${sortBy === 'load' ? 'bg-blue-600' : ''}`} onClick={() => setSortBy(sortBy === 'id' ? 'load' : 'id')}>
                <Filter className="h-4 w-4 mr-2" /> {sortBy === 'load' ? 'Load' : 'ID'}
              </Button>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button onClick={fetchNodes} variant="outline" className="bg-slate-900/50 h-14 px-6 rounded-2xl hover:bg-slate-800 transition-all font-bold">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Sync
              </Button>
              <CreateNodeDialog onSuccess={fetchNodes} />
            </div>
          </div>

          {/* --- GRILLE AVEC ANIMATION DE DÉSINTÉGRATION --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
            <AnimatePresence mode="popLayout">
              {filteredNodes.map((node, index) => (
                <motion.div 
                  key={node.id} 
                  layout // Indispensable pour que les voisins glissent fluidement
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.2, 
                    rotate: 15,
                    filter: "blur(20px)",
                    transition: { duration: 0.4, ease: "backIn" } 
                  }}
                  className="relative group w-full"
                >
                  <NodeCard node={node} index={index} />
                  
                  {/* Overlay d'actions */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 translate-y-2 group-hover:translate-y-0 z-20">
                     <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-9 w-9 rounded-xl shadow-2xl bg-slate-800 border border-white/10 hover:bg-blue-600"
                      onClick={() => openFileExplorer(node.id)}
                     >
                       <FolderOpen className="h-4 w-4" />
                     </Button>
                     <Button 
                      size="icon" 
                      variant="destructive" 
                      className="h-9 w-9 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                      onClick={() => deleteNode(node.id)}
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}