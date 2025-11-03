import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Info } from "lucide-react";
import { useState } from "react";

const EvidenceExplainer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-primary/20 bg-primary/5">
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-primary/10 transition-colors">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-primary" />
            <span className="font-medium">Understanding Evidence Levels</span>
          </div>
          <ChevronDown className={`h-5 w-5 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              All protocols in our library are evidence-based, with varying levels of research support. Here's what each level means:
            </p>
            
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
                <Badge className="evidence-gold shrink-0">Gold</Badge>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Multiple RCTs, Meta-Analyses, Systematic Reviews</p>
                  <p className="text-xs text-muted-foreground">
                    The highest quality evidence from randomized controlled trials, comprehensive reviews, and large-scale studies.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
                <Badge className="evidence-silver shrink-0">Silver</Badge>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Multiple Observational Studies, Some RCTs</p>
                  <p className="text-xs text-muted-foreground">
                    Strong evidence from well-designed observational research and some controlled trials.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
                <Badge className="evidence-bronze shrink-0">Bronze</Badge>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Preliminary Research, Mechanistic Studies</p>
                  <p className="text-xs text-muted-foreground">
                    Early-stage research showing promising mechanisms and biological plausibility.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
                <Badge className="bg-secondary/50 text-secondary-foreground border-secondary shrink-0">Emerging</Badge>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Promising but Needs More Research</p>
                  <p className="text-xs text-muted-foreground">
                    Interesting findings that require additional studies to confirm benefits and mechanisms.
                  </p>
                </div>
              </div>
            </div>
            
            <Alert className="border-primary/20">
              <AlertDescription className="text-xs">
                <strong>Why Evidence Matters:</strong> We prioritize protocols with strong research backing to ensure you're investing time in strategies with proven benefits. Even "Emerging" protocols show scientific promise and biological mechanisms.
              </AlertDescription>
            </Alert>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default EvidenceExplainer;
