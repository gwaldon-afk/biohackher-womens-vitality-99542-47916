import { useState, useEffect, useCallback } from 'react';
import { EnhancedChecklistState, ChecklistItemState, ItemStatus, BugItem } from '@/types/checklist';

const STORAGE_KEY = 'biohackher-dev-checklist-v2';

const defaultItemState: ChecklistItemState = {
  status: 'untested',
  notes: '',
  lastTested: null,
};

const defaultState: EnhancedChecklistState = {
  routes: {},
  tables: {},
  functions: {},
  flows: {},
  features: {},
};

export const useChecklistState = () => {
  const [state, setState] = useState<EnhancedChecklistState>(defaultState);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (e) {
        console.error('Failed to parse checklist state:', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getItemState = useCallback((category: keyof EnhancedChecklistState, id: string): ChecklistItemState => {
    return state[category][id] || defaultItemState;
  }, [state]);

  const setItemStatus = useCallback((
    category: keyof EnhancedChecklistState,
    id: string,
    status: ItemStatus
  ) => {
    setState(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [id]: {
          ...(prev[category][id] || defaultItemState),
          status,
          lastTested: new Date().toISOString(),
        },
      },
    }));
  }, []);

  const setItemNotes = useCallback((
    category: keyof EnhancedChecklistState,
    id: string,
    notes: string
  ) => {
    setState(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [id]: {
          ...(prev[category][id] || defaultItemState),
          notes,
        },
      },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getCounts = useCallback((category: keyof EnhancedChecklistState, itemIds: string[]): Record<ItemStatus, number> => {
    const counts: Record<ItemStatus, number> = {
      untested: 0,
      pass: 0,
      fail: 0,
      review: 0,
    };

    itemIds.forEach(id => {
      const itemState = state[category][id];
      const status = itemState?.status || 'untested';
      counts[status]++;
    });

    return counts;
  }, [state]);

  const getAllCounts = useCallback((allItemIds: {
    routes: string[];
    tables: string[];
    functions: string[];
    flows: string[];
    features: string[];
  }): Record<ItemStatus, number> => {
    const counts: Record<ItemStatus, number> = {
      untested: 0,
      pass: 0,
      fail: 0,
      review: 0,
    };

    (Object.keys(allItemIds) as (keyof typeof allItemIds)[]).forEach(category => {
      allItemIds[category].forEach(id => {
        const itemState = state[category][id];
        const status = itemState?.status || 'untested';
        counts[status]++;
      });
    });

    return counts;
  }, [state]);

  const getBugs = useCallback((allItems: {
    routes: Array<{ id: string; label: string; path?: string }>;
    tables: Array<{ id: string; label: string }>;
    functions: Array<{ id: string; label: string }>;
    flows: Array<{ id: string; label: string }>;
    features: Array<{ id: string; label: string }>;
  }): BugItem[] => {
    const bugs: BugItem[] = [];

    (Object.keys(allItems) as (keyof typeof allItems)[]).forEach(category => {
      allItems[category].forEach(item => {
        const itemState = state[category][item.id];
        if (itemState?.status === 'fail' || itemState?.status === 'review') {
          bugs.push({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            item: item.label,
            path: 'path' in item ? item.path : undefined,
            notes: itemState.notes || '',
            status: itemState.status,
            lastTested: itemState.lastTested,
          });
        }
      });
    });

    return bugs;
  }, [state]);

  const exportAsJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biohackher-checklist-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state]);

  return {
    state,
    getItemState,
    setItemStatus,
    setItemNotes,
    resetAll,
    getCounts,
    getAllCounts,
    getBugs,
    exportAsJson,
  };
};
