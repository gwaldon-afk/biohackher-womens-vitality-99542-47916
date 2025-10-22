import { create } from 'zustand';

export interface EvidenceData {
  key: string;
  title: string;
  summary: string;
  context?: any;
}

interface EvidenceStore {
  isOpen: boolean;
  currentEvidence: EvidenceData | null;
  openEvidence: (key: string, title: string, summary: string, context?: any) => void;
  closeEvidence: () => void;
}

export const useEvidenceStore = create<EvidenceStore>((set) => ({
  isOpen: false,
  currentEvidence: null,
  openEvidence: (key, title, summary, context) => set({ 
    isOpen: true, 
    currentEvidence: { key, title, summary, context } 
  }),
  closeEvidence: () => set({ isOpen: false, currentEvidence: null }),
}));
