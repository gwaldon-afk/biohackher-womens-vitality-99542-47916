import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, ShoppingCart, AlertCircle, Microscope, ExternalLink } from "lucide-react";
import type { LibraryProtocol } from "@/services/protocolLibraryService";
import EvidenceBadge from "@/components/EvidenceBadge";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import ResearchCitation from "@/components/ResearchCitation";
import { useCart } from "@/hooks/useCart";
import { useEvidenceStore } from "@/stores/evidenceStore";
import { getEvidenceContext } from "@/data/evidenceMapping";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProtocolLibraryCardProps {
  protocol: LibraryProtocol;
  onAddToProtocol: (protocol: LibraryProtocol) => void;
  isAdding?: boolean;
}

export const ProtocolLibraryCard = ({ protocol, onAddToProtocol, isAdding = false }: ProtocolLibraryCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const { addToCart } = useCart();
  const { openEvidence } = useEvidenceStore();

  const handleAddToCart = () => {
    if (protocol.product) {
      addToCart({
        id: protocol.product.id,
        name: protocol.product.name,
        price: protocol.product.price_usd || 0,
        originalPrice: protocol.product.price_usd,
        image: protocol.product.image_url || '/placeholder.svg',
        brand: protocol.product.brand || 'Biohackher',
        dosage: protocol.product.usage_instructions || '',
        quantity: 1,
      });
    }
  };

  const handleViewResearch = () => {
    if (protocol.evidenceKey) {
      const context = getEvidenceContext(protocol.evidenceKey);
      if (context) {
        openEvidence(protocol.evidenceKey, context.title, context.summary);
      }
    }
  };

  // Extract protocol steps/dosing from sourceData
  const protocolSteps = protocol.sourceData?.protocols || [];
  const contraindications = protocol.sourceData?.contraindications || [];
  const targetSymptoms = protocol.sourceData?.target_symptoms || [];

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-1">
              {protocol.icon && <span className="text-3xl">{protocol.icon}</span>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-lg">{protocol.name}</CardTitle>
                  {protocol.evidenceLevel && (
                    <EvidenceBadge level={protocol.evidenceLevel} className="text-xs" />
                  )}
                  {protocol.evidenceKey && (
                    <ScienceBackedIcon 
                      className="h-4 w-4 flex-shrink-0" 
                      evidenceKey={protocol.evidenceKey}
                    />
                  )}
                </div>
                <Badge variant="outline" className="mt-1 text-xs capitalize">
                  {protocol.category}
                </Badge>
              </div>
            </div>
          </div>
          <CardDescription className="mt-2 line-clamp-2">
            {protocol.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Benefits Preview */}
          {protocol.benefits.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Key Benefits:</p>
              <div className="space-y-1">
                {protocol.benefits.slice(0, 3).map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
                {protocol.benefits.length > 3 && (
                  <p className="text-xs text-muted-foreground ml-6">
                    +{protocol.benefits.length - 3} more benefits
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Product Info */}
          {protocol.product && (
            <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border border-border">
              <div className="space-y-1">
                <p className="text-sm font-medium">{protocol.product.brand}</p>
                <p className="text-lg font-bold text-primary">
                  ${protocol.product.price_usd?.toFixed(2)}
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                onClick={handleAddToCart}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              className="flex-1"
            >
              View Details
            </Button>
            <Button
              size="sm"
              onClick={() => onAddToProtocol(protocol)}
              disabled={isAdding}
              className="flex-1"
            >
              {isAdding ? "Adding..." : "Add to Protocol"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {protocol.icon && <span className="text-4xl">{protocol.icon}</span>}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <DialogTitle className="text-2xl">{protocol.name}</DialogTitle>
                  {protocol.evidenceLevel && (
                    <EvidenceBadge level={protocol.evidenceLevel} />
                  )}
                  {protocol.evidenceKey && (
                    <ScienceBackedIcon 
                      className="h-5 w-5" 
                      evidenceKey={protocol.evidenceKey}
                    />
                  )}
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {protocol.category}
                </Badge>
              </div>
            </div>
            <DialogDescription className="text-base mt-4">
              {protocol.sourceData?.detailed_description || protocol.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* All Benefits */}
            {protocol.benefits.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Benefits
                </h3>
                <div className="grid gap-2">
                  {protocol.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-accent/30">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Protocol Steps/Dosing */}
            {protocolSteps.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">How to Use</h3>
                <div className="space-y-2">
                  {protocolSteps.map((step: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm font-medium">{step.name || `Step ${idx + 1}`}</p>
                      {step.timing && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.timing}
                        </p>
                      )}
                      {step.dosage && (
                        <p className="text-sm mt-1">
                          <strong>Dosage:</strong> {step.dosage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target Symptoms */}
            {targetSymptoms.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Targets</h3>
                <div className="flex flex-wrap gap-2">
                  {targetSymptoms.map((symptom: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contraindications */}
            {contraindications.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Contraindications:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {contraindications.map((contra: any, idx: number) => (
                      <li key={idx}>
                        {contra.condition || contra}: {contra.reason || ''}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Research Support */}
            {protocol.researchCitations && protocol.researchCitations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Microscope className="h-5 w-5 text-primary" />
                  Research Support
                </h3>
                <div className="space-y-3">
                  {protocol.researchCitations.slice(0, 3).map((citation: any, idx: number) => (
                    <ResearchCitation
                      key={idx}
                      title={citation.title}
                      journal={citation.journal}
                      year={citation.year}
                      url={citation.url}
                      doi={citation.doi}
                      studyType={citation.studyType}
                      sampleSize={citation.sampleSize}
                    />
                  ))}
                  {protocol.evidenceKey && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewResearch}
                      className="w-full gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View All Research
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Product Purchase Option */}
            {protocol.product && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Get This Product</h3>
                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-border">
                    <div className="space-y-1">
                      <p className="font-medium">{protocol.product.name}</p>
                      <p className="text-sm text-muted-foreground">{protocol.product.brand}</p>
                      <p className="text-2xl font-bold text-primary">
                        ${protocol.product.price_usd?.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleAddToCart}
                      className="gap-2"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </Button>
                  </div>
                  {protocol.product.affiliate_link && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => window.open(protocol.product!.affiliate_link!, '_blank')}
                      className="w-full"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on partner site
                    </Button>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* Add to Protocol Action */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDetails(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  onAddToProtocol(protocol);
                  setShowDetails(false);
                }}
                disabled={isAdding}
                className="flex-1"
              >
                {isAdding ? "Adding..." : "Add to My Protocol"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
