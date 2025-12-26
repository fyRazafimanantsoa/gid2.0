import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'undo';
  onUndo?: () => void;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onUndo, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (type !== 'undo') {
      const duration = 4000;
      const interval = 10;
      const step = (interval / duration) * 100;
      
      const timer = setInterval(() => {
        setProgress(p => Math.max(0, p - step));
      }, interval);

      const closeTimer = setTimeout(onClose, duration);
      
      return () => {
        clearInterval(timer);
        clearTimeout(closeTimer);
      };
    } else {
      // Deletion undo stays longer
      const duration = 10000;
      const interval = 10;
      const step = (interval / duration) * 100;
      
      const timer = setInterval(() => {
        setProgress(p => Math.max(0, p - step));
      }, interval);

      const closeTimer = setTimeout(onClose, duration);
      
      return () => {
        clearInterval(timer);
        clearTimeout(closeTimer);
      };
    }
  }, [type, onClose]);

  const icons = {
    success: '✨',
    error: '🚫',
    undo: '♻️'
  };

  const accentColor = type === 'undo' ? 'border-l-orange-500' : 'border-l-cyan-500';
  const progressColor = type === 'undo' ? 'bg-orange-500' : 'bg-cyan-500';

  return (
    <div className={`relative flex items-center gap-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-8 py-5 rounded-[2rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] animate-toast-in min-w-[320px] max-w-md border-l-[6px] ${accentColor} overflow-hidden`}>
      <span className="text-2xl filter drop-shadow-md">{icons[type]}</span>
      <div className="flex-1 flex flex-col pr-4">
        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.3em] mb-1.5 leading-none">Intelligence Event</span>
        <span className="text-[13px] font-bold text-zinc-800 dark:text-zinc-100 tracking-tight leading-tight">{message}</span>
      </div>
      
      {type === 'undo' ? (
        <button 
          onClick={onUndo}
          className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          Recover
        </button>
      ) : (
        <button onClick={onClose} className="text-zinc-300 hover:text-zinc-500 transition-colors p-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-50 dark:bg-zinc-800">
        <div 
          className={`h-full ${progressColor} transition-all duration-100 linear`} 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
};