-- Create protocol item completions table for tracking daily completions
CREATE TABLE IF NOT EXISTS protocol_item_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  protocol_item_id uuid NOT NULL REFERENCES protocol_items(id) ON DELETE CASCADE,
  completed_date date NOT NULL DEFAULT CURRENT_DATE,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, protocol_item_id, completed_date)
);

-- Enable RLS
ALTER TABLE protocol_item_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own completions"
  ON protocol_item_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
  ON protocol_item_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions"
  ON protocol_item_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions"
  ON protocol_item_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_protocol_completions_user_date 
  ON protocol_item_completions(user_id, completed_date);

CREATE INDEX idx_protocol_completions_item 
  ON protocol_item_completions(protocol_item_id, completed_date);