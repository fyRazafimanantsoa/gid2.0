
import { Block, KanbanData, DatabaseData, MindMapNode } from '../types';

export const TEMPLATES: Record<string, { title: string, icon: string, blocks: Block[] }> = {
  'tpl:meeting_notes': {
    title: 'Session Protocol',
    icon: '👥',
    blocks: [
      { id: 'mn1', type: 'h1', content: 'Sync: Protocol Objective' },
      { id: 'mn2', type: 'date', content: new Date().toISOString().split('T')[0] },
      { id: 'mn3', type: 'callout', content: 'Participants: Agent 0, System Core' },
      { id: 'mn4', type: 'h2', content: 'Strategic Agenda' },
      { id: 'mn5', type: 'todo', content: 'Review quarterly architecture' },
      { id: 'mn6', type: 'todo', content: 'Verify synapse integrity' },
      { id: 'mn7', type: 'divider', content: '' },
      { id: 'mn8', type: 'h2', content: 'Execution Vectors' },
      { id: 'mn9', type: 'todo', content: 'Deploy next-gen logic' }
    ]
  },
  'tpl:planner': {
    title: 'Strategic Roadmap',
    icon: '🗺️',
    blocks: [
      { id: 'pl1', type: 'h1', content: 'Strategic Timeline' },
      { id: 'pl2', type: 'database', content: JSON.stringify({
        columns: [
          { id: 'phase', title: 'Phase', type: 'select', options: ['Initial', 'Alpha', 'Beta', 'Stable'], width: 120 },
          { id: 'objective', title: 'Mission Objective', type: 'text', width: 250 },
          { id: 'status', title: 'Readiness', type: 'progress', width: 150 },
          { id: 'milestones', title: 'Key Milestones', type: 'checklist', width: 300 }
        ],
        rows: [
          { id: 'r1', phase: 'Alpha', objective: 'Core Logic Stability', status: 40, milestones: [] }
        ]
      } as DatabaseData) }
    ]
  },
  'tpl:prd_blueprint': {
    title: 'Product Blueprint',
    icon: '📘',
    blocks: [
      { id: 'prd1', type: 'h1', content: 'Blueprint: Neural Interface' },
      { id: 'prd2', type: 'callout', content: 'Status: Architecture Phase' },
      { id: 'prd3', type: 'h2', content: '1. Strategic Summary' },
      { id: 'prd4', type: 'text', content: 'Defining the spatial logic for the next-gen workspace...' },
      { id: 'prd5', type: 'quote', content: 'Design is not just what it looks like; it is how it works.' },
      { id: 'prd6', type: 'h2', content: '2. Capability Set' },
      { id: 'prd7', type: 'todo', content: 'Implement temporal history tracking' },
      { id: 'prd8', type: 'todo', content: 'Verified multi-node bridge' }
    ]
  },
  'tpl:sop_document': {
    title: 'Operating Guide',
    icon: '📜',
    blocks: [
      { id: 'sop1', type: 'h1', content: 'Onboarding Protocol' },
      { id: 'sop2', type: 'text', content: 'Standard operating procedure for node initialization.' },
      { id: 'sop3', type: 'todo', content: 'Define mission parameters' },
      { id: 'sop4', type: 'todo', content: 'Initialize Mind Map core' },
      { id: 'sop5', type: 'todo', content: 'Audit resource repository' }
    ]
  },
  'tpl:project_mgmt': {
    title: 'Mission Control',
    icon: '🛰️',
    blocks: [
      { id: 'p1', type: 'h1', content: 'Unified Project OS' },
      { id: 'p2', type: 'callout', content: 'Context: Full lifecycle project orchestration.' },
      { id: 'p3', type: 'project_os', content: JSON.stringify({
        tasks: [
          { 
            id: 't1', 
            title: 'Deploy Production Core', 
            metadata: { 
              importance: 'High', 
              status: 'In Progress', 
              deadline: Date.now() + 86400000,
              subTasks: [
                { id: 'st1', text: 'Optimize CSS shaders', checked: true },
                { id: 'st2', text: 'Audit local database', checked: false }
              ]
            } 
          }
        ],
        mindMap: {
          id: 'root',
          text: 'Core Strategy',
          x: 2000,
          y: 2000,
          children: [
            { id: 'node1', text: 'Design Phase', x: 2200, y: 1950, children: [] },
            { id: 'node2', text: 'Logic Phase', x: 2200, y: 2050, children: [] }
          ]
        }
      }) }
    ]
  },
  'tpl:kanban_board': {
    title: 'Flow Pipeline',
    icon: '▥',
    blocks: [
      { id: 'kb1', type: 'h1', content: 'Execution Pipeline' },
      { id: 'kb2', type: 'kanban', content: JSON.stringify({
        columns: [
          { id: 'c1', title: 'Pending', cards: [{ id: 'k1', content: 'Draft initial architecture', checked: false }] },
          { id: 'c2', title: 'Active', cards: [] },
          { id: 'c3', title: 'Validation', cards: [] },
          { id: 'c4', title: 'Deployed', cards: [] }
        ]
      } as KanbanData) }
    ]
  },
  'tpl:project_db': {
    title: 'Resource Repository',
    icon: '▦',
    blocks: [
      { id: 'db1', type: 'h1', content: 'Context Master Inventory' },
      { id: 'db2', type: 'database', content: JSON.stringify({
        columns: [
          { id: 'item', title: 'Resource Name', type: 'text', width: 200 },
          { id: 'status', title: 'State', type: 'tags', width: 150 },
          { id: 'roadmap', title: 'Checklist', type: 'checklist', width: 250 },
          { id: 'progress', title: 'Sync Level', type: 'progress', width: 150 }
        ],
        rows: [
          { 
            id: 'r1', 
            item: 'System Kernel v2', 
            status: ['Stable'], 
            roadmap: [
              { id: 'st1', text: 'Verified', checked: true }
            ],
            progress: 100
          }
        ]
      } as DatabaseData) }
    ]
  },
  'tpl:habit': {
    title: 'Habit Analytics',
    icon: '⚡',
    blocks: [
      { id: 'h1', type: 'h1', content: 'Routine Optimization' },
      { id: 'h2', type: 'database', content: JSON.stringify({
        columns: [
          { id: 'habit', title: 'Routine', type: 'text', width: 200 },
          { id: 'm', title: 'M', type: 'checkbox', width: 40 },
          { id: 't', title: 'T', type: 'checkbox', width: 40 },
          { id: 'w', title: 'W', type: 'checkbox', width: 40 },
          { id: 'th', title: 'Th', type: 'checkbox', width: 40 },
          { id: 'f', title: 'F', type: 'checkbox', width: 40 },
          { id: 'streak', title: 'Momentum', type: 'progress', width: 120 }
        ],
        rows: [
          { id: 'r1', habit: 'Morning Focus Session', m: true, t: true, w: true, th: false, f: false, streak: 60 }
        ]
      } as DatabaseData) }
    ]
  },
  'tpl:daily': {
    title: 'Daily Protocol',
    icon: '☀️',
    blocks: [
      { id: 'd1', type: 'h1', content: 'Daily Protocol: Session Active' },
      { id: 'd2', type: 'timer', content: '0', metadata: { state: 'stopped' } },
      { id: 'd3', type: 'todo', content: 'Primary Objective', schedule: 'today' },
      { id: 'd4', type: 'divider', content: '' }
    ]
  },
  'tpl:code_space': {
    title: 'Code Space',
    icon: '💻',
    blocks: [
      { id: 'cs1', type: 'h1', content: 'Engineering Environment' },
      { id: 'cs2', type: 'callout', content: 'Integrated Web Lab (JS/HTML/CSS) and Python Logic prototyping environment.' },
      { 
        id: 'cs3', 
        type: 'code', 
        content: JSON.stringify({
          html: '<h2 style="color: #22d3ee; font-weight: 900;">GID WEB LAB</h2>\n<p>Context Ready.</p>\n<button id="pulse">Launch Sequence</button>',
          css: 'button {\n  background: #22d3ee;\n  color: #000;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 8px;\n  font-weight: 900;\n  cursor: pointer;\n  transition: 0.3s;\n}\nbutton:hover {\n  scale: 1.05;\n  box-shadow: 0 0 20px rgba(34,211,238,0.5);\n}',
          js: 'document.getElementById("pulse").onclick = () => {\n  console.log("Web Pulse Detected");\n  alert("Logic Synchronized");\n};'
        }), 
        metadata: { language: 'javascript' } 
      },
      { id: 'cs4', type: 'h2', content: 'System Documentation' },
      { id: 'cs5', type: 'text', content: 'Use the expanded mode for a full CodePen-style development environment with real-time rendering.' }
    ]
  }
};
