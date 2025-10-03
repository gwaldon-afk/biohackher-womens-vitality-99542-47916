export interface ResearchStudy {
  title: string;
  journal: string;
  year: number;
  doi?: string;
  pmid?: string;
  studyType: "RCT" | "Meta-analysis" | "Cohort" | "Review" | "Observational" | "Systematic Review";
  sampleSize?: number;
  evidenceLevel: "Gold" | "Silver" | "Bronze" | "Emerging";
  keyFindings?: string;
  url: string;
}

export interface InterventionResearch {
  intervention: string;
  category: string;
  pillar: "brain" | "body" | "beauty" | "balance";
  studies: ResearchStudy[];
}

// This will be populated by the compile-research edge function
// Initial seed data with examples
export const researchEvidence: InterventionResearch[] = [
  {
    intervention: "Lion's Mane Mushroom",
    category: "Supplements",
    pillar: "brain",
    studies: [
      {
        title: "Improving effects of the mushroom Yamabushitake (Hericium erinaceus) on mild cognitive impairment: a double-blind placebo-controlled clinical trial",
        journal: "Phytotherapy Research",
        year: 2009,
        doi: "10.1002/ptr.2634",
        pmid: "18844328",
        studyType: "RCT",
        sampleSize: 30,
        evidenceLevel: "Gold",
        keyFindings: "Significant improvement in cognitive function scores after 16 weeks",
        url: "https://pubmed.ncbi.nlm.nih.gov/18844328/"
      }
    ]
  },
  {
    intervention: "Omega-3 Fatty Acids",
    category: "Supplements",
    pillar: "brain",
    studies: [
      {
        title: "Omega-3 fatty acids and cardiovascular disease: effects on risk factors, molecular pathways, and clinical events",
        journal: "Journal of the American College of Cardiology",
        year: 2011,
        doi: "10.1016/j.jacc.2011.06.063",
        pmid: "21982312",
        studyType: "Meta-analysis",
        sampleSize: 68680,
        evidenceLevel: "Gold",
        keyFindings: "Significant reduction in cardiovascular events and all-cause mortality",
        url: "https://pubmed.ncbi.nlm.nih.gov/21982312/"
      }
    ]
  },
  {
    intervention: "Red Light Therapy",
    category: "Therapies",
    pillar: "body",
    studies: [
      {
        title: "Low-level laser therapy (LLLT) for treatment of hair loss",
        journal: "Lasers in Surgery and Medicine",
        year: 2014,
        doi: "10.1002/lsm.22170",
        pmid: "24375618",
        studyType: "Meta-analysis",
        sampleSize: 680,
        evidenceLevel: "Gold",
        keyFindings: "Effective for promoting hair growth and treating androgenetic alopecia",
        url: "https://pubmed.ncbi.nlm.nih.gov/24375618/"
      }
    ]
  },
  {
    intervention: "Cold Exposure Therapy",
    category: "Therapies",
    pillar: "balance",
    studies: [
      {
        title: "Cold exposure and metabolic health: a translational review",
        journal: "Diabetes, Obesity and Metabolism",
        year: 2021,
        doi: "10.1111/dom.14492",
        pmid: "34145952",
        studyType: "Review",
        sampleSize: undefined,
        evidenceLevel: "Silver",
        keyFindings: "Beneficial effects on metabolic health, thermogenesis, and insulin sensitivity",
        url: "https://pubmed.ncbi.nlm.nih.gov/34145952/"
      }
    ]
  },
  {
    intervention: "Sleep Optimization",
    category: "Sleep",
    pillar: "balance",
    studies: [
      {
        title: "Sleep and longevity: A systematic review and meta-analysis",
        journal: "Sleep Medicine Reviews",
        year: 2021,
        doi: "10.1016/j.smrv.2021.101450",
        pmid: "34147024",
        studyType: "Meta-analysis",
        sampleSize: 1935849,
        evidenceLevel: "Gold",
        keyFindings: "Both short and long sleep duration associated with increased mortality risk; 7-8 hours optimal",
        url: "https://pubmed.ncbi.nlm.nih.gov/34147024/"
      }
    ]
  },
  {
    intervention: "Mediterranean Diet",
    category: "Nutrition",
    pillar: "body",
    studies: [
      {
        title: "Mediterranean diet and longevity: an example of nutraceutical",
        journal: "Current Vascular Pharmacology",
        year: 2014,
        doi: "10.2174/15701611113116660174",
        pmid: "24350931",
        studyType: "Systematic Review",
        sampleSize: undefined,
        evidenceLevel: "Gold",
        keyFindings: "Associated with reduced all-cause mortality and increased longevity",
        url: "https://pubmed.ncbi.nlm.nih.gov/24350931/"
      }
    ]
  }
];

// Helper function to get total study count
export const getTotalStudyCount = (): number => {
  return researchEvidence.reduce((total, intervention) => total + intervention.studies.length, 0);
};

// Helper function to get studies by pillar
export const getStudiesByPillar = (pillar: string) => {
  return researchEvidence.filter(item => item.pillar === pillar);
};

// Helper function to get studies by evidence level
export const getStudiesByEvidenceLevel = (level: string) => {
  return researchEvidence.filter(item => 
    item.studies.some(study => study.evidenceLevel === level)
  );
};

// Helper function to search studies
export const searchStudies = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return researchEvidence.filter(item =>
    item.intervention.toLowerCase().includes(lowerQuery) ||
    item.category.toLowerCase().includes(lowerQuery) ||
    item.studies.some(study => 
      study.title.toLowerCase().includes(lowerQuery) ||
      study.journal.toLowerCase().includes(lowerQuery)
    )
  );
};
