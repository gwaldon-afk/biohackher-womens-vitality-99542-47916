import { supabase } from "@/integrations/supabase/client";

export interface ToolkitCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
}

export interface ToolkitItem {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string;
  detailed_description: string | null;
  target_symptoms: string[] | null;
  target_assessment_types: string[] | null;
  contraindications: Array<{ condition: string; severity: string }> | null;
  evidence_level: 'gold' | 'silver' | 'bronze' | 'emerging' | null;
  protocols: any[] | null;
  benefits: string[] | null;
  research_citations: any[] | null;
  display_order: number | null;
  is_active: boolean;
}

export interface ToolkitItemWithCategory extends ToolkitItem {
  category: ToolkitCategory;
}

/**
 * Fetch all active toolkit categories
 */
export const getToolkitCategories = async () => {
  const { data, error } = await supabase
    .from('toolkit_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching toolkit categories:', error);
    throw error;
  }

  return data as ToolkitCategory[];
};

/**
 * Fetch a single toolkit category by slug
 */
export const getToolkitCategoryBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('toolkit_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching toolkit category:', error);
    throw error;
  }

  return data as ToolkitCategory;
};

/**
 * Fetch all toolkit items for a specific category
 */
export const getToolkitItemsByCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('toolkit_items')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching toolkit items:', error);
    throw error;
  }

  return data as unknown as ToolkitItem[];
};

/**
 * Fetch a single toolkit item by slug and category
 */
export const getToolkitItemBySlug = async (categorySlug: string, itemSlug: string) => {
  const { data, error } = await supabase
    .from('toolkit_items')
    .select(`
      *,
      category:toolkit_categories!inner(*)
    `)
    .eq('slug', itemSlug)
    .eq('is_active', true)
    .eq('category.slug', categorySlug)
    .eq('category.is_active', true)
    .single();

  if (error) {
    console.error('Error fetching toolkit item:', error);
    throw error;
  }

  return data as unknown as ToolkitItemWithCategory;
};

/**
 * Fetch all active toolkit items with their categories
 */
export const getAllToolkitItems = async () => {
  const { data, error } = await supabase
    .from('toolkit_items')
    .select(`
      *,
      category:toolkit_categories!inner(*)
    `)
    .eq('is_active', true)
    .eq('category.is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching all toolkit items:', error);
    throw error;
  }

  return data as unknown as ToolkitItemWithCategory[];
};

/**
 * Search toolkit items by symptoms
 */
export const searchToolkitItemsBySymptoms = async (symptoms: string[]) => {
  const { data, error } = await supabase
    .from('toolkit_items')
    .select(`
      *,
      category:toolkit_categories(*)
    `)
    .eq('is_active', true)
    .overlaps('target_symptoms', symptoms);

  if (error) {
    console.error('Error searching toolkit items:', error);
    throw error;
  }

  return data as unknown as ToolkitItemWithCategory[];
};
