import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AssessmentFlowState {
  isActive: boolean;
  flowType: 'suggested' | 'single' | null;
  assessmentQueue: string[]; // Array of symptom IDs
  currentIndex: number;
  themeId: string | null;
  completedIds: string[];
  sessionId: string | null; // For guest users to claim assessments later
}

interface AssessmentFlowStore extends AssessmentFlowState {
  startFlow: (assessmentIds: string[], themeId: string, flowType: 'suggested' | 'single') => void;
  completeCurrentAssessment: () => void;
  getNextAssessment: () => string | null;
  hasMoreAssessments: () => boolean;
  clearFlow: () => void;
  setSessionId: (sessionId: string) => void;
}

export const useAssessmentFlowStore = create<AssessmentFlowStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isActive: false,
      flowType: null,
      assessmentQueue: [],
      currentIndex: 0,
      themeId: null,
      completedIds: [],
      sessionId: null,

      // Actions
      startFlow: (assessmentIds, themeId, flowType) => set({
        isActive: true,
        flowType,
        assessmentQueue: assessmentIds,
        currentIndex: 0,
        themeId,
        completedIds: [],
        sessionId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }),

      completeCurrentAssessment: () => {
        const state = get();
        const currentId = state.assessmentQueue[state.currentIndex];
        set({
          completedIds: [...state.completedIds, currentId],
          currentIndex: state.currentIndex + 1
        });
      },

      getNextAssessment: () => {
        const state = get();
        if (state.currentIndex < state.assessmentQueue.length) {
          return state.assessmentQueue[state.currentIndex];
        }
        return null;
      },

      hasMoreAssessments: () => {
        const state = get();
        return state.currentIndex < state.assessmentQueue.length - 1;
      },

      clearFlow: () => set({
        isActive: false,
        flowType: null,
        assessmentQueue: [],
        currentIndex: 0,
        themeId: null,
        completedIds: [],
        sessionId: null
      }),

      setSessionId: (sessionId) => set({ sessionId })
    }),
    {
      name: 'assessment-flow-storage', // localStorage key
      partialize: (state) => ({
        isActive: state.isActive,
        flowType: state.flowType,
        assessmentQueue: state.assessmentQueue,
        currentIndex: state.currentIndex,
        themeId: state.themeId,
        completedIds: state.completedIds,
        sessionId: state.sessionId
      })
    }
  )
);
