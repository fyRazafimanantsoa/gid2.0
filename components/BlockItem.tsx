
import React, { useRef, useEffect, useState } from 'react';
import { Block, BlockType, Page, ScheduleType } from '../types';
import { KanbanBlock } from './blocks/KanbanBlock';
import { DatabaseBlock } from './blocks/DatabaseBlock';
import { MindMapBlock } from './blocks/MindMapBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { ProjectManagementBlock } from './blocks/ProjectManagementBlock';
import { TimerBlock } from './blocks/TimerBlock';

interface BlockItemProps {
  block: Block;
  isFocused: boolean;
  allPages: Page[];
  anyBlockFocused: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDrop: () => void;
  onLinkTo: () => void;
  onJumpToSource: (pid: string) => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({ 
  block, isFocused, allPages, anyBlockFocused, onUpdate, onKeyDown, onFocus, onDelete, onDragStart, onDrop, onLinkTo, onJumpToSource
}) => {
  const editableRef = useRef<HTMLTextAreaElement>(null);
  const [showActions, setShowActions] = useState(false);

  const textTypes = ['text', 'heading', 'todo', 'callout', 'embed', 'quote', 'checkbox', 'math', 'date', 'time', 'emoji'];

  useEffect(() => {
    if (isFocused && editableRef.current && textTypes.includes(block.type)) {
      editableRef.current.focus();
    }
  }, [isFocused, block.type]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ content: e.target.value, lastEditedAt: Date.now() });
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const linkedPage = block.linkMetadata ? allPages.find(p => p.id === block.linkMetadata?.sourcePageId) : null;

  const renderContent = () => {
    const commonClasses = "w-full bg-transparent border-none focus:ring-0 resize-none p-0 placeholder-zinc-200 dark:placeholder-zinc-800 transition-all leading-relaxed";
    
    switch (block.type) {
      case 'heading':
        return <textarea ref={editableRef} value={block.content} onKeyDown={onKeyDown} onChange={handleInput} onFocus={onFocus} placeholder="Context Header" className={`${commonClasses} text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter`} rows={1} />;
      case 'todo':
      case 'checkbox':
        return (
          <div className="flex items-start gap-3">
            <button onClick={() => onUpdate({ checked: !block.checked })} className={`mt-1.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${block.checked ? 'bg-cyan-500 border-cyan-500 shadow-lg' : 'border-zinc-200 dark:border-zinc-800'}`}>{block.checked && <span className="text-white text-[8px]">✓</span>}</button>
            <textarea ref={editableRef} value={block.content} onKeyDown={onKeyDown} onChange={handleInput} onFocus={onFocus} placeholder={block.type === 'todo' ? "Mission task..." : "Check item..."} className={`${commonClasses} ${block.checked ? 'line-through text-zinc-300 dark:text-zinc-700' : 'text-zinc-800 dark:text-zinc-100'}`} rows={1} />
          </div>
        );
      case 'timer':
        return <TimerBlock value={parseInt(block.content) || 0} metadata={block.metadata} onUpdate={(c, m) => onUpdate({ content: String(c), metadata: m })} />;
      case 'quote':
        return (
          <div className="border-l-4 border-zinc-200 dark:border-zinc-800 pl-6 py-2">
             <textarea ref={editableRef} value={block.content} onKeyDown={onKeyDown} onChange={handleInput} onFocus={onFocus} placeholder="Meaningful quote..." className={`${commonClasses} text-lg text-zinc-500 dark:text-zinc-400 italic font-medium`} rows={1} />
          </div>
        );
      case 'callout':
        return (
          <div className="flex gap-4 p-5 bg-cyan-500/[0.03] dark:bg-cyan-500/[0.05] rounded-2xl border border-cyan-500/10 dark:border-cyan-500/20 items-start">
            <span className="text-lg opacity-60">💡</span>
            <textarea ref={editableRef} value={block.content} onKeyDown={onKeyDown} onChange={handleInput} onFocus={onFocus} placeholder="Intelligence insight..." className={`${commonClasses} text-cyan-600 dark:text-cyan-400 italic font-medium`} rows={1} />
          </div>
        );
      case 'code':
        return <CodeBlock content={block.content} metadata={block.metadata} onChange={(content, metadata) => onUpdate({ content, metadata })} onFocus={onFocus} onKeyDown={onKeyDown} />;
      case 'kanban':
        return <div onFocus={onFocus} tabIndex={0} className="outline-none py-4"><KanbanBlock data={JSON.parse(block.content)} onChange={(d) => onUpdate({ content: JSON.stringify(d) })} /></div>;
      case 'database':
        return <div onFocus={onFocus} tabIndex={0} className="outline-none py-4"><DatabaseBlock data={JSON.parse(block.content)} allPages={allPages} onChange={(d) => onUpdate({ content: JSON.stringify(d) })} /></div>;
      case 'mindmap':
        return <div onFocus={onFocus} tabIndex={0} className="outline-none py-4"><MindMapBlock root={JSON.parse(block.content)} onChange={(r) => onUpdate({ content: JSON.stringify(r) })} /></div>;
      case 'project_os':
        return <div onFocus={onFocus} tabIndex={0} className="outline-none py-4"><ProjectManagementBlock content={block.content} onChange={(c) => onUpdate({ content: c })} /></div>;
      case 'divider':
        return <div className="py-6"><hr className="border-zinc-100 dark:border-zinc-900" /></div>;
      default:
        return <textarea ref={editableRef} value={block.content} onKeyDown={onKeyDown} onChange={handleInput} onFocus={onFocus} placeholder="Type '/' for context blocks..." className={`${commonClasses} text-zinc-900 dark:text-zinc-50`} rows={1} />;
    }
  };

  const isActive = isFocused;
  const opacity = anyBlockFocused && !isActive ? 'opacity-30 blur-[0.6px]' : 'opacity-100';

  return (
    <div 
      className={`relative px-4 py-2 transition-all duration-300 rounded-xl group ${opacity} ${isActive ? 'bg-zinc-50/50 dark:bg-zinc-900/40' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-all ${isActive || showActions ? 'opacity-100' : 'opacity-0'}`}>
        <button draggable onDragStart={onDragStart} className="p-1 text-zinc-300 hover:text-cyan-500 cursor-grab active:cursor-grabbing">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8h16M4 16h16" /></svg>
        </button>
        {(isActive || showActions) && (
          <div className="flex flex-col gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-1 shadow-xl animate-in fade-in slide-in-from-left-2 duration-200">
            <button 
              onClick={(e) => { e.stopPropagation(); onLinkTo(); }} 
              className={`p-1.5 rounded-lg transition-colors ${block.linkMetadata ? 'text-cyan-500 bg-cyan-500/10' : 'text-zinc-400 hover:text-cyan-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
              title="Link to Context"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 105.656 5.656l1.1-1.1"/></svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Purge Block"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        )}
      </div>

      {block.linkMetadata && (
        <div className="absolute -top-3 left-4 flex items-center gap-2">
           <div 
             onClick={() => onJumpToSource(block.linkMetadata!.sourcePageId)}
             className="px-2 py-0.5 bg-cyan-500 text-white rounded-md text-[7px] font-black uppercase tracking-widest cursor-pointer hover:scale-105 transition-transform shadow-lg"
           >
             Synapse: {linkedPage?.title || 'Unknown Context'}
           </div>
        </div>
      )}

      <div className={`transition-all duration-500 ${isFocused ? 'pl-4 border-l-2 border-cyan-500' : 'border-l-2 border-transparent'}`}>
        {renderContent()}
      </div>
    </div>
  );
};
