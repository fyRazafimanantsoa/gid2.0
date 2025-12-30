
import React, { useState, useMemo, useCallback, memo } from 'react';
import { ImportanceLevel, SubTask, MindMapNode } from '../../types';
import { MindMapBlock } from './MindMapBlock';

interface ProjectManagementBlockProps {
  content: string;
  onChange: (newContent: string) => void;
}

type ViewMode = 'board' | 'list' | 'map' | 'calendar';

const TaskCard = memo(({ task, overdue, progress, onUpdate, onDelete, onDragStart, onGoToMap, isMapped }: any) => {
  const importanceColors = {
    High: 'bg-red-500/10 text-red-500 border-red-500/20',
    Medium: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    Low: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    Extension: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  };

  return (
    <div draggable onDragStart={(e) => onDragStart(e, task.id)} className={`group p-6 rounded-[2.5rem] border transition-all hover:shadow-2xl cursor-grab active:cursor-grabbing ${overdue ? 'bg-red-500/10 border-red-500 animate-pulse' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`px-3 py-1 rounded-xl text-[7px] font-black uppercase tracking-widest border ${importanceColors[task.metadata.importance as ImportanceLevel]}`}>{task.metadata.importance}</div>
        <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
      </div>
      <input value={task.title} onChange={(e) => onUpdate({ title: e.target.value })} className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] font-black text-zinc-800 dark:text-zinc-100 mb-4" placeholder="Mission Name" />
      <div className="flex flex-col gap-3 pt-5 border-t border-zinc-50 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Progressive Synapse</span>
          <span className="text-[8px] font-black text-cyan-500">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-cyan-500 transition-all duration-700 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${progress}%` }} /></div>
        <button onClick={onGoToMap} className="text-[8px] font-black text-cyan-500 uppercase tracking-widest mt-2 hover:text-cyan-600 flex items-center gap-2 group/btn">Map Connection <span className="group-hover/btn:translate-x-1 transition-transform">→</span></button>
      </div>
    </div>
  );
});

export const ProjectManagementBlock: React.FC<ProjectManagementBlockProps> = memo(({ content, onChange }) => {
  const data = useMemo(() => {
    try {
      const p = JSON.parse(content);
      return { columns: p.columns || ['Draft', 'Active', 'Validation', 'Success'], tasks: p.tasks || [], mindMap: p.mindMap || { id: 'root', text: 'Central Engine', children: [], x: 2000, y: 2000 } };
    } catch { return { columns: ['Draft', 'Active', 'Validation', 'Success'], tasks: [], mindMap: { id: 'root', text: 'Central Engine', children: [], x: 2000, y: 2000 } }; }
  }, [content]);

  const [activeView, setActiveView] = useState<ViewMode>('board');
  const [isExpanded, setIsExpanded] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const save = useCallback((u: any) => onChange(JSON.stringify({ ...data, ...u })), [data, onChange]);

  const addTask = (status?: string) => save({ tasks: [...data.tasks, { id: Math.random().toString(36).substr(2, 9), title: 'Initialize Mission', metadata: { importance: 'Medium', status: status || data.columns[0], subTasks: [] } }] });

  return (
    <div className={`flex flex-col gap-8 transition-all duration-700 ${isExpanded ? 'fixed inset-0 z-[5000] bg-white dark:bg-zinc-950 p-0 animate-in fade-in slide-in-from-bottom-8' : 'bg-zinc-50/30 dark:bg-zinc-900/10 rounded-[4rem] p-6 border border-zinc-100 dark:border-zinc-800'}`}>
      <div className={`flex items-center justify-between px-12 py-8 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 shadow-xl accelerate ${isExpanded ? 'h-32 pt-16' : 'rounded-[3rem] border'}`}>
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">{isExpanded ? 'Global Command Hub' : 'Mission Control'}</h2>
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em] mt-1">Unified Multi-Node Management</span>
          </div>
          <div className="flex gap-2 bg-zinc-100/50 dark:bg-zinc-800/50 p-1.5 rounded-3xl ml-4">
            {(['board', 'list', 'map'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setActiveView(v)} className={`px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-white dark:bg-zinc-950 text-cyan-500 shadow-lg' : 'text-zinc-400'}`}>{v}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => addTask()} className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Initialize Mission</button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-[1.5rem] text-zinc-400 hover:text-cyan-500 transition-all">
             {isExpanded ? (
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
             ) : (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l-5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>
             )}
          </button>
        </div>
      </div>
      
      <div className={`px-12 pb-12 ${isExpanded ? 'flex-1 overflow-hidden' : 'min-h-[600px]'}`}>
        {activeView === 'board' && (
          <div className="flex gap-10 overflow-x-auto pb-10 custom-scrollbar h-full items-start no-scrollbar">
            {data.columns.map(status => (
              <div key={status} onDragOver={e => e.preventDefault()} onDrop={() => { if (draggedTaskId) save({ tasks: data.tasks.map((t: any) => t.id === draggedTaskId ? { ...t, metadata: { ...t.metadata, status } } : t) }); setDraggedTaskId(null); }} className="flex-shrink-0 w-96 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-[3.5rem] p-8 border border-zinc-100 dark:border-zinc-800 flex flex-col gap-6 max-h-full overflow-y-auto shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-[0.3em]">{status}</span>
                  <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[8px] font-black text-zinc-500">{data.tasks.filter((t: any) => t.metadata.status === status).length}</span>
                </div>
                {data.tasks.filter((t: any) => t.metadata.status === status).map((task: any) => (
                  <TaskCard key={task.id} task={task} onDragStart={(_: any, tid: string) => setDraggedTaskId(tid)} onDelete={(id: string) => save({ tasks: data.tasks.filter((t: any) => t.id !== id) })} progress={0} onUpdate={(u: any) => save({ tasks: data.tasks.map((t: any) => t.id === task.id ? { ...t, ...u } : t) })} onGoToMap={() => setActiveView('map')} />
                ))}
                <button onClick={() => addTask(status)} className="w-full py-5 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] text-[9px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-700 hover:border-cyan-500/30 hover:text-cyan-500 transition-all">+ Launch</button>
              </div>
            ))}
          </div>
        )}
        {activeView === 'map' && <div className="h-full border border-zinc-100 dark:border-zinc-800 rounded-[3.5rem] overflow-hidden shadow-2xl"><MindMapBlock root={data.mindMap} tasks={data.tasks} onChange={mm => save({ mindMap: mm })} /></div>}
        {activeView === 'list' && (
          <div className="h-full overflow-y-auto bg-zinc-50/20 dark:bg-zinc-950/20 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 p-10 space-y-4">
             {data.tasks.map((task: any) => (
               <div key={task.id} className="flex items-center justify-between p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-50 dark:border-zinc-800 group hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{task.metadata.status}</span>
                    <button onClick={() => save({ tasks: data.tasks.filter((t: any) => t.id !== task.id) })} className="p-3 opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
});
