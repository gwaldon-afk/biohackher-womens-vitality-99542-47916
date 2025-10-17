import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMenoMap } from "@/hooks/useMenoMap";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SYMPTOM_CATEGORIES = {
  cycle: {
    name: 'Cycle & Periods',
    icon: '🩸',
    symptoms: ['Irregular cycles', 'Heavy flow', 'Light flow', 'Spotting', 'Cramps']
  },
  thermoregulation: {
    name: 'Temperature & Sleep',
    icon: '🌡️',
    symptoms: ['Hot flashes', 'Night sweats', 'Poor sleep', 'Cold sensitivity', 'Restless nights']
  },
  mood: {
    name: 'Mood & Focus',
    icon: '🧠',
    symptoms: ['Anxiety', 'Irritability', 'Brain fog', 'Low motivation', 'Memory issues']
  },
  energy: {
    name: 'Energy & Weight',
    icon: '⚡',
    symptoms: ['Fatigue', 'Weight gain', 'Afternoon slumps', 'Slow recovery', 'Metabolism changes']
  },
  libido: {
    name: 'Libido & Intimacy',
    icon: '💕',
    symptoms: ['Low libido', 'Vaginal dryness', 'Discomfort', 'Arousal difficulty', 'Dissatisfaction']
  },
  skin: {
    name: 'Skin & Hair',
    icon: '✨',
    symptoms: ['Dry skin', 'Hair thinning', 'Texture changes', 'Acne', 'Slow healing']
  }
};

export default function MenoMapTracker() {
  const navigate = useNavigate();
  const { trackSymptom } = useMenoMap();
  const [selectedCategory, setSelectedCategory] = useState<string>('thermoregulation');
  const [symptoms, setSymptoms] = useState<Record<string, { severity: number; notes: string }>>({});
  const [saving, setSaving] = useState(false);

  const handleSymptomChange = (symptomName: string, severity: number) => {
    setSymptoms(prev => ({
      ...prev,
      [symptomName]: {
        severity,
        notes: prev[symptomName]?.notes || ''
      }
    }));
  };

  const handleNotesChange = (symptomName: string, notes: string) => {
    setSymptoms(prev => ({
      ...prev,
      [symptomName]: {
        severity: prev[symptomName]?.severity || 3,
        notes
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const entries = Object.entries(symptoms).filter(
        ([_, data]) => data.severity > 0
      );

      if (entries.length === 0) {
        toast({
          title: "No symptoms tracked",
          description: "Please adjust at least one symptom severity to track.",
          variant: "destructive"
        });
        return;
      }

      // Save each symptom
      for (const [symptomName, data] of entries) {
        await trackSymptom(
          selectedCategory,
          symptomName,
          data.severity,
          data.notes || undefined
        );
      }

      toast({
        title: "Symptoms Tracked",
        description: `Successfully tracked ${entries.length} symptom(s).`
      });

      navigate('/menomap');
    } catch (error) {
      console.error('Error saving symptoms:', error);
      toast({
        title: "Error",
        description: "Failed to save symptoms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const categoryData = SYMPTOM_CATEGORIES[selectedCategory as keyof typeof SYMPTOM_CATEGORIES];

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/menomap')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Track Symptoms</h1>
            <p className="text-muted-foreground">
              Rate your symptoms today to track patterns over time
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6">
            {Object.entries(SYMPTOM_CATEGORIES).map(([key, cat]) => (
              <TabsTrigger key={key} value={key} className="text-xs md:text-sm">
                <span className="mr-1">{cat.icon}</span>
                <span className="hidden md:inline">{cat.name.split('&')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(SYMPTOM_CATEGORIES).map(([key, cat]) => (
            <TabsContent key={key} value={key} className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{cat.icon}</span>
                    {cat.name}
                  </CardTitle>
                  <CardDescription>
                    Rate the severity of each symptom from 1 (mild) to 5 (severe)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {cat.symptoms.map((symptom) => (
                    <div key={symptom} className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="font-medium">{symptom}</label>
                          <span className="text-2xl font-bold text-primary">
                            {symptoms[symptom]?.severity || 0}
                          </span>
                        </div>
                        <Slider
                          value={[symptoms[symptom]?.severity || 0]}
                          onValueChange={([value]) => handleSymptomChange(symptom, value)}
                          min={0}
                          max={5}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Not experiencing</span>
                          <span>Severe</span>
                        </div>
                      </div>

                      {symptoms[symptom]?.severity > 0 && (
                        <Textarea
                          placeholder="Add notes about this symptom (optional)..."
                          value={symptoms[symptom]?.notes || ''}
                          onChange={(e) => handleNotesChange(symptom, e.target.value)}
                          className="resize-none"
                          rows={2}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 gap-2"
            size="lg"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Today\'s Tracking'}
          </Button>
        </div>
      </div>
    </div>
  );
}
