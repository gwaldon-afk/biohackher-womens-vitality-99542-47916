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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
