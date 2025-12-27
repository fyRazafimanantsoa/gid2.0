
import React, { useState, useMemo } from 'react';
import { DatabaseData, DatabaseColumn, DbColType, Page, SubTask } from '../../types';

interface DatabaseBlockProps {
  data: DatabaseData;
  allPages?: Page[];
  onChange: (newData: DatabaseData) => void;
}

export const DatabaseBlock: React.FC<DatabaseBlockProps> = ({ data, onChange, allPages = [] }) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isResizing, setIsResizing] = useState<{ id: string; startX: number; startWidth: number } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null); // rowId-colId

  const viewConfig = data.viewConfig || { page: 1, pageSize: 10, searchQuery: '', sortBy: undefined, viewMode: 'table' };

  const updateConfig = (updates: Partial<NonNullable<DatabaseData['viewConfig']>>) => {
    onChange({ ...data, viewConfig: { ...viewConfig, ...updates } });
  };

  const calculateProgress = (row: any) => {
    const checklistCol = data.columns.find(c => c.type === 'checklist');
    if (checklistCol) {
      const items = row[checklistCol.id] as SubTask[];
      if (items && items.length > 0) {
        const completed = items.filter(i => i.checked).length;
        return Math.round((completed / items.length) * 100);
      }
    }
    return null;
  };

  const processedRows = useMemo(() => {
    let rows = [...data.rows];

    if (viewConfig.searchQuery) {
      const q = viewConfig.searchQuery.toLowerCase();
      rows = rows.filter(row => 
        Object.values(row).some(val => String(val).toLowerCase().includes(q))
      );
    }

    if (viewConfig.sortBy) {
      const { colId, direction } = viewConfig.sortBy;
      rows.sort((a, b) => {
        const valA = a[colId] ?? '';
        const valB = b[colId] ?? '';
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [data.rows, viewConfig]);

  const pagedRows = useMemo(() => {
    const start = ((viewConfig.page || 1) - 1) * (viewConfig.pageSize || 10);
    return processedRows.slice(start, start + (viewConfig.pageSize || 10));
  }, [processedRows, viewConfig.page, viewConfig.pageSize]);

  const totalPages = Math.ceil(processedRows.length / (viewConfig.pageSize || 10));

  const addRow = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newRow: Record<string, any> = { id: newId };
    data.columns.forEach(col => { 
      if (col.type === 'checklist') newRow[col.id] = [];
      else if (col.type === 'checkbox') newRow[col.id] = false;
      else if (col.type === 'progress' || col.type === 'rating') newRow[col.id] = 0;
      else newRow[col.id] = '';
    });
    onChange({ ...data, rows: [newRow, ...data.rows] });
  };

  const updateCell = (rowId: string, colId: string, value: any) => {
    const updatedRows = data.rows.map(row => {
      if (row.id === rowId) {
        const updatedRow = { ...row, [colId]: value };
        const progressCol = data.columns.find(c => c.type === 'progress');
        if (progressCol && data.columns.find(c => c.id === colId && c.type === 'checklist')) {
          const newProgress = calculateProgress(updatedRow);
          if (newProgress !== null) updatedRow[progressCol.id] = newProgress;
        }
        return updatedRow;
      }
      return row;
    });
    onChange({ ...data, rows: updatedRows });
  };

  const renderCell = (row: any, col: DatabaseColumn) => {
    const val = row[col.id];
    const cellClass = "w-full bg-transparent border-none focus:ring-0 p-0 text-[11px] font-medium transition-colors";

    switch (col.type) {
      case 'checklist':
        const items = (val || []) as SubTask[];
        const comp = items.filter(i => i.checked).length;
        const total = items.length;
        const expandedId = `${row.id}-${col.id}`;
        return (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <button 
              onClick={() => setExpandedChecklist(expandedChecklist === expandedId ? null : expandedId)}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-cyan-500 transition-all text-left"
            >
              <span className="text-[10px] font-black uppercase text-zinc-400">{total} Items</span>
              <div className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500" style={{ width: `${total ? (comp/total)*100 : 0}%` }} />
              </div>
              <span className="text-[10px] text-zinc-300">{expandedChecklist === expandedId ? '▲' : '▼'}</span>
            </button>
            {expandedChecklist === expandedId && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1">
                {items.map(st => (
                  <div key={st.id} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={st.checked} 
                      onChange={(e) => {
                        const next = items.map(i => i.id === st.id ? { ...i, checked: e.target.checked } : i);
                        updateCell(row.id, col.id, next);
                      }} 
                      className="w-3 h-3 rounded border-zinc-300 text-cyan-500" 
                    />
                    <input 
                      value={st.text} 
                      onChange={(e) => {
                        const next = items.map(i => i.id === st.id ? { ...i, text: e.target.value } : i);
                        updateCell(row.id, col.id, next);
                      }}
                      className="bg-transparent border-none p-0 text-[10px] focus:ring-0 flex-1 text-zinc-600 dark:text-zinc-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'checkbox':
        return <input type="checkbox" checked={!!val} onChange={(e) => updateCell(row.id, col.id, e.target.checked)} className="w-4 h-4 rounded border-zinc-300 text-cyan-500 focus:ring-cyan-500" />;
      case 'progress':
        const derived = calculateProgress(row);
        const displayVal = derived !== null ? derived : (val || 0);
        const isCalculated = derived !== null;
        return (
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${isCalculated ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-cyan-500'}`} style={{ width: `${displayVal}%` }} />
            </div>
            <span className="text-[9px] font-black text-cyan-500 w-8 text-right">{displayVal}%</span>
          </div>
        );
      case 'tags':
        const tags = Array.isArray(val) ? val : (String(val).split(',').filter(Boolean));
        return (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md text-[8px] font-black uppercase tracking-widest">{t}</span>)}
            <input placeholder="+" onKeyDown={(e) => { if (e.key === 'Enter') { updateCell(row.id, col.id, [...tags, e.currentTarget.value]); e.currentTarget.value = ''; } }} className="w-8 bg-transparent border-none p-0 text-[9px] focus:ring-0 placeholder-zinc-300" />
          </div>
        );
      case 'date':
        return <input type="date" value={val || ''} onChange={(e) => updateCell(row.id, col.id, e.target.value)} className={`${cellClass} text-zinc-500`} />;
      default:
        return <input value={val || ''} onChange={(e) => updateCell(row.id, col.id, e.target.value)} placeholder="Entry..." className={`${cellClass} text-zinc-900 dark:text-zinc-100`} />;
    }
  };

  const renderCalendar = () => {
    const dateCol = data.columns.find(c => c.type === 'date');
    if (!dateCol) return <div className="p-20 text-center text-zinc-400 font-bold uppercase tracking-widest">No Date column detected in schema</div>;
    
    const rowsByDate = data.rows.reduce((acc, row) => {
      const d = row[dateCol.id] || 'Unscheduled';
      if (!acc[d]) acc[d] = [];
      acc[d].push(row);
      return acc;
    }, {} as Record<string, any[]>);

    const sortedDates = Object.keys(rowsByDate).sort();

    return (
      <div className="p-8 space-y-10">
        {sortedDates.map(date => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-500">{date}</span>
              <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rowsByDate[date].map(row => (
                <div key={row.id} className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 hover:border-cyan-500 transition-all shadow-sm">
                   <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">RECORD</div>
                   <div className="font-bold text-sm mb-4 text-zinc-900 dark:text-zinc-100">{row[data.columns[0].id]}</div>
                   <div className="flex flex-wrap gap-2">
                     {data.columns.slice(1, 4).map(c => (
                       <div key={c.id} className="text-[8px] font-black uppercase text-zinc-500 bg-white dark:bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-100 dark:border-zinc-800">
                         {c.title}: {String(row[c.id])}
                       </div>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`w-full bg-white dark:bg-zinc-950 flex flex-col overflow-hidden transition-all duration-700 ${isExpanded ? 'fixed inset-0 z-[5000] p-10 animate-in zoom-in fade-in' : 'rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl my-8'}`}>
      <div className="px-8 py-6 flex items-center justify-between border-b border-zinc-50 dark:border-zinc-900 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
             {(['table', 'calendar'] as const).map(mode => (
               <button 
                 key={mode} 
                 onClick={() => updateConfig({ viewMode: mode })}
                 className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewConfig.viewMode === mode ? 'bg-white dark:bg-zinc-950 text-cyan-500 shadow-md' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
               >
                 {mode}
               </button>
             ))}
          </div>
          <div className="relative group">
            <input 
              value={viewConfig.searchQuery}
              onChange={(e) => updateConfig({ searchQuery: e.target.value, page: 1 })}
              placeholder="Filter context..."
              className="pl-10 pr-6 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-cyan-500/10 w-64 transition-all"
            />
          </div>
          <button onClick={addRow} className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
            + New Record
          </button>
        </div>

        <button onClick={() => setIsExpanded(!isExpanded)} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-zinc-400 hover:text-cyan-500 transition-all">
          {isExpanded ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>}
        </button>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar relative">
        {viewConfig.viewMode === 'calendar' ? renderCalendar() : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 z-20">
                <th className="w-14 px-6 py-5 text-center">
                  <input type="checkbox" checked={selectedRows.size === processedRows.length && processedRows.length > 0} onChange={(e) => setSelectedRows(e.target.checked ? new Set(processedRows.map(r => r.id)) : new Set())} className="rounded border-zinc-300 text-cyan-500" />
                </th>
                {data.columns.map(col => (
                  <th key={col.id} className="relative group px-6 py-5 text-left select-none" style={{ width: col.width || 160 }}>
                    <button onClick={() => updateConfig({ sortBy: { colId: col.id, direction: viewConfig.sortBy?.direction === 'asc' ? 'desc' : 'asc' } })} className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-colors ${viewConfig.sortBy?.colId === col.id ? 'text-cyan-500' : 'text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'}`}>
                      {col.title}
                    </button>
                  </th>
                ))}
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map(row => (
                <tr key={row.id} className="border-b border-zinc-50 dark:border-zinc-900 group hover:bg-cyan-500/[0.02] transition-colors">
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" checked={selectedRows.has(row.id)} onChange={() => { const n = new Set(selectedRows); if (n.has(row.id)) n.delete(row.id); else n.add(row.id); setSelectedRows(n); }} className="rounded border-zinc-300 text-cyan-500" />
                  </td>
                  {data.columns.map(col => (
                    <td key={col.id} className="px-6 py-4 overflow-hidden whitespace-nowrap">
                      {renderCell(row, col)}
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <button onClick={() => onChange({ ...data, rows: data.rows.filter(r => r.id !== row.id) })} className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-10 py-5 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{data.rows.length} Total Contexts</span>
        <div className="flex gap-1.5">
           <button disabled={viewConfig.page === 1} onClick={() => updateConfig({ page: viewConfig.page! - 1 })} className="p-2 text-zinc-400 disabled:opacity-20 hover:text-zinc-900">←</button>
           <button disabled={viewConfig.page === totalPages} onClick={() => updateConfig({ page: viewConfig.page! + 1 })} className="p-2 text-zinc-400 disabled:opacity-20 hover:text-zinc-900">→</button>
        </div>
      </div>
    </div>
  );
};
