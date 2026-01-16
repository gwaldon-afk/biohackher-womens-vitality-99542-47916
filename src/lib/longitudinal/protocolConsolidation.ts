import { normalizeItemName } from "@/utils/protocolDuplicateCheck";

export type ProtocolRecommendationRecord = {
  id: string;
  source_type: string;
  source_assessment_id: string;
  created_at: string;
  protocol_data: {
    immediate?: ProtocolItemInput[];
    foundation?: ProtocolItemInput[];
    optimization?: ProtocolItemInput[];
  };
};

export type ProtocolItemInput = {
  name: string;
  description: string;
  category: "immediate" | "foundation" | "optimization";
  relevance?: string;
  productKeywords?: string[];
  priority_tier?: "immediate" | "foundation" | "optimization";
  impact_weight?: number;
  lis_pillar_contribution?: string[];
};

export type ProtocolItemSource = {
  sourceType: string;
  sourceAssessmentId: string;
  sourceDate: string | null;
};

export type ConsolidatedProtocolItem = ProtocolItemInput & {
  item_type: "habit" | "supplement" | "exercise" | "diet" | "therapy";
  sources: ProtocolItemSource[];
};

export type ConsolidatedProtocol = {
  immediate: ConsolidatedProtocolItem[];
  foundation: ConsolidatedProtocolItem[];
  optimization: ConsolidatedProtocolItem[];
};

const categoryToItemType = (
  category: ProtocolItemInput["category"]
): ConsolidatedProtocolItem["item_type"] => {
  if (category === "immediate") return "habit";
  return "supplement";
};

export const getProtocolItemKey = (
  name: string,
  itemType: ConsolidatedProtocolItem["item_type"]
) => `${normalizeItemName(name)}|${itemType}`;

export const consolidateProtocolRecommendations = (
  recommendations: ProtocolRecommendationRecord[]
): ConsolidatedProtocol => {
  const byKey = new Map<string, ConsolidatedProtocolItem>();

  const sorted = [...recommendations].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const pushItem = (
    item: ProtocolItemInput,
    rec: ProtocolRecommendationRecord
  ) => {
    const itemType = categoryToItemType(item.category);
    const key = getProtocolItemKey(item.name, itemType);
    const source: ProtocolItemSource = {
      sourceType: rec.source_type,
      sourceAssessmentId: rec.source_assessment_id || rec.id,
      sourceDate: rec.created_at || null,
    };

    const existing = byKey.get(key);
    if (existing) {
      const hasSource = existing.sources.some(
        (s) =>
          s.sourceType === source.sourceType &&
          s.sourceAssessmentId === source.sourceAssessmentId
      );
      if (!hasSource) {
        existing.sources.push(source);
      }
      return;
    }

    byKey.set(key, {
      ...item,
      item_type: itemType,
      sources: [source],
    });
  };

  sorted.forEach((rec) => {
    rec.protocol_data.immediate?.forEach((item) => pushItem(item, rec));
    rec.protocol_data.foundation?.forEach((item) => pushItem(item, rec));
    rec.protocol_data.optimization?.forEach((item) => pushItem(item, rec));
  });

  const items = Array.from(byKey.values());

  return {
    immediate: items.filter((item) => item.category === "immediate"),
    foundation: items.filter((item) => item.category === "foundation"),
    optimization: items.filter((item) => item.category === "optimization"),
  };
};
