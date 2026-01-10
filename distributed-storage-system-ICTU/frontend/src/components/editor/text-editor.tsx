'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bold, Italic, List, ListOrdered, 
  Quote, Redo2, Undo2, Users2, Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextEditorProps {
  docId: string;
  username: string;
}

export function TextEditor({ docId, username }: TextEditorProps) {
  // 1. Initialisation stable de Yjs
  const { ydoc, provider } = useMemo(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1234', 
      docId, 
      ydoc
    );
    return { ydoc, provider };
  }, [docId]);

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        history: false, // Désactivé car géré par Yjs
      }),
      Collaboration.configure({ 
        document: ydoc 
      }),
      CollaborationCursor.configure({
        provider,
        user: { 
          name: username, 
          color: '#' + Math.floor(Math.random()*16777215).toString(16) 
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert max-w-none focus:outline-none",
          "min-h-[600px] p-12 lg:p-20",
          "bg-white dark:bg-gray-950 rounded-[2.5rem]",
          "border border-gray-200 dark:border-gray-800 shadow-2xl transition-all"
        ),
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 2. HEADER DE COLLABORATION */}
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <Zap className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
              NexusNode_{docId.slice(0, 4)}
            </h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Synchronisé en temps réel</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex -space-x-2 overflow-hidden">
            {/* Ici on pourrait mapper les users connectés via provider.awareness */}
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-900 bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              {username.slice(0, 2)}
            </div>
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <Users2 className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. BARRE D'OUTILS FLOTTANTE */}
      <div className="sticky top-4 z-30 flex justify-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-1 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl"
        >
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800 mx-1" />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="w-4 h-4" />
          </ToolbarButton>
        </motion.div>
      </div>

      {/* 4. ZONE D'ÉDITION PRINCIPALE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <EditorContent editor={editor} />
        
        {/* Décoration de fond */}
        <div className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
}

// Sous-composant pour les boutons de la barre d'outils
function ToolbarButton({ 
  children, 
  onClick, 
  active = false 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  active?: boolean 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 rounded-xl transition-all duration-200",
        active 
          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground hover:text-gray-900 dark:hover:text-white"
      )}
    >
      {children}
    </button>
  );
}