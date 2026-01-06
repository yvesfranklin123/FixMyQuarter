"use client";

import { motion } from "framer-motion";
import { Node } from "@/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Server, HardDrive, ShieldCheck, Zap } from "lucide-react";

export function NodeCard({ node, index }: { node: Node; index: number }) {
  const maxVal = parseInt(node.max_capacity) || 10;
  const percent = Math.min((node.used_capacity / maxVal) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="w-full flex justify-center" // Assure le centrage horizontal
    >
      <Card className={`group relative w-full max-w-[320px] overflow-hidden border-slate-800 bg-slate-900/40 backdrop-blur-md transition-all duration-500 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 ${
        node.is_full ? "ring-1 ring-rose-500/50 bg-rose-950/10" : ""
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${node.status === 'ONLINE' ? 'bg-blue-500/10' : 'bg-slate-800'}`}>
              <Server className={`h-5 w-5 ${node.status === 'ONLINE' ? 'text-blue-400' : 'text-slate-500'}`} />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-white tracking-tight">{node.id}</CardTitle>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">{node.ip}</p>
            </div>
          </div>
          <Badge variant="outline" className={`${node.is_full ? "border-rose-500 text-rose-400 bg-rose-500/10" : "border-blue-500/20 text-blue-400 bg-blue-500/5"}`}>
            {node.is_full ? "FULL" : node.status}
          </Badge>
        </CardHeader>
        
        <CardContent className="relative space-y-5 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold tracking-tight">
              <span className="text-slate-400 uppercase">Capacity</span>
              <span className={node.is_full ? "text-rose-400" : "text-blue-400"}>{percent.toFixed(1)}%</span>
            </div>
            <Progress value={percent} className={`h-1.5 bg-slate-800 ${node.is_full ? "[&>div]:bg-rose-500" : "[&>div]:bg-blue-500"}`} />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>{node.used_capacity.toFixed(2)} GB</span>
              <span>{node.max_capacity}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
             <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 tracking-tighter">
                <ShieldCheck className={`h-3.5 w-3.5 ${node.status === 'ONLINE' ? 'text-emerald-500' : 'text-slate-600'}`} />
                {node.status === 'ONLINE' ? 'Secure' : 'Unstable'}
             </div>
             <Zap className={`h-3.5 w-3.5 ${node.status === 'ONLINE' ? 'text-blue-500' : 'text-slate-700'}`} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}