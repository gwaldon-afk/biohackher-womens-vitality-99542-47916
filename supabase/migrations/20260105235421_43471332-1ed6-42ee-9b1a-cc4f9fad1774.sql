-- Create qa_checklists table
CREATE TABLE public.qa_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  app_id UUID,
  name TEXT NOT NULL DEFAULT 'Untitled Checklist',
  checklist_data JSONB NOT NULL DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.qa_checklists ENABLE ROW LEVEL SECURITY;

-- RLS policies for qa_checklists
CREATE POLICY "Users can view their own checklists"
  ON public.qa_checklists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checklists"
  ON public.qa_checklists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklists"
  ON public.qa_checklists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklists"
  ON public.qa_checklists FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger for qa_checklists
CREATE TRIGGER update_qa_checklists_updated_at
  BEFORE UPDATE ON public.qa_checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create qa_fix_prompts table
CREATE TABLE public.qa_fix_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID REFERENCES public.qa_checklists(id) ON DELETE CASCADE NOT NULL,
  prompt_text TEXT NOT NULL,
  issues_included JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  resolution_status TEXT DEFAULT 'pending',
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.qa_fix_prompts ENABLE ROW LEVEL SECURITY;

-- RLS policies for qa_fix_prompts
CREATE POLICY "Users can view prompts via checklist ownership"
  ON public.qa_fix_prompts FOR SELECT
  USING (checklist_id IN (SELECT id FROM public.qa_checklists WHERE user_id = auth.uid()));

CREATE POLICY "Users can create prompts via checklist ownership"
  ON public.qa_fix_prompts FOR INSERT
  WITH CHECK (checklist_id IN (SELECT id FROM public.qa_checklists WHERE user_id = auth.uid()));

CREATE POLICY "Users can update prompts via checklist ownership"
  ON public.qa_fix_prompts FOR UPDATE
  USING (checklist_id IN (SELECT id FROM public.qa_checklists WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete prompts via checklist ownership"
  ON public.qa_fix_prompts FOR DELETE
  USING (checklist_id IN (SELECT id FROM public.qa_checklists WHERE user_id = auth.uid()));

-- Create qa_resolution_history table
CREATE TABLE public.qa_resolution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fix_prompt_id UUID REFERENCES public.qa_fix_prompts(id) ON DELETE CASCADE NOT NULL,
  issue_key TEXT NOT NULL,
  issue_category TEXT NOT NULL,
  original_status TEXT NOT NULL,
  original_notes TEXT,
  new_status TEXT NOT NULL,
  resolution_notes TEXT,
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.qa_resolution_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for qa_resolution_history
CREATE POLICY "Users can view resolution history via ownership"
  ON public.qa_resolution_history FOR SELECT
  USING (fix_prompt_id IN (
    SELECT fp.id FROM public.qa_fix_prompts fp
    JOIN public.qa_checklists qc ON fp.checklist_id = qc.id
    WHERE qc.user_id = auth.uid()
  ));

CREATE POLICY "Users can create resolution history via ownership"
  ON public.qa_resolution_history FOR INSERT
  WITH CHECK (fix_prompt_id IN (
    SELECT fp.id FROM public.qa_fix_prompts fp
    JOIN public.qa_checklists qc ON fp.checklist_id = qc.id
    WHERE qc.user_id = auth.uid()
  ));

CREATE POLICY "Users can update resolution history via ownership"
  ON public.qa_resolution_history FOR UPDATE
  USING (fix_prompt_id IN (
    SELECT fp.id FROM public.qa_fix_prompts fp
    JOIN public.qa_checklists qc ON fp.checklist_id = qc.id
    WHERE qc.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete resolution history via ownership"
  ON public.qa_resolution_history FOR DELETE
  USING (fix_prompt_id IN (
    SELECT fp.id FROM public.qa_fix_prompts fp
    JOIN public.qa_checklists qc ON fp.checklist_id = qc.id
    WHERE qc.user_id = auth.uid()
  ));