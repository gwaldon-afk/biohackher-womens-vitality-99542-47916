export interface ResearchCitation {
  title: string;
  journal?: string;
  year: number;
  url: string;
  doi?: string;
  studyType?: "Policy" | "Review" | "Meta-analysis" | "Report";
}

export const womenResearchGapCitations: ResearchCitation[] = [
  {
    title: "NIH Revitalization Act of 1993: Mandate for inclusion of women in clinical research",
    journal: "Federal Register",
    year: 1993,
    url: "https://orwh.od.nih.gov/about/legislation",
    studyType: "Policy"
  },
  {
    title: "Sex and gender differences in health: what the COVID-19 pandemic can teach us",
    journal: "Annals of Internal Medicine",
    year: 2020,
    url: "https://pubmed.ncbi.nlm.nih.gov/32384135/",
    doi: "10.7326/M20-1941",
    studyType: "Review"
  },
  {
    title: "Women's participation in clinical trials: historical perspective and future implications",
    journal: "Pharmacy Practice",
    year: 2020,
    url: "https://pubmed.ncbi.nlm.nih.gov/32922647/",
    doi: "10.18549/PharmPract.2020.3.2033",
    studyType: "Review"
  },
  {
    title: "Analysis of sex inclusion in FDA drug trials",
    journal: "Journal of Women's Health",
    year: 2021,
    url: "https://pubmed.ncbi.nlm.nih.gov/33512287/",
    doi: "10.1089/jwh.2020.8932",
    studyType: "Meta-analysis"
  }
];
