import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Moon, UtensilsCrossed, Brain, Pill, LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import { getToolkitCategories } from "@/services/toolkitService";
import { toast } from "sonner";

// Map icon names to icon components
const iconMap: Record<string, LucideIcon> = {
  Activity,
  Moon,
  UtensilsCrossed,
  Brain,
  Pill,
};

const BiohackingToolkit = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['toolkit-categories'],
    queryFn: getToolkitCategories,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Show error toast if fetch fails
  if (error) {
    toast.error("Failed to load toolkit categories. Please refresh the page.");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-albra font-bold mb-4 text-primary">
              Biohacking Toolkit
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your comprehensive suite of evidence-based biohacking tools and protocols. 
              Explore personalised strategies for optimal health, performance, and longevity 
              tailored specifically for women's unique biology.
            </p>
          </div>

          {/* Toolkit Items Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="h-full border-2 border-l-4 border-l-primary/40">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                </Card>
              ))
            ) : error ? (
              // Error state
              <div className="col-span-2 text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Unable to load toolkit categories. Please try again later.
                </p>
              </div>
            ) : (
              // Loaded categories
              categories?.map((category) => {
                const Icon = iconMap[category.icon_name] || Activity;
                return (
                  <Link key={category.id} to={`/${category.slug}`}>
                    <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 hover:border-primary border-l-4 border-l-primary/40">
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-primary-dark" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{category.name}</CardTitle>
                              <ScienceBackedIcon 
                                className="h-4 w-4" 
                                evidenceKey={`toolkit:${category.slug}`}
                              />
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-base">
                          {category.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiohackingToolkit;
