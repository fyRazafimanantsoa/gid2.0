
import React from 'react';

interface DeleteModalProps {
  title: string;
  itemCount: number;
  linkedCount: number;
  lastModified: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ title, itemCount, linkedCount, lastModified, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-sm animate-in fade-in duration-300" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 p-10 animate-in zoom-in slide-in-from-bottom-6 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center mb-8">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4">Purge Context?</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
            Are you sure you want to delete <span className="font-black text-zinc-900 dark:text-zinc-100">"{title || 'Untitled'}"</span>? 
            This action can be undone via the recovery window for 10 seconds.
          </p>

          <div className="w-full grid grid-cols-2 gap-4 mb-10">
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
               <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-1">Items</span>
               <span className="text-lg font-black">{itemCount}</span>
            </div>
            <div className={`p-4 rounded-2xl border ${linkedCount > 0 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800'}`}>
               <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-1">Synapses</span>
               <span className={`text-lg font-black ${linkedCount > 0 ? 'text-orange-500' : ''}`}>{linkedCount}</span>
            </div>
          </div>

          {linkedCount > 0 && (
            <div className="w-full bg-red-500/5 border border-red-500/20 rounded-2xl p-4 mb-10 text-left flex gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400">
                Warning: This context has active synapses. Deleting it will turn linked references in other contexts into [Reference Purged].
              </p>
            </div>
          )}

          <div className="flex flex-col w-full gap-3">
            <button onClick={onConfirm} className="w-full py-5 bg-red-600 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all">Confirm Purge</button>
            <button onClick={onCancel} className="w-full py-5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:text-zinc-900 dark:hover:text-zinc-100 active:scale-95 transition-all">Abort</button>
          </div>
        </div>
      </div>
    </div>
  );
};
