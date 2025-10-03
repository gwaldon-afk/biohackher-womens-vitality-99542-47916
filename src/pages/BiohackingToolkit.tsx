import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Moon, UtensilsCrossed, Brain, Pill } from "lucide-react";
import Navigation from "@/components/Navigation";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";

const BiohackingToolkit = () => {
  const toolkitItems = [
    {
      id: "therapies",
      title: "Therapies",
      description: "Evidence-based biohacking therapies and protocols",
      icon: Activity,
      href: "/therapies"
    },
    {
      id: "sleep",
      title: "Sleep",
      description: "Optimise your sleep quality and recovery",
      icon: Moon,
      href: "/sleep"
    },
    {
      id: "nutrition",
      title: "Nutrition",
      description: "Personalised nutrition strategies for longevity",
      icon: UtensilsCrossed,
      href: "/nutrition"
    },
    {
      id: "coaching",
      title: "Coaching",
      description: "Cycle-synced training and wellness coaching",
      icon: Brain,
      href: "/coaching"
    },
    {
      id: "supplements",
      title: "Supplements",
      description: "Science-backed supplement recommendations",
      icon: Pill,
      href: "/supplements"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
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
            {toolkitItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.id} to={item.href}>
                  <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 hover:border-primary border-l-4 border-l-primary/40">
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary-dark" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <ScienceBackedIcon className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-base">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiohackingToolkit;
