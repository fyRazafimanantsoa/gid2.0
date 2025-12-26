
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MindMapNode, ImportanceLevel } from '../../types';

interface MindMapBlockProps {
  root: MindMapNode;
  tasks?: any[];
  onLinkToTask?: (nodeId: string, taskId: string) => void;
  onUnlinkTask?: (nodeId: string) => void;
  onChange: (newRoot: MindMapNode) => void;
  autoExpand?: boolean;
}

export const MindMapBlock: React.FC<MindMapBlockProps> = ({ root, tasks = [], onLinkToTask, onUnlinkTask, onChange, autoExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [linkingNodeId, setLinkingNodeId] = useState<string | null>(null);
  const [showingSubtasksId, setShowingSubtasksId] = useState<string | null>(null);
  
  const rootRef = useRef(root);
  const onChangeRef = useRef(onChange);

  const dragInfo = useRef<{ 
    nodeId: string; 
    startX: number; 
    startY: number; 
    initialNodeX: number; 
    initialNodeY: number;
    element: HTMLElement;
  } | null>(null);

  const panInfo = useRef<{ startX: number; startY: number; initialPanX: number; initialPanY: number; } | null>(null);
  const [pan, setPan] = useState({ x: -1600, y: -1600 });
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    rootRef.current = root;
    onChangeRef.current = onChange;
  }, [root, onChange]);

  useEffect(() => { if (autoExpand) setIsExpanded(true); }, [autoExpand]);

  const updateNodeInternal = useCallback((nodeId: string, updates: Partial<MindMapNode>) => {
    const updateRecursive = (current: MindMapNode): MindMapNode => {
      if (current.id === nodeId) return { ...current, ...updates };
      return { ...current, children: current.children.map(updateRecursive) };
    };
    onChangeRef.current(updateRecursive(rootRef.current));
  }, []);

  const handlePointerDown = (e: React.PointerEvent, node: MindMapNode) => {
    const target = e.target as HTMLElement;
    // Don't start dragging if we're clicking interactive sub-elements
    if (target.closest('button') || target.closest('input') || target.closest('.link-selector')) return;
    
    e.preventDefault();
    e.stopPropagation();

    dragInfo.current = {
      nodeId: node.id,
      startX: e.clientX,
      startY: e.clientY,
      initialNodeX: node.x || 0,
      initialNodeY: node.y || 0,
      element: target.closest('.mindmap-node') as HTMLElement
    };
    setDraggingNodeId(node.id);
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    // If the click is on a node or its children, don't initiate pan
    if (target.closest('.mindmap-node') || target.closest('button')) return;

    e.preventDefault();
    panInfo.current = { 
      startX: e.clientX, 
      startY: e.clientY, 
      initialPanX: pan.x, 
      initialPanY: pan.y 
    };
    setIsPanning(true);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (dragInfo.current) {
        const { nodeId, startX, startY, initialNodeX, initialNodeY, element } = dragInfo.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const nx = initialNodeX + dx;
        const ny = initialNodeY + dy;
        if (element) { element.style.left = `${nx}px`; element.style.top = `${ny}px`; }
        updateNodeInternal(nodeId, { x: nx, y: ny });
      } else if (panInfo.current) {
        const { startX, startY, initialPanX, initialPanY } = panInfo.current;
        setPan({ 
          x: initialPanX + (e.clientX - startX), 
          y: initialPanY + (e.clientY - startY) 
        });
      }
    };

    const handlePointerUp = () => {
      if (dragInfo.current) {
        // Handle reparenting logic if needed (optional implementation detail)
      }
      dragInfo.current = null;
      panInfo.current = null;
      setDraggingNodeId(null);
      setIsPanning(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => { 
      window.removeEventListener('pointermove', handlePointerMove); 
      window.removeEventListener('pointerup', handlePointerUp); 
    };
  }, [updateNodeInternal, pan]);

  const addChild = (parentId: string, px: number, py: number) => {
    const newNode: MindMapNode = { id: Math.random().toString(36).substr(2, 9), text: 'New Logic Connection', children: [], x: px + 280, y: py };
    const addRecursive = (curr: MindMapNode): MindMapNode => {
      if (curr.id === parentId) return { ...curr, children: [...curr.children, newNode] };
      return { ...curr, children: curr.children.map(addRecursive) };
    };
    onChange(addRecursive(root));
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === root.id) return;
    const del = (curr: MindMapNode): MindMapNode => ({ ...curr, children: curr.children.filter(c => c.id !== nodeId).map(del) });
    onChange(del(root));
  };

  const renderElements = (node: MindMapNode) => {
    const nodes: React.ReactNode[] = [];
    const lines: React.ReactNode[] = [];
    const traverse = (n: MindMapNode) => {
      const nx = n.x || 0, ny = n.y || 0;
      const linkedTask = tasks.find(t => t.id === n.taskId);
      const progress = linkedTask ? Math.round((linkedTask.metadata.subTasks?.filter((s:any)=>s.checked).length / (linkedTask.metadata.subTasks?.length || 1)) * 100) : 0;

      nodes.push(
        <div 
          key={n.id} 
          data-node-id={n.id} 
          style={{ left: `${nx}px`, top: `${ny}px`, position: 'absolute', touchAction: 'none' }} 
          onPointerDown={(e) => handlePointerDown(e, n)} 
          onMouseEnter={() => setHoveredNodeId(n.id)} 
          onMouseLeave={() => setHoveredNodeId(null)} 
          className="mindmap-node flex items-center group transition-all duration-300 hover:z-50"
        >
          <div className="relative flex items-center gap-4">
            <div className={`flex flex-col gap-1.5 px-6 py-4 rounded-[2.2rem] border shadow-2xl transition-all min-w-[260px] ${
                n.id !== root.id ? 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800' : 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white'
              } ${linkedTask ? 'border-l-4 border-l-cyan-500 shadow-cyan-500/20' : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                <input 
                  value={linkedTask ? linkedTask.title : n.text} 
                  readOnly={!!linkedTask}
                  onChange={(e) => updateNodeInternal(n.id, { text: e.target.value })} 
                  onPointerDown={(e) => e.stopPropagation()} 
                  className={`bg-transparent border-none focus:ring-0 outline-none w-full text-center p-1 ${
                    n.id !== root.id ? 'text-xs text-zinc-800 dark:text-zinc-100 font-bold' : 'text-white dark:text-black font-black text-xs uppercase tracking-[0.2em]'
                  }`} 
                />
                {n.id !== root.id && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (linkedTask) onUnlinkTask?.(n.id); else setLinkingNodeId(linkingNodeId === n.id ? null : n.id); }} 
                      className={`p-1.5 rounded-xl transition-colors ${linkedTask ? 'text-cyan-500 bg-cyan-500/10' : 'text-zinc-300 hover:text-cyan-500'}`} 
                      title={linkedTask ? "Unlink from Mission" : "Map to Mission"}
                    >
                      {linkedTask ? '☘' : '🔗'}
                    </button>
                  </div>
                )}
              </div>

              {linkedTask && (
                <div className="flex flex-col gap-2 mt-2 border-t border-zinc-50 dark:border-zinc-800 pt-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[7px] font-black uppercase text-zinc-400 tracking-widest">{linkedTask.metadata.status}</span>
                    <button 
                       onClick={(e) => { e.stopPropagation(); setShowingSubtasksId(showingSubtasksId === n.id ? null : n.id); }}
                       className="text-[7px] font-black uppercase text-cyan-500 tracking-widest flex items-center gap-1 hover:text-cyan-600"
                    >
                      {progress}% {showingSubtasksId === n.id ? '▲' : '▼'}
                    </button>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 transition-all duration-1000 shadow-[0_0_12px_rgba(34,211,238,0.5)]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {linkingNodeId === n.id && (
                <div className="absolute top-full left-0 mt-4 w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-4 shadow-3xl z-[200] link-selector animate-in fade-in zoom-in duration-200">
                  <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-3 text-center px-2">Map Local Mission Context</div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {tasks.filter(t => !rootRef.current.children.some(c => c.taskId === t.id) && n.id !== root.id).map(t => (
                      <button 
                        key={t.id}
                        onClick={() => { onLinkToTask?.(n.id, t.id); setLinkingNodeId(null); }}
                        className="w-full text-left px-4 py-2.5 rounded-2xl hover:bg-cyan-500 hover:text-white transition-all text-[11px] font-bold truncate border border-transparent hover:shadow-lg"
                      >
                        {t.title}
                      </button>
                    ))}
                    {tasks.length === 0 && <div className="text-[10px] text-zinc-300 italic text-center py-4">No available missions found</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="absolute -right-32 top-1/2 -translate-y-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-6 group-hover:translate-x-0">
              <button onClick={(e) => { e.stopPropagation(); addChild(n.id, nx, ny); }} className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center hover:bg-cyan-500 hover:text-white text-base font-black border border-zinc-100 dark:border-zinc-700 shadow-2xl transition-all active:scale-90">+</button>
              {n.id !== root.id && <button onClick={(e) => { e.stopPropagation(); deleteNode(n.id); }} className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center hover:bg-red-500 hover:text-white text-base border border-zinc-100 dark:border-zinc-700 shadow-2xl transition-all active:scale-90">×</button>}
            </div>
          </div>
        </div>
      );
      n.children.forEach(c => { lines.push(<path key={`${n.id}-${c.id}`} d={`M ${nx + 130} ${ny + 35} L ${(c.x || 0) + 130} ${(c.y || 0) + 35}`} className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="3" fill="none" strokeDasharray="6 6" />); traverse(c); });
    };
    traverse(node); return { nodes, lines };
  };

  const { nodes, lines } = renderElements(root);
  const canvasContent = (
    <div 
      onPointerDown={handleCanvasPointerDown} 
      className={`relative select-none overflow-hidden touch-none h-full w-full bg-cyan-500/[0.01] dark:bg-zinc-900/5 overscroll-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <div style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }} className="absolute w-[4000px] h-[4000px] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full overflow-visible">{lines}</svg>
        <div className="absolute inset-0 pointer-events-auto">{nodes}</div>
      </div>
      {!isExpanded && <div className="absolute bottom-10 right-10 z-[60]"><button onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }} className="px-8 py-4 bg-zinc-900 dark:bg-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest text-white dark:text-black hover:scale-105 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] transition-all active:scale-95 border border-zinc-900 dark:border-white">Immersive Context Mapping</button></div>}
    </div>
  );

  return (
    <>
      <div className={`group relative bg-zinc-50/50 dark:bg-zinc-900/20 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden transition-all duration-700 h-full w-full ${isExpanded ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>{canvasContent}</div>
      {isExpanded && (
        <div className="fixed inset-0 z-[400] bg-white dark:bg-zinc-950 animate-in fade-in zoom-in duration-500 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-12 h-24 border-b bg-white/90 dark:bg-zinc-950/90 backdrop-blur-3xl shrink-0 safe-top border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-6">
              <span className="text-4xl animate-pulse">☘</span>
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-cyan-500">Spatial Context OS</span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Deep linking mission architecture</span>
              </div>
            </div>
            <button onClick={() => setIsExpanded(false)} className="px-10 py-4 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 rounded-[1.8rem] border border-zinc-100 dark:border-zinc-800 hover:text-cyan-500 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm">Exit Workspace</button>
          </div>
          <div className="flex-1 overflow-hidden relative bg-zinc-50 dark:bg-zinc-950">{canvasContent}</div>
          <div className="h-16 border-t flex items-center justify-between px-12 bg-white dark:bg-zinc-950 shrink-0 border-zinc-100 dark:border-zinc-800 shadow-2xl">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.5em]">Integrated Synapse Engine v2.8</span>
            <div className="flex items-center gap-10">
               <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">• Drag anywhere on canvas to pan</span>
               <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">• Drag nodes to rearrange logic</span>
               <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">• Click ▲ to toggle sub-mission flow</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
