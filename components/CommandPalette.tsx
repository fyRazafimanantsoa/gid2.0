
import React, { useState } from 'react';
import { Page } from '../types';

interface CommandPaletteProps {
  pages: Page[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ pages, onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  
  const filtered = pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.blocks.some(b => b.content.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-24 px-6 lg:pt-32">
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300">
        <div className="p-6 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-4 px-2">
            <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Jump to context..."
              className="w-full bg-transparent border-none focus:ring-0 text-lg font-bold text-zinc-900 dark:text-white placeholder-zinc-300"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto max-h-[60vh] p-4 custom-scrollbar">
          {filtered.map(p => (
            <button 
              key={p.id}
              onClick={() => { onSelect(p.id); onClose(); }}
              className="w-full text-left px-5 py-4 rounded-[1.8rem] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group flex items-center justify-between"
            >
              <div className="flex flex-col min-w-0 pr-4">
                <span className="text-sm font-black text-zinc-800 dark:text-zinc-100 group-hover:text-cyan-500 transition-colors">{p.title || 'Untitled'}</span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{p.blocks.length} blocks</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
