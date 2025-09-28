import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AssessmentCompletion {
  assessment_id: string;
  pillar: string | null;
  completed_at: string;
  score: number | null;
}

interface PillarCompletions {
  [pillar: string]: {
    completed: boolean;
    lastTaken: string | null;
    completions: AssessmentCompletion[];
  };
}

export const useAssessmentCompletions = () => {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<PillarCompletions>({
    brain: { completed: false, lastTaken: null, completions: [] },
    body: { completed: false, lastTaken: null, completions: [] },
    balance: { completed: false, lastTaken: null, completions: [] },
    beauty: { completed: false, lastTaken: null, completions: [] }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAssessmentCompletions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadAssessmentCompletions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_assessment_completions')
        .select('*')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      // Process completions by pillar
      const pillarData: PillarCompletions = {
        brain: { completed: false, lastTaken: null, completions: [] },
        body: { completed: false, lastTaken: null, completions: [] },
        balance: { completed: false, lastTaken: null, completions: [] },
        beauty: { completed: false, lastTaken: null, completions: [] }
      };

      if (data) {
        data.forEach((completion) => {
          const pillar = completion.pillar || getPillarFromAssessmentId(completion.assessment_id);
          
          if (pillar && pillarData[pillar]) {
            pillarData[pillar].completions.push(completion);
            
            // Mark as completed if has any completions
            if (!pillarData[pillar].completed) {
              pillarData[pillar].completed = true;
              pillarData[pillar].lastTaken = completion.completed_at;
            }
          }
        });
      }

      setCompletions(pillarData);
    } catch (error) {
      console.error('Error loading assessment completions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPillarFromAssessmentId = (assessmentId: string): string | null => {
    // For pillar assessments like "brain-brain-fog-assessment"
    if (assessmentId.includes('-')) {
      const parts = assessmentId.split('-');
      const potentialPillar = parts[0];
      if (['brain', 'body', 'balance', 'beauty'].includes(potentialPillar)) {
        return potentialPillar;
      }
    }
    
    // For individual symptoms, try to map to pillars based on symptom type
    const symptomToPillarMap: Record<string, string> = {
      'brain-fog': 'brain',
      'memory-issues': 'brain',
      'energy-levels': 'body',
      'joint-pain': 'body',
      'sleep': 'balance',
      'anxiety': 'balance',
      'mood': 'balance',
      'hot-flashes': 'balance',
      'hair-thinning': 'beauty',
      'weight-changes': 'body'
    };
    
    return symptomToPillarMap[assessmentId] || null;
  };

  const isAssessmentCompleted = (assessmentId: string): boolean => {
    return Object.values(completions).some(pillar => 
      pillar.completions.some(completion => completion.assessment_id === assessmentId)
    );
  };

  const getAssessmentCompletion = (assessmentId: string): AssessmentCompletion | null => {
    for (const pillar of Object.values(completions)) {
      const completion = pillar.completions.find(c => c.assessment_id === assessmentId);
      if (completion) return completion;
    }
    return null;
  };

  const refreshCompletions = () => {
    if (user) {
      loadAssessmentCompletions();
    }
  };

  return {
    completions,
    loading,
    isAssessmentCompleted,
    getAssessmentCompletion,
    refreshCompletions
  };
};