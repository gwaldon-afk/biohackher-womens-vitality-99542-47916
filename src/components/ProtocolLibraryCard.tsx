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
import { getIconComponent, getCategoryLabel } from "@/utils/iconMapper";

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
  
  const IconComponent = getIconComponent(protocol.icon);
  const categoryLabel = getCategoryLabel(protocol.category);

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-primary/10">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
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
                <Badge variant="secondary" className="mt-1 text-xs">
                  {categoryLabel}
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
              <div className="p-3 rounded-lg bg-primary/10">
                <IconComponent className="h-8 w-8 text-primary" />
              </div>
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
                <Badge variant="secondary" className="text-xs">
                  {categoryLabel}
                </Badge>
              </div>
            </div>
            <DialogDescription className="text-base space-y-6 mt-4">
              {/* Main Description */}
              {protocol.sourceData?.detailed_description && (
                <div className="space-y-2">
                  <p className="leading-relaxed text-foreground">{protocol.sourceData.detailed_description}</p>
                </div>
              )}
              
              {!protocol.sourceData?.detailed_description && protocol.description && (
                <div className="space-y-2">
                  <p className="leading-relaxed text-foreground">{protocol.description}</p>
                </div>
              )}

              {/* Why This Works Section */}
              {protocol.sourceData?.mechanism && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2">
                    <span>💡</span> Why This Works
                  </h4>
                  <p className="text-sm leading-relaxed">{protocol.sourceData.mechanism}</p>
                </div>
              )}

              {/* Research Highlights - MOVED HIGHER */}
              {protocol.researchCitations && protocol.researchCitations.length > 0 && (
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <h4 className="font-semibold text-sm text-accent mb-3 flex items-center gap-2">
                    <span>🔬</span> Research Highlights
                  </h4>
                  <div className="space-y-3">
                    {protocol.researchCitations.slice(0, 3).map((citation: any, idx: number) => (
                      <div key={idx} className="text-sm">
                        <p className="font-medium text-foreground">{citation.finding || citation.title}</p>
                        {citation.source && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {citation.source} {citation.year && `(${citation.year})`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {protocol.evidenceKey && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handleViewResearch}
                      className="mt-3 p-0 h-auto text-primary"
                    >
                      View All Research →
                    </Button>
                  )}
                </div>
              )}

              {/* Benefits */}
              {protocol.benefits && protocol.benefits.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Key Benefits:</h4>
                  <ul className="space-y-2">
                    {protocol.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">

            {/* How to Use - Enhanced */}
            {protocolSteps.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">How to Use</h3>
                {protocolSteps.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg border border-border bg-card space-y-2">
                    <p className="font-medium text-base">{item.intervention || item.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {item.duration && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">⏱️ Duration:</span>
                          <span className="font-medium">{item.duration}</span>
                        </div>
                      )}
                      {item.frequency && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">📅 Frequency:</span>
                          <span className="font-medium">{item.frequency}</span>
                        </div>
                      )}
                    </div>
                    {item.method && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">🎯 Method: </span>
                        <span>{item.method}</span>
                      </div>
                    )}
                    {item.pattern && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">🔄 Pattern: </span>
                        <span>{item.pattern}</span>
                      </div>
                    )}
                    {item.rationale && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground italic">{item.rationale}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <Separator />

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

            {/* Additional Research Info - Only show if no highlights shown earlier */}
            {(!protocol.researchCitations || protocol.researchCitations.length === 0) && protocol.evidenceKey && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewResearch}
                  className="w-full"
                >
                  View Research Evidence →
                </Button>
              </div>
            )}

            <Separator />

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
