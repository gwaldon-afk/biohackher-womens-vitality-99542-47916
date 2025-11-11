-- Create email_shares table for tracking email sends and viral growth
CREATE TABLE email_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  share_type text NOT NULL CHECK (share_type IN ('self', 'other')),
  assessment_type text NOT NULL DEFAULT 'lis',
  score integer,
  shared_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  clicked_at timestamptz,
  converted_at timestamptz,
  share_source text CHECK (share_source IN ('guest_results', 'authenticated_results'))
);

CREATE INDEX idx_email_shares_user_id ON email_shares(user_id);
CREATE INDEX idx_email_shares_recipient ON email_shares(recipient_email);
CREATE INDEX idx_email_shares_shared_at ON email_shares(shared_at);

-- Enable RLS
ALTER TABLE email_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own email shares"
  ON email_shares FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert email shares"
  ON email_shares FOR INSERT
  WITH CHECK (true);