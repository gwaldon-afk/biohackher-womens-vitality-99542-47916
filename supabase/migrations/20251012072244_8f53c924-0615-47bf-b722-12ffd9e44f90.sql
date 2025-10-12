-- Fix security warnings for function search paths
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.update_goal_progress_on_checkin() SET search_path = 'public';