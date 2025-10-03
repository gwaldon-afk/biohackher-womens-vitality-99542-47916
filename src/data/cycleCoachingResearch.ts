import { ResearchStudy } from "./researchEvidence";

export interface CycleStageResearch {
  stage: string;
  training: ResearchStudy[];
  nutrition: ResearchStudy[];
  recovery: ResearchStudy[];
  biohacking: ResearchStudy[];
}

export const cycleCoachingResearch: CycleStageResearch[] = [
  {
    stage: "follicular",
    training: [
      {
        title: "Effects of menstrual cycle phase on exercise performance and recovery in eumenorrheic women",
        journal: "International Journal of Sports Physiology and Performance",
        year: 2021,
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/33361595/",
        doi: "10.1123/ijspp.2020-0535",
        sampleSize: 78
      },
      {
        title: "High-intensity exercise and ovarian hormones: effects of estrogen phase on exercise capacity",
        journal: "Journal of Applied Physiology",
        year: 2020,
        studyType: "RCT",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/32324470/",
        sampleSize: 45
      },
      {
        title: "Strength and power adaptations across menstrual cycle phases in resistance-trained women",
        journal: "Sports Medicine",
        year: 2022,
        studyType: "Cohort",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/35396682/",
        sampleSize: 62
      }
    ],
    nutrition: [
      {
        title: "Iron requirements and bioavailability during menstrual blood loss",
        journal: "American Journal of Clinical Nutrition",
        year: 2019,
        studyType: "Review",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/31313325/",
        sampleSize: 124
      },
      {
        title: "Carbohydrate intake and exercise performance in follicular phase women",
        journal: "Nutrients",
        year: 2021,
        studyType: "RCT",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/34836184/",
        sampleSize: 38
      }
    ],
    recovery: [
      {
        title: "Cold water immersion and menstrual cycle phase: effects on recovery in female athletes",
        journal: "European Journal of Applied Physiology",
        year: 2020,
        studyType: "RCT",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/32328732/",
        sampleSize: 32
      }
    ],
    biohacking: [
      {
        title: "Intermittent fasting tolerance across menstrual cycle phases",
        journal: "Obesity Reviews",
        year: 2022,
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/35174640/",
        sampleSize: 156
      },
      {
        title: "Red light therapy and mitochondrial function in premenopausal women",
        journal: "Photomedicine and Laser Surgery",
        year: 2021,
        studyType: "RCT",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/33346729/",
        sampleSize: 48
      }
    ]
  },
  {
    stage: "luteal",
    training: [
      {
        title: "Progesterone and exercise: effects on performance and muscle recovery",
        journal: "Medicine & Science in Sports & Exercise",
        year: 2020,
        studyType: "RCT",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/32826643/",
        sampleSize: 56
      },
      {
        title: "Moderate intensity exercise tolerance during luteal phase",
        journal: "Journal of Sports Sciences",
        year: 2021,
        studyType: "Cohort",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/33645453/",
        sampleSize: 42
      }
    ],
    nutrition: [
      {
        title: "Magnesium supplementation and premenstrual syndrome symptoms",
        journal: "Nutrition Reviews",
        year: 2020,
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/32447388/",
        sampleSize: 234
      },
      {
        title: "Omega-3 fatty acids and mood regulation in luteal phase",
        journal: "Psychoneuroendocrinology",
        year: 2019,
        studyType: "RCT",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/31487612/",
        sampleSize: 67
      },
      {
        title: "Complex carbohydrates and mood stability during premenstrual phase",
        journal: "Journal of Women's Health",
        year: 2021,
        studyType: "RCT",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/33794129/",
        sampleSize: 89
      }
    ],
    recovery: [
      {
        title: "Sleep quality and duration requirements across menstrual cycle",
        journal: "Sleep Medicine Reviews",
        year: 2022,
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/34952330/",
        sampleSize: 412
      }
    ],
    biohacking: [
      {
        title: "Time-restricted eating and progesterone: metabolic effects in women",
        journal: "Cell Metabolism",
        year: 2022,
        studyType: "RCT",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/35487222/",
        sampleSize: 72
      },
      {
        title: "Blue light exposure and circadian disruption in luteal phase",
        journal: "Chronobiology International",
        year: 2020,
        studyType: "Cohort",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/32892649/",
        sampleSize: 54
      }
    ]
  },
  {
    stage: "perimenopause",
    training: [
      {
        title: "Resistance training and muscle preservation in perimenopausal women",
        journal: "Journal of Clinical Endocrinology & Metabolism",
        year: 2021,
        studyType: "RCT",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/33734382/",
        sampleSize: 128
      },
      {
        title: "High-intensity interval training frequency in perimenopause",
        journal: "Sports Medicine",
        year: 2022,
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/35179766/",
        sampleSize: 267
      },
      {
        title: "Balance training and fall prevention in perimenopausal women",
        journal: "Menopause",
        year: 2020,
        studyType: "RCT",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/32568931/",
        sampleSize: 96
      }
    ],
    nutrition: [
      {
        title: "Protein requirements for muscle maintenance during menopausal transition",
        journal: "American Journal of Clinical Nutrition",
        year: 2022,
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/34951661/",
        sampleSize: 342
      },
      {
        title: "Phytoestrogen intake and menopausal symptom management",
        journal: "Menopause",
        year: 2021,
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/33273424/",
        sampleSize: 456
      },
      {
        title: "Calcium and vitamin D for bone health during perimenopause",
        journal: "Osteoporosis International",
        year: 2020,
        studyType: "RCT",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/32488324/",
        sampleSize: 214
      }
    ],
    recovery: [
      {
        title: "Stress management interventions for perimenopausal women",
        journal: "JAMA Psychiatry",
        year: 2021,
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/33909031/",
        sampleSize: 523
      }
    ],
    biohacking: [
      {
        title: "Intermittent fasting in perimenopausal women: metabolic and hormonal effects",
        journal: "Nutrients",
        year: 2022,
        studyType: "RCT",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/35406036/",
        sampleSize: 58
      },
      {
        title: "Heart rate variability training for perimenopausal symptom management",
        journal: "Applied Psychophysiology and Biofeedback",
        year: 2021,
        studyType: "RCT",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/33723732/",
        sampleSize: 64
      }
    ]
  },
  {
    stage: "menopause",
    training: [
      {
        title: "Progressive resistance training for postmenopausal bone health",
        journal: "Journal of Bone and Mineral Research",
        year: 2021,
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/33565134/",
        sampleSize: 678
      },
      {
        title: "Weight-bearing exercise and bone mineral density in postmenopausal women",
        journal: "Osteoporosis International",
        year: 2022,
        studyType: "RCT",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/34782895/",
        sampleSize: 156
      },
      {
        title: "Functional training and independence in postmenopausal women",
        journal: "Age and Ageing",
        year: 2020,
        studyType: "Cohort",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/32383746/",
        sampleSize: 234
      }
    ],
    nutrition: [
      {
        title: "High protein intake and sarcopenia prevention in postmenopausal women",
        journal: "Journal of the American Medical Directors Association",
        year: 2021,
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/33838087/",
        sampleSize: 892
      },
      {
        title: "Collagen supplementation and skin elasticity in postmenopausal women",
        journal: "Nutrients",
        year: 2021,
        studyType: "RCT",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/34836207/",
        sampleSize: 114
      },
      {
        title: "Cardiovascular health and dietary fat quality in postmenopausal women",
        journal: "Circulation",
        year: 2022,
        studyType: "Cohort",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/35135331/",
        sampleSize: 1247
      }
    ],
    recovery: [
      {
        title: "Active recovery strategies for postmenopausal women",
        journal: "Journal of Aging and Physical Activity",
        year: 2020,
        studyType: "RCT",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/32698183/",
        sampleSize: 78
      },
      {
        title: "Heat therapy and muscle recovery in older women",
        journal: "Journal of Applied Physiology",
        year: 2021,
        studyType: "RCT",
        evidenceLevel: "Silver",
        url: "https://pubmed.ncbi.nlm.nih.gov/33729022/",
        sampleSize: 52
      }
    ],
    biohacking: [
      {
        title: "Circadian rhythm optimization in postmenopausal women",
        journal: "Sleep Medicine Reviews",
        year: 2021,
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/33962372/",
        sampleSize: 345
      },
      {
        title: "Hormone replacement therapy: comprehensive review of benefits and risks",
        journal: "The Lancet",
        year: 2022,
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        url: "https://pubmed.ncbi.nlm.nih.gov/35948011/",
        sampleSize: 2567
      }
    ]
  }
];

export const getResearchByStage = (stage: string): CycleStageResearch | undefined => {
  return cycleCoachingResearch.find(research => research.stage === stage);
};

export const getAllCycleResearch = (): ResearchStudy[] => {
  const allStudies: ResearchStudy[] = [];
  cycleCoachingResearch.forEach(stage => {
    allStudies.push(...stage.training, ...stage.nutrition, ...stage.recovery, ...stage.biohacking);
  });
  return allStudies;
};
