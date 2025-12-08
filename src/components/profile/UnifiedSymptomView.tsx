import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Brain, 
  Heart, 
  Scale,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SymptomEntry {
  id: string;
  name: string;
  severity: number; // 1-5 or 0-100 normalized to 1-5
  source: string;
  sourceType: 'hormone_compass' | 'longevity_nutrition' | 'symptom' | 'lis' | 'pillar';
  pillar: 'BEAUTY' | 'BRAIN' | 'BODY' | 'BALANCE';
  recordedAt: Date;
}

// Map symptoms/domains to pillars
const pillarMapping: Record<string, 'BEAUTY' | 'BRAIN' | 'BODY' | 'BALANCE'> = {
  // Hormone Compass domains
  'energy': 'BODY',
  'sleep': 'BALANCE',
  'mood': 'BRAIN',
  'cognitive': 'BRAIN',
  'physical': 'BODY',
  'hormonal': 'BALANCE',
  // Nutrition domains
  'protein': 'BODY',
  'fiber': 'BODY',
  'gut_health': 'BODY',
  'inflammation': 'BALANCE',
  'hydration': 'BEAUTY',
  'plant_diversity': 'BODY',
  // LIS pillars
  'sleep_recovery': 'BALANCE',
  'stress_management': 'BALANCE',
  'physical_activity': 'BODY',
  'nutrition': 'BODY',
  'social_connection': 'BRAIN',
  'cognitive_engagement': 'BRAIN',
  // Common symptoms
  'hot_flashes': 'BALANCE',
  'night_sweats': 'BALANCE',
  'brain_fog': 'BRAIN',
  'fatigue': 'BODY',
  'anxiety': 'BRAIN',
  'weight_gain': 'BODY',
  'joint_pain': 'BODY',
  'skin_changes': 'BEAUTY',
  'hair_loss': 'BEAUTY',
  'memory': 'BRAIN',
  'focus': 'BRAIN',
  'digestion': 'BODY',
  'bloating': 'BODY',
  'headaches': 'BRAIN',
  'insomnia': 'BALANCE',
};

const pillarConfig = {
  BEAUTY: {
    icon: Sparkles,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    borderColor: 'border-pink-200 dark:border-pink-800',
  },
  BRAIN: {
    icon: Brain,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  BODY: {
    icon: Heart,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  BALANCE: {
    icon: Scale,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    borderColor: 'border-teal-200 dark:border-teal-800',
  },
};

const getSeverityBadge = (severity: number) => {
  if (severity <= 1) return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Minimal</Badge>;
  if (severity <= 2) return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Mild</Badge>;
  if (severity <= 3) return <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-400">Moderate</Badge>;
  if (severity <= 4) return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">Significant</Badge>;
  return <Badge className="bg-red-700/10 text-red-800 dark:text-red-300">Severe</Badge>;
};

const getSourceBadge = (sourceType: string) => {
  const sourceLabels: Record<string, string> = {
    hormone_compass: 'Hormone Compass',
    longevity_nutrition: 'Nutrition',
    symptom: 'Symptom Assessment',
    lis: 'LIS',
    pillar: 'Pillar Assessment',
  };
  return <Badge variant="outline" className="text-xs">{sourceLabels[sourceType] || sourceType}</Badge>;
};

export const UnifiedSymptomView = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchAllSymptoms = async () => {
      if (!user) return;

      try {
        const allSymptoms: SymptomEntry[] = [];

        // Fetch Hormone Compass symptom tracking
        const { data: hcSymptoms } = await supabase
          .from('hormone_compass_symptom_tracking')
          .select('*')
          .eq('user_id', user.id)
          .order('tracked_date', { ascending: false })
          .limit(50);

        hcSymptoms?.forEach(item => {
          const pillar = pillarMapping[item.symptom_category?.toLowerCase()] || 
                        pillarMapping[item.symptom_name?.toLowerCase()] || 'BALANCE';
          allSymptoms.push({
            id: item.id,
            name: item.symptom_name,
            severity: item.severity,
            source: 'Hormone Compass',
            sourceType: 'hormone_compass',
            pillar,
            recordedAt: new Date(item.tracked_date || item.created_at),
          });
        });

        // Fetch symptom tracking data
        const { data: symptomTracking } = await supabase
          .from('symptom_tracking')
          .select('*, symptoms(name)')
          .eq('user_id', user.id)
          .order('tracked_date', { ascending: false })
          .limit(50);

        symptomTracking?.forEach(item => {
          const symptomName = (item.symptoms as any)?.name || 'Unknown Symptom';
          const pillar = pillarMapping[symptomName.toLowerCase().replace(/\s+/g, '_')] || 'BODY';
          allSymptoms.push({
            id: item.id,
            name: symptomName,
            severity: item.severity,
            source: 'Symptom Tracking',
            sourceType: 'symptom',
            pillar,
            recordedAt: new Date(item.tracked_date),
          });
        });

        // Fetch latest LIS scores and extract pillar data
        const { data: lisData } = await supabase
          .from('daily_scores')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_baseline', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (lisData?.[0]) {
          const lis = lisData[0];
          const pillarScores = [
            { name: 'Sleep & Recovery', score: lis.sleep_score, pillar: 'BALANCE' as const },
            { name: 'Stress Management', score: lis.stress_score, pillar: 'BALANCE' as const },
            { name: 'Physical Activity', score: lis.physical_activity_score, pillar: 'BODY' as const },
            { name: 'Nutrition', score: lis.nutrition_score, pillar: 'BODY' as const },
            { name: 'Social Connection', score: lis.social_connections_score, pillar: 'BRAIN' as const },
            { name: 'Cognitive Engagement', score: lis.cognitive_engagement_score, pillar: 'BRAIN' as const },
          ];

          pillarScores.forEach(p => {
            if (p.score !== null && p.score !== undefined) {
              // Convert 0-100 score to 1-5 severity (inverted - low score = high severity)
              const severity = Math.max(1, Math.min(5, Math.round((100 - p.score) / 20)));
              allSymptoms.push({
                id: `lis-${p.name.toLowerCase().replace(/\s+/g, '-')}`,
                name: p.name,
                severity,
                source: 'LIS Assessment',
                sourceType: 'lis',
                pillar: p.pillar,
                recordedAt: new Date(lis.created_at),
              });
            }
          });
        }

        // Fetch Longevity Nutrition assessment data
        const { data: nutritionData } = await supabase
          .from('longevity_nutrition_assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1);

        if (nutritionData?.[0]) {
          const nutrition = nutritionData[0];
          const nutritionDomains = [
            { name: 'Protein Intake', score: nutrition.protein_score, pillar: 'BODY' as const },
            { name: 'Fiber & Plants', score: nutrition.fiber_score, pillar: 'BODY' as const },
            { name: 'Gut Health', score: nutrition.gut_symptom_score, pillar: 'BODY' as const, inverted: true },
            { name: 'Inflammation', score: nutrition.inflammation_score, pillar: 'BALANCE' as const, inverted: true },
            { name: 'Hydration', score: nutrition.hydration_score, pillar: 'BEAUTY' as const },
          ];

          nutritionDomains.forEach(d => {
            if (d.score !== null && d.score !== undefined) {
              // Convert 0-5 score to severity (inverted for symptom scores)
              const severity = d.inverted ? d.score : Math.max(1, 5 - d.score);
              allSymptoms.push({
                id: `nutrition-${d.name.toLowerCase().replace(/\s+/g, '-')}`,
                name: d.name,
                severity: Math.max(1, Math.min(5, severity)),
                source: 'Nutrition Assessment',
                sourceType: 'longevity_nutrition',
                pillar: d.pillar,
                recordedAt: new Date(nutrition.completed_at || nutrition.created_at),
              });
            }
          });
        }

        // Sort by date (most recent first)
        allSymptoms.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
        setSymptoms(allSymptoms);
      } catch (error) {
        console.error('Error fetching symptoms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSymptoms();
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Sign in to view your unified symptom profile
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const symptomsByPillar = {
    BEAUTY: symptoms.filter(s => s.pillar === 'BEAUTY'),
    BRAIN: symptoms.filter(s => s.pillar === 'BRAIN'),
    BODY: symptoms.filter(s => s.pillar === 'BODY'),
    BALANCE: symptoms.filter(s => s.pillar === 'BALANCE'),
  };

  const getPillarSummary = (pillar: 'BEAUTY' | 'BRAIN' | 'BODY' | 'BALANCE') => {
    const pillarSymptoms = symptomsByPillar[pillar];
    if (pillarSymptoms.length === 0) return null;
    
    const avgSeverity = pillarSymptoms.reduce((acc, s) => acc + s.severity, 0) / pillarSymptoms.length;
    return { count: pillarSymptoms.length, avgSeverity };
  };

  const renderSymptomList = (filteredSymptoms: SymptomEntry[]) => {
    if (filteredSymptoms.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No symptoms recorded in this category</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredSymptoms.map(symptom => {
          const config = pillarConfig[symptom.pillar];
          return (
            <div 
              key={symptom.id} 
              className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{symptom.name}</span>
                    {getSeverityBadge(symptom.severity)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {getSourceBadge(symptom.sourceType)}
                    <span>•</span>
                    <span>{formatDistanceToNow(symptom.recordedAt, { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {symptom.severity <= 2 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : symptom.severity >= 4 ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Unified Health Profile
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          All your symptoms and health indicators from every assessment, organized by pillar
        </p>
      </CardHeader>
      <CardContent>
        {symptoms.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold mb-2">No health data yet</h3>
            <p className="text-sm">Complete assessments to see your unified health profile</p>
          </div>
        ) : (
          <>
            {/* Pillar Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {(['BEAUTY', 'BRAIN', 'BODY', 'BALANCE'] as const).map(pillar => {
                const config = pillarConfig[pillar];
                const summary = getPillarSummary(pillar);
                const Icon = config.icon;
                
                return (
                  <div 
                    key={pillar}
                    className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor} cursor-pointer transition-all hover:shadow-md`}
                    onClick={() => setActiveTab(pillar.toLowerCase())}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      <span className="font-medium text-sm">{pillar}</span>
                    </div>
                    {summary ? (
                      <div className="text-xs text-muted-foreground">
                        {summary.count} items • Avg: {summary.avgSeverity.toFixed(1)}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">No data</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tabbed View */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="beauty">Beauty</TabsTrigger>
                <TabsTrigger value="brain">Brain</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="balance">Balance</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {renderSymptomList(symptoms)}
              </TabsContent>
              <TabsContent value="beauty" className="mt-4">
                {renderSymptomList(symptomsByPillar.BEAUTY)}
              </TabsContent>
              <TabsContent value="brain" className="mt-4">
                {renderSymptomList(symptomsByPillar.BRAIN)}
              </TabsContent>
              <TabsContent value="body" className="mt-4">
                {renderSymptomList(symptomsByPillar.BODY)}
              </TabsContent>
              <TabsContent value="balance" className="mt-4">
                {renderSymptomList(symptomsByPillar.BALANCE)}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};
