import { fetchAllLibraryProtocols, LibraryProtocol } from "@/services/protocolLibraryService";

/**
 * Extract all unique symptoms from user's assessments
 */
export function extractSymptomsFromAssessments(
  assessments: Array<{ symptom_type: string; primary_issues?: string[] }>
): string[] {
  const symptoms = new Set<string>();
  
  assessments.forEach(assessment => {
    // Add primary issues (symptoms identified in assessment)
    assessment.primary_issues?.forEach(issue => symptoms.add(issue));
    
    // Also consider the symptom_type itself
    symptoms.add(assessment.symptom_type);
  });
  
  return Array.from(symptoms);
}

/**
 * Normalize text for matching
 */
function normalizeForSearch(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Get protocol recommendations based on symptoms
 */
export async function getProtocolRecommendationsForSymptoms(
  symptoms: string[],
  limit: number = 8
): Promise<Array<LibraryProtocol & { matchScore: number; matchedSymptoms: string[] }>> {
  // Get all protocols from library
  const allProtocols = await fetchAllLibraryProtocols();
  
  // Score each protocol based on symptom match
  const scoredProtocols = allProtocols.map(protocol => {
    let matchScore = 0;
    const matchedSymptoms: string[] = [];
    
    // Check target_symptoms in sourceData
    const targetSymptoms = protocol.sourceData?.target_symptoms || [];
    symptoms.forEach(symptom => {
      if (Array.isArray(targetSymptoms) && targetSymptoms.some((ts: string) => 
        normalizeForSearch(ts).includes(normalizeForSearch(symptom))
      )) {
        matchScore += 5;
        matchedSymptoms.push(symptom);
      }
    });
    
    // Check name and description
    symptoms.forEach(symptom => {
      const normalizedSymptom = normalizeForSearch(symptom);
      if (normalizeForSearch(protocol.name).includes(normalizedSymptom)) {
        matchScore += 3;
        if (!matchedSymptoms.includes(symptom)) matchedSymptoms.push(symptom);
      }
      if (normalizeForSearch(protocol.description).includes(normalizedSymptom)) {
        matchScore += 2;
        if (!matchedSymptoms.includes(symptom)) matchedSymptoms.push(symptom);
      }
    });
    
    // Check category match
    const categorySymptomMap: Record<string, string[]> = {
      'sleep': ['sleep', 'insomnia', 'rest'],
      'exercise': ['energy', 'fatigue', 'tired', 'strength', 'physical'],
      'nutrition': ['energy', 'weight', 'metabolic', 'protein'],
      'therapy': ['stress', 'anxiety', 'mood', 'mental'],
      'supplement': ['deficiency', 'vitamin', 'mineral'],
    };
    
    Object.entries(categorySymptomMap).forEach(([cat, catSymptoms]) => {
      if (protocol.category === cat) {
        symptoms.forEach(symptom => {
          if (catSymptoms.some(cs => normalizeForSearch(symptom).includes(cs))) {
            matchScore += 2;
          }
        });
      }
    });
    
    return {
      ...protocol,
      matchScore,
      matchedSymptoms
    };
  });
  
  // Sort by match score and return top N
  return scoredProtocols
    .filter(p => p.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
