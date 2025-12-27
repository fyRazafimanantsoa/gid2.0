
import React, { useState, useEffect, useRef } from 'react';

interface TimerBlockProps {
  value: number;
  metadata: { state: 'running' | 'stopped', lastStart?: number };
  onUpdate: (content: number, metadata: any) => void;
}

export const TimerBlock: React.FC<TimerBlockProps> = ({ value, metadata, onUpdate }) => {
  const [elapsed, setElapsed] = useState(value);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (metadata.state === 'running') {
      const start = metadata.lastStart || Date.now();
      const initialElapsed = value;
      
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const sessionDiff = Math.floor((now - start) / 1000);
        setElapsed(initialElapsed + sessionDiff);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(value);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [metadata.state, metadata.lastStart, value]);

  const toggle = () => {
    if (metadata.state === 'running') {
      onUpdate(elapsed, { state: 'stopped' });
    } else {
      onUpdate(elapsed, { state: 'running', lastStart: Date.now() });
    }
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onUpdate(0, { state: 'stopped' });
    setElapsed(0);
  };

  const format = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h, m, sec].map(v => v.toString().padStart(2, '0')).join(':');
  };

  return (
    <div className="my-6 p-8 bg-zinc-950 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center gap-6 group/timer overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
        {metadata.state === 'running' && <div className="h-full bg-cyan-500 animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent)' }} />}
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Chronos Logic Pulse</span>
        <div className={`text-6xl font-black tabular-nums transition-all ${metadata.state === 'running' ? 'text-white scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-zinc-700'}`}>
          {format(elapsed)}
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={toggle}
          className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${metadata.state === 'running' ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-cyan-500 text-white shadow-lg hover:scale-105'}`}
        >
          {metadata.state === 'running' ? 'Stop Pulse' : 'Initialize'}
        </button>
        <button 
          onClick={reset}
          className="px-6 py-3 bg-zinc-900 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:text-white transition-all"
        >
          Reset
        </button>
      </div>

      <div className="flex gap-3 mt-2">
        <div className={`w-1.5 h-1.5 rounded-full ${metadata.state === 'running' ? 'bg-cyan-500 animate-pulse' : 'bg-zinc-800'}`} />
        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{metadata.state === 'running' ? 'Active Session' : 'Standby'}</span>
      </div>
    </div>
  );
};
