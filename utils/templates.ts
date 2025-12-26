
import { Block, KanbanData, DatabaseData, MindMapNode } from '../types';

export const TEMPLATES: Record<string, { title: string, icon: string, blocks: Block[] }> = {
  'tpl:project_mgmt': {
    title: 'Project Management',
    icon: '🛰️',
    blocks: [
      { id: 'p1', type: 'heading', content: 'Central Project OS' },
      { id: 'p2', type: 'callout', content: 'Goal: Optimize context engineering workflow.' },
      { id: 'p3', type: 'project_os', content: JSON.stringify({
        tasks: [
          { 
            id: 't1', 
            title: 'Initial Concept Draft', 
            metadata: { 
              importance: 'High', 
              status: 'In Progress', 
              deadline: Date.now() + 172800000,
              subTasks: [
                { id: 'st1', text: 'Research market needs', checked: true },
                { id: 'st2', text: 'Draft technical spec', checked: false }
              ]
            } 
          }
        ],
        mindMap: {
          id: 'root',
          text: 'Master Plan',
          x: 2000,
          y: 2000,
          children: [
            { id: 'node1', text: 'Concept Phase', x: 2200, y: 1950, children: [] },
            { id: 'node2', text: 'Build Phase', x: 2200, y: 2050, children: [] }
          ]
        }
      }) }
    ]
  },
  'tpl:kanban_board': {
    title: 'Project Board',
    icon: '▥',
    blocks: [
      { id: 'kb1', type: 'heading', content: 'Workflow Architecture' },
      { id: 'kb2', type: 'kanban', content: JSON.stringify({
        columns: [
          { id: 'c1', title: 'Backlog', cards: [{ id: 'k1', content: 'Draft initial concepts', checked: false }] },
          { id: 'c2', title: 'Active', cards: [] },
          { id: 'c3', title: 'In Review', cards: [] },
          { id: 'c4', title: 'Internalized', cards: [] }
        ]
      } as KanbanData) }
    ]
  },
  'tpl:project_db': {
    title: 'Context Inventory',
    icon: '▦',
    blocks: [
      { id: 'db1', type: 'heading', content: 'Resource Master' },
      { id: 'db2', type: 'database', content: JSON.stringify({
        columns: [
          { id: 'item', title: 'Component', type: 'text', width: 200 },
          { id: 'status', title: 'Status', type: 'tags', width: 150 },
          { id: 'roadmap', title: 'Roadmap', type: 'checklist', width: 250 },
          { id: 'progress', title: 'Sync Progress', type: 'progress', width: 150 },
          { id: 'deadline', title: 'Deadline', type: 'date', width: 150 }
        ],
        rows: [
          { 
            id: 'r1', 
            item: 'System Core Engine', 
            status: ['Stable', 'Core'], 
            roadmap: [
              { id: 'st1', text: 'Kernel Integration', checked: true },
              { id: 'st2', text: 'Memory Swap', checked: true },
              { id: 'st3', text: 'IO Optimization', checked: false }
            ],
            progress: 66,
            deadline: '2024-12-01' 
          },
          { 
            id: 'r2', 
            item: 'UI Design System', 
            status: ['Refining'], 
            roadmap: [
              { id: 'st4', text: 'Color Palettes', checked: true },
              { id: 'st5', text: 'Iconography', checked: false }
            ],
            progress: 50,
            deadline: '2024-12-15'
          }
        ],
        viewConfig: {
          sortBy: { colId: 'item', direction: 'asc' },
          page: 1,
          pageSize: 10
        }
      } as DatabaseData) }
    ]
  },
  'tpl:daily': {
    title: 'Daily Planner',
    icon: '☀️',
    blocks: [
      { id: 'd1', type: 'heading', content: 'Daily Review' },
      { id: 'd2', type: 'todo', content: 'Major Objective', schedule: 'today' },
      { id: 'd3', type: 'todo', content: 'Secondary Objective', schedule: 'today' },
      { id: 'd4', type: 'divider', content: '' },
      { id: 'd5', type: 'callout', content: 'Remember to sync with the central context map.' }
    ]
  },
  'tpl:habit': {
    title: 'Habit Engine',
    icon: '⚡',
    blocks: [
      { id: 'h1', type: 'heading', content: 'Personal Optimization' },
      { id: 'h2', type: 'database', content: JSON.stringify({
        columns: [
          { id: 'habit', title: 'Habit', type: 'text', width: 200 },
          { id: 'm', title: 'M', type: 'checkbox', width: 40 },
          { id: 't', title: 'T', type: 'checkbox', width: 40 },
          { id: 'w', title: 'W', type: 'checkbox', width: 40 },
          { id: 'th', title: 'Th', type: 'checkbox', width: 40 },
          { id: 'f', title: 'F', type: 'checkbox', width: 40 },
          { id: 's', title: 'S', type: 'checkbox', width: 40 },
          { id: 'su', title: 'Su', type: 'checkbox', width: 40 },
          { id: 'streak', title: 'Streak', type: 'progress', width: 120 }
        ],
        rows: [
          { id: 'r1', habit: 'Morning Deep Work', m: true, t: true, w: true, th: false, f: false, s: false, su: false, streak: 45 }
        ]
      } as DatabaseData) }
    ]
  },
  'tpl:webdev': {
    title: 'Static Website',
    icon: '🌐',
    blocks: [
      { id: 'w1', type: 'heading', content: 'UI Prototype' },
      { 
        id: 'w2', 
        type: 'code', 
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff; margin: 0; }
    .glass { padding: 50px; border: 1px solid rgba(255,255,255,0.08); border-radius: 32px; text-align: center; background: rgba(255,255,255,0.02); backdrop-filter: blur(40px); }
    h1 { background: linear-gradient(135deg, #22d3ee, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; letter-spacing: -0.06em; font-size: 3rem; margin: 0; }
  </style>
</head>
<body>
  <div class="glass">
    <h1>G I D</h1>
    <p>Context Studio v2.0</p>
  </div>
</body>
</html>`,
        metadata: { language: 'html' }
      }
    ]
  },
  'tpl:python_lab': {
    title: 'Python Lab',
    icon: '🐍',
    blocks: [
      { id: 'p1', type: 'heading', content: 'Data Logic' },
      { 
        id: 'p2', 
        type: 'code', 
        content: `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print("Generating sequence:")
print(list(fibonacci(10)))`,
        metadata: { language: 'python' }
      }
    ]
  }
};
