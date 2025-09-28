import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Moon, Brain, Thermometer, Bone, Battery, Scale, Heart, UtensilsCrossed, Wind } from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";

const SymptomsHistory = () => {
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSymptom, setFilterSymptom] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const referrer = searchParams.get('from') || 'dashboard';

  const symptoms = [
    { id: "hot-flashes", name: "Hot Flashes" },
    { id: "sleep", name: "Sleep Issues" },
    { id: "joint-pain", name: "Joint Pain" },
    { id: "brain-fog", name: "Brain Fog" },
    { id: "energy-levels", name: "Low Energy" },
    { id: "bloating", name: "Bloating" },
    { id: "weight-changes", name: "Weight Changes" },
    { id: "hair-thinning", name: "Hair Thinning" },
    { id: "anxiety", name: "Anxiety" },
    { id: "irregular-periods", name: "Irregular Periods" },
    { id: "headaches", name: "Headaches" },
    { id: "night-sweats", name: "Night Sweats" },
    { id: "memory-issues", name: "Memory Issues" },
    { id: "gut", name: "Gut Health" }
  ];

  useEffect(() => {
    if (user) {
      loadAssessmentHistory();
    }
  }, [user]);

  const loadAssessmentHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('symptom_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setAssessmentHistory(data || []);
    } catch (error) {
      console.error('Error loading assessment history:', error);
      toast({
        variant: "destructive",
        title: "Error loading assessment history",
        description: "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAssessments = () => {
    let filtered = assessmentHistory;
    
    if (filterSymptom !== 'all') {
      filtered = filtered.filter(assessment => assessment.symptom_type === filterSymptom);
    }
    
    return filtered.sort((a, b) => {
      const dateA = new Date(a.completed_at).getTime();
      const dateB = new Date(b.completed_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  const getSymptomName = (id: string) => {
    const symptom = symptoms.find(s => s.id === id);
    return symptom?.name || id;
  };

  const getSymptomIcon = (symptomType: string) => {
    const iconMap: Record<string, any> = {
      "sleep": Moon,
      "brain-fog": Brain,
      "memory-issues": Brain,
      "hot-flashes": Thermometer,
      "night-sweats": Thermometer,
      "joint-pain": Bone,
      "energy-levels": Battery,
      "weight-changes": Scale,
      "anxiety": Heart,
      "gut": UtensilsCrossed,
      "bloating": Wind
    };
    return iconMap[symptomType] || FileText;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (category: string) => {
    switch (category) {
      case 'excellent': return "bg-green-100 text-green-800";
      case 'good': return "bg-blue-100 text-blue-800";
      case 'fair': return "bg-yellow-100 text-yellow-800";
      case 'poor': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAssessments = getFilteredAssessments();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading assessment history...</p>
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
          {/* Back navigation */}
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(referrer === 'dashboard' ? '/dashboard' : '/symptoms')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {referrer === 'dashboard' ? 'Dashboard' : 'Symptoms'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 gradient-text">Assessment History</h1>
              <p className="text-muted-foreground">
                Review your completed assessments and track progress over time
              </p>
            </div>
            
            {/* Filter Controls */}
            <div className="flex items-center gap-2">
              <Select value={filterSymptom} onValueChange={setFilterSymptom}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by symptom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Symptoms</SelectItem>
                  {symptoms.map((symptom) => (
                    <SelectItem key={symptom.id} value={symptom.id}>
                      {symptom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Assessment History Content */}
        <div className="space-y-4">
          {filteredAssessments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Assessments Found</h3>
                <p className="text-muted-foreground mb-4">
                  {filterSymptom !== 'all' 
                    ? `No assessments found for ${getSymptomName(filterSymptom)}.`
                    : 'You haven\'t completed any assessments yet.'
                  }
                </p>
                <Button onClick={() => navigate('/symptoms')}>
                  Complete Your First Assessment
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredAssessments.map((assessment) => {
              const SymptomIcon = getSymptomIcon(assessment.symptom_type);
              
              return (
                <Card 
                  key={assessment.id} 
                  className="hover:shadow-md transition-shadow border-l-4 border-l-primary/20 hover:border-l-primary cursor-pointer"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (assessment.answers) {
                      Object.entries(assessment.answers).forEach(([key, value]) => {
                        params.append(`q${key}`, value as string);
                      });
                    }
                    navigate(`/assessment/${assessment.symptom_type}/results?${params.toString()}`);
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <SymptomIcon className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">
                            {getSymptomName(assessment.symptom_type)}
                          </CardTitle>
                          <CardDescription>
                            {new Date(assessment.completed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(assessment.overall_score)}`}>
                          {assessment.overall_score}
                        </div>
                        <Badge className={getScoreBadgeColor(assessment.score_category)}>
                          {assessment.score_category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {assessment.primary_issues && assessment.primary_issues.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Primary Concerns:</p>
                        <div className="flex flex-wrap gap-2">
                          {assessment.primary_issues.map((issue: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default SymptomsHistory;