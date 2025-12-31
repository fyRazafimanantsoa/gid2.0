
import { Block } from '../types';

// Compact template set to reduce bundle size for deployment while preserving key flows.
export const TEMPLATES: Record<string, { title: string, icon: string, blocks: Block[] }> = {
  'tpl:meeting_notes': {
    title: 'Session Protocol',
    icon: '👥',
    blocks: [
      { id: 'mn1', type: 'h1', content: 'Sync: Protocol Objective' },
      { id: 'mn2', type: 'date', content: new Date().toISOString().split('T')[0] },
      { id: 'mn3', type: 'h2', content: 'Strategic Agenda' },
      { id: 'mn4', type: 'todo', content: 'Review architecture' }
    ]
  },
  'tpl:planner': {
    title: 'Strategic Roadmap',
    icon: '🗺️',
    blocks: [
      { id: 'pl1', type: 'h1', content: 'Strategic Timeline' },
      { id: 'pl2', type: 'text', content: 'Define phases and objectives.' }
    ]
  },
  'tpl:kanban_board': {
    title: 'Flow Pipeline',
    icon: '▥',
    blocks: [
      { id: 'kb1', type: 'h1', content: 'Execution Pipeline' },
      { id: 'kb2', type: 'kanban', content: JSON.stringify({ columns: [
        { id: 'c1', title: 'Pending', cards: [{ id: 'k1', content: 'Draft initial architecture', checked: false }] },
        { id: 'c2', title: 'Active', cards: [] },
        { id: 'c3', title: 'Done', cards: [] }
      ] }) }
    ]
  },
  'tpl:daily': {
    title: 'Daily Protocol',
    icon: '☀️',
    blocks: [
      { id: 'd1', type: 'h1', content: 'Daily Protocol' },
      { id: 'd2', type: 'todo', content: 'Primary Objective' }
    ]
  },
  'tpl:code_space': {
    title: 'Code Space',
    icon: '💻',
    blocks: [
      { id: 'cs1', type: 'h1', content: 'Engineering Environment' },
      { id: 'cs2', type: 'code', content: JSON.stringify({ html: '<h2>GID WEB LAB</h2>', css: '', js: '' }), metadata: { language: 'javascript' } }
    ]
  }
};
