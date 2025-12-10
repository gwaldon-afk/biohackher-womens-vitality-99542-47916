import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertTriangle, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EvidenceBadge from "./EvidenceBadge";
import { PersonalizedRelevance } from "./research/PersonalizedRelevance";

interface AdditionalResearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interventionName: string;
  interventionType?: string;
}

interface Study {
  title: string;
  journal?: string;
  year?: number;
  doi?: string;
  pmid?: string;
  studyType?: string;
  sampleSize?: number;
  keyFindings?: string;
  evidenceLevel?: "Gold" | "Silver" | "Bronze" | "Emerging";
  url?: string;
}

const AdditionalResearchModal = ({ 
  open, 
  onOpenChange, 
  interventionName,
  interventionType = "supplement"
}: AdditionalResearchModalProps) => {
  const [loading, setLoading] = useState(false);
  const [studies, setStudies] = useState<Study[]>([]);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const searchPubMed = async () => {
    setLoading(true);
    setSearched(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('compile-research', {
        body: { 
          interventionName,
          interventionType 
        }
      });

      if (error) throw error;

      setStudies(data.studies || []);
      
      if (!data.studies || data.studies.length === 0) {
        toast({
          title: "No additional studies found",
          description: "Try adjusting your search or check back later as we continuously update our database.",
        });
      }
    } catch (error) {
      console.error('Error searching PubMed:', error);
      toast({
        title: "Search failed",
        description: "Unable to search PubMed at this time. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Additional Research: {interventionName}
          </DialogTitle>
          <DialogDescription>
            AI-powered search of PubMed for additional peer-reviewed studies
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm">
            <strong>Research Disclaimer:</strong> These studies are automatically sourced from PubMed 
            and have not been reviewed by our clinical team. Always consult healthcare professionals 
            before making health decisions. Our curated research library represents our highest 
            confidence recommendations.
          </AlertDescription>
        </Alert>

        {!searched && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Search PubMed for additional peer-reviewed research on {interventionName}
            </p>
            <Button onClick={searchPubMed} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching PubMed...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Additional Studies
                </>
              )}
            </Button>
          </div>
        )}

        {searched && !loading && studies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No additional studies found. Try our curated research library for verified studies.</p>
          </div>
        )}

        <div className="space-y-4">
          {studies.map((study, index) => (
            <Card key={index} className="border-l-4 border-l-primary/30">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-base leading-tight flex-1">
                      {study.title}
                    </h4>
                    {study.evidenceLevel && (
                      <EvidenceBadge level={study.evidenceLevel} />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {study.journal && (
                      <span className="font-medium">{study.journal}</span>
                    )}
                    {study.year && <span>({study.year})</span>}
                    {study.studyType && (
                      <Badge variant="outline" className="ml-2">
                        {study.studyType}
                      </Badge>
                    )}
                    {study.sampleSize && (
                      <Badge variant="outline">
                        n={study.sampleSize.toLocaleString()}
                      </Badge>
                    )}
                  </div>

                  {study.keyFindings && (
                    <p className="text-sm text-muted-foreground">
                      {study.keyFindings}
                    </p>
                  )}

                  {/* Personalized Relevance Section */}
                  <PersonalizedRelevance
                    studyTitle={study.title}
                    studyAbstract={study.keyFindings}
                    interventionName={interventionName}
                    className="mt-3"
                  />

                  <div className="flex gap-2 pt-2">
                    {study.doi && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://doi.org/${study.doi}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        DOI
                      </Button>
                    )}
                    {study.pmid && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        PubMed
                      </Button>
                    )}
                    {study.url && !study.doi && !study.pmid && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(study.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Study
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {searched && studies.length > 0 && (
          <Alert>
            <AlertDescription className="text-xs">
              Found {studies.length} additional studies. These are automatically sourced and not 
              part of our curated research library. Always verify findings with healthcare professionals.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdditionalResearchModal;
