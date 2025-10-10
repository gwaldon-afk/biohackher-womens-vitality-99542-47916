-- First create wearable_connections table
CREATE TABLE IF NOT EXISTS public.wearable_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_user_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  last_sync_at timestamp with time zone,
  sync_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;

-- Policies for connections
DROP POLICY IF EXISTS "Users can view their own connections" ON public.wearable_connections;
DROP POLICY IF EXISTS "Users can insert their own connections" ON public.wearable_connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON public.wearable_connections;
DROP POLICY IF EXISTS "Users can delete their own connections" ON public.wearable_connections;

CREATE POLICY "Users can view their own connections"
  ON public.wearable_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections"
  ON public.wearable_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
  ON public.wearable_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections"
  ON public.wearable_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wearable_connections_user ON public.wearable_connections(user_id, is_active);

-- Create trigger
DROP TRIGGER IF EXISTS update_wearable_connections_updated_at ON public.wearable_connections;
CREATE TRIGGER update_wearable_connections_updated_at
  BEFORE UPDATE ON public.wearable_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();