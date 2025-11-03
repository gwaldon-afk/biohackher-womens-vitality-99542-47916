import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Activity, Utensils, Dumbbell, Pill, Sparkles, Heart, Search, Loader2 } from "lucide-react";
import { ProtocolLibraryCard } from "@/components/ProtocolLibraryCard";
import { useProtocols } from "@/hooks/useProtocols";
import { fetchAllLibraryProtocols, getProtocolsByCategory, LibraryProtocol } from "@/services/protocolLibraryService";
import { useToast } from "@/hooks/use-toast";
import { EvidenceBasedIntervention } from "@/data/evidenceBasedProtocols";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EvidenceExplainer from "@/components/EvidenceExplainer";

const ProtocolLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addProtocolFromLibrary } = useProtocols();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [protocols, setProtocols] = useState<LibraryProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingProtocolId, setAddingProtocolId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Protocols", icon: Activity },
    { id: "complete", label: "Complete Programs", icon: Sparkles },
    { id: "therapy", label: "Therapies", icon: Heart },
    { id: "exercise", label: "Exercise", icon: Dumbbell },
    { id: "nutrition", label: "Nutrition", icon: Utensils },
    { id: "supplement", label: "Supplements", icon: Pill },
  ];

  useEffect(() => {
    loadProtocols();
  }, [selectedCategory]);

  const loadProtocols = async () => {
    setLoading(true);
    try {
      const data = selectedCategory === 'all' 
        ? await fetchAllLibraryProtocols()
        : await getProtocolsByCategory(selectedCategory);
      setProtocols(data);
    } catch (error) {
      console.error('Error loading protocols:', error);
      toast({
        title: "Error",
        description: "Failed to load protocols. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Normalize text for search (handle hyphenated and underscored terms like "sleep-disruption" or "sleep_disruption")
  const normalizeForSearch = (text: string) => {
    return text.toLowerCase().replace(/[-_]/g, ' ');
  };

  // Enhanced search - includes target_symptoms, benefits, category with normalization
  const filteredProtocols = protocols.filter((protocol) => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    // Check if any symptom matches (with normalization for hyphenated terms)
    const symptomsMatch = protocol.sourceData?.target_symptoms?.some((symptom: string) => {
      const normalized = normalizeForSearch(symptom);
      return normalized.includes(searchLower) || symptom.toLowerCase().includes(searchLower);
    });
    
    return (
      protocol.name.toLowerCase().includes(searchLower) ||
      protocol.description.toLowerCase().includes(searchLower) ||
      protocol.benefits.some((benefit) => benefit.toLowerCase().includes(searchLower)) ||
      normalizeForSearch(protocol.category).includes(searchLower) ||
      symptomsMatch ||
      protocol.sourceData?.detailed_description?.toLowerCase().includes(searchLower)
    );
  });

  const handleAddToProtocol = async (protocol: LibraryProtocol) => {
    setAddingProtocolId(protocol.id);
    
    try {
      let items: Array<{
        item_type: 'supplement' | 'therapy' | 'habit' | 'exercise' | 'diet';
        name: string;
        description?: string;
        dosage?: string;
        frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
        time_of_day?: string[];
        notes?: string;
      }> = [];

      // Convert protocol to protocol items based on source type
      if (protocol.sourceType === 'evidence') {
        const sourceData = protocol.sourceData;
        
        if (Array.isArray(sourceData)) {
          // Single protocol or array of interventions
          items = sourceData.map((intervention: EvidenceBasedIntervention) => ({
            item_type: intervention.type,
            name: intervention.name,
            description: intervention.reason,
            dosage: intervention.dosage || intervention.sets_reps,
            frequency: intervention.frequency,
            time_of_day: intervention.time_of_day,
            notes: `Evidence: ${intervention.evidence_source}`
          }));
        } else {
          // Complete program with multiple protocols
          const allInterventions: EvidenceBasedIntervention[] = [];
          Object.values(sourceData).forEach((interventions: any) => {
            if (Array.isArray(interventions)) {
              allInterventions.push(...interventions);
            }
          });
          
          items = allInterventions.map(intervention => ({
            item_type: intervention.type,
            name: intervention.name,
            description: intervention.reason,
            dosage: intervention.dosage || intervention.sets_reps,
            frequency: intervention.frequency,
            time_of_day: intervention.time_of_day,
            notes: `Evidence: ${intervention.evidence_source}`
          }));
        }
      } else if (protocol.sourceType === 'toolkit') {
        // Toolkit item
        items = [{
          item_type: protocol.category === 'therapy' ? 'therapy' : 
                    protocol.category === 'exercise' ? 'exercise' :
                    protocol.category === 'supplement' ? 'supplement' :
                    protocol.category === 'nutrition' ? 'diet' : 'habit',
          name: protocol.name,
          description: protocol.description,
          dosage: protocol.sourceData.recommended_dosage,
          frequency: 'daily',
          time_of_day: ['morning'],
          notes: protocol.sourceData.usage_instructions || protocol.sourceData.how_to_use
        }];
      } else if (protocol.sourceType === 'meal_template') {
        // Meal template
        items = [{
          item_type: 'diet',
          name: protocol.name,
          description: protocol.description,
          frequency: 'daily',
          time_of_day: ['morning', 'afternoon', 'evening'],
          notes: `7-day meal plan. Benefits: ${protocol.benefits.slice(0, 2).join(', ')}`
        }];
      }

      await addProtocolFromLibrary(protocol.name, items);

      toast({
        title: "Added to Protocol!",
        description: `${protocol.name} has been added to your protocol.`,
      });

      // Navigate to My Protocol after a short delay
      setTimeout(() => {
        navigate('/my-protocol');
      }, 1000);

    } catch (error) {
      console.error('Error adding protocol:', error);
      toast({
        title: "Error",
        description: "Failed to add protocol. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAddingProtocolId(null);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Protocol Library</h1>
            <p className="text-muted-foreground text-lg mb-4">
              Browse evidence-based wellness protocols from top researchers and add them to your personalized plan
            </p>
            
            {/* Evidence Explainer */}
            <div className="mb-6">
              <EvidenceExplainer />
            </div>
            
            {/* Search */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search protocols (e.g., sleep, energy, focus, magnesium)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Search Results Context */}
          {searchQuery && filteredProtocols.length > 0 && (
            <Alert className="mb-6 border-primary/20 bg-primary/5">
              <AlertDescription>
                Found <strong>{filteredProtocols.length}</strong> evidence-based protocol{filteredProtocols.length !== 1 ? 's' : ''} for "<strong>{searchQuery}</strong>". All protocols below have research backing, with evidence levels ranging from Gold-standard RCTs to emerging research.
              </AlertDescription>
            </Alert>
          )}

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full max-w-4xl">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{cat.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-8">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredProtocols.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No protocols found matching your search.' : 'No protocols available in this category.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProtocols.map((protocol) => (
                    <ProtocolLibraryCard
                      key={protocol.id}
                      protocol={protocol}
                      onAddToProtocol={handleAddToProtocol}
                      isAdding={addingProtocolId === protocol.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* CTA */}
          <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ready to view your protocol?</h3>
                  <p className="text-muted-foreground">
                    See all your added protocols and customize them to fit your needs
                  </p>
                </div>
                <Link to="/my-protocol">
                  <Button size="lg">
                    Go to My Protocol
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProtocolLibrary;
