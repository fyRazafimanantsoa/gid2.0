
import React, { useState } from 'react';
import { Page } from '../types';

interface LinkSelectorProps {
  pages: Page[];
  onSelect: (pageId: string, blockId?: string, type?: 'live' | 'snapshot') => void;
  onClose: () => void;
}

export const LinkSelector: React.FC<LinkSelectorProps> = ({ pages, onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const filteredPages = pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  const selectedPage = pages.find(p => p.id === selectedPageId);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-6">
          <span className="text-3xl">🔗</span>
          <div className="flex-1">
            <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Synapse System</h3>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Select a context to bridge</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-300 hover:text-zinc-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {!selectedPageId ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-6">
              <input 
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search across your knowledge..."
                className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
              {filteredPages.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setSelectedPageId(p.id)}
                  className="w-full flex items-center justify-between p-5 rounded-[1.8rem] bg-zinc-50/50 dark:bg-zinc-900/30 border border-transparent hover:border-cyan-500/20 hover:bg-white dark:hover:bg-zinc-900 transition-all text-left group"
                >
                  <span className="font-bold text-zinc-700 dark:text-zinc-200">{p.title || 'Untitled Context'}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-cyan-500 uppercase tracking-widest transition-opacity">Select →</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <button onClick={() => setSelectedPageId(null)} className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">← Back</button>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate max-w-[200px]">Bridge: "{selectedPage?.title}"</span>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => onSelect(selectedPageId, undefined, 'live')}
                  className="p-8 rounded-[2rem] border-2 border-cyan-500 bg-cyan-500/5 text-center transition-all hover:scale-[1.02] active:scale-95 group"
                >
                  <span className="text-3xl mb-4 block group-hover:animate-pulse">🛰️</span>
                  <span className="block font-black text-xs uppercase tracking-widest text-cyan-500 mb-1">Embed Live</span>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">Bi-directional Sync</span>
                </button>
                <button 
                  onClick={() => onSelect(selectedPageId, undefined, 'snapshot')}
                  className="p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-center transition-all hover:border-zinc-300 active:scale-95 group"
                >
                  <span className="text-3xl mb-4 block group-hover:rotate-12 transition-transform">📸</span>
                  <span className="block font-black text-xs uppercase tracking-widest text-zinc-500 mb-1">Insert Snapshot</span>
                  <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-tighter">Static Copy</span>
                </button>
              </div>
              
              {selectedPage?.blocks.length! > 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Or select specific block:</span>
                  <div className="space-y-2">
                    {selectedPage?.blocks.filter(b => b.content.trim()).map(b => (
                      <button 
                        key={b.id}
                        onClick={() => onSelect(selectedPageId, b.id, 'live')}
                        className="w-full text-left p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-transparent hover:border-cyan-500/20 transition-all text-sm text-zinc-600 dark:text-zinc-400 truncate font-medium"
                      >
                        {b.type.toUpperCase()}: {b.content}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
