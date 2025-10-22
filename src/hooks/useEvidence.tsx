import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ResearchStudy } from '@/services/researchService';
import { getEvidenceContext } from '@/data/evidenceMapping';

interface UseEvidenceOptions {
  enabled?: boolean;
}

export const useEvidence = (evidenceKey: string, options: UseEvidenceOptions = {}) => {
  const evidenceContext = getEvidenceContext(evidenceKey);
  
  return useQuery({
    queryKey: ['evidence', evidenceKey],
    queryFn: async () => {
      if (!evidenceContext) {
        throw new Error(`No evidence mapping found for key: ${evidenceKey}`);
      }

      const { query } = evidenceContext;
      let supabaseQuery = supabase
        .from('research_studies')
        .select('*')
        .eq('is_active', true);

      // Apply filters based on query parameters
      if (query.related_pillars && query.related_pillars.length > 0) {
        supabaseQuery = supabaseQuery.overlaps('related_pillars', query.related_pillars);
      }

      if (query.related_toolkit_items && query.related_toolkit_items.length > 0) {
        supabaseQuery = supabaseQuery.overlaps('related_toolkit_items', query.related_toolkit_items);
      }

      if (query.related_symptoms && query.related_symptoms.length > 0) {
        supabaseQuery = supabaseQuery.overlaps('related_symptoms', query.related_symptoms);
      }

      if (query.is_women_specific !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_women_specific', query.is_women_specific);
      }

      // Order by evidence level and year
      const { data, error } = await supabaseQuery
        .order('evidence_level', { ascending: true }) // gold comes first alphabetically
        .order('year', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching evidence:', error);
        throw error;
      }

      return {
        studies: (data as ResearchStudy[]) || [],
        context: evidenceContext,
      };
    },
    enabled: options.enabled !== false && !!evidenceContext,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
