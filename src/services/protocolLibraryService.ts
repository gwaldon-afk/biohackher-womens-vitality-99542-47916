import { supabase } from "@/integrations/supabase/client";
import { 
  PROTEIN_PROTOCOL, 
  RESISTANCE_TRAINING_PROTOCOL, 
  HIIT_PROTOCOL, 
  CRITICAL_SUPPLEMENTS,
  PERIMENOPAUSE_PROTOCOL,
  POSTMENOPAUSE_PROTOCOL,
  PERIODIZATION_GUIDANCE,
  EvidenceBasedIntervention 
} from "@/data/evidenceBasedProtocols";
import { mealTemplates } from "@/data/mealTemplates";
import { getAllToolkitItems } from "./toolkitService";
import type { Product } from "@/types/products";

export interface LibraryProtocol {
  id: string;
  name: string;
  description: string;
  category: 'therapy' | 'exercise' | 'nutrition' | 'supplement' | 'sleep' | 'complete' | 'habit';
  evidenceLevel?: 'Gold' | 'Silver' | 'Bronze' | 'Emerging';
  evidenceSource?: string;
  benefits: string[];
  icon?: string;
  sourceType: 'toolkit' | 'evidence' | 'meal_template';
  sourceData: any; // Original data to convert to protocol_item
  product?: Product; // Matched product from database
  researchCitations?: any[]; // Research citations
  evidenceKey?: string; // Key for evidence drawer
}

// Map toolkit categories to our categories
const categoryMap: Record<string, LibraryProtocol['category']> = {
  'therapies': 'therapy',
  'exercise': 'exercise',
  'nutrition': 'nutrition',
  'supplements': 'supplement',
  'sleep': 'sleep',
  'habits': 'habit'
};

// Map evidence levels from database to display format
const mapEvidenceLevel = (level: string | undefined): 'Gold' | 'Silver' | 'Bronze' | 'Emerging' => {
  switch (level?.toLowerCase()) {
    case 'very_strong':
    case 'gold':
      return 'Gold';
    case 'strong':
    case 'silver':
      return 'Silver';
    case 'moderate':
    case 'bronze':
      return 'Bronze';
    default:
      return 'Emerging';
  }
};

// Match product to toolkit item by name
const matchProductToToolkitItem = async (itemName: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .ilike('name', `%${itemName}%`)
    .maybeSingle();

  if (error) {
    console.error('Error matching product:', error);
    return null;
  }

  // Cast the data to Product type
  return data as unknown as Product;
};

// Convert toolkit items to library protocols
const convertToolkitItems = async (): Promise<LibraryProtocol[]> => {
  const toolkitItems = await getAllToolkitItems();
  
  // Match products to toolkit items
  const protocolsWithProducts = await Promise.all(
    toolkitItems.map(async (item) => {
      const product = await matchProductToToolkitItem(item.name);
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      return {
        id: `toolkit-${item.id}`,
        name: item.name,
        description: item.description || '',
        category: categoryMap[item.category?.slug || ''] || 'therapy',
        evidenceLevel: mapEvidenceLevel(item.evidence_level),
        benefits: item.benefits || [],
        icon: item.category?.icon_name,
        sourceType: 'toolkit' as const,
        sourceData: item,
        product: product || undefined,
        researchCitations: item.research_citations || [],
        evidenceKey: `toolkit:${slug}`,
      };
    })
  );

  return protocolsWithProducts;
};

// Convert evidence-based interventions to library protocols
const convertEvidenceProtocols = (): LibraryProtocol[] => {
  const protocols: LibraryProtocol[] = [];

  // Protein Protocol
  protocols.push({
    id: 'evidence-protein-protocol',
    name: "Gabrielle Lyon's Protein Protocol",
    description: "30-40g protein per meal, 3x daily for optimal muscle protein synthesis",
    category: 'nutrition',
    evidenceLevel: 'Gold',
    evidenceSource: 'Gabrielle Lyon - Forever Strong (2023)',
    benefits: [
      'Optimizes muscle protein synthesis',
      'Prevents muscle catabolism',
      'Supports metabolic health',
      'Evidence-based by Dr. Gabrielle Lyon'
    ],
    icon: '🥩',
    sourceType: 'evidence',
    sourceData: PROTEIN_PROTOCOL
  });

  // Resistance Training
  protocols.push({
    id: 'evidence-resistance-training',
    name: "Stacey Sims' Resistance Training Protocol",
    description: "4+ days/week of compound lifts with progressive overload",
    category: 'exercise',
    evidenceLevel: 'Gold',
    evidenceSource: 'Stacey Sims - Next Level (2022)',
    benefits: [
      'Builds bone density and muscle mass',
      'Critical for perimenopause and beyond',
      'Progressive overload for continued adaptation',
      'Research-backed by Dr. Stacey Sims'
    ],
    icon: '🏋️',
    sourceType: 'evidence',
    sourceData: RESISTANCE_TRAINING_PROTOCOL
  });

  // HIIT Protocol
  protocols.push({
    id: 'evidence-hiit',
    name: 'High-Intensity Interval Training',
    description: '2x/week HIIT sessions for hormonal health and fitness',
    category: 'exercise',
    evidenceLevel: 'Gold',
    evidenceSource: 'Stacey Sims - Next Level (2022)',
    benefits: [
      'Stimulates growth hormone',
      'Improves insulin sensitivity',
      'Maintains cardiovascular fitness',
      'Optimized for women 40+'
    ],
    icon: '⚡',
    sourceType: 'evidence',
    sourceData: HIIT_PROTOCOL
  });

  // Critical Supplements (individual items)
  CRITICAL_SUPPLEMENTS.forEach((supp, idx) => {
    protocols.push({
      id: `evidence-supplement-${idx}`,
      name: supp.name,
      description: supp.reason,
      category: 'supplement',
      evidenceLevel: mapEvidenceLevel(supp.evidence_strength),
      evidenceSource: supp.evidence_source,
      benefits: [supp.reason],
      icon: '💊',
      sourceType: 'evidence',
      sourceData: [supp]
    });
  });

  // Perimenopause Protocol
  protocols.push({
    id: 'evidence-perimenopause',
    name: 'Perimenopause Training Protocol',
    description: 'Aggressive resistance training and sprint intervals for hormonal transition',
    category: 'exercise',
    evidenceLevel: 'Gold',
    evidenceSource: 'Stacey Sims - Next Level (2022)',
    benefits: [
      'Combats rapid muscle loss during perimenopause',
      'Higher volume and intensity for hormonal changes',
      'Counteracts declining estrogen effects',
      'Optimizes body composition'
    ],
    icon: '🔥',
    sourceType: 'evidence',
    sourceData: PERIMENOPAUSE_PROTOCOL
  });

  // Postmenopause Protocol
  protocols.push({
    id: 'evidence-postmenopause',
    name: 'Postmenopause Training Protocol',
    description: 'Moderate resistance training with emphasis on recovery',
    category: 'exercise',
    evidenceLevel: 'Gold',
    evidenceSource: 'Stacey Sims - Next Level (2022)',
    benefits: [
      'Maintains bone density and muscle mass',
      'Emphasizes recovery due to reduced estrogen',
      'Prevents age-related decline',
      'Sustainable long-term approach'
    ],
    icon: '🌸',
    sourceType: 'evidence',
    sourceData: POSTMENOPAUSE_PROTOCOL
  });

  return protocols;
};

// Convert meal templates to library protocols
const convertMealTemplates = (): LibraryProtocol[] => {
  return mealTemplates.map(template => ({
    id: `meal-${template.id}`,
    name: template.name,
    description: template.description,
    category: 'nutrition' as const,
    evidenceLevel: 'Silver' as const,
    benefits: template.benefits,
    icon: template.icon,
    sourceType: 'meal_template' as const,
    sourceData: template
  }));
};

// Complete program that combines multiple protocols
const getCompleteProgram = (): LibraryProtocol => ({
  id: 'complete-evidence-foundation',
  name: 'Evidence-Based Foundation Protocol',
  description: 'Complete wellness program combining nutrition, exercise, and supplements based on Gabrielle Lyon & Stacey Sims research',
  category: 'complete',
  evidenceLevel: 'Gold',
  evidenceSource: 'Multiple peer-reviewed sources',
  benefits: [
    '30-40g protein per meal for muscle protein synthesis',
    'Compound lifts + HIIT for optimal strength & hormonal health',
    'Research-backed supplements for longevity',
    'Comprehensive approach to healthy aging'
  ],
  icon: '🌟',
  sourceType: 'evidence',
  sourceData: {
    protein: PROTEIN_PROTOCOL,
    resistance: RESISTANCE_TRAINING_PROTOCOL,
    hiit: HIIT_PROTOCOL,
    supplements: CRITICAL_SUPPLEMENTS
  }
});

// Fetch all library protocols
export const fetchAllLibraryProtocols = async (): Promise<LibraryProtocol[]> => {
  const [toolkitProtocols] = await Promise.all([
    convertToolkitItems()
  ]);
  
  const evidenceProtocols = convertEvidenceProtocols();
  const mealProtocols = convertMealTemplates();
  const completeProgram = getCompleteProgram();

  return [
    completeProgram,
    ...toolkitProtocols,
    ...evidenceProtocols,
    ...mealProtocols
  ];
};

// Get protocols by category
export const getProtocolsByCategory = async (category: string): Promise<LibraryProtocol[]> => {
  const allProtocols = await fetchAllLibraryProtocols();
  
  if (category === 'all') {
    return allProtocols;
  }
  
  return allProtocols.filter(p => p.category === category);
};
