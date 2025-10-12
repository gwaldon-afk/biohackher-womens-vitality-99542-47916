import { useState, useEffect } from 'react';
import { useSubscription } from './useSubscription';
import {
  getAllTemplates,
  getTemplateByAssessmentType,
  GoalTemplate,
} from '@/services/goalTemplateService';
import { canAccessTemplate } from '@/services/subscriptionLimitsService';

export const useGoalTemplates = () => {
  const { subscription } = useSubscription();
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch all templates (filters by tier access)
   */
  const fetchAllTemplates = async () => {
    setLoading(true);
    try {
      const allTemplates = await getAllTemplates();

      // Filter by tier access if not premium
      if (subscription?.subscription_tier && subscription.subscription_tier !== 'premium') {
        const accessibleTemplates = await Promise.all(
          allTemplates.map(async (template) => {
            const canAccess = await canAccessTemplate(
              subscription.subscription_tier,
              template.template_key
            );
            return canAccess ? template : null;
          })
        );
        setTemplates(accessibleTemplates.filter(Boolean) as GoalTemplate[]);
      } else {
        setTemplates(allTemplates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get template matching an assessment type
   */
  const getMatchingTemplate = async (assessmentType: string): Promise<GoalTemplate | null> => {
    return getTemplateByAssessmentType(assessmentType);
  };

  /**
   * Apply template to create goal data
   */
  const applyTemplate = (template: GoalTemplate, assessmentData?: any) => {
    return {
      template_id: template.id,
      title: template.name,
      pillar_category: template.pillar_category,
      healthspan_target: template.default_healthspan_target,
      aging_blueprint: template.default_interventions,
      longevity_metrics: template.default_metrics,
      barriers_plan: template.common_barriers,
      triggered_by_assessment_id: assessmentData?.assessmentId || null,
    };
  };

  useEffect(() => {
    fetchAllTemplates();
  }, [subscription]);

  return {
    templates,
    loading,
    fetchAllTemplates,
    getMatchingTemplate,
    applyTemplate,
  };
};
