import React, { useState } from 'react';
import { TEMPLATES } from '../utils/templates';

interface TemplateGalleryProps {
  onSelect: (key: string) => void;
  onClose: () => void;
}

const TemplateSkeleton = ({ type }: { type: string }) => {
  const items = [1, 2, 3];
  
  if (type.includes('kanban')) {
    return (
      <div className="flex gap-3 h-full p-4">
        {items.map(i => (
          <div key={i} className="flex-1 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-3 space-y-3 border border-zinc-100/50 dark:border-zinc-700/20">
            <div className="h-2 w-10 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
            <div className="h-8 w-full bg-white dark:bg-zinc-800 rounded-xl shadow-sm" />
            <div className="h-16 w-full bg-white dark:bg-zinc-800 rounded-xl shadow-sm" />
          </div>
        ))}
      </div>
    );
  }
  
  if (type.includes('db') || type.includes('habit') || type.includes('goals')) {
    return (
      <div className="p-6 h-full space-y-5">
        <div className="flex gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-2 w-12 bg-zinc-200 dark:bg-zinc-700 rounded-full" />)}
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex gap-3">
            {[1, 2, 3, 4].map(j => <div key={j} className="h-3 w-12 bg-zinc-50 dark:bg-zinc-800/60 rounded-md" />)}
          </div>
        ))}
      </div>
    );
  }
  
  if (type.includes('mindmap') || type.includes('project_mgmt')) {
    return (
      <div className="relative h-full flex items-center justify-center p-8">
        <div className="w-16 h-16 rounded-[2rem] border-2 border-cyan-500/30 bg-cyan-500/5 shadow-inner" />
        <div className="absolute top-[20%] left-[20%] w-10 h-10 rounded-2xl border border-zinc-200 dark:border-zinc-700" />
        <div className="absolute bottom-[20%] right-[20%] w-10 h-10 rounded-2xl border border-zinc-200 dark:border-zinc-700" />
        <div className="absolute top-[30%] right-[25%] w-8 h-8 rounded-2xl border border-zinc-200 dark:border-zinc-700" />
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          <path d="M50 50 L25 25 M50 50 L75 75 M50 50 L70 30" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="4 4" />
        </svg>
      </div>
    );
  }
  
  return (
    <div className="p-8 space-y-6">
      <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
      <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-full" />
      <div className="h-4 w-5/6 bg-zinc-100 dark:bg-zinc-800/60 rounded-full" />
      <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-800/60 rounded-full" />
      <div className="h-4 w-full bg-zinc-50 dark:bg-zinc-900/40 rounded-full" />
    </div>
  );
};

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState('All');
  const categories = ['All', 'Systems', 'Planning', 'Engineering'];
  
  const getCategory = (key: string) => {
    if (['tpl:kanban_board', 'tpl:project_db', 'tpl:habit'].includes(key)) return 'Systems';
    if (['tpl:daily', 'tpl:meeting', 'tpl:goals'].includes(key)) return 'Planning';
    if (['tpl:webdev', 'tpl:python_lab'].includes(key)) return 'Engineering';
    return 'Systems';
  };

  const filtered = Object.entries(TEMPLATES).filter(([key]) => activeTab === 'All' || getCategory(key) === activeTab);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-12 overflow-hidden">
      <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/80 backdrop-blur-3xl animate-in fade-in duration-500" onClick={onClose} />
      <div className="relative w-full max-w-7xl h-full flex flex-col bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <header className="px-14 py-12 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">Workspace Gallery</h2>
            <p className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.4em] mt-3">Select a Blueprint for your local Intelligence</p>
          </div>
          <button onClick={onClose} className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all active:scale-90 border border-zinc-100 dark:border-zinc-700 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-14 py-12 custom-scrollbar no-scrollbar lg:scrollbar-show">
          <div className="flex gap-5 mb-14">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveTab(cat)}
                className={`px-10 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === cat ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-2xl scale-105' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-20">
            {filtered.map(([key, tpl]) => (
              <button 
                key={key} 
                onClick={() => onSelect(key)}
                className="group flex flex-col h-[480px] bg-zinc-50/50 dark:bg-zinc-950/40 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 transition-all hover:scale-[1.03] hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] hover:border-cyan-500/30 text-left overflow-hidden relative"
              >
                <div className="flex-1 bg-white dark:bg-zinc-900/50 m-5 rounded-[2.2rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden relative shadow-sm transition-all group-hover:m-3 group-hover:rounded-[2.5rem] duration-500">
                  <TemplateSkeleton type={key} />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/10 dark:to-zinc-900/10 pointer-events-none" />
                </div>
                <div className="px-10 pb-10 pt-4">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-4xl transition-transform duration-700 group-hover:scale-125 group-hover:rotate-6 drop-shadow-md">{tpl.icon}</span>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">{tpl.title}</h3>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    Deploy {tpl.title.toLowerCase()} system.
                  </p>
                </div>
                <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-cyan-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 shadow-lg">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};