
import React, { useState, useMemo, memo, useCallback } from 'react';
import { DatabaseData, DatabaseColumn, DbColType, Page, SubTask } from '../../types';

interface DatabaseBlockProps {
  data: DatabaseData;
  allPages?: Page[];
  onChange: (newData: DatabaseData) => void;
}

const CellRenderer = memo(({ row, col, onUpdate, expandedChecklist, setExpandedChecklist }: any) => {
  const val = row[col.id];
  const cellClass = "w-full bg-transparent border-none focus:ring-0 p-0 text-[11px] font-medium transition-colors";

  switch (col.type) {
    case 'checklist':
      const items = (val || []) as SubTask[];
      const comp = items.filter(i => i.checked).length;
      const total = items.length;
      const expandedId = `${row.id}-${col.id}`;
      const isExpanded = expandedChecklist === expandedId;
      return (
        <div className="flex flex-col gap-2 min-w-[200px]">
          <button onClick={() => setExpandedChecklist(isExpanded ? null : expandedId)} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-cyan-500 transition-all text-left">
            <span className="text-[10px] font-black uppercase text-zinc-400">{total} Items</span>
            <div className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500" style={{ width: `${total ? (comp/total)*100 : 0}%` }} />
            </div>
            <span className="text-[10px] text-zinc-300">{isExpanded ? '▲' : '▼'}</span>
          </button>
          {isExpanded && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1">
              {items.map(st => (
                <div key={st.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={st.checked} onChange={(e) => onUpdate(row.id, col.id, items.map(i => i.id === st.id ? { ...i, checked: e.target.checked } : i))} className="w-3 h-3 rounded border-zinc-300 text-cyan-500" />
                  <input value={st.text} onChange={(e) => onUpdate(row.id, col.id, items.map(i => i.id === st.id ? { ...i, text: e.target.value } : i))} className="bg-transparent border-none p-0 text-[10px] focus:ring-0 flex-1 text-zinc-600 dark:text-zinc-300"/>
                </div>
              ))}
              <button onClick={() => onUpdate(row.id, col.id, [...items, { id: Math.random().toString(36).substr(2, 9), text: 'New node', checked: false }])} className="text-[8px] font-black text-cyan-500 uppercase tracking-widest pl-5 hover:underline">+ Add Entry</button>
            </div>
          )}
        </div>
      );
    case 'checkbox':
      return <input type="checkbox" checked={!!val} onChange={(e) => onUpdate(row.id, col.id, e.target.checked)} className="w-4 h-4 rounded border-zinc-300 text-cyan-500 focus:ring-cyan-500" />;
    case 'progress':
      return (
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 transition-all" style={{ width: `${val || 0}%` }} />
          </div>
          <span className="text-[9px] font-black text-cyan-500 w-8 text-right">{val || 0}%</span>
        </div>
      );
    case 'tags':
      const tags = Array.isArray(val) ? val : [];
      return (
        <div className="flex flex-wrap gap-1.5 min-w-[120px]">
          {tags.map((t, i) => (
            <span key={i} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1 group/tag">
              {t}<button onClick={() => onUpdate(row.id, col.id, tags.filter((_, idx) => idx !== i))} className="opacity-0 group-hover/tag:opacity-100 hover:text-red-500">×</button>
            </span>
          ))}
          <input placeholder="+" onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { onUpdate(row.id, col.id, [...tags, e.currentTarget.value.trim()]); e.currentTarget.value = ''; } }} className="w-12 bg-transparent border-none p-0 text-[9px] focus:ring-0 placeholder-zinc-300" />
        </div>
      );
    case 'date':
      return <input type="date" value={val || ''} onChange={(e) => onUpdate(row.id, col.id, e.target.value)} className={`${cellClass} text-zinc-500`} />;
    case 'select':
      return (
        <select value={val || ''} onChange={(e) => onUpdate(row.id, col.id, e.target.value)} className={`${cellClass} appearance-none cursor-pointer`}>
          <option value="" disabled>Select...</option>
          {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    default:
      return <input value={val || ''} onChange={(e) => onUpdate(row.id, col.id, e.target.value)} placeholder="Entry..." className={`${cellClass} text-zinc-900 dark:text-zinc-100`} />;
  }
});

export const DatabaseBlock: React.FC<DatabaseBlockProps> = memo(({ data, onChange, allPages = [] }) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null);

  // Fix: Explicitly type the fallback viewConfig to ensure compatibility with DatabaseData['viewConfig']
  const viewConfig = useMemo(() => 
    data.viewConfig || { 
      page: 1, 
      pageSize: 20, 
      searchQuery: '', 
      sortBy: undefined, 
      viewMode: 'table' as 'table' | 'kanban' | 'gallery' | 'calendar'
    }
  , [data.viewConfig]);

  const updateConfig = useCallback((updates: Partial<NonNullable<DatabaseData['viewConfig']>>) => {
    onChange({ ...data, viewConfig: { ...viewConfig, ...updates } });
  }, [data, viewConfig, onChange]);

  const processedRows = useMemo(() => {
    let rows = [...data.rows];
    if (viewConfig.searchQuery) {
      const q = viewConfig.searchQuery.toLowerCase();
      rows = rows.filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(q)));
    }
    if (viewConfig.sortBy) {
      const { colId, direction } = viewConfig.sortBy;
      rows.sort((a, b) => {
        const valA = a[colId] ?? '', valB = b[colId] ?? '';
        return direction === 'asc' ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
      });
    }
    return rows;
  }, [data.rows, viewConfig.searchQuery, viewConfig.sortBy]);

  const updateCell = useCallback((rowId: string, colId: string, value: any) => {
    onChange({ ...data, rows: data.rows.map(row => row.id === rowId ? { ...row, [colId]: value } : row) });
  }, [data, onChange]);

  return (
    <div className={`w-full bg-white dark:bg-zinc-950 flex flex-col overflow-hidden transition-all duration-700 ${isExpanded ? 'fixed inset-0 z-[5000] p-0 animate-in fade-in slide-in-from-bottom-4' : 'rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl my-10 h-[600px]'}`}>
      <div className={`px-12 py-8 flex items-center justify-between border-b border-zinc-50 dark:border-zinc-900 shrink-0 ${isExpanded ? 'bg-zinc-50 dark:bg-zinc-950 h-32 pt-16' : ''}`}>
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">{isExpanded ? 'Global Resource Control' : 'Resource Repository'}</h3>
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em] mt-1">Deep Inventory Active</span>
          </div>
          <div className="flex gap-2 bg-zinc-100/50 dark:bg-zinc-800/50 p-1.5 rounded-2xl ml-4">
             {(['table', 'calendar'] as const).map(mode => (
               <button key={mode} onClick={() => updateConfig({ viewMode: mode })} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewConfig.viewMode === mode ? 'bg-white dark:bg-zinc-950 text-cyan-500 shadow-lg' : 'text-zinc-400'}`}>{mode}</button>
             ))}
          </div>
          <button onClick={() => onChange({ ...data, rows: [{ id: Math.random().toString(36).substr(2, 9) }, ...data.rows] })} className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">+ Record</button>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-zinc-400 hover:text-cyan-500 transition-all shadow-sm">
          {isExpanded ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l-5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>
          )}
        </button>
      </div>
      <div className="flex-1 overflow-x-auto custom-scrollbar relative">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 z-20">
              <th className="w-16 px-10 py-6 text-center"><input type="checkbox" checked={selectedRows.size === processedRows.length && processedRows.length > 0} onChange={(e) => setSelectedRows(e.target.checked ? new Set(processedRows.map(r => r.id)) : new Set())} className="rounded text-cyan-500" /></th>
              {data.columns.map(col => (
                <th key={col.id} className="px-10 py-6 text-left text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em]" style={{ width: col.width || 180 }}>
                  {col.title}
                </th>
              ))}
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {processedRows.map(row => (
              <tr key={row.id} className="border-b border-zinc-50 dark:border-zinc-900 group hover:bg-cyan-500/[0.01]">
                <td className="px-10 py-5 text-center"><input type="checkbox" checked={selectedRows.has(row.id)} onChange={() => { const n = new Set(selectedRows); if (n.has(row.id)) n.delete(row.id); else n.add(row.id); setSelectedRows(n); }} className="rounded text-cyan-500" /></td>
                {data.columns.map(col => (
                  <td key={col.id} className="px-10 py-5 whitespace-nowrap">
                    <CellRenderer row={row} col={col} onUpdate={updateCell} expandedChecklist={expandedChecklist} setExpandedChecklist={setExpandedChecklist} />
                  </td>
                ))}
                <td className="px-10 py-5"><button onClick={() => onChange({ ...data, rows: data.rows.filter(r => r.id !== row.id) })} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all">×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
