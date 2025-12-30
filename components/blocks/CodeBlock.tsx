
import React, { useState, useEffect, useRef, useMemo } from 'react';

type SupportedLanguage = 'javascript' | 'python' | 'html';

interface WebContent {
  html: string;
  css: string;
  js: string;
}

interface CodeBlockProps {
  content: string;
  metadata?: {
    language: SupportedLanguage;
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
  const [language, setLanguage] = useState<SupportedLanguage>(metadata?.language || 'javascript');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(45);
  const [activeWebTab, setActiveWebTab] = useState<'js' | 'html' | 'css'>('js');
  
  // State for the web environment (CodePen style)
  const webData = useMemo<WebContent>(() => {
    if (language !== 'javascript') return { html: '', css: '', js: content };
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object' && 'js' in parsed) {
        return { 
          html: parsed.html || '', 
          css: parsed.css || '', 
          js: parsed.js || '' 
        };
      }
    } catch (e) {}
    return { html: '', css: '', js: content };
  }, [content, language]);

  const updateWebData = (updates: Partial<WebContent>) => {
    const next = { ...webData, ...updates };
    onChange(JSON.stringify(next), { ...metadata, language });
  };

  useEffect(() => {
    if (metadata?.language && metadata.language !== language) {
      setLanguage(metadata.language);
    }
  }, [metadata?.language]);

  // Pyodide initialization for Python
  useEffect(() => {
    if (language === 'python' && !pyodide && window.loadPyodide) {
      const initPy = async () => {
        try {
          // Explicitly set indexURL to fix "Failed to fetch" errors during wasm loading
          const p = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
          });
          
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
        } catch (e: any) {
          console.error("Pyodide init failed", e);
          setOutput(`Pyodide Error: ${e?.message || 'Check network connection'}`);
        }
      };
      initPy();
    }
  }, [language, pyodide]);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setOutput('');
    // Migrate content based on source/target formats
    if (newLang === 'javascript') {
      const currentCode = (language === 'javascript') ? webData.js : content;
      onChange(JSON.stringify({ ...webData, js: currentCode }), { ...metadata, language: newLang });
    } else {
      const currentCode = (language === 'javascript') ? webData.js : content;
      onChange(currentCode, { ...metadata, language: newLang });
    }
  };

  const runLogicCompiler = async () => {
    if (language !== 'python') return;
    setIsRunning(true);
    setOutput('Python Runtime: Initializing logic core...');
    await new Promise(r => setTimeout(r, 600));

    if (!pyodide) {
      setOutput('Python Engine Error: Still booting. Please wait.');
      setIsRunning(false);
      return;
    }
    try {
      pyodide.runPython("sys.stdout = io.StringIO()");
      await pyodide.runPythonAsync(content);
      const res = pyodide.runPython("sys.stdout.getvalue()");
      setOutput(res || 'Execution finished successfully.');
    } catch (err: any) {
      setOutput('Python Traceback:\n' + err.message);
    }
    setIsRunning(false);
  };

  const combinedPreview = useMemo(() => {
    if (language === 'html') return content;
    if (language === 'javascript') {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: sans-serif; margin: 0; background: #000; color: #fff; padding: 20px; }
              ${webData.css}
            </style>
          </head>
          <body>
            ${webData.html || '<div style="height:50vh;display:flex;align-items:center;justify-content:center;opacity:0.2;font-size:12px;letter-spacing:0.2em;font-weight:900;">AWAITING CONTEXT</div>'}
            <script>
              (function() {
                try {
                  ${webData.js}
                } catch (e) {
                  const errDiv = document.createElement('div');
                  errDiv.style.background = '#7f1d1d';
                  errDiv.style.color = '#fecaca';
                  errDiv.style.padding = '15px';
                  errDiv.style.marginTop = '20px';
                  errDiv.style.borderRadius = '10px';
                  errDiv.style.fontSize = '12px';
                  errDiv.style.fontFamily = 'monospace';
                  errDiv.textContent = 'Runtime Error: ' + e.message;
                  document.body.appendChild(errDiv);
                }
              })();
            </script>
          </body>
        </html>
      `;
    }
    return '';
  }, [language, content, webData]);

  const renderEditorArea = (type: 'js' | 'html' | 'css' | 'logic', isFull: boolean) => {
    const val = (language === 'javascript' && type !== 'logic') ? webData[type] : content;
    const label = type === 'logic' ? language.toUpperCase() : type.toUpperCase();
    
    return (
      <div className="flex flex-col h-full relative group">
        {(isFull || (language === 'javascript' && !isExpanded)) && (
          <div className="px-5 py-3 bg-zinc-950/80 border-b border-white/5 flex items-center justify-between shrink-0 sticky top-0 z-10 backdrop-blur-md">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500/60">{label} EDITOR</span>
          </div>
        )}
        <textarea
          value={val}
          onChange={(e) => {
            if (language === 'javascript' && type !== 'logic') updateWebData({ [type]: e.target.value });
            else onChange(e.target.value, { ...metadata, language });
          }}
          placeholder={`Initialize ${label} context...`}
          className="flex-1 bg-transparent border-none focus:ring-0 resize-none p-8 code-font text-[14px] text-zinc-300 leading-relaxed custom-scrollbar selection:bg-cyan-500/20"
          spellCheck={false}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
        />
      </div>
    );
  };

  return (
    <div className="relative my-12 group/block">
      {/* Compact Mode */}
      <div className={`flex flex-col bg-zinc-950 rounded-[3rem] border border-white/5 overflow-hidden transition-all duration-700 shadow-2xl ${isExpanded ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 group-hover/block:border-cyan-500/30'}`}>
        
        <div className="flex items-center justify-between px-8 py-5 bg-zinc-950 border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="relative">
              <select 
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                className="appearance-none bg-zinc-900 border border-white/10 rounded-2xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-cyan-500 focus:ring-0 cursor-pointer pr-12 transition-all hover:border-cyan-500/40"
              >
                <option value="javascript">WEB LAB (JS/HTML/CSS)</option>
                <option value="python">PYTHON ENGINE</option>
                <option value="html">HTML SNIPPET</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 text-[10px]">
                ▼
              </div>
            </div>

            {language === 'javascript' && (
              <div className="flex gap-1 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
                {(['js', 'html', 'css'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => setActiveWebTab(t)}
                    className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeWebTab === t ? 'bg-cyan-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 items-center">
            {language === 'python' && (
              <button
                onClick={runLogicCompiler}
                disabled={isRunning}
                className="flex items-center gap-3 px-6 py-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all active:scale-95"
              >
                {isRunning ? 'EXECUTING' : '▶ RUN LOGIC'}
              </button>
            )}
            <button onClick={() => setIsExpanded(true)} className="p-3 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l-5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[550px]">
          <div className="flex-1 border-r border-white/5 overflow-hidden">
            {language === 'javascript' ? renderEditorArea(activeWebTab, false) : renderEditorArea('logic', false)}
          </div>
          <div className="w-full lg:w-[45%] bg-black overflow-hidden shrink-0">
             {(language === 'javascript' || language === 'html') ? (
               <div className="w-full h-full bg-white relative">
                  <iframe title="mini-preview" srcDoc={combinedPreview} className="absolute inset-0 w-full h-full border-none" sandbox="allow-scripts" />
               </div>
             ) : (
               <div className="p-10 code-font h-full flex flex-col bg-zinc-950/20">
                  <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] block mb-6">INTELLIGENCE TERMINAL</span>
                  <pre className="flex-1 text-[13px] text-cyan-400/60 overflow-auto whitespace-pre-wrap selection:bg-cyan-500/10">{output || '> Awaiting signal...'}</pre>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Expanded Mode: CodePen Layout for JS */}
      {isExpanded && (
        <div className="fixed inset-0 z-[5000] bg-black flex flex-col animate-in fade-in zoom-in duration-500 overflow-hidden">
          <div className="flex items-center justify-between px-12 h-24 border-b border-white/5 shrink-0 bg-zinc-950">
            <div className="flex items-center gap-10">
               <span className="text-[13px] font-black uppercase tracking-[0.6em] text-cyan-500">IMMERSIVE {language === 'javascript' ? 'WEB LAB' : 'LOGIC ENGINE'}</span>
               <div className="flex items-center gap-2 px-6 py-2 bg-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 border border-white/5">
                 <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse mr-2"></span>
                 STATUS: SYNCED
               </div>
            </div>
            <div className="flex gap-6 items-center">
              {language === 'python' && (
                <button onClick={runLogicCompiler} className="px-10 py-3.5 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95">EXECUTE PYTHON SCRIPT</button>
              )}
              <button onClick={() => setIsExpanded(false)} className="w-14 h-14 flex items-center justify-center bg-white/5 text-zinc-500 hover:text-white rounded-2xl transition-all hover:bg-white/10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Editor Sidebar */}
            <div className="flex flex-col flex-1 border-r border-white/10 overflow-hidden bg-zinc-950/50">
              {language === 'javascript' ? (
                <div className="grid grid-rows-3 h-full divide-y divide-white/10">
                   {renderEditorArea('html', true)}
                   {renderEditorArea('css', true)}
                   {renderEditorArea('js', true)}
                </div>
              ) : (
                renderEditorArea('logic', true)
              )}
            </div>

            {/* Preview Panel */}
            <div className="bg-black flex flex-col shrink-0 overflow-hidden border-l border-white/10" style={{ flex: `0 0 ${sidebarWidth}%` }}>
               {(language === 'javascript' || language === 'html') ? (
                  <div className="flex flex-col h-full bg-white">
                     <div className="h-14 bg-zinc-50 flex items-center px-10 justify-between shrink-0 border-b border-zinc-200">
                        <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">LIVE WORKSPACE PREVIEW</span>
                        <div className="flex items-center gap-6">
                          <button onClick={() => setSidebarWidth(sidebarWidth === 45 ? 65 : 45)} className="text-[10px] font-black text-zinc-400 hover:text-cyan-600 uppercase tracking-widest border border-zinc-200 px-4 py-1.5 rounded-xl transition-all">
                            {sidebarWidth === 45 ? 'MAXIMIZE VIEW' : 'RESTORE VIEW'}
                          </button>
                        </div>
                     </div>
                     <div className="flex-1 relative">
                        <iframe title="expanded-preview" srcDoc={combinedPreview} className="absolute inset-0 w-full h-full border-none" sandbox="allow-scripts" />
                     </div>
                  </div>
               ) : (
                  <div className="flex flex-col h-full p-14 bg-zinc-950/20">
                    <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                      <span className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em]">SYSTEM LOGS</span>
                      <button onClick={() => setOutput('')} className="text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest">Wipe Output</button>
                    </div>
                    <pre className="flex-1 code-font text-[15px] text-cyan-400/80 overflow-auto whitespace-pre-wrap leading-relaxed selection:bg-cyan-500/20">{output || '> System standby. Awaiting logic execution sequence...'}</pre>
                  </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
