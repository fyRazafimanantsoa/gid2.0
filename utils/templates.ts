
import { Block } from '../types';

export const TEMPLATES: Record<string, { title: string; description?: string; icon?: string; blocks: Block[] }> = {
  'blank': {
    title: 'Page vide',
    description: 'Commencez à partir d\'une page vide',
    icon: '📄',
    blocks: [
      { id: 'b1', type: 'text', content: 'Nouvelle page' }
    ]
  },

  'meeting-notes': {
    title: 'Notes de réunion',
    description: 'Template pour prendre des notes pendant une réunion',
    icon: '📝',
    blocks: [
      { id: 'mn1', type: 'h1', content: 'Notes de réunion' },
      { id: 'mn2', type: 'date', content: new Date().toISOString().split('T')[0] },
      { id: 'mn3', type: 'h2', content: 'Agenda' },
      { id: 'mn4', type: 'todo', content: JSON.stringify([{ text: 'Action 1', done: false }, { text: 'Action 2', done: false }]) },
      { id: 'mn5', type: 'text', content: 'Décisions prises:' }
    ]
  },

  'database': {
    title: 'Base de données / Table',
    description: 'Table simple pour stocker objets, tâches ou références',
    icon: '🗃️',
    blocks: [
      {
        id: 'db1',
        type: 'database',
        content: JSON.stringify({
          name: 'Contacts',
          columns: [
            { id: 'name', title: 'Nom', type: 'text' },
            { id: 'email', title: 'Email', type: 'text' },
            { id: 'company', title: 'Entreprise', type: 'text' },
            { id: 'status', title: 'Statut', type: 'select', options: ['Lead', 'Client', 'Prospect'] }
          ],
          rows: [
            { id: 'r1', values: { name: 'Alice Dupont', email: 'alice@example.com', company: 'Acme', status: 'Client' } },
            { id: 'r2', values: { name: 'Bob Martin', email: 'bob@example.com', company: 'Beta', status: 'Lead' } }
          ]
        })
      }
    ]
  },

  'kanban': {
    title: 'Kanban Simple',
    description: 'Organisation par colonnes pour workflows',
    icon: '📋',
    blocks: [
      {
        id: 'k1',
        type: 'kanban',
        content: JSON.stringify({ lanes: [
          { id: 'todo', title: 'À faire', cards: [{ id: 'c1', title: 'Planifier release' }] },
          { id: 'doing', title: 'En cours', cards: [{ id: 'c2', title: 'Développer feature X' }] },
          { id: 'done', title: 'Fait', cards: [{ id: 'c3', title: 'Story grooming' }] }
        ] })
      }
    ]
  },

  'project-management': {
    title: 'Gestion de projet',
    description: 'Vue projet avec backlog, roadmap et tâches',
    icon: '📈',
    blocks: [
      { id: 'pm1', type: 'h1', content: 'Nom du projet' },
      { id: 'pm2', type: 'text', content: "Objectif : Décrire l'objectif principal du projet." },
      { id: 'pm3', type: 'kanban', content: JSON.stringify({ lanes: [
        { id: 'backlog', title: 'Backlog', cards: [{ id: 'p1', title: 'User story A' }, { id: 'p2', title: 'User story B' }] },
        { id: 'sprint', title: 'Sprint en cours', cards: [] },
        { id: 'done', title: 'Terminé', cards: [] }
      ] }) },
      { id: 'pm4', type: 'database', content: JSON.stringify({
        name: 'Roadmap',
        columns: [
          { id: 'milestone', title: 'Milestone', type: 'text' },
          { id: 'due', title: 'Date limite', type: 'date' },
          { id: 'owner', title: 'Responsable', type: 'text' },
          { id: 'status', title: 'Statut', type: 'select', options: ['Planned', 'In progress', 'Done'] }
        ],
        rows: [
          { id: 'm1', values: { milestone: 'v1.0', due: '2026-03-01', owner: 'Alice', status: 'Planned' } }
        ]
      }) }
    ]
  },

  'mindmap': {
    title: 'Mindmap',
    description: 'Carte mentale pour brainstorm',
    icon: '🧠',
    blocks: [
      { id: 'mm1', type: 'mindmap', content: JSON.stringify({ root: { id: 'root', title: 'Idée centrale', children: [{ id: 'n1', title: 'Branche 1', children: [{ id: 'n1a', title: 'Idée A' }] }, { id: 'n2', title: 'Branche 2' }] } }) }
    ]
  },

  'code-playground': {
    title: 'Code / Web Lab',
    description: 'Exécutez HTML/CSS/JS ou Python (via pyodide) en local',
    icon: '🧩',
    blocks: [
      { id: 'cp1', type: 'code', content: '<!doctype html>\n<html><body><h1>Hello</h1></body></html>', metadata: { language: 'html' } },
      { id: 'cp2', type: 'code', content: "print('Hello from Pyodide')", metadata: { language: 'python' } }
    ]
  },

  'knowledge-graph': {
    title: 'Graphe de connaissances',
    description: 'Commencez un petit graphe pour relier concepts',
    icon: '🔗',
    blocks: [
      { id: 'kg1', type: 'knowledge-graph', content: JSON.stringify({ nodes: [{ id: 'k1', label: 'Concept A' }, { id: 'k2', label: 'Concept B' }], edges: [{ from: 'k1', to: 'k2', label: 'relates to' }] }) }
    ]
  }
};

// Backwards-compatible aliases for older tests and keys
// keep both `tpl:...` keys and the newer hyphenated keys
TEMPLATES['tpl:code_space'] = TEMPLATES['code-playground'];
TEMPLATES['tpl:meeting_notes'] = TEMPLATES['meeting-notes'];
TEMPLATES['tpl:planner'] = TEMPLATES['project-management'];
TEMPLATES['tpl:kanban_board'] = TEMPLATES['kanban'];
TEMPLATES['tpl:daily'] = TEMPLATES['blank'];

export default TEMPLATES;
