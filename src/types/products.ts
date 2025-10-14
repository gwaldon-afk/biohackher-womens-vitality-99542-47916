// TypeScript types for products
import { Contraindication, TargetSymptom, Benefit, ResearchCitation } from './protocols';

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  description: string;
  detailed_description: string | null;
  category: string;
  price_usd: number | null;
  price_gbp: number | null;
  price_cad: number | null;
  price_aud: number | null;
  image_url: string | null;
  affiliate_link: string | null;
  usage_instructions: string | null;
  is_active: boolean;
  display_order: number | null;
  evidence_level: string | null;
  ingredients: Record<string, any> | null;
  benefits: Benefit[] | null;
  contraindications: Contraindication[] | null;
  target_symptoms: TargetSymptom[] | null;
  target_pillars: string[] | null;
  research_citations: ResearchCitation[] | null;
  created_at: string;
  updated_at: string;
}
