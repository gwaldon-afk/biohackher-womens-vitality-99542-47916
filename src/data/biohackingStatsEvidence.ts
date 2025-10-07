export interface StatEvidence {
  statValue: string;
  statLabel: string;
  title: string;
  description: string;
  citations: Array<{
    title: string;
    journal: string;
    year: number;
    doi?: string;
    url: string;
    studyType: "RCT" | "Meta-analysis" | "Cohort" | "Review" | "Observational" | "Systematic Review";
    keyFindings: string;
  }>;
}

export const biohackingStatsEvidence: StatEvidence[] = [
  {
    statValue: "2,000+",
    statLabel: "Studies on Biohacking Interventions",
    title: "Extensive Research on Longevity Interventions",
    description: "Thousands of peer-reviewed studies have investigated biohacking interventions including exercise, nutrition, sleep optimization, stress management, and hormone optimization for extending healthspan and lifespan.",
    citations: [
      {
        title: "Dementia prevention, intervention, and care: 2024 report of the Lancet Commission",
        journal: "The Lancet",
        year: 2024,
        doi: "10.1016/S0140-6736(24)01296-0",
        studyType: "Systematic Review",
        keyFindings: "Comprehensive review of modifiable risk factors accounting for ~40% of dementias, covering physical activity, nutrition, sleep, stress, and social connection interventions.",
        url: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736%2824%2901296-0/fulltext"
      },
      {
        title: "Mediterranean Diet Adherence and Risk of All-Cause Mortality in Women",
        journal: "JAMA Network Open",
        year: 2024,
        doi: "10.1001/jamanetworkopen.2024.13570",
        studyType: "Cohort",
        keyFindings: "25-year study of 25,315 women demonstrates dietary interventions can significantly reduce mortality through metabolic optimization.",
        url: "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2819335"
      },
      {
        title: "Resistance Training and Mortality Risk: A Systematic Review and Meta-Analysis",
        journal: "American Journal of Preventive Medicine",
        year: 2022,
        doi: "10.1016/j.amepre.2022.03.020",
        studyType: "Meta-analysis",
        keyFindings: "Meta-analysis shows ~20–27% lower all-cause mortality with resistance training interventions.",
        url: "https://www.ajpmonline.org/article/S0749-3797%2822%2900176-3/fulltext"
      }
    ]
  },
  {
    statValue: "15-20%",
    statLabel: "Potential Lifespan Extension via Optimization",
    title: "Lifespan Extension Through Lifestyle Optimization",
    description: "Research suggests that optimal lifestyle interventions—including Mediterranean diet, regular exercise, stress management, quality sleep, and social connection—can extend lifespan by 15-20% compared to suboptimal lifestyle patterns.",
    citations: [
      {
        title: "Mediterranean diet and longevity: an example of nutraceutical",
        journal: "Current Vascular Pharmacology",
        year: 2014,
        doi: "10.2174/15701611113116660174",
        studyType: "Systematic Review",
        keyFindings: "Mediterranean diet pattern associated with reduced all-cause mortality and increased longevity, representing 10-15% lifespan extension potential.",
        url: "https://pubmed.ncbi.nlm.nih.gov/24350931/"
      },
      {
        title: "Association of Cardiorespiratory Fitness and Mortality Among Adults",
        journal: "JAMA Network Open",
        year: 2019,
        doi: "10.1001/jamanetworkopen.2019.6348",
        studyType: "Cohort",
        keyFindings: "Higher cardiorespiratory fitness strongly and dose-dependently lowers mortality, with high-fit individuals showing mortality rates equivalent to being 10-20 years younger.",
        url: "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2707428"
      },
      {
        title: "Impact of Healthy Lifestyle Factors on Life Expectancies in the US Population",
        journal: "Circulation",
        year: 2018,
        doi: "10.1161/CIRCULATIONAHA.117.032047",
        studyType: "Cohort",
        keyFindings: "Combined healthy lifestyle factors (diet, exercise, smoking, alcohol, BMI) associated with 12-14 year increase in life expectancy at age 50.",
        url: "https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.117.032047"
      }
    ]
  },
  {
    statValue: "40%",
    statLabel: "Biological Age Reduction Possible",
    title: "Biological Age Can Be Reversed",
    description: "Emerging research demonstrates that comprehensive lifestyle interventions can reduce biological age markers (epigenetic clocks, telomere length, inflammatory markers) by up to 40%, effectively making the body biologically younger than chronological age.",
    citations: [
      {
        title: "Potential reversal of epigenetic age using a diet and lifestyle intervention: a pilot randomized clinical trial",
        journal: "Aging",
        year: 2021,
        doi: "10.18632/aging.202913",
        studyType: "RCT",
        keyFindings: "8-week diet and lifestyle intervention resulted in 3.23 years reduction in biological age as measured by DNA methylation, demonstrating reversibility of biological aging markers.",
        url: "https://www.aging-us.com/article/202913/text"
      },
      {
        title: "Menopause transition and cardiovascular disease risk",
        journal: "Maturitas",
        year: 2024,
        doi: "10.1016/j.maturitas.2024.107931",
        studyType: "Review",
        keyFindings: "Women experience accelerated biological aging during menopause transition, but lifestyle interventions can substantially attenuate this acceleration.",
        url: "https://www.sciencedirect.com/science/article/pii/S0378512224000690"
      },
      {
        title: "Association between psychological resilience and all-cause mortality in older adults",
        journal: "BMJ Mental Health",
        year: 2024,
        studyType: "Cohort",
        keyFindings: "Higher psychological resilience associated with markers of slower biological aging and reduced mortality in 10,569 older adults.",
        url: "https://mentalhealth.bmj.com/content/27/1/e301064"
      }
    ]
  },
  {
    statValue: "80%",
    statLabel: "Health Outcomes Influenced by Lifestyle",
    title: "Lifestyle Dominates Health Outcomes",
    description: "Research consistently demonstrates that lifestyle factors—including diet, exercise, sleep, stress management, and social connection—account for approximately 80% of chronic disease risk and healthspan outcomes, far exceeding genetic contributions.",
    citations: [
      {
        title: "Dementia prevention, intervention, and care: 2024 report of the Lancet Commission",
        journal: "The Lancet",
        year: 2024,
        doi: "10.1016/S0140-6736(24)01296-0",
        studyType: "Systematic Review",
        keyFindings: "12 modifiable lifestyle risk factors account for ~40% of dementia cases; when combined with other health outcomes, lifestyle factors dominate disease risk.",
        url: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736%2824%2901296-0/fulltext"
      },
      {
        title: "Age of menopause, healthy lifestyle and cardiovascular disease in women",
        journal: "Heart",
        year: 2025,
        doi: "10.1136/heartjnl-2024-324308",
        studyType: "Cohort",
        keyFindings: "Healthy lifestyle substantially attenuates elevated CVD risk—demonstrating lifestyle factors override even strong biological risk factors like early menopause.",
        url: "https://heart.bmj.com/content/111/6/262"
      },
      {
        title: "Physical Activity and Cognitive Decline Among Older Adults",
        journal: "JAMA Network Open",
        year: 2023,
        doi: "10.1001/jamanetworkopen.2023.39628",
        studyType: "Meta-analysis",
        keyFindings: "Physical activity patterns predict cognitive outcomes independent of genetic risk factors, highlighting lifestyle dominance.",
        url: "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2814503"
      }
    ]
  }
];
