import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, AlertTriangle, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import EvidenceBadge from "@/components/EvidenceBadge";
import ResearchCitation from "@/components/ResearchCitation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getToolkitCategoryBySlug, getToolkitItemsByCategory } from "@/services/toolkitService";
import { toast } from "sonner";

const ToolkitCategory = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Fetch category
  const { data: category, isLoading: categoryLoading, error: categoryError } = useQuery({
    queryKey: ['toolkit-category', categorySlug],
    queryFn: async () => {
      console.log('Fetching category with slug:', categorySlug);
      const result = await getToolkitCategoryBySlug(categorySlug!);
      console.log('Category result:', result);
      return result;
    },
    enabled: !!categorySlug,
    retry: 1,
  });

  // Fetch items for this category
  const { data: items, isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ['toolkit-items', category?.id],
    queryFn: async () => {
      console.log('Fetching items for category:', category?.id);
      const result = await getToolkitItemsByCategory(category!.id);
      console.log('Items result:', result);
      return result;
    },
    enabled: !!category?.id,
    retry: 1,
  });

  if (categoryError) {
    console.error('Category error:', categoryError);
    toast.error("Failed to load category.");
  }

  if (itemsError) {
    console.error('Items error:', itemsError);
    toast.error("Failed to load toolkit items.");
  }

  const selectedItem = items?.find(item => item.id === selectedItemId) || items?.[0];

  const isLoading = categoryLoading || itemsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Skeleton className="h-96" />
              <Skeleton className="lg:col-span-3 h-96" />
            </div>
          </div>
        ) : !category ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Category not found</p>
            <Link to="/biohacking-toolkit">
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Toolkit
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <Breadcrumbs
              items={[
                { label: "Toolkit", href: "/biohacking-toolkit" },
                { label: category.name, href: `/${category.slug}` }
              ]}
              className="mb-6"
            />

            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-3xl font-bold gradient-text">{category.name}</h1>
                <ScienceBackedIcon className="h-6 w-6" />
              </div>
              <p className="text-muted-foreground">
                {category.description}
              </p>
            </div>

            {!items || items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No items available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Item Selector */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      className={`cursor-pointer transition-colors border-l-4 ${
                        selectedItemId === item.id || (!selectedItemId && item.id === items[0].id)
                          ? "border-primary bg-primary/5" 
                          : "border-transparent hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedItemId(item.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <ScienceBackedIcon className="h-3 w-3" />
                        </div>
                        {item.evidence_level && (
                          <EvidenceBadge 
                            level={item.evidence_level.charAt(0).toUpperCase() + item.evidence_level.slice(1) as any} 
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Item Details */}
                <div className="lg:col-span-3">
                  {selectedItem && (
                    <>
                      <Card className="mb-6">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                              {selectedItem.name}
                              <ScienceBackedIcon className="h-5 w-5" />
                            </CardTitle>
                            {selectedItem.evidence_level && (
                              <EvidenceBadge 
                                level={selectedItem.evidence_level.charAt(0).toUpperCase() + selectedItem.evidence_level.slice(1) as any} 
                              />
                            )}
                          </div>
                          <CardDescription className="text-base">
                            {selectedItem.detailed_description || selectedItem.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>

                      <Tabs defaultValue="protocols" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="protocols">
                            {selectedItem.protocols ? 'Protocols' : 'Details'}
                          </TabsTrigger>
                          <TabsTrigger value="benefits">Benefits</TabsTrigger>
                          <TabsTrigger value="safety">Safety</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="protocols" className="mt-6">
                          <div className="grid gap-4">
                            {selectedItem.protocols && Array.isArray(selectedItem.protocols) ? (
                              selectedItem.protocols.map((protocol: any, index: number) => (
                                <Card key={index}>
                                  <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h3 className="font-semibold mb-2">
                                          {protocol.name || protocol.step || `Step ${index + 1}`}
                                        </h3>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                          {protocol.duration_minutes && (
                                            <p>Duration: {protocol.duration_minutes} minutes</p>
                                          )}
                                          {protocol.timing && (
                                            <p>Timing: {protocol.timing}</p>
                                          )}
                                          {protocol.dosage && (
                                            <p>Dosage: {protocol.dosage}</p>
                                          )}
                                          {protocol.frequency && (
                                            <p>Frequency: {protocol.frequency}</p>
                                          )}
                                          {protocol.distance && (
                                            <p>Distance: {protocol.distance}</p>
                                          )}
                                          {protocol.temperature && (
                                            <p>Temperature: {protocol.temperature}</p>
                                          )}
                                          {protocol.pattern && (
                                            <p>Pattern: {protocol.pattern}</p>
                                          )}
                                          {protocol.cycles && (
                                            <p>Cycles: {protocol.cycles}</p>
                                          )}
                                        </div>
                                      </div>
                                      {protocol.duration_minutes && (
                                        <Button size="sm" className="ml-4">
                                          <Play className="h-4 w-4 mr-2" />
                                          Start
                                        </Button>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                            ) : (
                              <Card>
                                <CardContent className="p-6">
                                  <p className="text-muted-foreground">
                                    {selectedItem.description}
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="benefits" className="mt-6">
                          <Card>
                            <CardContent className="p-6">
                              <h3 className="font-semibold mb-4 flex items-center gap-2">
                                Evidence-Based Benefits
                                <ScienceBackedIcon className="h-4 w-4" />
                              </h3>
                              {selectedItem.benefits && Array.isArray(selectedItem.benefits) ? (
                                <ul className="space-y-2 mb-6">
                                  {selectedItem.benefits.map((benefit: string, index: number) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-primary rounded-full" />
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted-foreground mb-6">
                                  Benefits information will be added soon.
                                </p>
                              )}
                              
                              {selectedItem.research_citations && Array.isArray(selectedItem.research_citations) && (
                                <div className="mt-6 pt-4 border-t">
                                  <h4 className="text-sm font-semibold mb-3">Supporting Research</h4>
                                  <div className="space-y-3">
                                    {selectedItem.research_citations.map((citation: any, index: number) => (
                                      <ResearchCitation key={index} {...citation} />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>
                        
                        <TabsContent value="safety" className="mt-6">
                          <Card className="border-destructive/20 bg-destructive/5">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                <h3 className="font-semibold text-destructive">Contraindications</h3>
                              </div>
                              {selectedItem.contraindications && Array.isArray(selectedItem.contraindications) && selectedItem.contraindications.length > 0 ? (
                                <>
                                  <p className="text-sm mb-4">Do not use this therapy if you have:</p>
                                  <ul className="space-y-2 mb-4">
                                    {selectedItem.contraindications.map((contra: any, index: number) => (
                                      <li key={index} className="text-sm flex items-start gap-2">
                                        <div className="w-1 h-1 bg-destructive rounded-full mt-2" />
                                        <div>
                                          <span className="font-medium">{contra.condition}</span>
                                          {contra.severity && (
                                            <Badge 
                                              variant={contra.severity === 'high' ? 'destructive' : 'secondary'}
                                              className="ml-2 text-xs"
                                            >
                                              {contra.severity} risk
                                            </Badge>
                                          )}
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              ) : (
                                <p className="text-sm mb-4">
                                  No specific contraindications listed. However, always consult with your healthcare provider before starting any new therapy.
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Always consult with your healthcare provider before beginning any new therapy protocol.
                              </p>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ToolkitCategory;
