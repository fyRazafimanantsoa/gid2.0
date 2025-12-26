
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Page, Block, UserSettings } from './types';
import { loadPages, savePages } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { TEMPLATES } from './utils/templates';
import { TemplateGallery } from './components/TemplateGallery';
import { CommandPalette } from './components/CommandPalette';
import { ShortcutHelp } from './components/ShortcutHelp';
import { DeleteModal } from './components/DeleteModal';
import { Toast } from './components/Toast';
import { Settings } from './components/Settings';

const App: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [secondaryPageId, setSecondaryPageId] = useState<string | null>(null);
  const [isSplitPinned, setIsSplitPinned] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [templateUsage, setTemplateUsage] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('gid_template_usage');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Settings & Preferences
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('gid_settings');
    return saved ? JSON.parse(saved) : {
      name: 'Agent 0',
      fontSize: 'medium',
      autoSaveInterval: 5000,
      theme: 'dark'
    };
  });

  // UI Overlays
  const [showGallery, setShowGallery] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'undo'; onUndo?: () => void }[]>([]);

  // Recovery System
  const [recentlyDeleted, setRecentlyDeleted] = useState<{ page: Page; index: number } | null>(null);
  const [history, setHistory] = useState<string[]>([]); // Page ID history

  const [darkMode, setDarkMode] = useState(() => {
    return (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  });

  const createNewPage = useCallback((title: string = '', blocks?: Block[]): Page => {
    const id = Math.random().toString(36).substr(2, 9);
    return {
      id,
      title,
      blocks: blocks || [
        { id: Math.random().toString(36).substr(2, 9), type: 'text', content: '' }
      ],
      updatedAt: Date.now()
    };
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'undo' = 'success', onUndo?: () => void) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, onUndo }]);
    if (type !== 'undo') {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gid_template_usage', JSON.stringify(templateUsage));
  }, [templateUsage]);

  useEffect(() => {
    localStorage.setItem('gid_settings', JSON.stringify(settings));
    if (settings.theme === 'dark') setDarkMode(true);
    else if (settings.theme === 'light') setDarkMode(false);
  }, [settings]);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      const loadedPages = await loadPages();
      if (loadedPages.length > 0) {
        setPages(loadedPages);
        setActivePageId(loadedPages[0].id);
      } else {
        const firstPage = createNewPage('Workspace', [
          { id: 'start1', type: 'heading', content: 'Begin your journey' },
          { id: 'start2', type: 'text', content: 'Focus your thoughts here. Use "/" to add blocks.' }
        ]);
        setPages([firstPage]);
        setActivePageId(firstPage.id);
      }
      setIsLoading(false);
    };
    init();
  }, [createNewPage]);

  useEffect(() => {
    if (!isLoading && pages.length > 0) {
      savePages(pages).catch(console.error);
    }
  }, [pages, isLoading]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gid_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gid_theme', 'light');
    }
  }, [darkMode]);

  // Track History
  useEffect(() => {
    if (activePageId) {
      setHistory(prev => {
        if (prev[prev.length - 1] === activePageId) return prev;
        return [...prev.slice(-10), activePageId];
      });
    }
  }, [activePageId]);

  // Global Keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmd = isMac ? e.metaKey : e.ctrlKey;

      if (cmd && e.key === 'k') { e.preventDefault(); setShowPalette(true); }
      if (cmd && e.key === 'n') { e.preventDefault(); handleAddPage(); }
      if (cmd && e.key === '/') { e.preventDefault(); setShowHelp(prev => !prev); }
      if (cmd && e.key === ',') { e.preventDefault(); setShowSettings(true); }
      
      // History Nav
      if (cmd && e.key === '[') {
        e.preventDefault();
        const idx = pages.findIndex(p => p.id === activePageId);
        if (idx > 0) setActivePageId(pages[idx - 1].id);
      }
      if (cmd && e.key === ']') {
        e.preventDefault();
        const idx = pages.findIndex(p => p.id === activePageId);
        if (idx < pages.length - 1) setActivePageId(pages[idx + 1].id);
      }

      if (e.key === 'Escape') {
        setShowGallery(false);
        setShowPalette(false);
        setShowHelp(false);
        setShowSettings(false);
        setSecondaryPageId(null);
        setDeleteTargetId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePageId, pages]);

  const handleAddPage = () => {
    const newPage = createNewPage();
    setPages(prev => [newPage, ...prev]);
    setActivePageId(newPage.id);
    addToast('New context initialized', 'success');
  };

  const handleAddFromTemplate = (templateKey: string) => {
    const template = TEMPLATES[templateKey];
    if (!template) return;
    
    setTemplateUsage(prev => ({
      ...prev,
      [templateKey]: (prev[templateKey] || 0) + 1
    }));

    const newBlocks = template.blocks.map(b => ({ ...b, id: Math.random().toString(36).substr(2, 9) }));
    const newPage = createNewPage(template.title, newBlocks);
    setPages(prev => [newPage, ...prev]);
    setActivePageId(newPage.id);
    setShowGallery(false);
    addToast(`Deployed: ${template.title}`, 'success');
  };

  const undoDeletion = useCallback(() => {
    if (!recentlyDeleted) return;
    const { page, index } = recentlyDeleted;
    setPages(prev => {
      const next = [...prev];
      next.splice(index, 0, page);
      return next;
    });
    setActivePageId(page.id);
    setRecentlyDeleted(null);
    addToast('Context restored', 'success');
  }, [recentlyDeleted, addToast]);

  const executeDeletion = (id: string) => {
    const index = pages.findIndex(p => p.id === id);
    if (index === -1) return;
    
    const pageToDelete = pages[index];
    setRecentlyDeleted({ page: pageToDelete, index });
    
    const nextPages = pages.filter(p => p.id !== id);
    setPages(nextPages.length === 0 ? [createNewPage('Workspace')] : nextPages);
    
    if (activePageId === id) setActivePageId(nextPages[0]?.id || null);
    setDeleteTargetId(null);
    addToast('Context purged', 'undo', undoDeletion);
  };

  const handleUpdatePage = (updatedPage: Page) => {
    setPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p));
  };

  const activePage = pages.find(p => p.id === activePageId);
  const secondaryPage = pages.find(p => p.id === secondaryPageId);

  const deleteStats = useMemo(() => {
    if (!deleteTargetId) return { itemCount: 0, linkedCount: 0, lastModified: 0, title: '' };
    const p = pages.find(p => p.id === deleteTargetId);
    if (!p) return { itemCount: 0, linkedCount: 0, lastModified: 0, title: '' };
    const linked = pages.filter(pg => pg.id !== deleteTargetId && pg.blocks.some(b => b.linkMetadata?.sourcePageId === deleteTargetId)).length;
    return { title: p.title || 'Untitled', itemCount: p.blocks.length, linkedCount: linked, lastModified: p.updatedAt };
  }, [deleteTargetId, pages]);

  if (isLoading) return null;

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-500 font-size-${settings.fontSize}`}>
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-[60] w-12 h-12 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl text-zinc-900 dark:text-white active:scale-95 transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>

      <Sidebar 
        pages={pages}
        activePageId={activePageId}
        onSelectPage={setActivePageId}
        onAddPage={handleAddPage}
        onAddFromTemplate={handleAddFromTemplate}
        onOpenGallery={() => setShowGallery(true)}
        onOpenSettings={() => setShowSettings(true)}
        onDeletePage={setDeleteTargetId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        isOnline={isOnline}
        templateUsage={templateUsage}
      />

      <main className="flex-1 flex flex-col lg:flex-row lg:ml-72 relative">
        <div 
          key={activePageId}
          className={`flex-1 overflow-y-auto h-full scroll-smooth transition-all duration-500 ${secondaryPageId ? 'lg:w-1/2 w-full border-r border-zinc-100 dark:border-zinc-800' : 'w-full'}`}
        >
          {activePage ? (
            <Editor 
              key={`main-${activePage.id}`}
              page={activePage}
              allPages={pages}
              onUpdate={handleUpdatePage}
              onOpenSplit={setSecondaryPageId}
              onJumpTo={setActivePageId}
              onDelete={setDeleteTargetId}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-200 dark:text-zinc-800">
               <span className="text-8xl mb-8 animate-pulse">☄️</span>
               <h2 className="text-2xl font-black uppercase tracking-widest">Workspace Void</h2>
               <button onClick={handleAddPage} className="mt-6 px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Start New Mission</button>
            </div>
          )}
        </div>

        {secondaryPage && (
          <div className="flex-1 overflow-y-auto h-full bg-zinc-50/10 dark:bg-zinc-900/10 animate-in slide-in-from-right duration-500 border-l border-zinc-100 dark:border-zinc-800 relative">
            <div className="sticky top-4 right-4 z-[60] flex justify-end p-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsSplitPinned(!isSplitPinned)}
                  className={`p-2 rounded-xl border backdrop-blur-md transition-all ${isSplitPinned ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg' : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-400 border-zinc-100 dark:border-zinc-800'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                </button>
                <button 
                  onClick={() => setSecondaryPageId(null)}
                  className="p-2 bg-white/80 dark:bg-zinc-900/80 text-zinc-400 border border-zinc-100 dark:border-zinc-800 rounded-xl backdrop-blur-md hover:text-red-500 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            <Editor 
              page={secondaryPage} 
              allPages={pages} 
              onUpdate={handleUpdatePage} 
              onJumpTo={setActivePageId} 
              isSecondary 
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
            />
          </div>
        )}
      </main>

      {/* Overlays */}
      {showGallery && <TemplateGallery onSelect={handleAddFromTemplate} onClose={() => setShowGallery(false)} />}
      {showPalette && <CommandPalette pages={pages} onSelect={setActivePageId} onClose={() => setShowPalette(false)} />}
      {showHelp && <ShortcutHelp onClose={() => setShowHelp(false)} />}
      {showSettings && <Settings settings={settings} onUpdate={setSettings} onClose={() => setShowSettings(false)} />}
      {deleteTargetId && (
        <DeleteModal 
          onConfirm={() => executeDeletion(deleteTargetId)}
          onCancel={() => setDeleteTargetId(null)}
          title={deleteStats.title}
          itemCount={deleteStats.itemCount}
          linkedCount={deleteStats.linkedCount}
          lastModified={deleteStats.lastModified}
        />
      )}

      {/* Toasts */}
      <div className="fixed bottom-10 right-10 z-[5000] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast message={toast.message} type={toast.type} onUndo={toast.onUndo} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
