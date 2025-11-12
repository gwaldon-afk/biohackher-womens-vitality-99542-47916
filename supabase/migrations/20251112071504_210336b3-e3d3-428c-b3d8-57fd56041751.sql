-- Feature 4: User Notification Preferences Table
CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_assessment_reminders BOOLEAN DEFAULT true,
  email_weekly_reports BOOLEAN DEFAULT true,
  email_protocol_updates BOOLEAN DEFAULT false,
  email_marketing BOOLEAN DEFAULT false,
  push_daily_nudges BOOLEAN DEFAULT true,
  push_symptom_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS policies
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification preferences"
  ON user_notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON user_notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON user_notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optional: Notification Log Table for tracking
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'push')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'opened', 'clicked')),
  metadata JSONB
);

-- RLS for notification log
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification logs"
  ON notification_log FOR SELECT
  USING (auth.uid() = user_id);