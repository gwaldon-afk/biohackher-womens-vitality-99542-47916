import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Search } from "lucide-react";

interface Symptom {
  id: string;
  name: string;
  icon: any;
  severity: string;
  frequency: string;
  pillars: string[];
}

interface SymptomBrowseAllProps {
  symptoms: Symptom[];
  userSymptoms: any[];
  onSymptomSelect: (symptomId: string) => void;
}

const SymptomBrowseAll = ({ symptoms, userSymptoms, onSymptomSelect }: SymptomBrowseAllProps) => {
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isCompleted = (symptomId: string) => {
    return userSymptoms.some(us => us.symptom_id === symptomId && us.is_active);
  };

  const filterSymptoms = () => {
    let filtered = symptoms;

    // Filter by pillar
    if (selectedPillar !== "all") {
      filtered = filtered.filter(s => s.pillars?.includes(selectedPillar));
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort alphabetically
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  };

  const filteredSymptoms = filterSymptoms();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-4">Browse All Symptom Assessments</h2>
        <p className="text-center text-muted-foreground mb-6">
          Choose from our complete library of science-backed symptom assessments
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Pillar Tabs */}
      <Tabs value={selectedPillar} onValueChange={setSelectedPillar} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="brain">Brain</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="beauty">Beauty</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPillar} className="space-y-3">
          {filteredSymptoms.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No symptoms found matching your search.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSymptoms.map((symptom) => {
                const Icon = symptom.icon;
                const completed = isCompleted(symptom.id);

                return (
                  <Card
                    key={symptom.id}
                    className="cursor-pointer hover:shadow-md hover:border-primary transition-all duration-200"
                    onClick={() => onSymptomSelect(symptom.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate">{symptom.name}</h3>
                            {completed && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {symptom.pillars?.map((pillar) => (
                              <Badge key={pillar} variant="outline" className="text-xs">
                                {pillar}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SymptomBrowseAll;
