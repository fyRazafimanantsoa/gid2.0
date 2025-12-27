
import { Block, KanbanData, DatabaseData, MindMapNode } from '../types';

export const TEMPLATES: Record<string, { title: string, icon: string, blocks: Block[] }> = {
  'tpl:okr_engine': {
    title: 'OKR Strategy',
    icon: '🎯',
    blocks: [
      { id: 'okr1', type: 'heading', content: 'Q4 Strategy Objectives' },
      { id: 'okr2', type: 'callout', content: 'Mission: Achieve 20% growth in context depth.' },
      { id: 'okr3', type: 'database', content: JSON.stringify({
        columns: [
          { id: 'objective', title: 'Objective', type: 'text', width: 250 },
          { id: 'krs', title: 'Key Results', type: 'checklist', width: 300 },
          { id: 'progress', title: 'Realization', type: 'progress', width: 150 },
          { id: 'owner', title: 'Strategic Lead', type: 'text', width: 150 }
        ],
        rows: [
          { 
            id: 'o1', 
            objective: 'Market Dominance', 
            owner: 'Agent 0',
            krs: [
              { id: 'kr1', text: '10k active local users', checked: false },
              { id: 'kr2', text: 'Sub-10ms logic response', checked: true }
            ],
            progress: 50
          }
        ]
      } as DatabaseData) }
    ]
  },
  'tpl:prd_blueprint': {
    title: 'Product PRD',
    icon: '📘',
    blocks: [
      { id: 'prd1', type: 'heading', content: 'Feature: Temporal Synapse' },
      { id: 'prd2', type: 'callout', content: 'Status: Draft Stage' },
      { id: 'prd3', type: 'heading', content: '1. Executive Summary' },
      { id: 'prd4', type: 'text', content: 'Detailed description of the temporal synapse architecture...' },
      { id: 'prd5', type: 'quote', content: 'The user should never feel the latency of thought.' },
      { id: 'prd6', type: 'heading', content: '2. User Stories' },
      { id: 'prd7', type: 'todo', content: 'As a user, I want to track my thought duration.' },
      { id: 'prd8', type: 'todo', content: 'As a user, I want to export my logic paths.' }
    ]
  },
  'tpl:sop_document': {
    title: 'SOP Guide',
    icon: '📜',
    blocks: [
      { id: 'sop1', type: 'heading', content: 'Context Onboarding SOP' },
      { id: 'sop2', type: 'text', content: 'Follow these steps to initialize a new knowledge node.' },
      { id: 'sop3', type: 'todo', content: 'Step 1: Define core mission parameters' },
      { id: 'sop4', type: 'todo', content: 'Step 2: Initialize Mind Map core' },
      { id: 'sop5', type: 'todo', content: 'Step 3: Deploy relevant databases' },
      { id: 'sop6', type: 'divider', content: '' },
      { id: 'sop7', type: 'callout', content: 'Critical: Ensure local persistence is verified before exit.' }
    ]
  },
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
          }
        ]
      } as DatabaseData) }
    ]
  },
  'tpl:daily': {
    title: 'Daily Planner',
    icon: '☀️',
    blocks: [
      { id: 'd1', type: 'heading', content: 'Daily Review' },
      { id: 'd2', type: 'timer', content: '0', metadata: { state: 'stopped' } },
      { id: 'd3', type: 'todo', content: 'Major Objective', schedule: 'today' },
      { id: 'd4', type: 'divider', content: '' }
    ]
  }
};
