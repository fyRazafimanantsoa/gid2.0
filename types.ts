
export type BlockType = 
  | 'text' 
  | 'heading' 
  | 'todo' 
  | 'code' 
  | 'divider' 
  | 'kanban' 
  | 'database' 
  | 'mindmap'
  | 'project_os'
  | 'callout'
  | 'embed'
  | 'quote'
  | 'table'
  | 'image'
  | 'video'
  | 'audio'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'math'
  | 'emoji';

export type ScheduleType = 'today' | 'week' | 'someday' | null;
export type ImportanceLevel = 'High' | 'Medium' | 'Low' | 'Extension';

export interface LinkMetadata {
  sourcePageId: string;
  sourceBlockId?: string;
  type: 'live' | 'snapshot';
  createdAt: number;
  updatedAt: number;
}

export interface SubTask {
  id: string;
  text: string;
  checked: boolean;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string; 
  checked?: boolean;
  schedule?: ScheduleType;
  lastEditedAt?: number; 
  metadata?: any; 
  linkMetadata?: LinkMetadata;
}

export interface Page {
  id: string;
  title: string;
  blocks: Block[];
  updatedAt: number;
  isDeleted?: boolean;
  deletedAt?: number;
}

export type DbColType = 'text' | 'number' | 'checkbox' | 'date' | 'select' | 'tags' | 'progress' | 'rating' | 'relation' | 'checklist';

export interface DatabaseColumn {
  id: string;
  title: string;
  type: DbColType;
  width?: number;
  options?: string[];
  visible?: boolean;
  relationPageId?: string;
}

export interface DatabaseData {
  columns: DatabaseColumn[];
  rows: Record<string, any>[];
  viewConfig?: {
    sortBy?: { colId: string; direction: 'asc' | 'desc' };
    filters?: { colId: string; value: string }[];
    searchQuery?: string;
    page?: number;
    pageSize?: number;
    viewMode?: 'table' | 'kanban' | 'gallery';
  };
}

export interface KanbanData {
  columns: {
    id: string;
    title: string;
    cards: { id: string; content: string; checked: boolean }[];
  }[];
}

export interface MindMapNode {
  id: string;
  text: string;
  x?: number;
  y?: number;
  taskId?: string;
  children: MindMapNode[];
}

export interface UserSettings {
  name: string;
  avatar?: string;
  fontSize: 'small' | 'medium' | 'large';
  autoSaveInterval: number;
  theme: 'light' | 'dark' | 'system';
}
