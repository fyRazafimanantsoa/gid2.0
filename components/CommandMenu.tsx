
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BlockType } from '../types';
import { TEMPLATES } from '../utils/templates';

interface CommandMenuProps {
  onSelect: (type: BlockType | string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

interface CommandItem {
  type: string;
  label: string;
  icon: string;
  category: string;
  description: string;
}

const COMMANDS: CommandItem[] = [
  { type: 'text', label: 'Draft Text', icon: 'T', category: 'Basic', description: 'Plain text for rapid notes' },
  { type: 'heading', label: 'Heading', icon: 'H', category: 'Basic', description: 'Large context header' },
  { type: 'todo', label: 'Action Item', icon: '✓', category: 'Basic', description: 'Task with checkbox' },
  { type: 'checkbox', label: 'Checkbox', icon: '☐', category: 'Basic', description: 'Standalone toggle' },
  { type: 'quote', label: 'Quote', icon: '“', category: 'Basic', description: 'Block quotation' },
  { type: 'divider', label: 'Divider', icon: '—', category: 'Basic', description: 'Visual separation line' },
  
  { type: 'callout', label: 'Callout', icon: '💡', category: 'Advanced', description: 'Important info box' },
  { type: 'table', label: 'Simple Table', icon: '田', category: 'Advanced', description: 'Quick grid structure' },
  { type: 'math', label: 'Math Formula', icon: '∑', category: 'Advanced', description: 'LaTeX mathematical notation' },
  { type: 'emoji', label: 'Emoji', icon: '☺', category: 'Advanced', description: 'Insert visual symbol' },

  { type: 'image', label: 'Image', icon: '🖼', category: 'Media', description: 'Embed visual context' },
  { type: 'video', label: 'Video', icon: '🎬', category: 'Media', description: 'Embed motion content' },
  { type: 'audio', label: 'Audio', icon: '♬', category: 'Media', description: 'Embed sound or voice' },
  { type: 'embed', label: 'External Link', icon: '🔗', category: 'Media', description: 'YouTube, Figma, Loom' },

  { type: 'kanban', label: 'Kanban Board', icon: '▥', category: 'Systems', description: 'Status-driven workflow' },
  { type: 'database', label: 'Context Database', icon: '▦', category: 'Systems', description: 'Relational data engine' },
  { type: 'mindmap', label: 'Synapse Map', icon: '☘', category: 'Systems', description: 'Spatial knowledge mapping' },
  { type: 'project_os', label: 'Project OS', icon: '🛰️', category: 'Systems', description: 'Integrated mission architecture' },

  { type: 'code:python', label: 'Python Lab', icon: '🐍', category: 'Engineering', description: 'In-browser logic execution' },
  { type: 'code:html', label: 'Web Preview', icon: '🌐', category: 'Engineering', description: 'Live UI sandbox' },
  { type: 'code:javascript', label: 'JS Sandbox', icon: '📜', category: 'Engineering', description: 'Scripting engine' },

  { type: 'date', label: 'Date', icon: '📅', category: 'Utility', description: 'Calendar reference' },
  { type: 'time', label: 'Time', icon: '⌚', category: 'Utility', description: 'Temporal reference' },
];

export const CommandMenu: React.FC<CommandMenuProps> = ({ onSelect, onClose, position }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const recents = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('gid_recent_blocks') || '[]');
    } catch { return []; }
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const templateItems: CommandItem[] = Object.entries(TEMPLATES).map(([key, tpl]) => ({
      type: key,
      label: tpl.title,
      icon: tpl.icon,
      category: 'Templates',
      description: `Deploy ${tpl.title} blueprint`
    }));

    const all = [...COMMANDS, ...templateItems];
    return all.filter(c => 
      c.label.toLowerCase().includes(q) || 
      c.category.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }, [search]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = (item: CommandItem) => {
    const updated = [item.type, ...recents.filter((r: string) => r !== item.type)].slice(0, 5);
    localStorage.setItem('gid_recent_blocks', JSON.stringify(updated));
    onSelect(item.type);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedIndex]);

  const categories = useMemo(() => Array.from(new Set(filtered.map(c => c.category))), [filtered]);

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div 
        className="fixed z-[70] bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] w-80 flex flex-col overflow-hidden max-h-[500px] animate-in fade-in zoom-in duration-300 backdrop-blur-xl"
        style={{ top: Math.min(position.top, window.innerHeight - 520), left: Math.min(position.left, window.innerWidth - 340) }}
      >
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
          <input 
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search context blocks..."
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-black text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
          />
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar py-4 px-2 space-y-6">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
               <span className="text-3xl block mb-2">🔍</span>
               <p className="text-[10px] font-black uppercase tracking-widest">No matching context</p>
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat} className="space-y-1">
                <div className="px-4 py-1.5 text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] sticky top-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md z-10">{cat}</div>
                {filtered.filter(c => c.category === cat).map((cmd) => {
                  const isSelected = filtered[selectedIndex]?.type === cmd.type;
                  return (
                    <button
                      key={cmd.type}
                      onClick={() => handleSelect(cmd)}
                      className={`w-full flex items-center px-4 py-2.5 rounded-2xl transition-all group ${isSelected ? 'bg-zinc-100 dark:bg-zinc-800 shadow-sm' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50'}`}
                    >
                      <span className="w-9 h-9 flex items-center justify-center bg-white dark:bg-zinc-950 rounded-xl mr-4 text-xs shadow-sm border border-zinc-100 dark:border-zinc-800 group-hover:scale-110 transition-transform">{cmd.icon}</span>
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="font-bold text-[13px] text-zinc-800 dark:text-zinc-200 tracking-tight">{cmd.label}</span>
                        <span className="text-[9px] text-zinc-400 truncate w-full text-left">{cmd.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <footer className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between text-[8px] font-black text-zinc-400 uppercase tracking-widest shrink-0">
          <div className="flex gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Esc Close</span>
        </footer>
      </div>
    </>
  );
};
