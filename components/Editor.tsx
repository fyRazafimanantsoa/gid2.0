
import React, { useState, useCallback, useMemo, memo } from 'react';
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

const NAVIGABLE_BLOCKS = ['text', 'heading', 'h1', 'h2', 'h3', 'bullet', 'number', 'todo', 'callout', 'quote', 'checkbox', 'math', 'date', 'time', 'emoji', 'timer'];

export const Editor: React.FC<EditorProps> = memo(({ 
  page, allPages, onUpdate, onOpenSplit, onJumpTo, onDelete, isSecondary, darkMode, onToggleDarkMode
}) => {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showLinkSelector, setShowLinkSelector] = useState<{ blockId?: string } | null>(null);
  const [showLinkedPanel, setShowLinkedPanel] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const inboundLinks = useMemo(() => {
    return allPages.filter(p => p.id !== page.id && p.blocks.some(b => b.linkMetadata?.sourcePageId === page.id));
  }, [allPages, page.id]);

  const outboundLinks = useMemo(() => {
    const ids = new Set(page.blocks.map(b => b.linkMetadata?.sourcePageId).filter(Boolean));
    return allPages.filter(p => ids.has(p.id));
  }, [allPages, page.blocks]);

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
      if (!NAVIGABLE_BLOCKS.includes(block.type)) return;
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
    
    if (type.startsWith('tpl:')) {
      const template = TEMPLATES[type];
      if (template) {
        const newBlocksFromTemplate = template.blocks.map(b => ({ ...b, id: Math.random().toString(36).substr(2, 9) }));
        const currentBlockIndex = page.blocks.findIndex(b => b.id === focusedBlockId);
        const nextBlocks = [...page.blocks];
        nextBlocks.splice(currentBlockIndex, 1, ...newBlocksFromTemplate);
        updateBlocks(nextBlocks);
        setMenuPosition(null);
        return;
      }
    }

    const bType: BlockType = type.startsWith('code:') ? 'code' : (type as BlockType);
    let metadata: any = bType === 'code' ? { language: type.split(':')[1] || 'javascript' } : undefined;
    let content = '';

    if (bType === 'kanban') content = JSON.stringify({ columns: [{ id: 'c1', title: 'Pending', cards: [] }] });
    if (bType === 'database') content = JSON.stringify({ columns: [{ id: 'c1', title: 'Context Item', type: 'text', width: 200 }], rows: [] });
    if (bType === 'mindmap') content = JSON.stringify({ id: 'root', text: 'Central Engine', x: 400, y: 300, children: [] });
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
      className={`min-h-full flex flex-col cursor-text pb-96 transition-all duration-700 bg-white dark:bg-zinc-950`}
      onDoubleClick={(e) => {
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
      <div className={`w-full mx-auto px-6 lg:px-12 flex-1 transition-all duration-700 max-w-5xl py-16 lg:py-24`}>
        <div className="mb-8 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 select-none animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <span className="hover:text-cyan-500 cursor-pointer transition-colors" onClick={() => onJumpTo?.(page.id)}>Main</span>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100">{page.title || 'Untitled Context'}</span>
          </div>
          <div className="flex items-center gap-4">
            {isSaving ? <span className="text-cyan-500 animate-pulse">Syncing...</span> : <span className="opacity-40">Ready</span>}
          </div>
        </div>

        <div className={`mb-12 flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-8 cursor-default gap-6 transition-all`} onClick={e => e.stopPropagation()}>
          <div className="flex flex-col gap-1 flex-1 pr-4">
            <input
              value={page.title}
              onChange={(e) => onUpdate({ ...page, title: e.target.value })}
              placeholder="Draft Context Name"
              className={`w-full font-black bg-transparent border-none focus:ring-0 placeholder-zinc-100 dark:placeholder-zinc-800 tracking-tighter text-zinc-900 dark:text-zinc-50 transition-all text-5xl`}
            />
            <div className="flex items-center gap-4 mt-3">
              <button 
                onClick={() => setShowLinkedPanel(!showLinkedPanel)}
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${showLinkedPanel ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:text-cyan-500'}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 105.656 5.656l1.1-1.1"/></svg>
                {inboundLinks.length + outboundLinks.length} Connections
              </button>
            </div>
          </div>

          <div className={`flex gap-3 items-center`}>
            <button 
              onClick={() => setShowLinkSelector({})} 
              className="px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Bridge Synapse
            </button>
            <button 
              onClick={onToggleDarkMode} 
              className={`p-4 rounded-2xl transition-all border ${darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white'} border-zinc-100 dark:border-zinc-800 hover:text-cyan-500 shadow-sm`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            {onDelete && (
              <button onClick={() => onDelete(page.id)} className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90 group shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
          </div>
        </div>

        {showLinkedPanel && (
          <div className="mb-12 p-8 bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] animate-in fade-in slide-in-from-top-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <span className="text-[8px] font-black uppercase tracking-widest text-cyan-500">Outbound Bridge</span>
                 <div className="space-y-2">
                   {outboundLinks.map(p => (
                     <div key={p.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 group hover:border-cyan-500 transition-all">
                       <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate pr-4">{p.title || 'Untitled'}</span>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onOpenSplit?.(p.id)} className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-[8px] font-black text-cyan-500 uppercase hover:bg-cyan-500 hover:text-white transition-all">Split</button>
                         <button onClick={() => onJumpTo?.(p.id)} className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-[8px] font-black text-zinc-400 uppercase hover:text-zinc-900 dark:hover:text-zinc-100 transition-all">Jump</button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
               <div className="space-y-4 border-l border-zinc-100 dark:border-zinc-800 pl-8">
                 <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Inbound Reference</span>
                 <div className="space-y-2">
                   {inboundLinks.map(p => (
                     <div key={p.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 group hover:border-zinc-300 transition-all">
                       <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate pr-4">{p.title || 'Untitled'}</span>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onOpenSplit?.(p.id)} className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-[8px] font-black text-cyan-500 uppercase hover:bg-cyan-500 hover:text-white transition-all">Split</button>
                         <button onClick={() => onJumpTo?.(p.id)} className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-[8px] font-black text-zinc-400 uppercase hover:text-zinc-900 dark:hover:text-zinc-100 transition-all">Jump</button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          </div>
        )}

        <div className={`space-y-4`} onClick={e => e.stopPropagation()}>
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
              onPinToSplit={(pid) => onOpenSplit?.(pid)}
            />
          ))}
        </div>

        {menuPosition && <CommandMenu position={menuPosition} onSelect={handleCommandSelect} onClose={() => setMenuPosition(null)} />}
        {showLinkSelector && <LinkSelector pages={allPages} onSelect={handleLinkSelect} onClose={() => setShowLinkSelector(null)} />}
      </div>
    </div>
  );
});
