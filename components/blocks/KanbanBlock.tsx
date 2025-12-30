
import React, { useState, memo, useMemo } from 'react';
import { KanbanData } from '../../types';

export const KanbanBlock: React.FC<{ data: KanbanData; onChange: (newData: KanbanData) => void }> = memo(({ data, onChange }) => {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<{ colId: string, cardId: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const addColumn = () => {
    const newData = { ...data };
    newData.columns.push({
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Logic Gate',
      cards: []
    });
    onChange(newData);
  };

  const removeColumn = (colId: string) => {
    if (!confirm('Purge this entire gate?')) return;
    const newData = { ...data };
    newData.columns = newData.columns.filter(c => c.id !== colId);
    onChange(newData);
  };

  const addCard = (colId: string) => {
    const newData = { ...data };
    const col = newData.columns.find(c => c.id === colId);
    if (col) {
      const newCardId = Math.random().toString(36).substr(2, 9);
      col.cards.push({ id: newCardId, content: '', checked: false });
      onChange(newData);
      setEditingCardId(newCardId);
    }
  };

  const updateCard = (colId: string, cardId: string, updates: Partial<{ content: string; checked: boolean }>) => {
    const newData = { ...data };
    const col = newData.columns.find(c => c.id === colId);
    const card = col?.cards.find(c => c.id === cardId);
    if (card) {
      Object.assign(card, updates);
      onChange(newData);
    }
  };

  const handleDragStart = (colId: string, cardId: string) => {
    setDraggedCard({ colId, cardId });
  };

  const handleDrop = (targetColId: string) => {
    if (!draggedCard) return;
    if (draggedCard.colId === targetColId) {
      setDraggedCard(null);
      return;
    }

    const newData = { ...data };
    const sourceCol = newData.columns.find(c => c.id === draggedCard.colId);
    const targetCol = newData.columns.find(c => c.id === targetColId);
    const cardIndex = sourceCol?.cards.findIndex(c => c.id === draggedCard.cardId);

    if (sourceCol && targetCol && cardIndex !== undefined && cardIndex !== -1) {
      const [card] = sourceCol.cards.splice(cardIndex, 1);
      targetCol.cards.push(card);
      onChange(newData);
    }
    setDraggedCard(null);
  };

  const renderContent = (full: boolean) => (
    <div className={`flex gap-8 overflow-x-auto pb-10 custom-scrollbar select-none touch-pan-x items-start h-full ${full ? 'px-12' : 'px-4'}`}>
      {data.columns.map(column => (
        <div 
          key={column.id} 
          className={`flex-shrink-0 w-80 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-[2.5rem] p-6 border transition-all duration-500 flex flex-col gap-6 ${draggedCard && draggedCard.colId !== column.id ? 'border-dashed border-cyan-500/30 bg-cyan-500/[0.03] scale-105' : 'border-zinc-100 dark:border-zinc-800'}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(column.id)}
        >
          <div className="flex items-center justify-between px-2 group">
            <input 
              className="font-black text-[10px] bg-transparent border-none focus:ring-0 p-0 w-full text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.4em] focus:text-cyan-500 transition-colors"
              value={column.title}
              onChange={(e) => {
                const newData = { ...data };
                const col = newData.columns.find(c => c.id === column.id);
                if (col) col.title = e.target.value;
                onChange(newData);
              }}
            />
            <button 
              onClick={() => removeColumn(column.id)}
              className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 p-2 transition-all hover:scale-110"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className="flex flex-col gap-4 min-h-[100px] max-h-[600px] overflow-y-auto no-scrollbar pb-4">
            {column.cards.map(card => (
              <div 
                key={card.id} 
                draggable
                onDragStart={() => handleDragStart(column.id, card.id)}
                className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] dark:shadow-none border border-zinc-100 dark:border-zinc-800 group transition-all hover:shadow-2xl hover:border-cyan-500/30 active:scale-[0.98] cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => updateCard(column.id, card.id, { checked: !card.checked })}
                    className={`mt-1 w-5 h-5 rounded-xl border flex-shrink-0 transition-all flex items-center justify-center ${
                      card.checked ? 'bg-cyan-500 border-cyan-500 shadow-lg' : 'border-zinc-200 dark:border-zinc-700 hover:border-cyan-500'
                    }`}
                  >
                    {card.checked && <span className="text-white text-[9px]">✓</span>}
                  </button>
                  <textarea
                    className={`w-full text-[13px] font-bold border-none focus:ring-0 p-0 resize-none bg-transparent leading-relaxed placeholder-zinc-100 dark:placeholder-zinc-800 transition-all ${
                      card.checked ? 'line-through text-zinc-300 dark:text-zinc-700 italic' : 'text-zinc-700 dark:text-zinc-200'
                    }`}
                    rows={2}
                    value={card.content}
                    placeholder="Enter mission node..."
                    autoFocus={editingCardId === card.id}
                    onChange={(e) => updateCard(column.id, card.id, { content: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => addCard(column.id)}
            className="mt-2 text-[9px] text-zinc-300 dark:text-zinc-600 hover:text-cyan-500 font-black uppercase tracking-widest py-5 rounded-[2rem] border border-dashed border-zinc-100 dark:border-zinc-800 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all active:scale-95"
          >
            + PUSH MISSION
          </button>
        </div>
      ))}
      <button 
        onClick={addColumn}
        className={`flex-shrink-0 w-80 min-h-[400px] border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem] text-zinc-300 dark:text-zinc-800 hover:border-cyan-500/40 hover:text-cyan-500 text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 group ${full ? 'h-full' : ''}`}
      >
        <span className="group-hover:scale-110 transition-transform">+ NEW GATE</span>
      </button>
    </div>
  );

  return (
    <div className="relative my-12 group/kanban">
      {/* Compact Container */}
      <div className={`flex flex-col bg-zinc-50/40 dark:bg-zinc-900/10 rounded-[4rem] p-8 border border-zinc-100 dark:border-zinc-800 transition-all duration-700 shadow-2xl ${isExpanded ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 group-hover/kanban:border-cyan-500/20'}`}>
        <div className="flex items-center justify-between mb-10 px-4">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">Flow Pipeline</h3>
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em] mt-1.5">Synapse Flow Active</span>
          </div>
          <button 
            onClick={() => setIsExpanded(true)} 
            className="p-4 bg-white dark:bg-zinc-800 rounded-2xl text-zinc-400 hover:text-cyan-500 transition-all shadow-sm border border-zinc-50 dark:border-zinc-700 hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l-5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>
          </button>
        </div>
        <div className="overflow-hidden h-[500px]">
          {renderContent(false)}
        </div>
      </div>

      {/* Immersive Expanded View */}
      {isExpanded && (
        <div className="fixed inset-0 z-[5000] bg-white dark:bg-zinc-950 flex flex-col animate-in fade-in zoom-in duration-500 overflow-hidden">
          <div className="flex items-center justify-between px-16 h-32 border-b border-zinc-50 dark:border-zinc-900 shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl pt-8">
            <div className="flex items-center gap-10">
              <div className="flex flex-col">
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">Command Pipeline</h3>
                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.6em] mt-2">Immersive Flow Environment Synchronized</span>
              </div>
              <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 px-6 py-2 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">{data.columns.length} Logic Gates Active</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button 
                onClick={addColumn}
                className="px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
              >
                + Initialize Gate
              </button>
              <button 
                onClick={() => setIsExpanded(false)} 
                className="w-16 h-16 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] text-zinc-400 hover:text-red-500 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden py-12 bg-zinc-50/30 dark:bg-zinc-950">
            {renderContent(true)}
          </div>
          <footer className="h-16 px-16 border-t border-zinc-50 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-zinc-950 text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] shrink-0 shadow-inner">
            <div className="flex gap-10">
              <span>Drag cards to transition status</span>
              <span>Double click card text to edit logic</span>
            </div>
            <span>Integrated Flow OS v4.2</span>
          </footer>
        </div>
      )}
    </div>
  );
});
