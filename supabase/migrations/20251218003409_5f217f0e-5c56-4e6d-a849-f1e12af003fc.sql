-- Create marketing_leads table for abandoned guest sessions and lead nurturing
CREATE TABLE public.marketing_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  session_id TEXT,
  source TEXT NOT NULL DEFAULT 'assessment',
  assessment_type TEXT,
  assessment_score NUMERIC,
  converted_at TIMESTAMP WITH TIME ZONE,
  converted_user_id UUID,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  email_count INTEGER DEFAULT 0,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on email
CREATE UNIQUE INDEX idx_marketing_leads_email ON public.marketing_leads(email);

-- Create index for unconverted leads for remarketing queries
CREATE INDEX idx_marketing_leads_unconverted ON public.marketing_leads(converted_at) WHERE converted_at IS NULL;

-- Create index for email campaigns
CREATE INDEX idx_marketing_leads_marketing ON public.marketing_leads(marketing_consent, unsubscribed_at) WHERE marketing_consent = true AND unsubscribed_at IS NULL;

-- Enable RLS
ALTER TABLE public.marketing_leads ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (for guest lead capture)
CREATE POLICY "Anyone can create marketing leads" 
ON public.marketing_leads 
FOR INSERT 
WITH CHECK (true);

-- Allow users to view/update their own lead (matched by email)
CREATE POLICY "Users can view their own lead" 
ON public.marketing_leads 
FOR SELECT 
USING (auth.email() = email);

-- Update trigger
CREATE TRIGGER update_marketing_leads_updated_at
BEFORE UPDATE ON public.marketing_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();