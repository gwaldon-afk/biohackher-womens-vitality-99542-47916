// Zustand store for assessments
import { create } from 'zustand';
import { AssessmentCompletion, SymptomAssessment } from '@/types/assessments';

interface AssessmentStore {
  completions: AssessmentCompletion[];
  symptomAssessments: SymptomAssessment[];
  setCompletions: (completions: AssessmentCompletion[]) => void;
  addCompletion: (completion: AssessmentCompletion) => void;
  setSymptomAssessments: (assessments: SymptomAssessment[]) => void;
  addSymptomAssessment: (assessment: SymptomAssessment) => void;
  clearAll: () => void;
}

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  completions: [],
  symptomAssessments: [],
  
  setCompletions: (completions) => set({ completions }),
  
  addCompletion: (completion) => set((state) => ({
    completions: [...state.completions, completion]
  })),
  
  setSymptomAssessments: (assessments) => set({ symptomAssessments: assessments }),
  
  addSymptomAssessment: (assessment) => set((state) => ({
    symptomAssessments: [...state.symptomAssessments, assessment]
  })),
  
  clearAll: () => set({ completions: [], symptomAssessments: [] })
}));
