
import React from 'react';

export const ShortcutHelp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const shortcuts = [
    { key: '⌘ K', desc: 'Search / Context Switcher' },
    { key: '⌘ N', desc: 'New Context' },
    { key: '⌘ [ / ]', desc: 'Navigate History' },
    { key: '⌘ /', desc: 'Toggle Help' },
    { key: 'ESC', desc: 'Close menus' }
  ];

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] shadow-2xl p-10 animate-in zoom-in fade-in duration-300">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-8 tracking-tighter">Shortcuts</h2>
        <div className="space-y-4">
          {shortcuts.map(s => (
            <div key={s.key} className="flex items-center justify-between py-4 border-b border-zinc-50 dark:border-zinc-800 last:border-none">
              <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">{s.desc}</span>
              <span className="px-4 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 rounded-xl text-[10px] font-black">{s.key}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[2rem] text-[10px] font-black uppercase tracking-widest">Close</button>
      </div>
    </div>
  );
};
