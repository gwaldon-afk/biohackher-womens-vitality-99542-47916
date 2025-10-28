import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, ExternalLink } from "lucide-react";

const ExpertFinderMap = () => {
  const [selectedExpert, setSelectedExpert] = useState<number | null>(null);

  // Unified expert directory - show all experts regardless of user preferences
  const experts = [
    { id: 1, name: 'Dr. Sarah Chen', specialty: 'Performance Nutrition', rating: 4.9, distance: '2.3 km' },
    { id: 2, name: 'Coach Mike Roberts', specialty: 'Biohacking', rating: 4.8, distance: '5.1 km' },
    { id: 3, name: 'Dr. Alex Kumar', specialty: 'Sleep Optimization', rating: 4.7, distance: '8.4 km' },
    { id: 4, name: 'Dr. Emma Wilson', specialty: 'Hormone Health', rating: 4.9, distance: '1.8 km' },
    { id: 5, name: 'Dr. Lisa Thompson', specialty: 'Integrative Medicine', rating: 4.8, distance: '4.2 km' },
    { id: 6, name: 'Dr. Rachel Green', specialty: 'Women\'s Health', rating: 4.7, distance: '6.9 km' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6 pt-8">
        <h1 className="text-4xl font-bold">Find an Expert</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 h-96 flex items-center justify-center bg-muted/20">
            <div className="text-center space-y-2">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Map view placeholder</p>
              <p className="text-sm text-muted-foreground">
                Experts near you will be displayed here
              </p>
            </div>
          </Card>

          <div className="space-y-3">
            {experts.map((expert) => (
              <Card
                key={expert.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedExpert === expert.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedExpert(expert.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{expert.name}</h3>
                      <p className="text-sm text-muted-foreground">{expert.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{expert.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{expert.distance}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Book
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertFinderMap;
