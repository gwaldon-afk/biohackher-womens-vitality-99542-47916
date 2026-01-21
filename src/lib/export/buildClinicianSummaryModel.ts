export type ClinicianSummaryProtocolItem = {
  name: string;
  item_type?: string | null;
  frequency?: string | null;
  time_of_day?: string[] | null;
};

export type ClinicianSummaryProtocol = {
  name: string;
  is_active?: boolean | null;
};

export type ClinicianSummaryModel = {
  date: string;
  name?: string | null;
  chronologicalAge?: number | null;
  biologicalAge?: number | null;
  projectedAge?: number | null;
  ageDelta?: number | null;
  primaryFactors: string[];
  protocols: Array<{ category: string; name: string; frequency: string }>;
  inputs: string[];
};

type BuildClinicianSummaryInput = {
  name?: string | null;
  chronologicalAge?: number | null;
  biologicalAge?: number | null;
  projectedAge?: number | null;
  primaryFactors?: string[];
  protocolItems?: ClinicianSummaryProtocolItem[];
  protocols?: ClinicianSummaryProtocol[];
  inputs?: string[];
};

const formatFrequency = (frequency?: string | null) => {
  if (!frequency) return "Daily";
  switch (frequency) {
    case "daily":
      return "Daily";
    case "twice_daily":
      return "Twice daily";
    case "three_times_daily":
      return "Three times daily";
    case "weekly":
      return "Weekly";
    case "as_needed":
      return "As needed";
    default:
      return frequency;
  }
};

const formatCategory = (itemType?: string | null) => {
  if (!itemType) return "Protocol";
  switch (itemType) {
    case "supplement":
      return "Supplement";
    case "habit":
      return "Habit";
    case "exercise":
      return "Exercise";
    case "therapy":
      return "Therapy";
    case "diet":
      return "Diet";
    default:
      return itemType;
  }
};

const getPrimaryFactors = (primaryFactors?: string[]) => {
  if (primaryFactors && primaryFactors.length > 0) {
    return primaryFactors.slice(0, 3);
  }
  return ["Sleep", "Stress", "Movement"];
};

export const buildClinicianSummaryModel = ({
  name,
  chronologicalAge,
  biologicalAge,
  projectedAge,
  primaryFactors,
  protocolItems,
  protocols,
  inputs,
}: BuildClinicianSummaryInput): ClinicianSummaryModel => {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const roundedBiologicalAge =
    biologicalAge === null || biologicalAge === undefined ? null : Math.round(biologicalAge);
  const roundedProjectedAge =
    projectedAge === null || projectedAge === undefined ? null : Math.round(projectedAge);

  const ageDelta =
    chronologicalAge === null || chronologicalAge === undefined || roundedBiologicalAge === null
      ? null
      : Math.round(roundedBiologicalAge - chronologicalAge);

  const protocolList =
    protocolItems && protocolItems.length > 0
      ? protocolItems.map((item) => ({
          category: formatCategory(item.item_type),
          name: item.name,
          frequency: formatFrequency(item.frequency),
        }))
      : (protocols || [])
          .filter((protocol) => protocol.is_active !== false)
          .map((protocol) => ({
            category: "Protocol",
            name: protocol.name,
            frequency: "Active",
          }));

  return {
    date,
    name,
    chronologicalAge,
    biologicalAge: roundedBiologicalAge,
    projectedAge: roundedProjectedAge,
    ageDelta,
    primaryFactors: getPrimaryFactors(primaryFactors),
    protocols: protocolList,
    inputs: inputs && inputs.length > 0 ? inputs : [],
  };
};
