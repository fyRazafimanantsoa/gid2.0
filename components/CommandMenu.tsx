
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
  color?: string;
}

const COMMANDS: CommandItem[] = [
  // Basic Tier
  { type: 'text', label: 'Draft Text', icon: '📝', category: 'Basic', description: 'Plain text for rapid notes', color: 'bg-zinc-100' },
  { type: 'heading', label: 'Heading', icon: 'H1', category: 'Basic', description: 'Large context header', color: 'bg-zinc-100' },
  { type: 'todo', label: 'Action Item', icon: '✅', category: 'Basic', description: 'Task with checkbox', color: 'bg-green-100' },
  { type: 'checkbox', label: 'Checkbox', icon: '🔘', category: 'Basic', description: 'Standalone toggle', color: 'bg-zinc-100' },
  { type: 'quote', label: 'Quote', icon: '💬', category: 'Basic', description: 'Block quotation', color: 'bg-zinc-100' },
  { type: 'divider', label: 'Divider', icon: '➖', category: 'Basic', description: 'Visual separation line', color: 'bg-zinc-100' },
  
  // Advanced Tier
  { type: 'callout', label: 'Callout', icon: '💡', category: 'Advanced', description: 'Important info box', color: 'bg-yellow-100' },
  { type: 'math', label: 'Math Formula', icon: '∑', category: 'Advanced', description: 'LaTeX mathematical notation', color: 'bg-blue-100' },
  { type: 'emoji', label: 'Emoji', icon: '😊', category: 'Advanced', description: 'Insert visual symbol', color: 'bg-pink-100' },

  // Media Tier
  { type: 'image', label: 'Image', icon: '🖼️', category: 'Media', description: 'Embed visual context', color: 'bg-purple-100' },
  { type: 'video', label: 'Video', icon: '🎬', category: 'Media', description: 'Embed motion content', color: 'bg-red-100' },
  { type: 'audio', label: 'Audio', icon: '🎵', category: 'Media', description: 'Embed sound or voice', color: 'bg-indigo-100' },
  { type: 'embed', label: 'Web Link', icon: '🔗', category: 'Media', description: 'YouTube, Figma, Loom', color: 'bg-cyan-100' },

  // Systems Tier
  { type: 'kanban', label: 'Kanban Board', icon: '📋', category: 'Systems', description: 'Status-driven workflow', color: 'bg-orange-100' },
  { type: 'database', label: 'Context Database', icon: '📊', category: 'Systems', description: 'Relational data engine', color: 'bg-cyan-100' },
  { type: 'mindmap', label: 'Synapse Map', icon: '☘️', category: 'Systems', description: 'Spatial knowledge mapping', color: 'bg-green-100' },
  { type: 'project_os', label: 'Project OS', icon: '🛰️', category: 'Systems', description: 'Integrated mission architecture', color: 'bg-blue-100' },

  // Engineering Tier
  { type: 'code:python', label: 'Python Lab', icon: '🐍', category: 'Engineering', description: 'In-browser logic execution', color: 'bg-yellow-50' },
  { type: 'code:html', label: 'Web Preview', icon: '🌐', category: 'Engineering', description: 'Live UI sandbox', color: 'bg-blue-50' },
  { type: 'code:javascript', label: 'JS Sandbox', icon: '📜', category: 'Engineering', description: 'Scripting engine', color: 'bg-yellow-50' },

  // Utility Tier
  { type: 'date', label: 'Date', icon: '📅', category: 'Utility', description: 'Calendar reference', color: 'bg-zinc-50' },
  { type: 'time', label: 'Time', icon: '⌚', category: 'Utility', description: 'Temporal reference', color: 'bg-zinc-50' },
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
      description: `Deploy ${tpl.title} blueprint`,
      color: 'bg-cyan-50'
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Prevent '/' from being typed into the search bar
    if (value.includes('/')) {
      setSearch(value.replace(/\//g, ''));
    } else {
      setSearch(value);
    }
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

  // Sync scroll with selectedIndex
  useEffect(() => {
    if (scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const categories = useMemo(() => Array.from(new Set(filtered.map(c => c.category))), [filtered]);

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div 
        className="fixed z-[70] bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-[2rem] w-80 flex flex-col overflow-hidden max-h-[480px] animate-in fade-in zoom-in duration-300 backdrop-blur-xl"
        style={{ top: Math.min(position.top, window.innerHeight - 500), left: Math.min(position.left, window.innerWidth - 340) }}
      >
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 font-bold select-none">/</span>
            <input 
              autoFocus
              value={search}
              onChange={handleInputChange}
              placeholder="Type to filter..."
              className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] font-bold text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
            />
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar py-2 px-1 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
               <span className="text-3xl block mb-2">🔍</span>
               <p className="text-[10px] font-black uppercase tracking-widest">No matching context</p>
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat} className="space-y-0.5">
                <div className="px-3 py-1.5 text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-10">{cat}</div>
                {filtered.filter(c => c.category === cat).map((cmd) => {
                  const isSelected = filtered[selectedIndex]?.type === cmd.type;
                  return (
                    <button
                      key={cmd.type}
                      data-selected={isSelected}
                      onClick={() => handleSelect(cmd)}
                      className={`w-full flex items-center px-3 py-2 rounded-xl transition-all group ${isSelected ? 'bg-cyan-500/10 dark:bg-cyan-500/20 shadow-sm' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                    >
                      <div className={`w-9 h-9 flex items-center justify-center rounded-xl mr-3 text-sm shadow-sm border border-zinc-100 dark:border-zinc-800 transition-all ${isSelected ? 'scale-105 border-cyan-500/30 bg-white dark:bg-zinc-800' : 'bg-zinc-50 dark:bg-zinc-900'}`}>
                        {cmd.icon}
                      </div>
                      <div className="flex flex-col items-start overflow-hidden text-left">
                        <span className={`font-bold text-[12px] tracking-tight transition-colors ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                          {cmd.label}
                        </span>
                        <span className={`text-[9px] truncate w-full transition-colors ${isSelected ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400'}`}>
                          {cmd.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <footer className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between text-[8px] font-black text-zinc-400 uppercase tracking-widest shrink-0">
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
