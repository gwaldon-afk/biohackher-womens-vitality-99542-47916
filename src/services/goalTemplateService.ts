import { supabase } from "@/integrations/supabase/client";

export interface GoalTemplate {
  id: string;
  template_key: string;
  name: string;
  description: string;
  detailed_description: string | null;
  pillar_category: 'brain' | 'body' | 'balance' | 'beauty';
  icon_name: string;
  target_assessment_types: string[];
  default_healthspan_target: any;
  default_interventions: any;
  default_metrics: any;
  common_barriers: any;
  display_order: number;
  is_active: boolean;
  is_premium_only: boolean;
}

/**
 * Fetch all active templates, ordered by display_order
 */
export const getAllTemplates = async (): Promise<GoalTemplate[]> => {
  const { data, error } = await supabase
    .from('goal_templates')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching goal templates:', error);
    throw error;
  }

  return data as GoalTemplate[];
};

/**
 * Fetch templates by pillar category
 */
export const getTemplatesByPillar = async (pillar: string): Promise<GoalTemplate[]> => {
  const { data, error } = await supabase
    .from('goal_templates')
    .select('*')
    .eq('is_active', true)
    .eq('pillar_category', pillar)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching templates by pillar:', error);
    throw error;
  }

  return data as GoalTemplate[];
};

/**
 * Find best matching template for an assessment type
 * NO HARDCODING - uses database assessment mappings
 */
export const getTemplateByAssessmentType = async (
  assessmentType: string
): Promise<GoalTemplate | null> => {
  const { data, error } = await supabase
    .from('goal_templates')
    .select('*')
    .eq('is_active', true)
    .contains('target_assessment_types', [assessmentType])
    .order('display_order', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching template by assessment:', error);
    return null;
  }

  return data as GoalTemplate | null;
};

/**
 * Get template by key
 */
export const getTemplateByKey = async (templateKey: string): Promise<GoalTemplate | null> => {
  const { data, error } = await supabase
    .from('goal_templates')
    .select('*')
    .eq('template_key', templateKey)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching template by key:', error);
    return null;
  }

  return data as GoalTemplate | null;
};

/**
 * Get template by ID
 */
export const getTemplateById = async (templateId: string): Promise<GoalTemplate | null> => {
  const { data, error } = await supabase
    .from('goal_templates')
    .select('*')
    .eq('id', templateId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching template by ID:', error);
    return null;
  }

  return data as GoalTemplate | null;
};
