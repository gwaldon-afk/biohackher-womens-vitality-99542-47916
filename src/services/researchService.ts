import { supabase } from "@/integrations/supabase/client";

export interface ResearchStudy {
  id: string;
  title: string;
  authors: string;
  journal: string | null;
  year: number | null;
  doi: string | null;
  url: string | null;
  abstract: string | null;
  key_findings: string[] | null;
  study_type: 'rct' | 'meta-analysis' | 'cohort' | 'case-control' | 'review' | 'other' | null;
  sample_size: number | null;
  related_symptoms: string[] | null;
  related_pillars: string[] | null;
  related_toolkit_items: string[] | null;
  related_products: string[] | null;
  evidence_level: 'gold' | 'silver' | 'bronze' | 'emerging' | null;
  is_women_specific: boolean;
  display_order: number | null;
  is_active: boolean;
}

/**
 * Fetch all active research studies
 */
export const getResearchStudies = async () => {
  const { data, error } = await supabase
    .from('research_studies')
    .select('*')
    .eq('is_active', true)
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching research studies:', error);
    throw error;
  }

  return data as ResearchStudy[];
};

/**
 * Fetch research studies by pillar
 */
export const getResearchStudiesByPillar = async (pillar: string) => {
  const { data, error } = await supabase
    .from('research_studies')
    .select('*')
    .eq('is_active', true)
    .contains('related_pillars', [pillar])
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching research studies by pillar:', error);
    throw error;
  }

  return data as ResearchStudy[];
};

/**
 * Fetch research studies by symptom
 */
export const getResearchStudiesBySymptom = async (symptom: string) => {
  const { data, error } = await supabase
    .from('research_studies')
    .select('*')
    .eq('is_active', true)
    .contains('related_symptoms', [symptom])
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching research studies by symptom:', error);
    throw error;
  }

  return data as ResearchStudy[];
};

/**
 * Fetch women-specific research studies
 */
export const getWomenSpecificResearch = async () => {
  const { data, error } = await supabase
    .from('research_studies')
    .select('*')
    .eq('is_active', true)
    .eq('is_women_specific', true)
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching women-specific research:', error);
    throw error;
  }

  return data as ResearchStudy[];
};

/**
 * Fetch research by evidence level
 */
export const getResearchByEvidenceLevel = async (evidenceLevel: string) => {
  const { data, error } = await supabase
    .from('research_studies')
    .select('*')
    .eq('is_active', true)
    .eq('evidence_level', evidenceLevel)
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching research by evidence level:', error);
    throw error;
  }

  return data as ResearchStudy[];
};

/**
 * Get research study by ID
 */
export const getResearchStudyById = async (studyId: string) => {
  const { data, error } = await supabase
    .from('research_studies')
    .select('*')
    .eq('id', studyId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching research study:', error);
    throw error;
  }

  return data as ResearchStudy;
};
