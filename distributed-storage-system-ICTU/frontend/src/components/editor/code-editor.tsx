'use client';

import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { 
  Loader2, 
  Code2, 
  Terminal, 
  ShieldCheck, 
  Circle,
  FileCode2,
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  value: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  fileName?: string;
}

export function CodeEditor({ 
  value, 
  language = 'python', 
  onChange, 
  readOnly = false,
  fileName = 'script.py'
}: CodeEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col w-full h-[650px] bg-[#1e1e1e] rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden transition-all duration-500 hover:border-blue-500/30"
    >
      {/* BARRE DE TITRE (WINDOW HEADER) */}
      <div className="flex items-center justify-between px-6 h-14 bg-gray-50/5 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200/10 dark:border-gray-800/50 z-20">
        <div className="flex items-center gap-4">
          {/* Mac-style buttons */}
          <div className="flex gap-2">
            <Circle className="w-3 h-3 fill-red-500 text-red-500/20" />
            <Circle className="w-3 h-3 fill-amber-500 text-amber-500/20" />
            <Circle className="w-3 h-3 fill-emerald-500 text-emerald-500/20" />
          </div>
          
          <div className="h-4 w-[1px] bg-gray-700 mx-2" />
          
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">
              {fileName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {readOnly && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <ShieldCheck className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-tighter">Read Only</span>
            </div>
          )}
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{language}</span>
          </div>
        </div>
      </div>

      {/* ZONE D'ÉDITION */}
      <div className="relative flex-1 w-full overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage={language}
          defaultValue={value}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onChange={onChange}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex flex-col items-center justify-center h-full bg-[#1e1e1e] space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Initialisation du noyau...</span>
            </div>
          }
          options={{
            minimap: { enabled: true, scale: 0.75, side: 'right' },
            fontSize: 14,
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            fontWeight: "500",
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: readOnly,
            automaticLayout: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            renderLineHighlight: "all",
            smoothScrolling: true,
            padding: { top: 20, bottom: 20 },
            bracketPairColorization: { enabled: true },
            suggestOnTriggerCharacters: true,
            formatOnPaste: true,
            wordWrap: "on"
          }}
        />
      </div>

      {/* BARRE D'ÉTAT (FOOTER) */}
      <div className="flex items-center justify-between px-6 h-10 bg-gray-50/5 dark:bg-gray-900 border-t border-gray-200/10 dark:border-gray-800/50 z-20">
        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-emerald-500" />
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-purple-500" />
            <span>NexusEngine v2.0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Connecté</span>
           </div>
        </div>
      </div>

      {/* Glow décoratif */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />
    </motion.div>
  );
}