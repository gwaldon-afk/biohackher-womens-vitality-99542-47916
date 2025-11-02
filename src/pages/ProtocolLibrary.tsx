import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mealTemplates } from "@/data/mealTemplates";
import { Activity, Utensils, Dumbbell, Pill, BookOpen } from "lucide-react";
import ProtocolTemplateCard from "@/components/ProtocolTemplateCard";
import { useNavigate } from "react-router-dom";

const ProtocolLibrary = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Templates", icon: Activity },
    { id: "nutrition", label: "Nutrition", icon: Utensils },
    { id: "exercise", label: "Exercise", icon: Dumbbell },
    { id: "supplements", label: "Supplements", icon: Pill },
    { id: "complete", label: "Complete Programs", icon: BookOpen },
  ];

  const completeTemplates = [
    {
      id: "evidence-based-foundation",
      name: "Evidence-Based Foundation Protocol",
      description: "Complete wellness program combining nutrition, exercise, and supplements based on Gabrielle Lyon & Stacey Sims research",
      category: "complete",
      benefits: [
        "30-40g protein per meal for muscle protein synthesis",
        "Compound lifts + HIIT for optimal strength & hormonal health",
        "Research-backed supplements for longevity",
        "Comprehensive approach to healthy aging"
      ],
      icon: "🌟"
    }
  ];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Protocol Library</h1>
            <p className="text-muted-foreground text-lg">
              Browse evidence-based wellness protocols and meal plans designed for optimal health
            </p>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList className="grid grid-cols-5 w-full max-w-3xl">
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

            <TabsContent value="all" className="mt-8 space-y-8">
              {/* Complete Programs */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Complete Programs
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {completeTemplates.map((template) => (
                    <ProtocolTemplateCard
                      key={template.id}
                      template={template}
                      onAdd={() => navigate("/my-protocol")}
                    />
                  ))}
                </div>
              </div>

              {/* Meal Plans */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Utensils className="h-6 w-6 text-primary" />
                  7-Day Meal Plans
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {mealTemplates.map((template) => (
                    <ProtocolTemplateCard
                      key={template.id}
                      template={{
                        id: template.id,
                        name: template.name,
                        description: template.description,
                        category: "nutrition",
                        benefits: template.benefits,
                        icon: template.icon
                      }}
                      onAdd={() => navigate("/my-protocol")}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nutrition" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mealTemplates.map((template) => (
                  <ProtocolTemplateCard
                    key={template.id}
                    template={{
                      id: template.id,
                      name: template.name,
                      description: template.description,
                      category: "nutrition",
                      benefits: template.benefits,
                      icon: template.icon
                    }}
                    onAdd={() => navigate("/my-protocol")}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="exercise" className="mt-8">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Exercise templates coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="supplements" className="mt-8">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Supplement protocols coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="complete" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completeTemplates.map((template) => (
                  <ProtocolTemplateCard
                    key={template.id}
                    template={template}
                    onAdd={() => navigate("/my-protocol")}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* CTA */}
          <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ready to build your protocol?</h3>
                  <p className="text-muted-foreground">
                    Combine templates or create a custom protocol tailored to your goals
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
