
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ImportanceLevel, SubTask, MindMapNode } from '../../types';
import { MindMapBlock } from './MindMapBlock';

interface ProjectManagementBlockProps {
  content: string;
  onChange: (newContent: string) => void;
}

type ViewMode = 'board' | 'list' | 'map';

const TaskCard = ({ task, overdue, progress, onUpdate, onDelete, onDragStart, onGoToMap, isMapped }: any) => {
  const importanceColors = {
    High: 'bg-red-500/10 text-red-500 border-red-500/20',
    Medium: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    Low: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    Extension: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  };

  const handleImportanceChange = (val: ImportanceLevel) => {
    const updates: any = { metadata: { ...task.metadata, importance: val } };
    if (val === 'High' && !task.metadata.deadline) {
      updates.metadata.deadline = Date.now() + 86400000; // Default 1 day for High
    }
    onUpdate(updates);
  };

  return (
    <div 
      draggable 
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`group p-5 rounded-[2rem] border transition-all hover:shadow-2xl cursor-grab active:cursor-grabbing ${overdue ? 'bg-red-500/10 border-red-500 animate-[pulse_1s_infinite] shadow-[0_0_25px_rgba(239,68,68,0.4)]' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <select 
          value={task.metadata.importance}
          onChange={(e) => handleImportanceChange(e.target.value as ImportanceLevel)}
          className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border bg-transparent focus:ring-0 cursor-pointer ${importanceColors[task.metadata.importance as ImportanceLevel]}`}
        >
          {['High', 'Medium', 'Low', 'Extension'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="flex items-center gap-1.5">
          {isMapped && <span className="text-cyan-500 text-[10px]" title="Linked to Synapse">☘</span>}
          <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-red-500 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      
      <input 
        value={task.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-3"
        placeholder="Mission Objective..."
      />

      <div className="space-y-2 mb-4">
        {task.metadata.subTasks?.map((st: SubTask) => (
          <div key={st.id} className="flex items-center gap-2 group/st">
            <input 
              type="checkbox" 
              checked={st.checked}
              onChange={(e) => {
                const subs = task.metadata.subTasks.map((s: SubTask) => s.id === st.id ? { ...s, checked: e.target.checked } : s);
                onUpdate({ metadata: { ...task.metadata, subTasks: subs } });
              }}
              className="w-3.5 h-3.5 rounded-md bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-cyan-500 focus:ring-0"
            />
            <input 
              value={st.text}
              onChange={(e) => {
                const subs = task.metadata.subTasks.map((s: SubTask) => s.id === st.id ? { ...s, text: e.target.value } : s);
                onUpdate({ metadata: { ...task.metadata, subTasks: subs } });
              }}
              className={`flex-1 bg-transparent border-none focus:ring-0 p-0 text-[11px] ${st.checked ? 'line-through text-zinc-400' : 'text-zinc-600 dark:text-zinc-400'}`}
            />
          </div>
        ))}
        <button 
          onClick={() => {
            const subs = [...(task.metadata.subTasks || []), { id: Math.random().toString(36).substr(2, 9), text: '', checked: false }];
            onUpdate({ metadata: { ...task.metadata, subTasks: subs } });
          }}
          className="text-[9px] font-black text-zinc-300 uppercase tracking-widest hover:text-cyan-500 transition-colors"
        >
          + Add Checkitem
        </button>
      </div>

      <div className="flex flex-col gap-2 pt-4 border-t border-zinc-50 dark:border-zinc-800">
        <div className="flex justify-between items-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">
           <span>Progress</span>
           <span>{progress}%</span>
        </div>
        <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        
        <div className="mt-3 space-y-2">
          { (task.metadata.importance === 'High' || task.metadata.deadline) && (
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Deadline (Required for High)</span>
              <input 
                type="datetime-local" 
                value={task.metadata.deadline ? new Date(task.metadata.deadline).toISOString().slice(0, 16) : ''}
                onChange={(e) => onUpdate({ metadata: { ...task.metadata, deadline: new Date(e.target.value).getTime() } })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border-none rounded-lg text-[10px] p-2 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          )}
          <button onClick={onGoToMap} className="text-[8px] font-black text-cyan-500 hover:text-cyan-600 uppercase tracking-[0.2em] transition-colors w-full text-left">
            View in Mind Map →
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProjectManagementBlock: React.FC<ProjectManagementBlockProps> = ({ content, onChange }) => {
  const data = useMemo(() => {
    try {
      const parsed = JSON.parse(content);
      return {
        columns: parsed.columns || ['Backlog', 'In Progress', 'Review', 'Done'],
        tasks: parsed.tasks || [],
        mindMap: parsed.mindMap || { id: 'root', text: 'Project Core', children: [], x: 2000, y: 2000 }
      };
    } catch (e) {
      return { columns: ['Backlog', 'In Progress', 'Review', 'Done'], tasks: [], mindMap: { id: 'root', text: 'Project Core', children: [], x: 2000, y: 2000 } };
    }
  }, [content]);

  const [activeView, setActiveView] = useState<ViewMode>('board');
  const [isExpanded, setIsExpanded] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const save = useCallback((updates: any) => {
    onChange(JSON.stringify({ ...data, ...updates }));
  }, [data, onChange]);

  const addTask = (status?: string) => {
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Mission',
      metadata: {
        importance: 'Medium' as ImportanceLevel,
        status: status || data.columns[0],
        subTasks: [],
        deadline: null
      }
    };
    save({ tasks: [...data.tasks, newTask] });
  };

  const deleteTask = (taskId: string) => {
    save({ tasks: data.tasks.filter((t: any) => t.id !== taskId) });
  };

  const updateTask = (taskId: string, updates: any) => {
    save({ tasks: data.tasks.map((t: any) => t.id === taskId ? { ...t, ...updates } : t) });
  };

  const calculateProgress = (task: any) => {
    if (!task.metadata.subTasks?.length) return task.metadata.status === 'Done' ? 100 : 0;
    const completed = task.metadata.subTasks.filter((s: SubTask) => s.checked).length;
    return Math.round((completed / task.metadata.subTasks.length) * 100);
  };

  const isOverdue = (task: any) => {
    return task.metadata.deadline && 
           task.metadata.deadline < Date.now() && 
           task.metadata.status !== 'Done';
  };

  const isTaskMapped = (taskId: string) => {
    let mapped = false;
    const walk = (node: any) => {
      if (node.taskId === taskId) mapped = true;
      node.children?.forEach(walk);
    };
    walk(data.mindMap);
    return mapped;
  };

  // Mock Notification Logic
  useEffect(() => {
    const checkReminders = () => {
      data.tasks.forEach((task: any) => {
        if (!task.metadata.deadline || task.metadata.status === 'Done') return;
        const timeLeft = task.metadata.deadline - Date.now();
        const intervals = [
          { label: '30min', ms: 30 * 60 * 1000 },
          { label: '1h', ms: 60 * 60 * 1000 },
          { label: '5h', ms: 5 * 60 * 60 * 1000 },
          { label: '1day', ms: 24 * 60 * 60 * 1000 },
          { label: '2days', ms: 2 * 24 * 60 * 60 * 1000 },
          { label: '1week', ms: 7 * 24 * 60 * 60 * 1000 },
          { label: '2weeks', ms: 14 * 24 * 60 * 60 * 1000 },
          { label: '1month', ms: 30 * 24 * 60 * 60 * 1000 },
        ];
        
        intervals.forEach(int => {
          if (timeLeft > 0 && timeLeft <= int.ms && !task.metadata.reminderSent?.[int.label]) {
            console.log(`[Email Reminder Simulation] To: user@example.com. Content: Task "${task.title}" is due in ${int.label}!`);
            const sent = { ...task.metadata.reminderSent, [int.label]: true };
            updateTask(task.id, { metadata: { ...task.metadata, reminderSent: sent } });
          }
        });
      });
    };
    const timer = setInterval(checkReminders, 60000);
    return () => clearInterval(timer);
  }, [data.tasks]);

  const renderDashboard = (fullscreen: boolean) => (
    <div className={`flex flex-col gap-6 ${fullscreen ? 'h-full bg-white dark:bg-zinc-950 p-8 overflow-hidden' : 'bg-zinc-50/50 dark:bg-zinc-900/20 rounded-[3rem] p-1 border border-zinc-100 dark:border-zinc-800'}`}>
      <div className={`flex items-center justify-between px-8 py-5 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl ${fullscreen ? 'shrink-0' : ''}`}>
        <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-3xl">
          {(['board', 'list', 'map'] as ViewMode[]).map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === view ? 'bg-white dark:bg-zinc-950 text-cyan-500 shadow-xl' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
            >
              {view}
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
           <button onClick={() => alert('Authenticating with Google OAuth... Redirecting to accounts.google.com')} className="hidden lg:flex px-5 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-[9px] font-black uppercase tracking-widest items-center gap-2 hover:border-cyan-500 transition-colors shadow-sm">
             <span className="text-blue-500">G</span> Sync Calendar
           </button>
           <button onClick={() => addTask()} className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-transform shadow-xl">
             + Mission
           </button>
           <button 
             onClick={() => setIsExpanded(!isExpanded)} 
             className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-zinc-400 hover:text-cyan-500 transition-all active:scale-90"
           >
             {isExpanded ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>}
           </button>
        </div>
      </div>

      <div className={`p-4 ${fullscreen ? 'flex-1 overflow-hidden relative' : 'min-h-[600px]'}`}>
        {activeView === 'board' && (
          <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar h-full items-start">
            {data.columns.map(status => (
              <div 
                key={status} 
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (!draggedTaskId) return;
                  updateTask(draggedTaskId, { metadata: { ...data.tasks.find((t: any) => t.id === draggedTaskId).metadata, status } });
                  setDraggedTaskId(null);
                }}
                className={`flex-shrink-0 w-80 bg-zinc-100/30 dark:bg-zinc-800/20 rounded-[2.5rem] p-5 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col gap-4 max-h-full overflow-y-auto`}
              >
                <div className="flex items-center justify-between px-3 mb-2 group/col">
                  <input 
                    value={status} 
                    onChange={(e) => save({ columns: data.columns.map(c => c === status ? e.target.value : c), tasks: data.tasks.map((t: any) => t.metadata.status === status ? { ...t, metadata: { ...t.metadata, status: e.target.value } } : t) })}
                    className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] bg-transparent border-none focus:ring-0 focus:text-cyan-500 w-full"
                  />
                  <button onClick={() => save({ columns: data.columns.filter(c => c !== status) })} className="opacity-0 group-hover/col:opacity-100 text-zinc-300 hover:text-red-500 transition-opacity">×</button>
                </div>
                {data.tasks.filter((t: any) => t.metadata.status === status).map((task: any) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onDragStart={(e: any, tid: string) => setDraggedTaskId(tid)}
                    onDelete={deleteTask}
                    overdue={isOverdue(task)}
                    isMapped={isTaskMapped(task.id)}
                    onGoToMap={() => setActiveView('map')}
                    progress={calculateProgress(task)}
                    onUpdate={(u: any) => updateTask(task.id, u)}
                  />
                ))}
                <button onClick={() => addTask(status)} className="w-full py-6 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-[9px] font-black text-zinc-300 uppercase tracking-widest hover:border-zinc-400 transition-all">+ Initialize</button>
              </div>
            ))}
          </div>
        )}

        {activeView === 'list' && (
          <div className={`space-y-4 px-2 ${fullscreen ? 'h-full overflow-y-auto' : ''}`}>
            {data.tasks.map((task: any) => (
              <div key={task.id} className={`flex items-center gap-6 p-6 rounded-[2.5rem] border bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 group hover:shadow-2xl transition-all ${isOverdue(task) ? 'border-red-500 bg-red-500/5 animate-[pulse_2s_infinite]' : ''}`}>
                <div className="flex-1 min-w-0">
                  <input 
                    value={task.title} 
                    onChange={(e) => updateTask(task.id, { title: e.target.value })}
                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-base font-bold text-zinc-800 dark:text-zinc-100"
                  />
                  <div className="flex gap-4 mt-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{task.metadata.status}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${task.metadata.importance === 'High' ? 'text-red-500' : 'text-zinc-400'}`}>{task.metadata.importance}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {isTaskMapped(task.id) && <span className="text-cyan-500 text-xs">☘</span>}
                  <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-300 hover:text-red-500 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            ))}
            <button onClick={() => addTask()} className="w-full py-8 rounded-[3rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800 text-[10px] font-black text-zinc-300 uppercase tracking-widest hover:border-zinc-200 transition-all">+ Add New Context Task</button>
          </div>
        )}

        {activeView === 'map' && (
          <div className={`border border-zinc-100 dark:border-zinc-800 rounded-[3rem] overflow-hidden ${fullscreen ? 'h-full' : 'h-[650px]'}`}>
            <MindMapBlock 
              root={data.mindMap} 
              tasks={data.tasks}
              onLinkToTask={(nodeId, taskId) => {
                const task = data.tasks.find((t: any) => t.id === taskId);
                const walk = (curr: any): any => {
                  if (curr.id === nodeId) return { ...curr, taskId, text: task.title };
                  return { ...curr, children: curr.children.map(walk) };
                };
                save({ mindMap: walk(data.mindMap) });
              }}
              onUnlinkTask={(nodeId) => {
                const walk = (curr: any): any => {
                  if (curr.id === nodeId) {
                    const { taskId, ...rest } = curr;
                    return { ...rest };
                  }
                  return { ...curr, children: curr.children.map(walk) };
                };
                save({ mindMap: walk(data.mindMap) });
              }}
              onChange={(mm) => save({ mindMap: mm })} 
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {!isExpanded && <div className="transition-all duration-700 opacity-100 scale-100">{renderDashboard(false)}</div>}
      {isExpanded && <div className="fixed inset-0 z-[300] bg-white dark:bg-zinc-950 animate-in fade-in zoom-in duration-500 flex flex-col overflow-hidden">{renderDashboard(true)}</div>}
    </>
  );
};
