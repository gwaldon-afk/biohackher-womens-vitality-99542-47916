import { format } from "date-fns";

interface AssessmentRecord {
  id: string;
  type: "lis" | "hormone_compass" | "symptom" | "nutrition" | "pillar";
  title: string;
  score: number | null;
  completedAt: Date;
}

interface LISComparisonData {
  baseline: {
    date: Date;
    score: number;
    pillars: Record<string, number>;
  } | null;
  latest: {
    date: Date;
    score: number;
    pillars: Record<string, number>;
  } | null;
}

interface HormoneCompassComparisonData {
  baseline: {
    date: Date;
    stage: string;
    confidence: number;
  } | null;
  latest: {
    date: Date;
    stage: string;
    confidence: number;
  } | null;
}

/**
 * Convert array of objects to CSV string
 */
const arrayToCSV = (data: any[]): string => {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","), // Header row
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value).replace(/"/g, '""');
          return escaped.includes(",") ? `"${escaped}"` : escaped;
        })
        .join(",")
    ),
  ];

  return csvRows.join("\n");
};

/**
 * Trigger download of CSV file
 */
const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Export assessment history to CSV
 */
export const exportAssessmentHistoryCSV = (assessments: AssessmentRecord[]) => {
  const csvData = assessments.map((assessment) => ({
    "Assessment Type": assessment.type,
    "Assessment Title": assessment.title,
    Score: assessment.score !== null ? assessment.score : "N/A",
    "Completed Date": format(assessment.completedAt, "yyyy-MM-dd"),
    "Completed Time": format(assessment.completedAt, "HH:mm:ss"),
  }));

  const csvContent = arrayToCSV(csvData);
  const filename = `assessment-history-${format(new Date(), "yyyy-MM-dd")}.csv`;

  downloadCSV(csvContent, filename);
};

/**
 * Export LIS comparison data to CSV
 */
export const exportLISComparisonCSV = (comparison: LISComparisonData) => {
  if (!comparison.baseline) {
    throw new Error("No baseline data to export");
  }

  // Overall scores comparison
  const overallData = [
    {
      Metric: "Overall LIS Score",
      "Baseline Date": format(comparison.baseline.date, "yyyy-MM-dd"),
      "Baseline Score": comparison.baseline.score,
      "Latest Date": comparison.latest ? format(comparison.latest.date, "yyyy-MM-dd") : "N/A",
      "Latest Score": comparison.latest ? comparison.latest.score : "N/A",
      Change: comparison.latest ? comparison.latest.score - comparison.baseline.score : 0,
      "Change %": comparison.latest
        ? (((comparison.latest.score - comparison.baseline.score) / comparison.baseline.score) * 100).toFixed(1)
        : "0",
    },
  ];

  // Pillar-by-pillar comparison
  const pillarData = Object.entries(comparison.baseline.pillars).map(([pillar, baselineScore]) => {
    const latestScore = comparison.latest ? comparison.latest.pillars[pillar] : baselineScore;
    const change = latestScore - baselineScore;
    const changePercent = ((change / baselineScore) * 100).toFixed(1);

    return {
      Pillar: pillar.charAt(0).toUpperCase() + pillar.slice(1),
      "Baseline Score": baselineScore.toFixed(1),
      "Latest Score": latestScore.toFixed(1),
      Change: change.toFixed(1),
      "Change %": changePercent,
    };
  });

  // Combine both sections
  const csvContent =
    "=== OVERALL LIS COMPARISON ===\n" +
    arrayToCSV(overallData) +
    "\n\n=== PILLAR-BY-PILLAR COMPARISON ===\n" +
    arrayToCSV(pillarData);

  const filename = `lis-comparison-${format(new Date(), "yyyy-MM-dd")}.csv`;
  downloadCSV(csvContent, filename);
};

/**
 * Export Hormone Compass comparison data to CSV
 */
export const exportHormoneCompassComparisonCSV = (comparison: HormoneCompassComparisonData) => {
  if (!comparison.baseline) {
    throw new Error("No baseline data to export");
  }

  const getHealthLevelLabel = (stage: string) => {
    const stageMap: Record<string, string> = {
      "feeling-great": "Feeling Great",
      "doing-well": "Doing Well",
      "having-challenges": "Having Challenges",
      "really-struggling": "Really Struggling",
      "need-support": "Need Support Now",
    };
    return stageMap[stage] || stage;
  };

  const csvData = [
    {
      Metric: "Hormone Health Level",
      "Baseline Date": format(comparison.baseline.date, "yyyy-MM-dd"),
      "Baseline Level": getHealthLevelLabel(comparison.baseline.stage),
      "Latest Date": comparison.latest ? format(comparison.latest.date, "yyyy-MM-dd") : "N/A",
      "Latest Level": comparison.latest ? getHealthLevelLabel(comparison.latest.stage) : "N/A",
      Status: comparison.latest
        ? comparison.baseline.stage === comparison.latest.stage
          ? "No Change"
          : "Changed"
        : "No Latest Assessment",
    },
    {
      Metric: "Assessment Confidence",
      "Baseline Date": format(comparison.baseline.date, "yyyy-MM-dd"),
      "Baseline Level": `${comparison.baseline.confidence.toFixed(0)}%`,
      "Latest Date": comparison.latest ? format(comparison.latest.date, "yyyy-MM-dd") : "N/A",
      "Latest Level": comparison.latest ? `${comparison.latest.confidence.toFixed(0)}%` : "N/A",
      Status: comparison.latest
        ? `${(comparison.latest.confidence - comparison.baseline.confidence).toFixed(0)}% change`
        : "N/A",
    },
  ];

  const csvContent = arrayToCSV(csvData);
  const filename = `hormone-compass-comparison-${format(new Date(), "yyyy-MM-dd")}.csv`;

  downloadCSV(csvContent, filename);
};
