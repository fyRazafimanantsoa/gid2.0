
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Page } from '../../types';

interface KnowledgeGraphBlockProps {
  pages: Page[];
  onSelectPage: (id: string) => void;
}

export const KnowledgeGraphBlock: React.FC<KnowledgeGraphBlockProps> = ({ pages, onSelectPage }) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef({ x: 0, y: 0, startPanX: 0, startPanY: 0 });

  const nodes = useMemo(() => {
    return pages.map((page, i) => {
      const hash = page.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const angle = (hash % 360) * (Math.PI / 180);
      const radius = 250 + (hash % 600);
      return {
        id: page.id,
        title: page.title || 'Untitled',
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: Math.max(40, Math.min(100, page.blocks.length * 10))
      };
    });
  }, [pages]);

  const edges = useMemo(() => {
    const e: { from: string; to: string }[] = [];
    pages.forEach(p => {
      p.blocks.forEach(b => {
        if (b.linkMetadata?.sourcePageId) {
          e.push({ from: p.id, to: b.linkMetadata.sourcePageId });
        }
      });
    });
    return e;
  }, [pages]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.node-button')) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY, startPanX: pan.x, startPanY: pan.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPan({ x: panStartRef.current.startPanX + dx, y: panStartRef.current.startPanY + dy });
  };

  const handlePointerUp = () => setIsPanning(false);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, [isExpanded]);

  const renderCanvas = () => (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-zinc-950 rounded-[3rem] overflow-hidden border border-white/5 cursor-grab active:cursor-grabbing select-none transition-all duration-700`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div 
        className="absolute inset-0 transition-transform duration-75"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
      >
        <svg className="absolute inset-0 w-0 h-0 overflow-visible">
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.2)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.5)" />
            </linearGradient>
          </defs>
          {edges.map((edge, i) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            return (
              <line 
                key={`${edge.from}-${edge.to}-${i}`}
                x1={fromNode.x} y1={fromNode.y}
                x2={toNode.x} y2={toNode.y}
                stroke="url(#edgeGrad)"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="animate-shimmer"
              />
            );
          })}
        </svg>

        {nodes.map(node => (
          <div 
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 node-button group"
            style={{ left: node.x, top: node.y }}
          >
            <button 
              onClick={() => { onSelectPage(node.id); setIsExpanded(false); }}
              className="relative w-20 h-20 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-hover:border-cyan-500 group-hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] shadow-2xl"
            >
              <span className="text-2xl">📄</span>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 bg-black/80 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{node.title}</span>
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="absolute top-10 left-10 flex flex-col gap-2">
        <span className="text-xl font-black text-cyan-500 uppercase tracking-[0.4em]">Global Synapse Map</span>
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{pages.length} Intelligent Nodes Active</span>
      </div>

      <button onClick={() => setIsExpanded(!isExpanded)} className="absolute top-10 right-10 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all shadow-2xl z-50">
        {isExpanded ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l-5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>
        )}
      </button>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-10 py-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest">
        Drag to Pan • Multi-Node Synapse Bridge Active
      </div>
    </div>
  );

  return (
    <div className={`relative w-full h-[600px] my-10 ${isExpanded ? 'fixed inset-0 z-[5000] h-screen w-screen p-0 animate-in fade-in zoom-in' : ''}`}>
       {renderCanvas()}
    </div>
  );
};
