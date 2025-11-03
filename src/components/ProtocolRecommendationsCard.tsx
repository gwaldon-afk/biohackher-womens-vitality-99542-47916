import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShoppingCart, Plus, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProtocolRecommendationsForSymptoms } from "@/utils/assessmentProtocolMatching";
import { LibraryProtocol } from "@/services/protocolLibraryService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProtocols } from "@/hooks/useProtocols";

interface ProtocolRecommendationsCardProps {
  userSymptoms: string[];
}

export function ProtocolRecommendationsCard({ userSymptoms }: ProtocolRecommendationsCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { protocols, addProtocolItem } = useProtocols();
  const [recommendations, setRecommendations] = useState<Array<LibraryProtocol & { matchScore: number; matchedSymptoms: string[] }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [userSymptoms]);

  const loadRecommendations = async () => {
    if (userSymptoms.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const protocols = await getProtocolRecommendationsForSymptoms(userSymptoms, 6);
      setRecommendations(protocols);
    } catch (error) {
      console.error('Error loading protocol recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToProtocol = async (protocol: LibraryProtocol) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add protocols",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get active protocol
      const activeProtocol = protocols.find(p => p.is_active);
      
      if (!activeProtocol) {
        toast({
          title: "No Active Protocol",
          description: "Please create a protocol first in My Protocol",
          variant: "destructive"
        });
        return;
      }

      // Map category to item_type
      const itemTypeMap: Record<string, 'therapy' | 'exercise' | 'supplement' | 'diet' | 'habit'> = {
        'therapy': 'therapy',
        'exercise': 'exercise',
        'nutrition': 'diet',
        'supplement': 'supplement',
        'sleep': 'habit',
        'complete': 'habit',
        'habit': 'habit'
      };

      // Add protocol item using the useProtocols hook
      await addProtocolItem({
        protocol_id: activeProtocol.id,
        name: protocol.name,
        item_type: itemTypeMap[protocol.category] || 'habit',
        description: protocol.description || '',
        frequency: 'daily',
        time_of_day: ['morning'],
        is_active: true,
        dosage: null,
        notes: null,
        product_link: null
      });

      toast({
        title: "Added to Protocol",
        description: `${protocol.name} has been added to your health protocol`
      });
    } catch (error) {
      console.error('Error adding to protocol:', error);
      toast({
        title: "Failed to Add",
        description: "Could not add protocol. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Personalized Protocol Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Personalized Protocol Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Complete assessments to receive personalized protocol recommendations based on your health profile.
          </p>
          <Button onClick={() => navigate('/pillars')}>
            Take Your First Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  const evidenceLevelColors: Record<string, string> = {
    Gold: 'bg-amber-100 text-amber-900 border-amber-300',
    Silver: 'bg-gray-100 text-gray-900 border-gray-300',
    Bronze: 'bg-orange-100 text-orange-900 border-orange-300',
    Emerging: 'bg-blue-100 text-blue-900 border-blue-300'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Personalized Protocol Recommendations
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your completed assessments and identified symptoms
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/protocol-library')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Explore All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {recommendations.map((protocol) => (
            <div 
              key={protocol.id}
              className="border rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {protocol.icon && <span className="text-xl">{protocol.icon}</span>}
                    <h4 className="font-semibold">{protocol.name}</h4>
                  </div>
                  {protocol.evidenceLevel && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs mb-2 ${evidenceLevelColors[protocol.evidenceLevel]}`}
                    >
                      {protocol.evidenceLevel} Evidence
                    </Badge>
                  )}
                </div>
              </div>

              {protocol.matchedSymptoms.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Matched symptoms:</p>
                  <div className="flex flex-wrap gap-1">
                    {protocol.matchedSymptoms.slice(0, 3).map((symptom, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {symptom.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {protocol.description}
              </p>

              {protocol.benefits && protocol.benefits.length > 0 && (
                <ul className="text-xs space-y-1 mb-4">
                  {protocol.benefits.slice(0, 3).map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleAddToProtocol(protocol)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add to Protocol
                </Button>
                {protocol.product && (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => navigate(`/shop?product=${protocol.product?.id}`)}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    View Product
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button 
          variant="outline" 
          onClick={() => navigate('/protocol-library')}
          className="w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Explore Full Protocol Library
        </Button>
      </CardContent>
    </Card>
  );
}
