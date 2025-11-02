-- Add permissions column to user_roles for granular access control
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- Create admin audit log table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_audit_log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create user feedback/support tickets table
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature_request', 'support', 'other')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on user_feedback
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.user_feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can create feedback
CREATE POLICY "Users can create feedback"
ON public.user_feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON public.user_feedback
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can update feedback
CREATE POLICY "Admins can update feedback"
ON public.user_feedback
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user ON public.admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_performed_at ON public.admin_audit_log(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON public.user_feedback(created_at DESC);

-- Trigger to update updated_at on user_feedback
CREATE TRIGGER update_user_feedback_updated_at
  BEFORE UPDATE ON public.user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();