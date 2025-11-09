import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ResearchStudy } from '@/services/researchService';
import { getEvidenceContext } from '@/data/evidenceMapping';

interface UseEvidenceOptions {
  enabled?: boolean;
}

// Helper to normalize supplement names for evidence key matching
const normalizeEvidenceKey = (name: string): string => {
  // Remove dosage information in parentheses
  const baseName = name.replace(/\s*\([^)]*\)/g, '').trim();
  // Convert to lowercase and add toolkit prefix
  return `toolkit:${baseName.toLowerCase()}`;
};

export const useEvidence = (evidenceKey: string, options: UseEvidenceOptions = {}) => {
  // Try to normalize the key if it doesn't have a prefix
  const normalizedKey = evidenceKey.includes(':') ? evidenceKey : normalizeEvidenceKey(evidenceKey);
  const evidenceContext = getEvidenceContext(normalizedKey);
  
  return useQuery({
    queryKey: ['evidence', normalizedKey],
    queryFn: async () => {
      // If we have evidence context, use it
      if (evidenceContext) {
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

        const { data, error } = await supabaseQuery
          .order('evidence_level', { ascending: true })
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
      }

      // Fallback: Search database directly by supplement name
      const searchTerm = evidenceKey.replace(/\s*\([^)]*\)/g, '').trim();
      console.log('Searching research_studies for:', searchTerm);
      
      const { data, error } = await supabase
        .from('research_studies')
        .select('*')
        .eq('is_active', true)
        .or(`title.ilike.%${searchTerm}%,abstract.ilike.%${searchTerm}%,related_products.cs.{${searchTerm}}`)
        .order('evidence_level', { ascending: true })
        .order('year', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error searching research_studies:', error);
        throw error;
      }

      return {
        studies: (data as ResearchStudy[]) || [],
        context: {
          query: {},
          title: `Research Evidence for ${searchTerm}`,
          summary: `Scientific research supporting ${searchTerm} for health optimization.`
        },
      };
    },
    enabled: options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
