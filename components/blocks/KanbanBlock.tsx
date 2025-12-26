
import React, { useState } from 'react';
import { KanbanData } from '../../types';

export const KanbanBlock: React.FC<{ data: KanbanData; onChange: (newData: KanbanData) => void }> = ({ data, onChange }) => {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<{ colId: string, cardId: string } | null>(null);

  const addColumn = () => {
    const newData = { ...data };
    newData.columns.push({
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Column',
      cards: []
    });
    onChange(newData);
  };

  const removeColumn = (colId: string) => {
    if (!confirm('Remove this entire column?')) return;
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

  return (
    <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide select-none touch-pan-x">
      {data.columns.map(column => (
        <div 
          key={column.id} 
          className={`flex-shrink-0 w-64 lg:w-72 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-3xl p-5 border transition-all duration-300 flex flex-col gap-4 ${draggedCard && draggedCard.colId !== column.id ? 'border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-100/30 dark:bg-zinc-800/20' : 'border-zinc-100 dark:border-zinc-800'}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(column.id)}
        >
          <div className="flex items-center justify-between px-1 group">
            <input 
              className="font-black text-[10px] bg-transparent border-none focus:ring-0 p-0 w-full text-zinc-300 dark:text-zinc-600 uppercase tracking-[0.2em] focus:text-zinc-900 dark:focus:text-zinc-100 transition-colors"
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
              className="opacity-0 lg:group-hover:opacity-100 text-zinc-300 dark:text-zinc-700 hover:text-red-400 p-1 transition-all"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className="flex flex-col gap-3 min-h-[60px]">
            {column.cards.map(card => (
              <div 
                key={card.id} 
                draggable
                onDragStart={() => handleDragStart(column.id, card.id)}
                className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] border border-zinc-100 dark:border-zinc-800 group transition-all hover:shadow-lg dark:hover:shadow-black active:scale-[0.98] cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => updateCard(column.id, card.id, { checked: !card.checked })}
                    className={`mt-1 w-4 h-4 rounded border flex-shrink-0 transition-all flex items-center justify-center ${
                      card.checked ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    {card.checked && <span className="text-white dark:text-black text-[8px]">✓</span>}
                  </button>
                  <textarea
                    className={`w-full text-sm font-medium border-none focus:ring-0 p-0 resize-none bg-transparent leading-relaxed placeholder-zinc-100 dark:placeholder-zinc-800 transition-all ${
                      card.checked ? 'line-through text-zinc-400 dark:text-zinc-600 italic' : 'text-zinc-700 dark:text-zinc-200'
                    }`}
                    rows={2}
                    value={card.content}
                    placeholder="Draft thought..."
                    autoFocus={editingCardId === card.id}
                    onChange={(e) => updateCard(column.id, card.id, { content: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => addCard(column.id)}
            className="mt-2 text-[9px] text-zinc-300 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 font-black uppercase tracking-widest py-3 rounded-2xl border border-dashed border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all active:scale-95"
          >
            + Add Card
          </button>
        </div>
      ))}
      <button 
        onClick={addColumn}
        className="flex-shrink-0 w-64 lg:w-72 h-[300px] border-2 border-dashed border-zinc-50 dark:border-zinc-900 rounded-3xl text-zinc-200 dark:text-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:text-zinc-400 dark:hover:text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30"
      >
        + Add Column
      </button>
    </div>
  );
};
