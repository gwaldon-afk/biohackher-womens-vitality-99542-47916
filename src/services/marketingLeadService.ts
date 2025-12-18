import { supabase } from '@/integrations/supabase/client';

export interface MarketingLeadData {
  email: string;
  session_id?: string;
  source?: string;
  assessment_type?: string;
  assessment_score?: number;
  marketing_consent?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Capture a marketing lead (for guest users before assessment)
 */
export const captureMarketingLead = async (data: MarketingLeadData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('marketing_leads')
      .upsert({
        email: data.email,
        session_id: data.session_id,
        source: data.source || 'assessment',
        assessment_type: data.assessment_type,
        assessment_score: data.assessment_score,
        marketing_consent: data.marketing_consent || false,
        consent_date: data.marketing_consent ? new Date().toISOString() : null,
        metadata: data.metadata || {}
      }, {
        onConflict: 'email',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error capturing marketing lead:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error capturing marketing lead:', error);
    return false;
  }
};

/**
 * Mark a lead as converted when they register
 */
export const convertMarketingLead = async (email: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('marketing_leads')
      .update({
        converted_at: new Date().toISOString(),
        converted_user_id: userId
      })
      .eq('email', email);

    if (error) {
      console.error('Error converting marketing lead:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error converting marketing lead:', error);
    return false;
  }
};

/**
 * Update lead with assessment results
 */
export const updateLeadAssessmentResults = async (
  email: string,
  assessmentType: string,
  score: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('marketing_leads')
      .update({
        assessment_type: assessmentType,
        assessment_score: score
      })
      .eq('email', email);

    if (error) {
      console.error('Error updating lead assessment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating lead assessment:', error);
    return false;
  }
};
