import { supabase } from "@/integrations/supabase/client";

export type ProtocolItemSource = {
  sourceType: string;
  sourceAssessmentId: string;
  sourceDate?: string | null;
  sourceRecommendationId?: string | null;
};

const isLikelyUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const getAssessmentCompletedAt = async (
  sourceType: string,
  sourceAssessmentId: string
): Promise<string | null> => {
  if (!sourceAssessmentId || !isLikelyUuid(sourceAssessmentId)) {
    return null;
  }

  if (sourceType === "symptom") {
    const { data } = await supabase
      .from("symptom_assessments")
      .select("completed_at")
      .eq("id", sourceAssessmentId)
      .maybeSingle();
    return data?.completed_at ?? null;
  }

  if (sourceType === "nutrition") {
    const { data } = await supabase
      .from("longevity_nutrition_assessments")
      .select("completed_at")
      .eq("id", sourceAssessmentId)
      .maybeSingle();
    return data?.completed_at ?? null;
  }

  if (sourceType === "hormone_compass") {
    const { data } = await supabase
      .from("hormone_compass_stages")
      .select("calculated_at")
      .eq("id", sourceAssessmentId)
      .maybeSingle();
    return data?.calculated_at ?? null;
  }

  return null;
};

export const getRecommendationSource = async (recommendationId: string) => {
  const { data, error } = await supabase
    .from("protocol_recommendations")
    .select("id, source_type, source_assessment_id, created_at")
    .eq("id", recommendationId)
    .single();

  if (error) throw error;
  return data;
};

export const upsertProtocolItemSources = async ({
  userId,
  protocolItemIds,
  source,
}: {
  userId: string;
  protocolItemIds: string[];
  source: ProtocolItemSource;
}) => {
  if (!protocolItemIds.length) return;

  const sourceDate =
    source.sourceDate ??
    (await getAssessmentCompletedAt(source.sourceType, source.sourceAssessmentId));

  const rows = protocolItemIds.map((protocolItemId) => ({
    user_id: userId,
    protocol_item_id: protocolItemId,
    source_type: source.sourceType,
    source_assessment_id: source.sourceAssessmentId,
    source_recommendation_id: source.sourceRecommendationId ?? null,
    source_date: sourceDate ?? null,
  }));

  const { error } = await supabase
    .from("protocol_item_sources")
    .upsert(rows, {
      onConflict: "protocol_item_id,source_type,source_assessment_id",
    });

  if (error) throw error;
};

export const upsertProtocolItemSourcesFromRecommendation = async ({
  userId,
  recommendationId,
  protocolItemIds,
}: {
  userId: string;
  recommendationId: string;
  protocolItemIds: string[];
}) => {
  const recommendation = await getRecommendationSource(recommendationId);
  const sourceAssessmentId =
    recommendation.source_assessment_id || recommendation.id;

  return upsertProtocolItemSources({
    userId,
    protocolItemIds,
    source: {
      sourceType: recommendation.source_type,
      sourceAssessmentId,
      sourceDate: recommendation.created_at ?? null,
      sourceRecommendationId: recommendation.id,
    },
  });
};
