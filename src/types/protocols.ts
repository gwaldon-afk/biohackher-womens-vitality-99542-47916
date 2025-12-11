// TypeScript types for protocols

export interface Contraindication {
  condition: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  description?: string;
}

export interface TargetSymptom {
  symptom: string;
  effectiveness?: 'low' | 'moderate' | 'high' | 'very_high';
}

export interface Benefit {
  title: string;
  description: string;
  evidence_level?: 'low' | 'moderate' | 'high' | 'very_high';
}

export interface ResearchCitation {
  title: string;
  authors?: string;
  journal?: string;
  year?: number;
  doi?: string;
  url?: string;
  key_findings?: string;
  evidence_strength?: 'weak' | 'moderate' | 'strong' | 'very_strong';
  expert_source?: string;
}

export interface ProtocolVersion {
  id: string;
  protocol_id: string;
  version_number: number;
  created_at: string;
  updated_at: string;
  change_summary?: string;
  evidence_level?: 'low' | 'moderate' | 'high' | 'very_high';
  research_basis?: string;
  items_snapshot: any;
  created_by?: string;
}

export interface ProtocolResearchLink {
  id: string;
  protocol_id?: string;
  protocol_item_id?: string;
  research_title: string;
  authors?: string;
  journal?: string;
  publication_year?: number;
  doi?: string;
  url?: string;
  key_findings?: string;
  evidence_strength?: 'weak' | 'moderate' | 'strong' | 'very_strong';
  expert_source?: string;
  created_at: string;
  updated_at: string;
}

export interface Protocol {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_from_pillar: string | null;
  created_at: string;
  updated_at: string;
  source_type?: string | null;
  source_recommendation_id?: string | null;
}

export interface ProtocolItem {
  id: string;
  protocol_id: string;
  item_type: 'supplement' | 'therapy' | 'habit' | 'exercise' | 'diet';
  name: string;
  description: string | null;
  dosage: string | null;
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
  time_of_day: string[] | null;
  notes: string | null;
  product_link: string | null;
  product_id: string | null;
  is_active: boolean;
  included_in_plan?: boolean;
  created_at: string;
  updated_at: string;
  meal_template_id?: string | null;
  recipe_data?: any | null;
}

export interface ProtocolItemCompletion {
  id: string;
  user_id: string;
  protocol_item_id: string;
  completed_date: string;
  completed_at: string;
  notes: string | null;
  created_at: string;
}
