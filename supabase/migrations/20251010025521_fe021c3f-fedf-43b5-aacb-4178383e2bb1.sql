-- Phase 1: Foundation Database Schema
-- Creates tables for dynamic toolkit, products, research, and recommendations

-- ============================================
-- TOOLKIT CATEGORIES
-- ============================================
CREATE TABLE public.toolkit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.toolkit_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active toolkit categories"
  ON public.toolkit_categories
  FOR SELECT
  USING (is_active = true);

-- ============================================
-- TOOLKIT ITEMS
-- ============================================
CREATE TABLE public.toolkit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.toolkit_categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  
  -- Matching/Scoring fields
  target_symptoms JSONB,
  target_assessment_types JSONB,
  contraindications JSONB,
  evidence_level TEXT CHECK (evidence_level IN ('gold', 'silver', 'bronze', 'emerging')),
  
  -- Content
  protocols JSONB,
  benefits JSONB,
  research_citations JSONB,
  
  -- Metadata
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(category_id, slug)
);

ALTER TABLE public.toolkit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active toolkit items"
  ON public.toolkit_items
  FOR SELECT
  USING (is_active = true);

-- ============================================
-- USER TOOLKIT RECOMMENDATIONS
-- ============================================
CREATE TABLE public.user_toolkit_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  toolkit_item_id UUID REFERENCES public.toolkit_items(id) ON DELETE CASCADE,
  
  -- Scoring
  suitability_score NUMERIC(5,2) CHECK (suitability_score >= 0 AND suitability_score <= 100),
  applicability_score NUMERIC(5,2) CHECK (applicability_score >= 0 AND applicability_score <= 100),
  priority_rank INTEGER,
  
  -- Context
  matched_symptoms JSONB,
  matched_assessments JSONB,
  contraindication_flags JSONB,
  
  -- Engagement
  viewed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, toolkit_item_id)
);

ALTER TABLE public.user_toolkit_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own toolkit recommendations"
  ON public.user_toolkit_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own toolkit recommendations"
  ON public.user_toolkit_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own toolkit recommendations"
  ON public.user_toolkit_recommendations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  category TEXT NOT NULL,
  
  -- Pricing
  price_gbp NUMERIC(10,2),
  price_usd NUMERIC(10,2),
  price_aud NUMERIC(10,2),
  price_cad NUMERIC(10,2),
  affiliate_link TEXT,
  
  -- Matching
  target_symptoms JSONB,
  target_pillars JSONB,
  contraindications JSONB,
  
  -- Content
  benefits JSONB,
  ingredients JSONB,
  usage_instructions TEXT,
  research_citations JSONB,
  
  -- Metadata
  image_url TEXT,
  brand TEXT,
  evidence_level TEXT CHECK (evidence_level IN ('gold', 'silver', 'bronze', 'emerging')),
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.products
  FOR SELECT
  USING (is_active = true);

-- ============================================
-- PRODUCT SYMPTOMS (Many-to-Many)
-- ============================================
CREATE TABLE public.product_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  symptom_type TEXT NOT NULL,
  effectiveness_score NUMERIC(3,2) CHECK (effectiveness_score >= 0 AND effectiveness_score <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(product_id, symptom_type)
);

ALTER TABLE public.product_symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product symptoms"
  ON public.product_symptoms
  FOR SELECT
  USING (true);

-- ============================================
-- RESEARCH STUDIES
-- ============================================
CREATE TABLE public.research_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  journal TEXT,
  year INTEGER,
  doi TEXT,
  url TEXT,
  
  -- Content
  abstract TEXT,
  key_findings JSONB,
  study_type TEXT CHECK (study_type IN ('rct', 'meta-analysis', 'cohort', 'case-control', 'review', 'other')),
  sample_size INTEGER,
  
  -- Matching
  related_symptoms JSONB,
  related_pillars JSONB,
  related_toolkit_items UUID[],
  related_products UUID[],
  
  -- Quality
  evidence_level TEXT CHECK (evidence_level IN ('gold', 'silver', 'bronze', 'emerging')),
  is_women_specific BOOLEAN DEFAULT false,
  
  -- Metadata
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.research_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active research studies"
  ON public.research_studies
  FOR SELECT
  USING (is_active = true);

-- ============================================
-- CONTENT TRANSLATIONS (Future I18N)
-- ============================================
CREATE TABLE public.content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('toolkit_item', 'product', 'research', 'category')),
  content_id UUID NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en-GB', 'en-US', 'en-AU', 'en-CA')),
  
  -- Translated fields
  name TEXT,
  description TEXT,
  detailed_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(content_type, content_id, locale)
);

ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view content translations"
  ON public.content_translations
  FOR SELECT
  USING (true);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_toolkit_categories_updated_at
  BEFORE UPDATE ON public.toolkit_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_toolkit_items_updated_at
  BEFORE UPDATE ON public.toolkit_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_toolkit_recommendations_updated_at
  BEFORE UPDATE ON public.user_toolkit_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_studies_updated_at
  BEFORE UPDATE ON public.research_studies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_translations_updated_at
  BEFORE UPDATE ON public.content_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_toolkit_items_category ON public.toolkit_items(category_id) WHERE is_active = true;
CREATE INDEX idx_toolkit_items_slug ON public.toolkit_items(slug) WHERE is_active = true;
CREATE INDEX idx_user_toolkit_recommendations_user ON public.user_toolkit_recommendations(user_id);
CREATE INDEX idx_user_toolkit_recommendations_rank ON public.user_toolkit_recommendations(user_id, priority_rank);
CREATE INDEX idx_products_category ON public.products(category) WHERE is_active = true;
CREATE INDEX idx_research_studies_year ON public.research_studies(year DESC) WHERE is_active = true;