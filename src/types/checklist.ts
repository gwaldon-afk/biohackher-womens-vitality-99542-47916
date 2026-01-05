export type ItemStatus = 'untested' | 'pass' | 'fail' | 'review';

export interface ChecklistItemState {
  status: ItemStatus;
  notes: string;
  lastTested: string | null;
}

export interface EnhancedChecklistState {
  routes: Record<string, ChecklistItemState>;
  tables: Record<string, ChecklistItemState>;
  functions: Record<string, ChecklistItemState>;
  flows: Record<string, ChecklistItemState>;
  features: Record<string, ChecklistItemState>;
}

export interface ChecklistItem {
  id: string;
  label: string;
  path?: string;
  description?: string;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

export interface TableInfo {
  name: string;
  rowCount: number;
  hasRls: boolean;
}

export interface FunctionInfo {
  name: string;
  verifyJwt: boolean;
}

export interface BugItem {
  category: string;
  item: string;
  path?: string;
  notes: string;
  status: ItemStatus;
  lastTested: string | null;
}
