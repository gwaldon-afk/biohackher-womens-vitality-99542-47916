import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Activity, Utensils, Dumbbell, Pill, Sparkles, Heart, Search, Loader2 } from "lucide-react";
import { ProtocolLibraryCard } from "@/components/ProtocolLibraryCard";
import { useProtocols } from "@/hooks/useProtocols";
import { useSubscription } from "@/hooks/useSubscription";
import { fetchAllLibraryProtocols, getProtocolsByCategory, LibraryProtocol } from "@/services/protocolLibraryService";
import { useToast } from "@/hooks/use-toast";
import { EvidenceBasedIntervention } from "@/data/evidenceBasedProtocols";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EvidenceExplainer from "@/components/EvidenceExplainer";
import { supabase } from "@/integrations/supabase/client";
import { TrialGateCard } from "@/components/subscription/TrialGateCard";

const ProtocolLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addProtocolFromLibrary } = useProtocols();
  const { hasTrialAccess } = useSubscription();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [protocols, setProtocols] = useState<LibraryProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingProtocolId, setAddingProtocolId] = useState<string | null>(null);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [primaryIntent, setPrimaryIntent] = useState<string>('');
  const trialAccess = hasTrialAccess();

  if (!trialAccess) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="max-w-5xl mx-auto pt-6">
          <TrialGateCard onKeepExploring={() => navigate('/biohacking-toolkit')} />
        </div>
      </div>
    );
  }

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

  // AI keyword extraction with debounce
  const extractKeywords = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setExtractedKeywords([]);
      setPrimaryIntent('');
      return;
    }

    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-protocol-keywords', {
        body: { query }
      });

      if (error) throw error;

      setExtractedKeywords(data.keywords || []);
      setPrimaryIntent(data.primary_intent || '');
    } catch (error) {
      console.error('Keyword extraction failed:', error);
      // Fallback to simple search
      setExtractedKeywords([query]);
      setPrimaryIntent('general');
    } finally {
      setIsExtracting(false);
    }
  }, []);

  // Debounce extraction
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        extractKeywords(searchQuery);
      } else {
        setExtractedKeywords([]);
        setPrimaryIntent('');
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, extractKeywords]);

  // Intelligent matching with scoring
  const filteredProtocols = useMemo(() => {
    if (!searchQuery.trim()) return protocols;

    // Use AI-extracted keywords or fallback to simple search
    const keywords = extractedKeywords.length > 0 
      ? extractedKeywords 
      : [searchQuery.toLowerCase()];

    return protocols
      .map(protocol => {
        let score = 0;
        const matchReasons: string[] = [];

        keywords.forEach(keyword => {
          const kwLower = keyword.toLowerCase();
          const kwNormalized = normalizeForSearch(keyword);

          // Name match (highest weight)
          if (protocol.name.toLowerCase().includes(kwLower)) {
            score += 10;
            matchReasons.push('name');
          }

          // Target symptoms match (high weight)
          const symptomsMatch = protocol.sourceData?.target_symptoms?.some((symptom: string) => {
            const normalized = normalizeForSearch(symptom);
            return normalized.includes(kwNormalized) || 
                   symptom.toLowerCase().includes(kwLower);
          });
          if (symptomsMatch) {
            score += 8;
            matchReasons.push('targets your symptoms');
          }

          // Benefits match (medium weight)
          const benefitsMatch = protocol.benefits.some(benefit => 
            benefit.toLowerCase().includes(kwLower)
          );
          if (benefitsMatch) {
            score += 5;
            matchReasons.push('provides benefits you need');
          }

          // Description match (medium weight)
          if (protocol.description.toLowerCase().includes(kwLower)) {
            score += 4;
            matchReasons.push('description');
          }

          // Category match (lower weight)
          if (normalizeForSearch(protocol.category).includes(kwNormalized)) {
            score += 3;
            matchReasons.push('category');
          }

          // Detailed description match (lower weight)
          if (protocol.sourceData?.detailed_description?.toLowerCase().includes(kwLower)) {
            score += 2;
            matchReasons.push('detailed info');
          }
        });

        return { 
          ...protocol, 
          matchScore: score, 
          matchReasons: [...new Set(matchReasons)] 
        };
      })
      .filter(p => p.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [protocols, searchQuery, extractedKeywords]);

  const exampleSearches = [
    "I can't sleep well",
    "Low energy all day",
    "Brain fog and focus issues",
    "Perimenopause symptoms",
    "Anxiety and stress"
  ];

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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Protocol Library</h1>
            <p className="text-muted-foreground text-lg mb-4">
              Browse evidence-based wellness protocols from top researchers and add them to your personalized plan
            </p>
            
            {/* Build Your Protocol CTA */}
            <Card className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Build Your Custom Protocol
                    </h3>
                    <p className="text-muted-foreground">
                      Start with evidence-based templates or create your personalized wellness plan from scratch
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => navigate('/my-protocol')}>
                      <Activity className="w-4 h-4 mr-2" />
                      Go to My Protocol
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Explainer */}
            <div className="mb-6">
              <EvidenceExplainer />
            </div>
            
            {/* Conversational Prompt */}
            <div className="text-center mb-4">
              <p className="text-lg font-medium">What health goal are you working on?</p>
              <p className="text-sm text-muted-foreground">
                Describe your symptoms, goals, or what you'd like to improve in natural language
              </p>
            </div>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="What are you interested in? (e.g., I can't sleep, I'm always tired, anxiety relief)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Example searches */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {exampleSearches.map(example => (
                  <Badge 
                    key={example}
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => setSearchQuery(example)}
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results Context */}
          {searchQuery && filteredProtocols.length > 0 && (
            <Alert className="mb-6 border-primary/20 bg-primary/5">
              <AlertDescription>
                <div className="flex flex-col gap-2">
                  <div>
                    Found <strong>{filteredProtocols.length}</strong> protocol{filteredProtocols.length !== 1 ? 's' : ''}
                    {extractedKeywords.length > 0 && (
                      <> matching: <strong>{extractedKeywords.join(', ')}</strong></>
                    )}
                  </div>
                  {isExtracting && (
                    <div className="text-xs flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Understanding your needs...
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* No results with suggestions */}
          {searchQuery && !loading && filteredProtocols.length === 0 && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground mb-4">
                  No protocols found for "{searchQuery}"
                </p>
                <div className="text-sm text-center">
                  <p className="mb-3 font-medium">Try searching for:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["sleep", "energy", "stress", "focus", "hormones", "gut health"].map(term => (
                      <Badge 
                        key={term}
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => setSearchQuery(term)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
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
