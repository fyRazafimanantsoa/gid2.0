
import React from 'react';
import { UserSettings } from '../types';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (s: UserSettings) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onClose }) => {
  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
        <header className="px-12 py-10 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Preferences</h2>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Configure your local context experience</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all active:scale-90 shadow-sm border border-zinc-100 dark:border-zinc-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
          {/* Profile */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Identity</h3>
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-4xl shadow-2xl relative group cursor-pointer">
                <span>👤</span>
                <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">Update</span>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Workspace Name</label>
                  <input 
                    value={settings.name}
                    onChange={(e) => onUpdate({ ...settings, name: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Appearance</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                 <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Theme Mode</label>
                 <div className="flex gap-2 p-1.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl">
                    {(['light', 'dark', 'system'] as const).map(t => (
                      <button 
                        key={t}
                        onClick={() => onUpdate({ ...settings, theme: t })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.theme === t ? 'bg-white dark:bg-zinc-800 text-cyan-500 shadow-xl' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                      >
                        {t}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="flex flex-col gap-3">
                 <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Context Density</label>
                 <div className="flex gap-2 p-1.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl">
                    {(['small', 'medium', 'large'] as const).map(s => (
                      <button 
                        key={s}
                        onClick={() => onUpdate({ ...settings, fontSize: s })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.fontSize === s ? 'bg-white dark:bg-zinc-800 text-cyan-500 shadow-xl' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                      >
                        {s}
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          </section>

          {/* Systems */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Systems Intelligence</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-950 rounded-3xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Auto-Save Pulse</span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Persistence frequency (ms)</span>
                  </div>
                  <input 
                    type="number"
                    step="1000"
                    min="1000"
                    value={settings.autoSaveInterval}
                    onChange={(e) => onUpdate({ ...settings, autoSaveInterval: parseInt(e.target.value) || 5000 })}
                    className="w-24 bg-white dark:bg-zinc-900 border-none rounded-xl p-3 text-xs font-black text-right focus:ring-2 focus:ring-cyan-500/20"
                  />
               </div>
            </div>
          </section>
        </div>

        <footer className="px-12 py-10 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Apply Changes</button>
        </footer>
      </div>
    </div>
  );
};
