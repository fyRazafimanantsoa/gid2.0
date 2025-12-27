
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Page, Block, BlockType } from '../types';
import { BlockItem } from './BlockItem';
import { CommandMenu } from './CommandMenu';
import { TEMPLATES } from '../utils/templates';
import { LinkSelector } from './LinkSelector';

interface EditorProps {
  page: Page;
  allPages: Page[];
  onUpdate: (updatedPage: Page) => void;
  onOpenSplit?: (id: string) => void;
  onJumpTo?: (id: string) => void;
  onDelete?: (id: string) => void;
  isSecondary?: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Editor: React.FC<EditorProps> = ({ 
  page, 
  allPages, 
  onUpdate, 
  onOpenSplit, 
  onJumpTo, 
  onDelete, 
  isSecondary,
  darkMode,
  onToggleDarkMode
}) => {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showLinkSelector, setShowLinkSelector] = useState<{ blockId?: string } | null>(null);
  const [showLinkedPanel, setShowLinkedPanel] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const inboundLinks = useMemo(() => {
    return allPages.filter(p => p.id !== page.id && p.blocks.some(b => b.linkMetadata?.sourcePageId === page.id));
  }, [allPages, page.id]);

  const updateBlocks = useCallback((blocks: Block[]) => {
    setIsSaving(true);
    onUpdate({ ...page, blocks, updatedAt: Date.now() });
    setTimeout(() => setIsSaving(false), 800);
  }, [page, onUpdate]);

  const addBlock = useCallback((afterId: string | null, type: BlockType = 'text', content: string = '') => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newBlock: Block = { id: newId, type, content, lastEditedAt: Date.now() };
    const index = afterId ? page.blocks.findIndex(b => b.id === afterId) : -1;
    const newBlocks = [...page.blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    updateBlocks(newBlocks);
    setFocusedBlockId(newId);
  }, [page.blocks, updateBlocks]);

  const handleKeyDown = (e: React.KeyboardEvent, block: Block) => {
    if (e.key === '/') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMenuPosition({ 
        top: rect.bottom + window.scrollY, 
        left: Math.min(rect.left + window.scrollX, window.innerWidth - 340) 
      });
    } else if (e.key === 'Enter' && !e.shiftKey) {
      if (!['text', 'heading', 'todo', 'callout', 'quote', 'checkbox', 'math', 'date', 'time', 'emoji', 'timer'].includes(block.type)) return;
      e.preventDefault();
      addBlock(block.id);
    } else if (e.key === 'Backspace' && block.content === '' && page.blocks.length > 1) {
      e.preventDefault();
      const index = page.blocks.findIndex(b => b.id === block.id);
      const prevBlock = page.blocks[index - 1];
      updateBlocks(page.blocks.filter(b => b.id !== block.id));
      if (prevBlock) setFocusedBlockId(prevBlock.id);
    }
  };

  const handleLinkSelect = (targetPageId: string, targetBlockId?: string, type: 'live' | 'snapshot' = 'live') => {
    if (showLinkSelector?.blockId) {
      const updatedBlocks = page.blocks.map(b => b.id === showLinkSelector.blockId ? {
        ...b,
        linkMetadata: {
          sourcePageId: targetPageId,
          sourceBlockId: targetBlockId,
          type,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      } : b);
      updateBlocks(updatedBlocks);
    } else {
      const targetPage = allPages.find(p => p.id === targetPageId);
      const newId = Math.random().toString(36).substr(2, 9);
      const newBlock: Block = {
        id: newId,
        type: type === 'live' ? 'embed' : 'text',
        content: `Ref: ${targetPage?.title || 'Context'}`,
        linkMetadata: {
          sourcePageId: targetPageId,
          sourceBlockId: targetBlockId,
          type,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        lastEditedAt: Date.now()
      };
      updateBlocks([...page.blocks, newBlock]);
    }
    setShowLinkSelector(null);
  };

  const handleCommandSelect = useCallback((type: string) => {
    if (!focusedBlockId) return;
    
    const bType: BlockType = type.startsWith('code:') ? 'code' : (type as BlockType);
    // Explicitly typing metadata as any to allow different property shapes for different block types
    let metadata: any = bType === 'code' ? { language: type.split(':')[1] || 'javascript' } : undefined;
    let content = '';

    if (bType === 'kanban') content = JSON.stringify({ columns: [{ id: 'c1', title: 'To Do', cards: [] }] });
    if (bType === 'database') content = JSON.stringify({ columns: [{ id: 'c1', title: 'Context Item', type: 'text', width: 200 }], rows: [] });
    if (bType === 'mindmap') content = JSON.stringify({ id: 'root', text: 'Central Thought', x: 400, y: 300, children: [] });
    if (bType === 'project_os') content = JSON.stringify({ tasks: [], mindMap: { id: 'root', text: 'Project Core', children: [], x: 2000, y: 2000 } });
    if (bType === 'timer') {
      content = '0';
      metadata = { state: 'stopped' };
    }

    const updated = page.blocks.map(b => {
      if (b.id === focusedBlockId) {
        const cleanedContent = b.content.startsWith('/') ? '' : b.content;
        return { ...b, type: bType, content: content || cleanedContent, metadata, checked: false };
      }
      return b;
    });

    updateBlocks(updated);
    setMenuPosition(null);
  }, [focusedBlockId, page.blocks, updateBlocks]);

  return (
    <div 
      className={`min-h-full flex flex-col cursor-text pb-96 transition-all duration-700 bg-white dark:bg-zinc-950 ${isFocusMode ? 'items-center pt-20' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const lastBlock = page.blocks[page.blocks.length - 1];
          if (lastBlock && lastBlock.content === '' && lastBlock.type === 'text') {
            setFocusedBlockId(lastBlock.id);
          } else {
            addBlock(lastBlock?.id || null);
          }
        }
      }}
    >
      <div className={`w-full mx-auto px-6 lg:px-12 flex-1 transition-all duration-700 ${isFocusMode ? 'max-w-3xl' : 'max-w-5xl py-16 lg:py-24'}`}>
        {!isFocusMode && (
          <div className="mb-8 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 select-none animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2">
              <span className="hover:text-cyan-500 cursor-pointer transition-colors" onClick={() => onJumpTo?.(page.id)}>Main</span>
              <span>/</span>
              <span className="text-zinc-900 dark:text-zinc-100">{page.title || 'Untitled Context'}</span>
            </div>
            <div className="flex items-center gap-4">
              {isSaving ? <span className="text-cyan-500 animate-pulse">Syncing Synapse...</span> : <span className="opacity-40">Ready</span>}
            </div>
          </div>
        )}

        <div className={`mb-12 flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-8 cursor-default gap-6 transition-all ${isFocusMode ? 'border-none' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="flex flex-col gap-1 flex-1 pr-4">
            <input
              value={page.title}
              onChange={(e) => onUpdate({ ...page, title: e.target.value })}
              placeholder="Draft Context Name"
              className={`w-full font-black bg-transparent border-none focus:ring-0 placeholder-zinc-100 dark:placeholder-zinc-800 tracking-tighter text-zinc-900 dark:text-zinc-50 transition-all ${isFocusMode ? 'text-5xl text-center mb-10' : 'text-4xl'}`}
            />
            {!isFocusMode && (
              <div className="flex items-center gap-4 mt-3">
                <button 
                  onClick={() => setShowLinkedPanel(!showLinkedPanel)}
                  className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${showLinkedPanel ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:text-cyan-500'}`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 105.656 5.656l1.1-1.1"/></svg>
                  {inboundLinks.length} Connections
                </button>
              </div>
            )}
          </div>

          <div className={`flex gap-2 items-center ${isFocusMode ? 'fixed top-10 right-10 z-[100]' : ''}`}>
            <button 
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`p-3 rounded-2xl transition-all border ${isFocusMode ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:text-cyan-500'}`}
              title="Toggle Focus Mode"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>
            </button>
            {!isFocusMode && (
              <>
                <button 
                  onClick={() => setShowLinkSelector({})} 
                  className="px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  Synapse Bridge
                </button>
                <button 
                  onClick={onToggleDarkMode} 
                  className={`p-3 rounded-2xl transition-all border ${darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white'} border-zinc-100 dark:border-zinc-800 hover:text-cyan-500`}
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
              </>
            )}
            {onDelete && !isFocusMode && (
              <button onClick={() => onDelete(page.id)} className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90 group">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
          </div>
        </div>

        {showLinkedPanel && !isFocusMode && (
          <div className="mb-12 p-8 bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] animate-in fade-in slide-in-from-top-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <span className="text-[8px] font-black uppercase tracking-widest text-cyan-500">Outbound Bridge</span>
                 {allPages.filter(p => page.blocks.some(b => b.linkMetadata?.sourcePageId === p.id)).map(p => (
                   <div key={p.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                     <span className="text-xs font-bold">{p.title || 'Untitled'}</span>
                     <button onClick={() => onOpenSplit?.(p.id)} className="text-[8px] font-black text-cyan-500 uppercase hover:underline">View</button>
                   </div>
                 ))}
               </div>
               <div className="space-y-3 border-l border-zinc-100 dark:border-zinc-800 pl-8">
                 <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Inbound Reference</span>
                 {inboundLinks.map(p => (
                   <div key={p.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                     <span className="text-xs font-bold">{p.title || 'Untitled'}</span>
                     <button onClick={() => onOpenSplit?.(p.id)} className="text-[8px] font-black text-cyan-500 uppercase hover:underline">View</button>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}

        <div className={`space-y-4 ${isFocusMode ? 'mt-10' : ''}`} onClick={e => e.stopPropagation()}>
          {page.blocks.map((block) => (
            <BlockItem
              key={block.id}
              block={block}
              isFocused={focusedBlockId === block.id}
              allPages={allPages}
              anyBlockFocused={focusedBlockId !== null}
              onFocus={() => setFocusedBlockId(block.id)}
              onUpdate={(u) => updateBlocks(page.blocks.map(b => b.id === block.id ? { ...b, ...u } : b))}
              onKeyDown={(e) => handleKeyDown(e, block)}
              onDelete={() => updateBlocks(page.blocks.filter(b => b.id !== block.id))}
              onDragStart={() => setDraggedBlockId(block.id)}
              onDrop={() => {
                if (!draggedBlockId) return;
                const newBlocks = [...page.blocks];
                const s = newBlocks.findIndex(b => b.id === draggedBlockId);
                const t = newBlocks.findIndex(b => b.id === block.id);
                if (s !== -1 && t !== -1) {
                    const [r] = newBlocks.splice(s, 1);
                    newBlocks.splice(t, 0, r);
                    updateBlocks(newBlocks);
                }
                setDraggedBlockId(null);
              }}
              onLinkTo={() => setShowLinkSelector({ blockId: block.id })}
              onJumpToSource={(pid) => onJumpTo?.(pid)}
            />
          ))}
        </div>

        {menuPosition && <CommandMenu position={menuPosition} onSelect={handleCommandSelect} onClose={() => setMenuPosition(null)} />}
        {showLinkSelector && <LinkSelector pages={allPages} onSelect={handleLinkSelect} onClose={() => setShowLinkSelector(null)} />}
      </div>
    </div>
  );
};
