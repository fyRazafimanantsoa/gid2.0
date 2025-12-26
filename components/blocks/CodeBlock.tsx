import React, { useState, useEffect, useRef } from 'react';

interface CodeBlockProps {
  content: string;
  metadata?: {
    language: 'javascript' | 'python' | 'html';
  };
  onChange: (content: string, metadata?: any) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
}

declare global {
  interface Window {
    loadPyodide: any;
  }
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ content, metadata, onChange, onKeyDown, onFocus }) => {
  const language = metadata?.language;
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(45); // Start closer to 50/50
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (language === 'python' && !pyodide && window.loadPyodide) {
      const initPy = async () => {
        try {
          const p = await window.loadPyodide();
          await p.loadPackage("micropip");
          p.runPython(`
import sys
import io
class StringIOWrapper(io.StringIO):
    def __init__(self):
        super().__init__()
    def get_val(self):
        return self.getvalue()
sys.stdout = StringIOWrapper()
          `);
          setPyodide(p);
        } catch (e) {
          console.error("Pyodide init failed", e);
        }
      };
      initPy();
    }
  }, [language, pyodide]);

  const runCode = async () => {
    if (!language || language === 'html') return;
    
    setIsRunning(true);
    setOutput('Processing...');
    
    if (language === 'javascript') {
      try {
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          error: (...args: any[]) => logs.push('ERROR: ' + args.join(' ')),
        };
        const runner = new Function('console', content);
        runner(customConsole);
        setOutput(logs.join('\n') || 'Done (no output)');
      } catch (err: any) {
        setOutput('Runtime Error: ' + err.message);
      }
    } else if (language === 'python') {
      if (!pyodide) {
        setOutput('Python engine booting...');
        setIsRunning(false);
        return;
      }
      try {
        pyodide.runPython("sys.stdout = io.StringIO()");
        await pyodide.runPythonAsync(content);
        const stdout = pyodide.runPython("sys.stdout.getvalue()");
        setOutput(stdout || 'Process complete.');
      } catch (err: any) {
        setOutput('Python Error: ' + err.message);
      }
    }
    setIsRunning(false);
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const defaultDoc = `
    <body style="background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: -apple-system, sans-serif; margin: 0;">
      <div style="text-align: center; padding: 20px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;">
        <p style="font-size: 14px; font-weight: 800; letter-spacing: 0.1em; color: #22d3ee; margin-bottom: 8px;">LIVE WORKSPACE</p>
        <p style="font-size: 11px; opacity: 0.5;">Code reflected in real-time</p>
      </div>
    </body>
  `;

  const renderHeader = (inOverlay: boolean = false) => {
    const isPython = language === 'python';
    const isWebsite = language === 'html';
    
    return (
      <div className={`flex items-center justify-between px-5 py-3.5 bg-zinc-950 border-b border-white/5 shrink-0 ${inOverlay ? 'h-20 px-8 bg-black shadow-2xl' : ''}`}>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{isPython ? '🐍' : isWebsite ? '🌐' : '📜'}</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                {isWebsite ? 'Interface Studio' : isPython ? 'Python Lab' : 'Logic Engine'}
              </span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Local Execution Enabled</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {(language === 'javascript' || language === 'python') && (
            <button
              onClick={(e) => { e.stopPropagation(); runCode(); }}
              disabled={isRunning}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                inOverlay 
                ? 'bg-white text-black hover:bg-zinc-200' 
                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20'
              }`}
            >
              {isRunning ? 'Running...' : 'Compile & Execute'}
            </button>
          )}
          
          <button
            onClick={(e) => { e.stopPropagation(); toggleExpand(); }}
            className={`flex items-center gap-2 p-2.5 rounded-2xl transition-all ${inOverlay ? 'text-zinc-500 hover:text-white hover:bg-white/5 px-5' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderContent = (isLarge: boolean) => {
    const isWebsite = language === 'html';
    
    return (
      <div className={`flex flex-col lg:flex-row flex-1 overflow-hidden h-full ${isLarge ? 'bg-black' : 'min-h-[550px] bg-zinc-950'}`}>
        {/* Editor (Code Input) */}
        <div 
          className="flex flex-col relative overflow-hidden border-r border-white/5"
          style={{ flex: `1 1 ${100 - sidebarWidth}%` }}
        >
          <textarea
            ref={isLarge ? null : editorRef}
            value={content}
            onChange={(e) => onChange(e.target.value, metadata)}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            placeholder={isWebsite ? "<!-- Construct HTML/CSS context... -->" : language === 'python' ? "# Python logic implementation..." : "// Script execution path..."}
            className={`w-full h-full bg-transparent border-none focus:ring-0 resize-none p-8 code-font text-[13px] leading-relaxed overflow-y-auto text-zinc-300 custom-scrollbar selection:bg-cyan-500/20`}
            spellCheck={false}
          />
        </div>

        {/* Output/Preview (The 'Next-to-code' area) */}
        <div 
          className={`bg-black flex flex-col shrink-0 overflow-hidden ${isWebsite ? 'bg-white' : 'border-l border-white/5'}`}
          style={{ flex: `0 0 ${sidebarWidth}%` }}
        >
          {isWebsite ? (
            <div className="flex flex-col h-full">
              <div className="h-10 bg-zinc-100/80 border-b border-zinc-200 flex items-center px-5 gap-4 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                </div>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-2">Sandbox Output</span>
                <div className="ml-auto flex gap-4">
                  <button 
                    onClick={() => setSidebarWidth(sidebarWidth === 45 ? 65 : 45)}
                    className="text-[9px] font-black text-zinc-400 hover:text-cyan-600 transition-colors uppercase tracking-widest"
                  >
                    {sidebarWidth === 45 ? 'Expand View' : 'Default View'}
                  </button>
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden bg-white">
                <iframe
                  key={isLarge ? 'expanded' : 'normal'}
                  title="preview"
                  srcDoc={content || defaultDoc}
                  className="absolute inset-0 w-full h-full border-none bg-white"
                  sandbox="allow-scripts allow-modals"
                />
              </div>
            </div>
          ) : language ? (
            <div className="flex flex-col h-full p-8 gap-5 bg-black">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Runtime Console</span>
                <div className="flex gap-5">
                  <button 
                    onClick={() => setSidebarWidth(sidebarWidth === 45 ? 65 : 45)}
                    className="text-[9px] text-zinc-600 hover:text-cyan-400 transition-colors uppercase font-black tracking-widest"
                  >
                    Resize Workspace
                  </button>
                  <button onClick={() => setOutput('')} className="text-[9px] text-zinc-600 hover:text-white transition-colors uppercase font-black tracking-widest">Wipe Output</button>
                </div>
              </div>
              <pre className="flex-1 code-font text-[12.5px] text-cyan-400/90 overflow-auto whitespace-pre-wrap select-text custom-scrollbar py-2">
                {output || '> System standby. Awaiting execution signal...'}
              </pre>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="relative group/block">
      <div className={`flex flex-col my-10 bg-zinc-950 rounded-3xl shadow-2xl border border-white/5 overflow-hidden transition-all duration-700 ${isExpanded ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 group-hover/block:border-cyan-500/20'}`}>
        {renderHeader(false)}
        {renderContent(false)}
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in zoom-in duration-300 overflow-hidden">
          {renderHeader(true)}
          <div className="flex-1 flex overflow-hidden">
             {renderContent(true)}
          </div>
        </div>
      )}
    </div>
  );
};