-- Phase 4: Cross-Feature Integration
-- Add goal linking to protocol items
ALTER TABLE protocol_items 
ADD COLUMN goal_id UUID REFERENCES user_health_goals(id) ON DELETE SET NULL;

-- Add protocol linking to goals
ALTER TABLE user_health_goals 
ADD COLUMN linked_protocol_id UUID REFERENCES user_protocols(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX idx_protocol_items_goal_id ON protocol_items(goal_id);
CREATE INDEX idx_user_health_goals_linked_protocol_id ON user_health_goals(linked_protocol_id);

-- Add goal context to daily scores for better tracking
ALTER TABLE daily_scores 
ADD COLUMN related_goal_ids UUID[] DEFAULT '{}';

-- Add goal context to energy loop scores
ALTER TABLE energy_loop_scores 
ADD COLUMN active_goal_count INTEGER DEFAULT 0,
ADD COLUMN goal_alignment_score NUMERIC;