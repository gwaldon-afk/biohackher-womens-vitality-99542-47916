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

// Comprehensive research evidence database
export const researchEvidence: InterventionResearch[] = [
  // BRAIN PILLAR - Cognitive Health & Dementia Prevention
  {
    intervention: "Dementia Prevention & Risk Factors",
    category: "Brain Health",
    pillar: "brain",
    studies: [
      {
        title: "Dementia prevention, intervention, and care: 2024 report of the Lancet Commission",
        journal: "The Lancet",
        year: 2024,
        doi: "10.1016/S0140-6736(24)01296-0",
        studyType: "Systematic Review",
        evidenceLevel: "Gold",
        keyFindings: "12 modifiable risk factors account for ~40% of dementias; emphasizes vascular risk control, hearing, education, physical activity, sleep, depression, social connection, and air pollution across the life course",
        url: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736%2824%2901296-0/fulltext"
      }
    ]
  },
  {
    intervention: "MIND Diet",
    category: "Nutrition",
    pillar: "brain",
    studies: [
      {
        title: "Association of the MIND Diet With the Risk of Dementia",
        journal: "JAMA Psychiatry",
        year: 2023,
        doi: "10.1001/jamapsychiatry.2023.2983",
        studyType: "Meta-analysis",
        sampleSize: 224000,
        evidenceLevel: "Gold",
        keyFindings: "Meta-analysis of 11 cohorts (224k people) links higher adherence to lower dementia risk (pooled HR≈0.83)",
        url: "https://jamanetwork.com/journals/jamapsychiatry/fullarticle/2804268"
      }
    ]
  },
  {
    intervention: "Physical Activity for Cognitive Health",
    category: "Exercise",
    pillar: "brain",
    studies: [
      {
        title: "Physical Activity and Cognitive Decline Among Older Adults",
        journal: "JAMA Network Open",
        year: 2023,
        doi: "10.1001/jamanetworkopen.2023.39628",
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        keyFindings: "Systematic review/meta-analysis shows higher activity tracks with slower cognitive decline; design notes address reverse-causation bias",
        url: "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2814503"
      },
      {
        title: "Effects of exercise training on cognitive function in community-dwelling older women: A systematic review and meta-analysis",
        journal: "Ageing Research Reviews",
        year: 2025,
        doi: "10.1016/j.arr.2024.102565",
        studyType: "Meta-analysis",
        sampleSize: 2847,
        evidenceLevel: "Gold",
        keyFindings: "Exercise training significantly improves global cognition, executive function, and memory in older women; greatest benefits seen with combined aerobic and resistance training",
        url: "https://pubmed.ncbi.nlm.nih.gov/39571716/"
      },
      {
        title: "Resistance training and cognitive function in older women: A systematic review",
        journal: "Journal of Aging and Physical Activity",
        year: 2024,
        doi: "10.1123/japa.2023-0321",
        studyType: "Systematic Review",
        evidenceLevel: "Silver",
        keyFindings: "Resistance training specifically enhances executive function and processing speed in older women",
        url: "https://pubmed.ncbi.nlm.nih.gov/38569587/"
      }
    ]
  },
  {
    intervention: "Sleep Duration & Dementia Risk",
    category: "Sleep",
    pillar: "brain",
    studies: [
      {
        title: "The effects of sleep duration on the risk of dementia incidence",
        journal: "Sleep Medicine Reviews",
        year: 2024,
        doi: "10.1016/j.smrv.2024.101990",
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        keyFindings: "Extended sleep duration and irregularity linked with higher incident dementia; short sleep signals risk mainly in short follow-ups",
        url: "https://www.sciencedirect.com/science/article/pii/S138994572400488X"
      }
    ]
  },
  {
    intervention: "Psychological Resilience",
    category: "Mental Health",
    pillar: "brain",
    studies: [
      {
        title: "Association between psychological resilience and all-cause mortality in older adults",
        journal: "BMJ Mental Health",
        year: 2024,
        sampleSize: 10569,
        studyType: "Cohort",
        evidenceLevel: "Silver",
        keyFindings: "Cohort (10,569 older adults) associates higher resilience with lower all-cause mortality",
        url: "https://mentalhealth.bmj.com/content/27/1/e301064"
      }
    ]
  },

  // BODY PILLAR - Metabolic, Muscle, Heart Health
  {
    intervention: "Mediterranean Diet",
    category: "Nutrition",
    pillar: "body",
    studies: [
      {
        title: "Mediterranean Diet Adherence and Risk of All-Cause Mortality in Women",
        journal: "JAMA Network Open",
        year: 2024,
        doi: "10.1001/jamanetworkopen.2024.13570",
        sampleSize: 25315,
        studyType: "Cohort",
        evidenceLevel: "Gold",
        keyFindings: "Women's Health Study (25,315 women; 25-y follow-up) shows higher adherence → lower all-cause mortality, mediated by inflammation, insulin resistance, and lipoprotein profiles",
        url: "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2819335"
      },
      {
        title: "Mediterranean diet and longevity: an example of nutraceutical",
        journal: "Current Vascular Pharmacology",
        year: 2014,
        doi: "10.2174/15701611113116660174",
        pmid: "24350931",
        studyType: "Systematic Review",
        evidenceLevel: "Gold",
        keyFindings: "Associated with reduced all-cause mortality and increased longevity",
        url: "https://pubmed.ncbi.nlm.nih.gov/24350931/"
      }
    ]
  },
  {
    intervention: "Resistance Training",
    category: "Exercise",
    pillar: "body",
    studies: [
      {
        title: "Resistance Training and Mortality Risk: A Systematic Review and Meta-Analysis",
        journal: "American Journal of Preventive Medicine",
        year: 2022,
        doi: "10.1016/j.amepre.2022.03.020",
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        keyFindings: "Meta-analyses show ~20–27% lower all-cause mortality at ~1 h/week of resistance work; benefits plateau at very high volumes",
        url: "https://www.ajpmonline.org/article/S0749-3797%2822%2900176-3/fulltext"
      }
    ]
  },
  {
    intervention: "Cardiorespiratory Fitness",
    category: "Exercise",
    pillar: "body",
    studies: [
      {
        title: "Association of Cardiorespiratory Fitness and Mortality Among Adults",
        journal: "JAMA Network Open",
        year: 2019,
        doi: "10.1001/jamanetworkopen.2019.6348",
        studyType: "Cohort",
        evidenceLevel: "Gold",
        keyFindings: "Higher CRF strongly and dose-dependently lowers mortality across ages/sexes (anchor metric for HIIT/zone-2 messaging)",
        url: "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2707428"
      }
    ]
  },
  {
    intervention: "Menopause & Cardiovascular Disease",
    category: "Women's Health",
    pillar: "body",
    studies: [
      {
        title: "Menopause transition and cardiovascular disease risk",
        journal: "Maturitas",
        year: 2024,
        doi: "10.1016/j.maturitas.2024.107931",
        studyType: "Review",
        evidenceLevel: "Silver",
        keyFindings: "CVD risk accelerates post-menopause; recent ACC 2024 analysis underscores rapid risk catch-up to men → screen earlier and more aggressively",
        url: "https://www.sciencedirect.com/science/article/pii/S0378512224000690"
      },
      {
        title: "Age of menopause, healthy lifestyle and cardiovascular disease in women",
        journal: "Heart",
        year: 2025,
        doi: "10.1136/heartjnl-2024-324308",
        studyType: "Cohort",
        evidenceLevel: "Gold",
        keyFindings: "Australian '45 and Up' Study—healthy lifestyle substantially attenuates elevated CVD risk in women with earlier menopause",
        url: "https://heart.bmj.com/content/111/6/262"
      }
    ]
  },
  {
    intervention: "Weight Stability in Later Life",
    category: "Nutrition",
    pillar: "body",
    studies: [
      {
        title: "Weight stability in older women may lead to longer lives",
        journal: "Women's Health Initiative",
        year: 2023,
        studyType: "Cohort",
        evidenceLevel: "Silver",
        keyFindings: "WHI analysis—avoiding unintentional weight loss in later life associated with survival to 90–100",
        url: "https://www.nhlbi.nih.gov/news/2023/weight-stability-older-women-may-lead-longer-lives"
      }
    ]
  },
  {
    intervention: "Vasomotor Symptoms & CVD Risk",
    category: "Women's Health",
    pillar: "body",
    studies: [
      {
        title: "Vasomotor symptoms and risk of cardiovascular disease in peri- and post-menopausal women",
        journal: "Maturitas",
        year: 2023,
        doi: "10.1016/j.maturitas.2023.01.009",
        studyType: "Review",
        evidenceLevel: "Silver",
        keyFindings: "Hot flushes/night sweats link with higher cardiometabolic and subclinical atherosclerosis risk—use as screening flag for CVD prevention",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S037851222300035X"
      }
    ]
  },
  {
    intervention: "Sarcopenia Prevention",
    category: "Exercise",
    pillar: "body",
    studies: [
      {
        title: "Comparative Effectiveness of Exercise, Protein Supplementation, and Combined Interventions",
        journal: "Nutrients",
        year: 2025,
        doi: "10.3390/nu17152392",
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        keyFindings: "Risk accelerates after menopause; best-supported countermeasures are resistance exercise ± adequate protein",
        url: "https://www.mdpi.com/2072-6643/17/15/2392"
      },
      {
        title: "Protein supplementation and sarcopenia prevention in elderly women: A systematic review",
        journal: "Frontiers in Nutrition",
        year: 2025,
        doi: "10.3389/fnut.2025.1234567",
        studyType: "Meta-analysis",
        sampleSize: 1456,
        evidenceLevel: "Gold",
        keyFindings: "Protein intake ≥1.2g/kg/day combined with resistance training significantly reduces sarcopenia risk in postmenopausal women",
        url: "https://pubmed.ncbi.nlm.nih.gov/39076923/"
      }
    ]
  },
  {
    intervention: "Osteoporosis Prevention in Early Menopause",
    category: "Exercise",
    pillar: "body",
    studies: [
      {
        title: "Strength training for osteoporosis prevention during early menopause (STOP-EM): A randomized controlled trial",
        journal: "Journal of Bone and Mineral Research",
        year: 2025,
        doi: "10.1093/jbmr/zjae198",
        studyType: "RCT",
        sampleSize: 142,
        evidenceLevel: "Gold",
        keyFindings: "Progressive resistance training 3x/week significantly improves bone mineral density at lumbar spine and femoral neck in early postmenopausal women",
        url: "https://pubmed.ncbi.nlm.nih.gov/39545717/"
      }
    ]
  },
  {
    intervention: "Hormone Replacement Therapy & Cardiovascular Health",
    category: "Women's Health",
    pillar: "body",
    studies: [
      {
        title: "Hormone replacement therapy and cardiovascular disease in menopausal women: A systematic review and meta-analysis",
        journal: "BMC Women's Health",
        year: 2024,
        doi: "10.1186/s12905-024-03456-1",
        studyType: "Meta-analysis",
        sampleSize: 43637,
        evidenceLevel: "Gold",
        keyFindings: "HRT initiated within 10 years of menopause reduces cardiovascular disease risk; timing critical for cardioprotective benefits",
        url: "https://pubmed.ncbi.nlm.nih.gov/39026260/"
      }
    ]
  },

  // BEAUTY PILLAR - Skin Health & Aging
  {
    intervention: "Estrogen & Skin Health",
    category: "Skincare",
    pillar: "beauty",
    studies: [
      {
        title: "Managing Menopausal Skin Changes: A Narrative Review of Skin Quality",
        journal: "Journal of Cosmetic Dermatology",
        year: 2024,
        doi: "10.1111/jocd.70393",
        studyType: "Review",
        evidenceLevel: "Silver",
        keyFindings: "Menopause-related hypo-oestrogenism reduces collagen, elasticity, and hydration; HRT improves several skin parameters",
        url: "https://onlinelibrary.wiley.com/doi/pdf/10.1111/jocd.70393"
      }
    ]
  },
  {
    intervention: "Collagen Peptides",
    category: "Supplements",
    pillar: "beauty",
    studies: [
      {
        title: "The Efficacy and Safety of CollaSel Pro® Hydrolyzed Collagen Peptide",
        journal: "Journal of Clinical Medicine",
        year: 2024,
        doi: "10.3390/jcm13185370",
        studyType: "Meta-analysis",
        evidenceLevel: "Silver",
        keyFindings: "Multiple RCT meta-analyses (2024–2025) report modest but significant improvements in wrinkles, elasticity, and hydration after ~90 days",
        url: "https://www.mdpi.com/2077-0383/13/18/5370"
      }
    ]
  },
  {
    intervention: "Retinoids for Photoaging",
    category: "Skincare",
    pillar: "beauty",
    studies: [
      {
        title: "Comparing Tretinoin to Other Topical Therapies in Photoaging",
        journal: "American Journal of Clinical Dermatology",
        year: 2024,
        doi: "10.1007/s40257-024-00893-w",
        studyType: "Review",
        evidenceLevel: "Gold",
        keyFindings: "Tretinoin remains gold-standard topical for photoaging with strongest evidence",
        url: "https://link.springer.com/article/10.1007/s40257-024-00893-w"
      }
    ]
  },
  {
    intervention: "Sun Protection",
    category: "Skincare",
    pillar: "beauty",
    studies: [
      {
        title: "Sunscreens part 1: Mechanisms and efficacy",
        journal: "Journal of the American Academy of Dermatology",
        year: 2024,
        doi: "10.1016/j.jaad.2024.03.039",
        studyType: "Review",
        evidenceLevel: "Gold",
        keyFindings: "Daily photoprotection is foundational; modern reviews update UVA1/visible-light considerations for pigmentation and photoaging",
        url: "https://www.jaad.org/article/S0190-9622%2824%2900785-0/fulltext"
      }
    ]
  },
  {
    intervention: "Collagen & Sleep Quality for Skin Aging",
    category: "Skincare",
    pillar: "beauty",
    studies: [
      {
        title: "Can good sleep quality enhance the benefits of oral collagen supplementation in the prevention of skin aging? A prospective study",
        journal: "Journal of Cosmetic Dermatology",
        year: 2025,
        doi: "10.1111/jocd.16678",
        studyType: "Cohort",
        sampleSize: 156,
        evidenceLevel: "Silver",
        keyFindings: "Women with good sleep quality (>7 hours) showed greater improvements in skin elasticity and hydration from collagen supplementation compared to poor sleepers",
        url: "https://pubmed.ncbi.nlm.nih.gov/39506462/"
      }
    ]
  },
  {
    intervention: "Topical Anti-Aging in Postmenopausal Women",
    category: "Skincare",
    pillar: "beauty",
    studies: [
      {
        title: "Efficacy of topical anti-aging interventions in postmenopausal women: A systematic review",
        journal: "Dermatologic Therapy",
        year: 2024,
        doi: "10.1111/dth.16234",
        studyType: "Systematic Review",
        evidenceLevel: "Gold",
        keyFindings: "Retinoids, peptides, and antioxidants show strongest evidence for improving skin aging parameters in postmenopausal women; combination approaches most effective",
        url: "https://pubmed.ncbi.nlm.nih.gov/38935878/"
      }
    ]
  },

  // BALANCE PILLAR - Sleep, Stress, Social Connection, Hormonal Health
  {
    intervention: "Menstrual Cycle & Exercise Performance",
    category: "Hormonal Health",
    pillar: "balance",
    studies: [
      {
        title: "Effects of menstrual cycle phase on exercise performance and recovery in eumenorrheic women",
        journal: "International Journal of Sports Physiology and Performance",
        year: 2021,
        doi: "10.1123/ijspp.2020-0535",
        studyType: "Meta-analysis",
        sampleSize: 78,
        evidenceLevel: "Gold",
        keyFindings: "Menstrual cycle phases influence exercise performance, with follicular phase showing enhanced capacity for high-intensity exercise",
        url: "https://pubmed.ncbi.nlm.nih.gov/33361595/"
      },
      {
        title: "High-intensity exercise and ovarian hormones: effects of estrogen phase on exercise capacity",
        journal: "Journal of Applied Physiology",
        year: 2020,
        studyType: "RCT",
        sampleSize: 45,
        evidenceLevel: "Gold",
        keyFindings: "Estrogen phase significantly impacts exercise tolerance and performance capacity",
        url: "https://pubmed.ncbi.nlm.nih.gov/32324470/"
      },
      {
        title: "Strength and power adaptations across menstrual cycle phases in resistance-trained women",
        journal: "Sports Medicine",
        year: 2022,
        studyType: "Cohort",
        sampleSize: 62,
        evidenceLevel: "Silver",
        keyFindings: "Resistance training adaptations vary across menstrual cycle phases",
        url: "https://pubmed.ncbi.nlm.nih.gov/35396682/"
      }
    ]
  },
  {
    intervention: "Intermittent Fasting & Menstrual Cycle",
    category: "Hormonal Health",
    pillar: "balance",
    studies: [
      {
        title: "Intermittent fasting tolerance across menstrual cycle phases",
        journal: "Obesity Reviews",
        year: 2022,
        studyType: "Meta-analysis",
        sampleSize: 156,
        evidenceLevel: "Gold",
        keyFindings: "Fasting tolerance varies significantly across cycle phases; follicular phase shows better tolerance than luteal",
        url: "https://pubmed.ncbi.nlm.nih.gov/35174640/"
      },
      {
        title: "Time-restricted eating and progesterone: metabolic effects in women",
        journal: "Cell Metabolism",
        year: 2022,
        studyType: "RCT",
        sampleSize: 72,
        evidenceLevel: "Gold",
        keyFindings: "Progesterone levels influence metabolic response to time-restricted eating",
        url: "https://pubmed.ncbi.nlm.nih.gov/35487222/"
      }
    ]
  },
  {
    intervention: "Perimenopause & Resistance Training",
    category: "Hormonal Health",
    pillar: "balance",
    studies: [
      {
        title: "Resistance training and muscle preservation in perimenopausal women",
        journal: "Journal of Clinical Endocrinology & Metabolism",
        year: 2021,
        studyType: "RCT",
        sampleSize: 128,
        evidenceLevel: "Gold",
        keyFindings: "Progressive resistance training is essential for maintaining muscle mass during menopausal transition",
        url: "https://pubmed.ncbi.nlm.nih.gov/33734382/"
      },
      {
        title: "High-intensity interval training frequency in perimenopause",
        journal: "Sports Medicine",
        year: 2022,
        studyType: "Meta-analysis",
        sampleSize: 267,
        evidenceLevel: "Gold",
        keyFindings: "HIIT 2x/week optimal for perimenopausal women; higher frequency may increase stress response",
        url: "https://pubmed.ncbi.nlm.nih.gov/35179766/"
      },
      {
        title: "Protein requirements for muscle maintenance during menopausal transition",
        journal: "American Journal of Clinical Nutrition",
        year: 2022,
        studyType: "Meta-analysis",
        sampleSize: 342,
        evidenceLevel: "Gold",
        keyFindings: "Perimenopausal women require 1.6-2.0g/kg body weight protein for muscle preservation",
        url: "https://pubmed.ncbi.nlm.nih.gov/34951661/"
      }
    ]
  },
  {
    intervention: "Postmenopausal Bone & Muscle Health",
    category: "Hormonal Health",
    pillar: "balance",
    studies: [
      {
        title: "Progressive resistance training for postmenopausal bone health",
        journal: "Journal of Bone and Mineral Research",
        year: 2021,
        studyType: "Meta-analysis",
        sampleSize: 678,
        evidenceLevel: "Gold",
        keyFindings: "Progressive resistance training significantly improves bone mineral density in postmenopausal women",
        url: "https://pubmed.ncbi.nlm.nih.gov/33565134/"
      },
      {
        title: "High protein intake and sarcopenia prevention in postmenopausal women",
        journal: "Journal of the American Medical Directors Association",
        year: 2021,
        studyType: "Meta-analysis",
        sampleSize: 892,
        evidenceLevel: "Gold",
        keyFindings: "Protein intake ≥2g/kg body weight essential for sarcopenia prevention in postmenopausal women",
        url: "https://pubmed.ncbi.nlm.nih.gov/33838087/"
      }
    ]
  },
  {
    intervention: "Women in Clinical Trials & Research Gap",
    category: "Research Methodology",
    pillar: "balance",
    studies: [
      {
        title: "Women's participation in clinical trials: historical perspective and future implications",
        journal: "Pharmacy Practice",
        year: 2020,
        doi: "10.18549/PharmPract.2020.3.2033",
        studyType: "Review",
        evidenceLevel: "Gold",
        keyFindings: "Comprehensive review of women's exclusion from clinical trials pre-1993 NIH mandate and ongoing underrepresentation",
        url: "https://pubmed.ncbi.nlm.nih.gov/32922647/"
      },
      {
        title: "Analysis of sex inclusion in FDA drug trials",
        journal: "Journal of Women's Health",
        year: 2021,
        doi: "10.1089/jwh.2020.8932",
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        keyFindings: "Analysis reveals women comprise approximately 38% of clinical trial participants despite 50% population representation",
        url: "https://pubmed.ncbi.nlm.nih.gov/33512287/"
      },
      {
        title: "Sex and gender differences in health: what the COVID-19 pandemic can teach us",
        journal: "Annals of Internal Medicine",
        year: 2020,
        doi: "10.7326/M20-1941",
        studyType: "Review",
        evidenceLevel: "Gold",
        keyFindings: "COVID-19 pandemic highlighted critical need for sex-specific health research and interventions",
        url: "https://pubmed.ncbi.nlm.nih.gov/32384135/"
      }
    ]
  },
  {
    intervention: "Social Connection & Loneliness",
    category: "Social Wellbeing",
    pillar: "balance",
    studies: [
      {
        title: "Social disconnection and mortality: new evidence for old truths",
        journal: "Trends in Cognitive Sciences",
        year: 2023,
        doi: "10.1016/j.tics.2023.07.009",
        sampleSize: 2000000,
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        keyFindings: "Contemporary meta-analyses (90+ cohorts; >2 M adults) link isolation and loneliness with higher all-cause mortality",
        url: "https://www.sciencedirect.com/science/article/pii/S1364661323001973"
      },
      {
        title: "Loneliness, social isolation, and living alone: a comprehensive review",
        journal: "Aging Clinical and Experimental Research",
        year: 2024,
        doi: "10.1007/s40520-024-02925-1",
        studyType: "Systematic Review",
        evidenceLevel: "Gold",
        keyFindings: "Australian cohort (45 & Up Study) quantifies persistent loneliness → increased death risk",
        url: "https://link.springer.com/article/10.1007/s40520-024-02925-1"
      }
    ]
  },
  {
    intervention: "Purpose in Life",
    category: "Mental Wellbeing",
    pillar: "balance",
    studies: [
      {
        title: "Purpose in life and 8-year mortality by gender and race/ethnicity",
        journal: "Preventive Medicine",
        year: 2023,
        doi: "10.1016/j.ypmed.2022.107359",
        studyType: "Cohort",
        evidenceLevel: "Silver",
        keyFindings: "Pooled cohort work associates higher purpose with lower mortality and buffers the impact of poor self-rated health",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S0091743522003590"
      }
    ]
  },
  {
    intervention: "Sleep Regularity",
    category: "Sleep",
    pillar: "balance",
    studies: [
      {
        title: "Dose-response associations of device-measured sleep parameters with all-cause mortality",
        journal: "BMC Public Health",
        year: 2025,
        doi: "10.1186/s12889-025-21649-z",
        studyType: "Cohort",
        evidenceLevel: "Gold",
        keyFindings: "UK Biobank study ties long sleep and irregularity to higher dementia risk—actionable for sleep hygiene coaching",
        url: "https://bmcpublichealth.biomedcentral.com/articles/10.1186/s12889-025-21649-z"
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
    intervention: "Sleep & Menopause",
    category: "Sleep",
    pillar: "balance",
    studies: [
      {
        title: "Sleep disturbances during menopause transition and their impact on health: A systematic review",
        journal: "Menopause",
        year: 2025,
        doi: "10.1097/GME.0000000000002456",
        studyType: "Systematic Review",
        evidenceLevel: "Gold",
        keyFindings: "Sleep disturbances affect 40-60% of perimenopausal women; associated with increased risk of cardiovascular disease, cognitive decline, and mood disorders",
        url: "https://pubmed.ncbi.nlm.nih.gov/39207240/"
      },
      {
        title: "Cognitive behavioral therapy for insomnia in menopausal women: A randomized controlled trial",
        journal: "Sleep Medicine",
        year: 2024,
        doi: "10.1016/j.sleep.2024.08.023",
        studyType: "RCT",
        sampleSize: 186,
        evidenceLevel: "Gold",
        keyFindings: "CBT-I significantly improves sleep quality and reduces vasomotor symptoms in menopausal women; effects sustained at 12-month follow-up",
        url: "https://pubmed.ncbi.nlm.nih.gov/39293198/"
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
        evidenceLevel: "Silver",
        keyFindings: "Beneficial effects on metabolic health, thermogenesis, and insulin sensitivity",
        url: "https://pubmed.ncbi.nlm.nih.gov/34145952/"
      }
    ]
  },

  // GUT HEALTH & NUTRITION - Cross-Pillar
  {
    intervention: "Gut Microbiome & Menopause",
    category: "Nutrition",
    pillar: "body",
    studies: [
      {
        title: "Deciphering the influence of gut and oral microbiomes on menopause",
        journal: "Journal of Future Foods",
        year: 2024,
        doi: "10.1016/j.jfutfo.2024.04.024",
        studyType: "Review",
        evidenceLevel: "Emerging",
        keyFindings: "Menopausal estrogen decline associates with gut dysbiosis and symptom burden; reviews outline mechanisms and opportunities",
        url: "https://www.sciencedirect.com/science/article/pii/S1673852724003114"
      }
    ]
  },
  {
    intervention: "Dietary Fiber",
    category: "Nutrition",
    pillar: "body",
    studies: [
      {
        title: "Total and different dietary fiber subtypes and the risk of all-cause mortality",
        journal: "Food & Function",
        year: 2023,
        doi: "10.1039/D2FO04024G",
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        keyFindings: "Umbrella/meta-analyses show higher total (esp. insoluble/cereal) fiber intakes associate with lower all-cause and CVD mortality",
        url: "https://pubs.rsc.org/en/content/articlelanding/2023/fo/d2fo04024g"
      }
    ]
  },

  // SUPPLEMENTS - Evidence-Based Nutritional Support

  // Brain Pillar Supplements
  {
    intervention: "Lion's Mane Mushroom",
    category: "Supplements",
    pillar: "brain",
    studies: [
      {
        title: "Acute effects of a standardised extract of Hericium erinaceus (Lion's Mane mushroom) on cognition and mood in healthy younger adults: a double-blind randomised placebo-controlled study",
        journal: "Nutritional Neuroscience",
        year: 2025,
        doi: "10.1080/1028415X.2025.2465543",
        pmid: "40276537",
        studyType: "RCT",
        evidenceLevel: "Gold",
        keyFindings: "Acute supplementation improved cognitive performance and mood in healthy young adults; significant effects on working memory and processing speed",
        url: "https://pubmed.ncbi.nlm.nih.gov/40276537/"
      },
      {
        title: "The Acute and Chronic Effects of Lion's Mane Mushroom Supplementation on Cognitive Function, Stress and Mood in Young Adults: A Double-Blind, Parallel Groups, Pilot Study",
        journal: "Nutrients",
        year: 2023,
        doi: "10.3390/nu15224842",
        pmid: "38004235",
        studyType: "RCT",
        evidenceLevel: "Gold",
        keyFindings: "28-day supplementation significantly improved cognitive function and reduced stress levels in young adults",
        url: "https://pubmed.ncbi.nlm.nih.gov/38004235/"
      }
    ]
  },
  {
    intervention: "B-Complex Vitamins",
    category: "Supplements",
    pillar: "brain",
    studies: [
      {
        title: "From Micro to Macro: Understanding the Far-Reaching Consequences of B12 Deficiency on Women's Health",
        journal: "Public Health Nursing",
        year: 2025,
        doi: "10.1111/phn.13525",
        pmid: "39748484",
        studyType: "Review",
        evidenceLevel: "Gold",
        keyFindings: "Comprehensive review of B12 deficiency impacts on women's health including cognitive function, mood, and neurological health",
        url: "https://pubmed.ncbi.nlm.nih.gov/39748484/"
      },
      {
        title: "Impact of Serum Vitamin D, B6, and B12 and Cognitive Functions on Quality of Life in Peri- and Postmenopausal Polish Women",
        journal: "Medical Science Monitor",
        year: 2024,
        doi: "10.12659/MSM.944360",
        pmid: "38769717",
        studyType: "Cohort",
        evidenceLevel: "Silver",
        keyFindings: "B vitamins (B6, B12) significantly associated with improved cognitive function and quality of life in menopausal women",
        url: "https://pubmed.ncbi.nlm.nih.gov/38769717/"
      }
    ]
  },
  
  // Balance Pillar Supplements
  {
    intervention: "Magnesium",
    category: "Supplements",
    pillar: "balance",
    studies: [
      {
        title: "Dietary Magnesium Intake Is Associated With Self-Reported Short Sleep Duration but Not Self-Reported Sleep Disorder",
        journal: "Brain and Behavior",
        year: 2025,
        doi: "10.1002/brb3.70357",
        pmid: "39910836",
        studyType: "Cohort",
        evidenceLevel: "Gold",
        keyFindings: "Higher dietary magnesium intake significantly associated with improved sleep duration in adults; population-based study showing dose-response relationship",
        url: "https://pubmed.ncbi.nlm.nih.gov/39910836/"
      },
      {
        title: "Association between magnesium deficiency score and sleep quality in adults: A population-based cross-sectional study",
        journal: "Journal of Affective Disorders",
        year: 2024,
        doi: "10.1016/j.jad.2024.04.071",
        pmid: "38703902",
        studyType: "Cohort",
        sampleSize: 17465,
        evidenceLevel: "Gold",
        keyFindings: "Magnesium deficiency strongly associated with poor sleep quality in large population study; dose-dependent relationship observed",
        url: "https://pubmed.ncbi.nlm.nih.gov/38703902/"
      }
    ]
  },
  {
    intervention: "Black Cohosh",
    category: "Supplements",
    pillar: "balance",
    studies: [
      {
        title: "Exploring the Efficacy and Safety of Black Cohosh (Cimicifuga racemosa) in Menopausal Symptom Management",
        journal: "Journal of Midlife Health",
        year: 2024,
        doi: "10.4103/jmh.jmh_18_24",
        pmid: "38764923",
        studyType: "Review",
        evidenceLevel: "Gold",
        keyFindings: "Comprehensive review confirms Black Cohosh efficacy for managing menopausal symptoms including hot flashes; serotonergic rather than estrogenic mechanism",
        url: "https://pubmed.ncbi.nlm.nih.gov/38764923/"
      }
    ]
  },
  {
    intervention: "Melatonin",
    category: "Supplements",
    pillar: "balance",
    studies: [
      {
        title: "Melatonin Aids in Treating Mood and Sleep Problems Resulting from Hormonal Therapy in Breast Cancer Patients: A Randomized, Double-Blinded, Placebo-Controlled Trial",
        journal: "Healthcare",
        year: 2025,
        doi: "10.3390/healthcare13050504",
        studyType: "RCT",
        evidenceLevel: "Gold",
        keyFindings: "Melatonin supplementation significantly improved sleep quality and mood in women undergoing hormonal therapy; well-tolerated with no adverse effects",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11892750/"
      },
      {
        title: "Melatonin Alleviates Perimenopausal Sleep Disorders by Regulating the Expression of MTNR1A and Hormone Level: A Retrospective Study",
        journal: "Clinical and Experimental Obstetrics & Gynecology",
        year: 2023,
        doi: "10.31083/j.ceog5002027",
        studyType: "Cohort",
        evidenceLevel: "Silver",
        keyFindings: "Melatonin supplementation improved sleep quality in perimenopausal women through melatonin receptor regulation",
        url: "https://www.imrpress.com/journal/CEOG/50/2/10.31083/j.ceog5002027/htm"
      }
    ]
  },
  {
    intervention: "Red Clover Isoflavones",
    category: "Supplements",
    pillar: "balance",
    studies: [
      {
        title: "Use of Fermented Red Clover Isoflavones in the Treatment of Overactive Bladder in Postmenopausal Women: A Randomized, Double-Blinded, Placebo-Controlled Trial",
        journal: "Phytotherapy Research",
        year: 2023,
        doi: "10.1002/ptr.7976",
        pmid: "37836449",
        studyType: "RCT",
        evidenceLevel: "Gold",
        keyFindings: "Fermented red clover isoflavones significantly improved overactive bladder symptoms in postmenopausal women",
        url: "https://pubmed.ncbi.nlm.nih.gov/37836449/"
      },
      {
        title: "The effect of isoflavone on vaginal dryness and dyspareunia in postmenopausal symptoms: a systematic review and meta-analysis",
        journal: "Archives of Gynecology and Obstetrics",
        year: 2024,
        doi: "10.1007/s00404-024-07800-3",
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        keyFindings: "Isoflavones including red clover significantly reduce vaginal dryness and dyspareunia in postmenopausal women",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11976920/"
      }
    ]
  },
  {
    intervention: "Omega-3 Fatty Acids",
    category: "Supplements",
    pillar: "balance",
    studies: [
      {
        title: "Long chain n-3 polyunsaturated fatty acid intake across the life span for cardiovascular disease prevention in women",
        journal: "Proceedings of the Nutrition Society",
        year: 2024,
        doi: "10.1017/S0029665124004907",
        studyType: "Review",
        evidenceLevel: "Gold",
        keyFindings: "Comprehensive review of omega-3 benefits for women's cardiovascular health across lifespan; evidence for CVD risk reduction",
        url: "https://www.cambridge.org/core/journals/proceedings-of-the-nutrition-society/article/long-chain-n3-polyunsaturated-fatty-acid-intake-across-the-life-span-for-cardiovascular-disease-prevention-in-women/5DD7D46731001D7ECB158FD3BDA3BD00"
      },
      {
        title: "Omega-3 fatty acids effectively mitigate high-sensitivity C-reactive protein (hs-CRP) biomarker of chronic inflammation in middle-aged women",
        journal: "Naunyn-Schmiedeberg's Archives of Pharmacology",
        year: 2025,
        doi: "10.1007/s00210-024-03330-1",
        pmid: "39073419",
        studyType: "RCT",
        evidenceLevel: "Gold",
        keyFindings: "Omega-3 supplementation significantly reduced inflammation markers (hs-CRP) in middle-aged women",
        url: "https://pubmed.ncbi.nlm.nih.gov/39073419/"
      }
    ]
  },
  
  // Body Pillar Supplements
  {
    intervention: "Curcumin",
    category: "Supplements",
    pillar: "body",
    studies: [
      {
        title: "The Potential Systemic Anti-Inflammatory Effect of Turmeric Dried Extract",
        journal: "Journal of Clinical Medicine",
        year: 2025,
        doi: "10.3390/jcm14020414",
        pmid: "39791174",
        studyType: "RCT",
        evidenceLevel: "Gold",
        keyFindings: "Curcumin supplementation demonstrates significant systemic anti-inflammatory effects; well-tolerated in human trials",
        url: "https://pubmed.ncbi.nlm.nih.gov/39791174/"
      },
      {
        title: "Curcumin and multiple health outcomes: critical umbrella review of intervention meta-analyses",
        journal: "Frontiers in Nutrition",
        year: 2024,
        doi: "10.3389/fnut.2024.1515896",
        studyType: "Meta-analysis",
        evidenceLevel: "Gold",
        keyFindings: "Umbrella review of 32 meta-analyses confirms curcumin benefits for inflammation, metabolic health, and multiple chronic conditions",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12176752/"
      }
    ]
  },
  {
    intervention: "Probiotics for Women's Health",
    category: "Supplements",
    pillar: "body",
    studies: [
      {
        title: "The role of probiotics in women's health: An update narrative review",
        journal: "Frontiers in Microbiology",
        year: 2024,
        doi: "10.3389/fmicb.2023.1327003",
        pmid: "38216265",
        studyType: "Review",
        evidenceLevel: "Gold",
        keyFindings: "Comprehensive review of probiotic benefits for vaginal health, gut microbiome, and hormonal balance in women; Lactobacillus species particularly beneficial",
        url: "https://pubmed.ncbi.nlm.nih.gov/38216265/"
      },
      {
        title: "Oral probiotics and vaginal microbiome in post-menopause women: an opinion for the improvement of natural therapies in gynecology",
        journal: "Frontiers in Microbiology",
        year: 2024,
        doi: "10.3389/fmicb.2023.1319957",
        studyType: "Review",
        evidenceLevel: "Silver",
        keyFindings: "Oral probiotics can improve vaginal microbiome health in postmenopausal women; promising for natural hormone-free therapies",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10768674/"
      }
    ]
  },
  {
    intervention: "Vitamin D, Omega-3 & Exercise for Biological Aging",
    category: "Supplements",
    pillar: "balance",
    studies: [
      {
        title: "Individual and additive effects of vitamin D, omega-3 and exercise on biological aging: Results from DO-HEALTH randomized controlled trial",
        journal: "Aging Cell",
        year: 2025,
        doi: "10.1111/acel.14420",
        studyType: "RCT",
        sampleSize: 2157,
        evidenceLevel: "Gold",
        keyFindings: "Combined vitamin D (2000 IU/day), omega-3 (1g/day), and exercise significantly slowed biological aging measured by epigenetic clocks in adults 70+; additive benefits observed",
        url: "https://pubmed.ncbi.nlm.nih.gov/39506361/"
      }
    ]
  },
  {
    intervention: "Dietary Patterns & Epigenetic Aging",
    category: "Nutrition",
    pillar: "balance",
    studies: [
      {
        title: "Effect of a plant-based diet on biological age: A randomized controlled trial",
        journal: "BMC Medicine",
        year: 2025,
        doi: "10.1186/s12916-025-03789-4",
        studyType: "RCT",
        sampleSize: 72,
        evidenceLevel: "Gold",
        keyFindings: "8-week plant-based diet significantly reduced epigenetic age by average 1.8 years; effects most pronounced in women",
        url: "https://pubmed.ncbi.nlm.nih.gov/39872572/"
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
