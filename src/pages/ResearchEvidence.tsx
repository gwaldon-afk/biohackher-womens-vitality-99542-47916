import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, ExternalLink, Download, FileText, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import EvidenceBadge from "@/components/EvidenceBadge";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import { researchEvidence, getTotalStudyCount, type InterventionResearch } from "@/data/researchEvidence";

const ResearchEvidence = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pillarFilter, setPillarFilter] = useState<string>("all");
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const totalStudies = getTotalStudyCount();
  const totalInterventions = researchEvidence.length;

  const filteredResearch = useMemo(() => {
    return researchEvidence.filter((item) => {
      const matchesSearch = 
        item.intervention.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studies.some(study => 
          study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          study.journal.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesPillar = pillarFilter === "all" || item.pillar === pillarFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesEvidence = evidenceFilter === "all" || 
        item.studies.some(study => study.evidenceLevel === evidenceFilter);

      return matchesSearch && matchesPillar && matchesCategory && matchesEvidence;
    });
  }, [searchQuery, pillarFilter, evidenceFilter, categoryFilter]);

  const downloadCSV = () => {
    const headers = ["Intervention", "Category", "Pillar", "Study Title", "Journal", "Year", "Study Type", "Evidence Level", "DOI", "PMID", "Sample Size"];
    const rows = researchEvidence.flatMap(item =>
      item.studies.map(study => [
        item.intervention,
        item.category,
        item.pillar,
        study.title,
        study.journal,
        study.year,
        study.studyType,
        study.evidenceLevel,
        study.doi || "",
        study.pmid || "",
        study.sampleSize || ""
      ])
    );

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research-evidence.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ScienceBackedIcon className="h-12 w-12" showTooltip={false} />
            <h1 className="text-4xl md:text-5xl font-bold">Research Evidence Library</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Complete database of peer-reviewed research supporting our longevity interventions and recommendations
          </p>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-center gap-3 mb-2">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-4xl font-bold text-primary">{totalStudies}</div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Peer-Reviewed Studies</p>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Award className="h-8 w-8 text-primary" />
                <div className="text-4xl font-bold text-primary">{totalInterventions}</div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Evidence-Based Interventions</p>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-center gap-3 mb-2">
                <ScienceBackedIcon className="h-8 w-8" showTooltip={false} />
                <div className="text-4xl font-bold text-primary">100%</div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Science-Backed Protocols</p>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search interventions or studies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Supplements">Supplements</SelectItem>
                <SelectItem value="Therapies">Therapies</SelectItem>
                <SelectItem value="Sleep">Sleep</SelectItem>
                <SelectItem value="Nutrition">Nutrition</SelectItem>
              </SelectContent>
            </Select>

            <Select value={pillarFilter} onValueChange={setPillarFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Pillars" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pillars</SelectItem>
                <SelectItem value="brain">Brain</SelectItem>
                <SelectItem value="body">Body</SelectItem>
                <SelectItem value="beauty">Beauty</SelectItem>
                <SelectItem value="balance">Balance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={evidenceFilter} onValueChange={setEvidenceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Evidence Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Evidence Levels</SelectItem>
                <SelectItem value="Gold">Gold Evidence</SelectItem>
                <SelectItem value="Silver">Silver Evidence</SelectItem>
                <SelectItem value="Bronze">Bronze Evidence</SelectItem>
                <SelectItem value="Emerging">Emerging Evidence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={downloadCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {filteredResearch.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No research found matching your filters</p>
            </Card>
          ) : (
            filteredResearch.map((item: InterventionResearch) => (
              <Card key={item.intervention} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{item.intervention}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge variant="secondary" className="capitalize">{item.pillar} Pillar</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.studies.length} {item.studies.length === 1 ? 'study' : 'studies'}
                  </div>
                </div>

                <div className="space-y-4">
                  {item.studies.map((study, idx) => (
                    <div key={idx} className="border-l-4 border-primary/30 pl-4 py-2">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="font-semibold text-sm leading-tight flex-1">{study.title}</h4>
                        <EvidenceBadge level={study.evidenceLevel} showTooltip={true} />
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                        <span className="font-medium">{study.journal}</span>
                        <span>•</span>
                        <span>{study.year}</span>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs">{study.studyType}</Badge>
                        {study.sampleSize && (
                          <>
                            <span>•</span>
                            <span>n={study.sampleSize.toLocaleString()}</span>
                          </>
                        )}
                      </div>

                      {study.keyFindings && (
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Key Findings:</strong> {study.keyFindings}
                        </p>
                      )}

                      <div className="flex gap-3 text-xs">
                        {study.doi && (
                          <a
                            href={`https://doi.org/${study.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Study (DOI) <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <a
                          href={study.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {study.url.includes('pubmed') ? 'PubMed' : 'Source'} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ResearchEvidence;
