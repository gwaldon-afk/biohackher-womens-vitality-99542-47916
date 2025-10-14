// Centralized export for all queries
export * from './protocolQueries';
export * from './assessmentQueries';
export * from './goalQueries';

// Re-export specific hooks for convenience
export { 
  useProtocols, 
  useProtocolItems, 
  useCreateProtocol,
  useUpdateProtocol,
  useDeleteProtocol,
  useCreateProtocolItem,
  useUpdateProtocolItem,
  useDeleteProtocolItem
} from './protocolQueries';

export { 
  useAssessments, 
  useDailyScores, 
  useUserSymptoms,
  useSymptomAssessments,
  useAssessmentCompletions,
  useCreateAssessmentCompletion,
  useCreateSymptomAssessment
} from './assessmentQueries';

export { useGoals } from './goalQueries';
