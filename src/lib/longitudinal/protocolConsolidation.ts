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
  reinforced?: boolean;
  suppressed?: boolean;
};

export type ConsolidatedProtocol = {
  immediate: ConsolidatedProtocolItem[];
  foundation: ConsolidatedProtocolItem[];
  optimization: ConsolidatedProtocolItem[];
};

export type ConsolidationModifiers = {
  intensity_modifier?: number | null;
  focus?: "stress_support" | "recovery" | null;
  exercise_constraint?: string | null;
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
  recommendations: ProtocolRecommendationRecord[],
  options?: {
    modifiers?: ConsolidationModifiers;
  }
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

  const items = Array.from(byKey.values()).map((item) => ({
    ...item,
    reinforced: item.sources.length >= 2,
  }));

  const modifiers = options?.modifiers;
  const isHighIntensity = (name: string) => {
    const value = name.toLowerCase();
    return ["hiit", "sprint", "burpee", "plyo", "impact", "run", "jump"].some(
      (keyword) => value.includes(keyword)
    );
  };

  const isFocusMatch = (name: string) => {
    const value = name.toLowerCase();
    if (modifiers?.focus === "recovery") {
      return ["recovery", "sleep", "rest", "restore"].some((k) =>
        value.includes(k)
      );
    }
    if (modifiers?.focus === "stress_support") {
      return ["breath", "stress", "calm", "relax"].some((k) =>
        value.includes(k)
      );
    }
    return false;
  };

  const filtered = items
    .map((item) => {
      const shouldSuppress =
        (modifiers?.exercise_constraint === "avoid_impact" &&
          (item.item_type === "exercise" || isHighIntensity(item.name))) ||
        (modifiers?.intensity_modifier !== null &&
          (modifiers?.intensity_modifier ?? 0) < 0 &&
          isHighIntensity(item.name));
      return { ...item, suppressed: shouldSuppress };
    })
    .filter((item) => !item.suppressed);

  const orderItems = (list: ConsolidatedProtocolItem[]) =>
    [...list].sort((a, b) => {
      if (a.reinforced !== b.reinforced) {
        return a.reinforced ? -1 : 1;
      }
      if (isFocusMatch(a.name) !== isFocusMatch(b.name)) {
        return isFocusMatch(a.name) ? -1 : 1;
      }
      return 0;
    });

  return {
    immediate: orderItems(
      filtered.filter((item) => item.category === "immediate")
    ),
    foundation: orderItems(
      filtered.filter((item) => item.category === "foundation")
    ),
    optimization: orderItems(
      filtered.filter((item) => item.category === "optimization")
    ),
  };
};
