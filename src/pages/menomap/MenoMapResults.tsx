import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MenoMapStageCompass } from "@/components/menomap/MenoMapStageCompass";
import { CheckCircle, ArrowRight, Download } from "lucide-react";

const STAGE_INFO = {
  'pre': {
    title: 'Pre-Menopause',
    description: 'Your cycles are still regular, and you\'re not experiencing significant hormonal changes yet.',
    recommendations: [
      'Focus on establishing healthy habits now',
      'Track your cycles to establish a baseline',
      'Consider preventive nutrition and exercise',
      'Monitor energy and mood patterns'
    ]
  },
  'early-peri': {
    title: 'Early Perimenopause',
    description: 'You\'re beginning to experience subtle hormonal shifts. Cycles may become slightly irregular.',
    recommendations: [
      'Start tracking symptoms consistently',
      'Consider adaptogenic herbs for hormone support',
      'Optimize sleep hygiene',
      'Add strength training to preserve muscle mass'
    ]
  },
  'mid-peri': {
    title: 'Mid Perimenopause',
    description: 'Hormonal fluctuations are more pronounced. You may notice significant cycle changes and symptoms.',
    recommendations: [
      'Focus on stress management and cortisol regulation',
      'Consider magnesium for sleep and mood',
      'Increase phytoestrogen-rich foods',
      'Track hot flashes and night sweats patterns'
    ]
  },
  'late-peri': {
    title: 'Late Perimenopause',
    description: 'You\'re approaching menopause. Periods may be very irregular or absent for months.',
    recommendations: [
      'Support bone health with vitamin D and K2',
      'Focus on cardiovascular exercise',
      'Consider hormone testing with your doctor',
      'Optimize gut health for hormone metabolism'
    ]
  },
  'post': {
    title: 'Post-Menopause',
    description: 'It\'s been 12+ months since your last period. Focus shifts to long-term health optimization.',
    recommendations: [
      'Prioritize bone density and cardiovascular health',
      'Continue strength training',
      'Focus on longevity nutrition',
      'Monitor metabolic health markers'
    ]
  }
};

export default function MenoMapResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { stage, confidence } = location.state || {};

  if (!stage) {
    navigate('/menomap/assessment');
    return null;
  }

  const stageInfo = STAGE_INFO[stage as keyof typeof STAGE_INFO];

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Assessment Complete!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your menopause stage has been mapped
          </p>
        </div>
      </div>

      {/* Stage Result */}
      <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="pt-8">
          <MenoMapStageCompass 
            currentStage={stage}
            confidenceScore={confidence}
            size="lg"
          />
        </CardContent>
      </Card>

      {/* Stage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{stageInfo.title}</CardTitle>
          <CardDescription className="text-base">
            {stageInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Recommended Next Steps:</h3>
            <ul className="space-y-2">
              {stageInfo.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>
            Continue your MenoMap journey with these features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate('/menomap/tracker')}
            className="w-full justify-between"
            size="lg"
          >
            <span>Start Tracking Daily Symptoms</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          <Button 
            onClick={() => navigate('/menomap')}
            variant="outline"
            className="w-full justify-between"
            size="lg"
          >
            <span>View Your Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Button>

          <Button 
            onClick={() => navigate('/my-protocol')}
            variant="outline"
            className="w-full justify-between"
            size="lg"
          >
            <span>Build Your Protocol</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Share or Export */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 gap-2">
          <Download className="w-4 h-4" />
          Export Results (PDF)
        </Button>
      </div>
    </div>
  );
}
