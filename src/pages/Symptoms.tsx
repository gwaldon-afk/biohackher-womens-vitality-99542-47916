import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Thermometer, Moon, Brain, UtensilsCrossed, FileText, Printer, Bone, Zap, Battery, Wind, Scale, Scissors, Heart, Calendar, Headphones, Droplets, BookOpen, Settings, Plus, History, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import SymptomChoiceDialog from "@/components/SymptomChoiceDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";

const Symptoms = () => {
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [userSymptoms, setUserSymptoms] = useState<any[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showChoiceDialog, setShowChoiceDialog] = useState(false);
  const [choiceDialogSymptom, setChoiceDialogSymptom] = useState<{id: string, name: string, icon: any} | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check where user came from for proper back navigation
  const referrer = searchParams.get('from') || null;

  // Load user symptoms on component mount
  useEffect(() => {
    if (user) {
      loadUserSymptoms();
    }
  }, [user]);

  const loadUserSymptoms = async () => {
    try {
      const { data, error } = await supabase
        .from('user_symptoms')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserSymptoms(data || []);
    } catch (error) {
      console.error('Error loading user symptoms:', error);
      toast({
        variant: "destructive",
        title: "Error loading symptoms",
        description: "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  const saveUserSymptom = async (symptomId: string, isActive: boolean, severity: string = 'Mild', frequency: string = 'Occasional', notes: string = '') => {
    if (!user) return;

    try {
      const existingSymptom = userSymptoms.find(s => s.symptom_id === symptomId);
      
      if (existingSymptom) {
        const { error } = await supabase
          .from('user_symptoms')
          .update({ 
            is_active: isActive, 
            severity, 
            frequency, 
            notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSymptom.id);

        if (error) throw error;
      } else if (isActive) {
        const { error } = await supabase
          .from('user_symptoms')
          .insert({
            user_id: user.id,
            symptom_id: symptomId,
            is_active: isActive,
            severity,
            frequency,
            notes
          });

        if (error) throw error;
      }

      await loadUserSymptoms();
      toast({
        title: "Symptoms updated",
        description: "Your symptom profile has been saved."
      });
    } catch (error) {
      console.error('Error saving symptom:', error);
      toast({
        variant: "destructive",
        title: "Error saving symptom",
        description: "Please try again."
      });
    }
  };

  const symptoms = [
    {
      id: "hot-flashes",
      name: "Hot Flashes",
      icon: Thermometer,
      severity: "Moderate",
      frequency: "Daily",
      actions: [
        {
          title: "Cold Exposure Therapy",
          description: "Commonly used treatments include brief cold showers or ice baths to help reset temperature regulation",
          evidence: "Gold",
          contraindications: ["Heart conditions", "Pregnancy"]
        },
        {
          title: "Sage Supplementation", 
          description: "Commonly used treatments include standardized sage extract supplements",
          evidence: "Silver",
          contraindications: ["Hormone-sensitive conditions"]
        },
        {
          title: "Cooling Breathwork",
          description: "Commonly used treatments include cooling breath techniques like Sheetali pranayama",
          evidence: "Bronze",
          contraindications: ["Respiratory issues"]
        }
      ]
    },
    {
      id: "sleep",
      name: "Sleep Issues",
      icon: Moon,
      severity: "Mild",
      frequency: "3-4x/week",
      actions: [
        {
          title: "Magnesium Glycinate",
          description: "Commonly used treatments include magnesium glycinate supplements before bed to support deep sleep",
          evidence: "Gold",
          contraindications: ["Kidney disease"]
        },
        {
          title: "Red Light Therapy",
          description: "Commonly used treatments include red light therapy devices used in the evening",
          evidence: "Silver", 
          contraindications: ["Photosensitivity"]
        },
        {
          title: "Sleep Restriction Protocol",
          description: "Commonly used treatments include limiting time in bed to match actual sleep time",
          evidence: "Gold",
          contraindications: ["Severe sleep disorders"]
        }
      ]
    },
    {
      id: "mood",
      name: "Mood Changes",
      icon: Brain,
      severity: "Variable",
      frequency: "Weekly",
      actions: [
        {
          title: "HRV Breathwork",
          description: "Commonly used treatments include structured breathing patterns like 4-7-8 breathing",
          evidence: "Gold",
          contraindications: ["Panic disorders"]
        },
        {
          title: "Omega-3 Optimisation",
          description: "Commonly used treatments include high-EPA fish oil supplements",
          evidence: "Gold",
          contraindications: ["Blood thinners"]
        },
        {
          title: "Morning Light Exposure",
          description: "Commonly used treatments include natural sunlight exposure in the morning",
          evidence: "Gold",
          contraindications: ["Light sensitivity disorders"]
        }
      ]
    },
    {
      id: "gut",
      name: "Gut Health",
      icon: UtensilsCrossed,
      severity: "Mild",
      frequency: "Occasional",
      actions: [
        {
          title: "Intermittent Fasting",
          description: "16:8 protocol with 12-hour eating window",
          evidence: "Silver",
          contraindications: ["Eating disorders", "Diabetes"]
        },
        {
          title: "Probiotic Rotation",
          description: "Rotate between different probiotic strains monthly",
          evidence: "Silver",
          contraindications: ["Immunocompromised states"]
        },
        {
          title: "Digestive Enzymes",
          description: "Broad-spectrum enzymes with protein-rich meals",
          evidence: "Bronze",
          contraindications: ["Pancreatic conditions"]
        }
      ]
    }
  ];

  const currentSymptom = symptoms.find(s => s.id === selectedSymptom);

  // Split symptoms into assessed and available
  const assessedSymptoms = user ? symptoms.filter(symptom => {
    const userSymptom = userSymptoms.find(us => us.symptom_id === symptom.id);
    return userSymptom?.is_active;
  }) : [];
  
  const availableSymptoms = user ? symptoms.filter(symptom => {
    const userSymptom = userSymptoms.find(us => us.symptom_id === symptom.id);
    return !userSymptom?.is_active;
  }) : symptoms;

  // Get user symptom data for a specific symptom
  const getUserSymptomData = (symptomId: string) => {
    return userSymptoms.find(us => us.symptom_id === symptomId);
  };

  // Handle symptom assessment navigation
  const handleSymptomSelect = (symptomId: string) => {
    const symptom = symptoms.find(s => s.id === symptomId);
    if (!symptom) return;
    
    // Check if this is an assessed symptom (from My Symptom Profile)
    const isAssessed = assessedSymptoms.some(s => s.id === symptomId);
    
    if (isAssessed) {
      // Show choice dialog for assessed symptoms
      setChoiceDialogSymptom({
        id: symptomId,
        name: symptom.name,
        icon: symptom.icon
      });
      setShowChoiceDialog(true);
    } else {
      // Direct navigation for new assessments
      setSelectedSymptom(symptomId);
      navigate(`/assessment/${symptomId}`);
    }
  };

  // Check if user has this symptom active
  const isSymptomActive = (symptomId: string) => {
    const userSymptom = getUserSymptomData(symptomId);
    return userSymptom?.is_active || false;
  };

  // Toggle symptom tracking
  const toggleSymptom = async (symptomId: string, isActive: boolean) => {
    await saveUserSymptom(symptomId, isActive);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading symptoms...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* Contextual back navigation */}
          {referrer && (
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/${referrer}`)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {referrer === 'dashboard' ? 'Dashboard' : 'Previous Page'}
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 gradient-text">Symptom Assessment</h1>
              <p className="text-muted-foreground">
                Select a symptom to begin your personalized assessment
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/assessment-history')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                View History
              </Button>
              {user && (
                <Button
                  variant={isCustomizing ? "default" : "outline"}
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {isCustomizing ? "Done" : "Customize"}
                </Button>
              )}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>📚 Educational Information:</strong> This content presents commonly used complementary treatments and approaches. 
              It is for educational purposes only and does not constitute medical advice. 
              Always consult with qualified healthcare professionals for personalized guidance.
            </p>
          </div>
        </div>

        {/* Customization Panel */}
        {isCustomizing && user && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Customize Your Symptoms
                </CardTitle>
                <CardDescription>
                  Add or remove symptoms from your profile to customize your tracking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {symptoms.map((symptom) => {
                    const isTracked = isSymptomActive(symptom.id);
                    
                    return (
                      <Card 
                        key={symptom.id} 
                        className={`p-4 cursor-pointer transition-colors ${
                          isTracked 
                            ? 'bg-primary/10 border-primary/20 hover:bg-primary/20' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleSymptom(symptom.id, !isTracked)}
                      >
                        <div className="flex flex-col items-center text-center gap-2">
                          <symptom.icon className={`h-6 w-6 ${isTracked ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${isTracked ? 'text-primary' : 'text-muted-foreground'}`}>
                            {symptom.name}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {isTracked ? 'Tracking' : 'Click to track'}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Symptom Profile Section */}
        {user && assessedSymptoms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">My Symptom Profile</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {assessedSymptoms.map((symptom) => {
                const userSymptom = getUserSymptomData(symptom.id);
                
                return (
                  <div key={symptom.id} className="flex flex-col items-center">
                    <input
                      type="radio"
                      id={`assessed-${symptom.id}`}
                      name="selected-symptom"
                      value={symptom.id}
                      checked={selectedSymptom === symptom.id}
                      onChange={() => handleSymptomSelect(symptom.id)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={`assessed-${symptom.id}`}
                      className={`w-full max-w-[120px] p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                        selectedSymptom === symptom.id
                          ? 'border-primary bg-primary/10 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
                      }`}
                    >
                      <symptom.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-sm font-medium mb-1">{symptom.name}</div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {userSymptom?.severity} • {userSymptom?.frequency}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Symptoms Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">
            {user && assessedSymptoms.length > 0 ? "Available Assessments" : "Symptom Assessments"}
          </h2>
          
          {/* Debug info - remove this later */}
          <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mb-4 text-sm">
            <p>Debug: Available symptoms count: {availableSymptoms.length}</p>
            <p>Debug: User logged in: {user ? 'Yes' : 'No'}</p>
            <p>Debug: User symptoms count: {userSymptoms.length}</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {availableSymptoms.map((symptom) => (
              <div key={symptom.id} className="flex flex-col items-center">
                <input
                  type="radio"
                  id={symptom.id}
                  name="selected-symptom"
                  value={symptom.id}
                  checked={selectedSymptom === symptom.id}
                  onChange={() => handleSymptomSelect(symptom.id)}
                  className="sr-only"
                />
                <label
                  htmlFor={symptom.id}
                  className={`w-full max-w-[120px] p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    selectedSymptom === symptom.id
                      ? 'border-primary bg-primary/10 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  <symptom.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium mb-1">{symptom.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {symptom.severity} • {symptom.frequency}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Start Assessment
                  </Badge>
                </label>
              </div>
            ))}
          </div>
          
          {/* Fallback if no symptoms */}
          {availableSymptoms.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No available assessments found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                This might be because all assessments have been completed or there's a loading issue.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Choice Dialog */}
      {choiceDialogSymptom && (
        <SymptomChoiceDialog
          open={showChoiceDialog}
          onOpenChange={setShowChoiceDialog}
          symptomId={choiceDialogSymptom.id}
          symptomName={choiceDialogSymptom.name}
          symptomIcon={choiceDialogSymptom.icon}
        />
      )}
    </div>
  );
};

export default Symptoms;