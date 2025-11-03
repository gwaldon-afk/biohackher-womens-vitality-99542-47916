import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, TrendingUp, AlertCircle } from 'lucide-react';

interface PillarAnalysisCardProps {
  pillarName: string;
  pillarDisplayName: string;
  pillarAnalysisName: string;
  pillarScore: number;
  icon: LucideIcon;
  color: string;
  overallLIS: number;
  userAge?: number;
}

export const LISPillarAnalysisCard = ({ 
  pillarName,
  pillarDisplayName,
  pillarAnalysisName,
  pillarScore, 
  icon: Icon, 
  color,
  overallLIS,
  userAge 
}: PillarAnalysisCardProps) => {
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
  };

  const getAnalysis = () => {
    const scoreBand = pillarScore >= 80 ? 'excellent' : 
                      pillarScore >= 60 ? 'good' : 
                      pillarScore >= 40 ? 'fair' : 'poor';

    // Use analysisName for lookup to map guest assessment pillars to detailed analysis
    const analyses: Record<string, Record<string, { impact: string; recommendations: string[]; quickWin: string }>> = {
      'Sleep': {
        excellent: {
          impact: 'Your sleep quality is actively slowing biological aging by optimizing cellular repair, hormone regulation, and metabolic health.',
          recommendations: [
            'Maintain consistent sleep-wake schedule to preserve circadian rhythm strength',
            'Continue optimizing sleep environment (darkness, temperature, quiet)',
            'Track HRV during sleep to monitor recovery quality'
          ],
          quickWin: 'Add 10-minute pre-bed wind-down routine with reading or meditation'
        },
        good: {
          impact: 'Your sleep provides solid foundation for health, but optimization could add 2-3 years to your healthspan.',
          recommendations: [
            'Establish consistent wake time (even weekends) to strengthen circadian rhythm',
            'Create 30-minute technology-free buffer before bed',
            'Experiment with room temperature between 65-68°F for deeper sleep'
          ],
          quickWin: 'Block blue light 2 hours before bed with amber glasses or night mode'
        },
        fair: {
          impact: 'Suboptimal sleep is accelerating aging by 3-5 years through chronic inflammation, impaired detoxification, and metabolic dysfunction.',
          recommendations: [
            'Set strict sleep schedule: same bedtime and wake time daily',
            'Address sleep hygiene: dark room, cool temperature, minimal noise',
            'Consider magnesium glycinate (300-400mg) 1 hour before bed',
            'Evaluate for sleep apnea if experiencing daytime fatigue'
          ],
          quickWin: 'Establish 10pm bedtime target and track sleep duration for 1 week'
        },
        poor: {
          impact: 'Critical issue: Poor sleep quality is aging you 5-10 years faster by disrupting nearly every biological system.',
          recommendations: [
            'PRIORITY: Schedule sleep study to rule out sleep apnea or disorders',
            'Implement strict sleep hygiene protocol immediately',
            'Consider CBT-I (Cognitive Behavioral Therapy for Insomnia)',
            'Eliminate caffeine after 12pm and alcohol within 3 hours of bed',
            'Explore targeted supplements: magnesium, L-theanine, glycine'
          ],
          quickWin: 'Start 7-day sleep reset: same bedtime/wake time, no screens 1 hour before bed'
        }
      },
      'Stress': {
        excellent: {
          impact: 'Your stress management is protecting against cellular aging, maintaining healthy cortisol patterns, and preserving telomere length.',
          recommendations: [
            'Continue daily stress-reduction practices to maintain resilience',
            'Deepen mindfulness or meditation practice for greater impact',
            'Build social support networks as protective buffer'
          ],
          quickWin: 'Add 5-minute gratitude journaling to amplify positive mindset'
        },
        good: {
          impact: 'Your stress levels are manageable but periods of high stress may be contributing to accelerated aging.',
          recommendations: [
            'Establish daily 10-minute stress-reduction practice (meditation, breathing)',
            'Build stress resilience through regular exercise and nature exposure',
            'Consider adaptogenic herbs: rhodiola, ashwagandha for HPA axis support'
          ],
          quickWin: 'Practice 4-7-8 breathing (4sec in, 7sec hold, 8sec out) twice daily'
        },
        fair: {
          impact: 'Chronic stress is accelerating biological aging by 4-7 years through cortisol dysregulation, inflammation, and telomere shortening.',
          recommendations: [
            'Implement daily stress management: 20 minutes meditation or yoga',
            'Address root causes: work stress, relationships, financial concerns',
            'Consider professional support: therapy, counseling, or coaching',
            'Optimize magnesium intake and consider adaptogenic supplements'
          ],
          quickWin: 'Start 5-minute morning meditation using guided app (Headspace, Calm)'
        },
        poor: {
          impact: 'URGENT: Severe stress is adding 8-12 years to your biological age and significantly increasing disease risk.',
          recommendations: [
            'PRIORITY: Seek professional mental health support immediately',
            'Implement daily stress-reduction protocol: 30min+ of proven techniques',
            'Consider intensive interventions: therapy, stress-reduction programs',
            'Address lifestyle factors: reduce commitments, improve boundaries',
            'Medical evaluation for anxiety/depression treatment if needed'
          ],
          quickWin: 'Schedule appointment with therapist or counselor this week'
        }
      },
      'Activity': {
        excellent: {
          impact: 'Your activity level is preserving muscle mass, mitochondrial function, and metabolic health—slowing aging by 5-10 years.',
          recommendations: [
            'Maintain diverse movement: strength, cardio, flexibility, balance',
            'Progress training intensity gradually to continue adaptations',
            'Prioritize recovery: sleep, nutrition, rest days'
          ],
          quickWin: 'Add 1 weekly session of zone 2 cardio (nasal breathing pace) for longevity'
        },
        good: {
          impact: 'Your activity provides good foundation, but increased consistency or intensity could add 3-5 years to healthspan.',
          recommendations: [
            'Increase strength training to 2-3x/week for muscle preservation',
            'Add high-intensity interval training 1-2x/week for metabolic benefit',
            'Ensure 8000+ daily steps for baseline movement throughout day'
          ],
          quickWin: 'Add 10-minute morning mobility routine before breakfast'
        },
        fair: {
          impact: 'Insufficient activity is accelerating aging by 4-6 years through muscle loss, metabolic decline, and reduced mitochondrial capacity.',
          recommendations: [
            'Build to 150 minutes moderate activity weekly (start with 20min daily walks)',
            'Add resistance training 2x/week (bodyweight or weights)',
            'Increase daily movement: standing desk, walking meetings, stairs',
            'Consider accountability: trainer, class, or workout partner'
          ],
          quickWin: 'Commit to 15-minute daily walk after lunch or dinner'
        },
        poor: {
          impact: 'CRITICAL: Sedentary lifestyle is aging you 8-15 years faster and dramatically increasing disease risk.',
          recommendations: [
            'PRIORITY: Start with achievable goal: 10-minute daily walk',
            'Build gradually: add 5 minutes every week until reaching 30min',
            'Address barriers: schedule time, find enjoyable activities',
            'Consider medical clearance if over 40 or health concerns',
            'Hire trainer or join beginner class for structure and support'
          ],
          quickWin: 'Take 5-minute walk after every meal starting today'
        }
      },
      'Nutrition': {
        excellent: {
          impact: 'Your nutrition is optimizing cellular function, reducing inflammation, and supporting longevity pathways—potentially adding 10-15 years to healthspan.',
          recommendations: [
            'Continue emphasizing whole foods, plants, healthy fats, quality protein',
            'Optimize meal timing: consider 12-16 hour overnight fast',
            'Fine-tune macro ratios based on biomarkers and personal response'
          ],
          quickWin: 'Add 1 serving colorful vegetables to each meal for polyphenol diversity'
        },
        good: {
          impact: 'Your nutrition is supporting health, but refinements could reduce biological age by 3-5 years.',
          recommendations: [
            'Increase vegetable intake to 5-7 servings daily for fiber and phytonutrients',
            'Reduce processed foods and added sugars to minimize inflammation',
            'Optimize protein: 1.2-1.6g per kg bodyweight for muscle preservation',
            'Consider circadian-aligned eating: larger meals earlier in day'
          ],
          quickWin: 'Replace one processed snack daily with nuts, fruit, or vegetables'
        },
        fair: {
          impact: 'Suboptimal nutrition is accelerating aging by 5-8 years through inflammation, oxidative stress, and metabolic dysfunction.',
          recommendations: [
            'Eliminate ultra-processed foods and focus on whole food sources',
            'Increase plant diversity: 30+ different plant foods weekly',
            'Balance macros: protein at every meal, healthy fats, complex carbs',
            'Consider elimination trial to identify inflammatory foods',
            'Work with nutritionist for personalized guidance'
          ],
          quickWin: 'Start every day with protein-rich breakfast within 1 hour of waking'
        },
        poor: {
          impact: 'URGENT: Poor nutrition is aging you 10-15 years faster and setting foundation for chronic disease.',
          recommendations: [
            'PRIORITY: Eliminate processed foods, sugary drinks, refined carbs',
            'Build foundation: whole foods, vegetables, quality protein, healthy fats',
            'Meal prep on weekends to ensure healthy options available',
            'Address emotional eating or disordered patterns with support',
            'Consider working with registered dietitian for personalized plan'
          ],
          quickWin: 'Clear kitchen of processed foods and restock with whole food staples'
        }
      },
      'Social': {
        excellent: {
          impact: 'Your strong social connections are reducing mortality risk by 50% and protecting cognitive function as you age.',
          recommendations: [
            'Continue nurturing meaningful relationships and community involvement',
            'Deepen existing connections through quality time and vulnerability',
            'Mentor or volunteer to expand sense of purpose and contribution'
          ],
          quickWin: 'Schedule weekly connection ritual with close friend or family member'
        },
        good: {
          impact: 'Your social connections provide health benefits, but deepening relationships could add 2-3 years to lifespan.',
          recommendations: [
            'Prioritize quality over quantity: deepen 2-3 core relationships',
            'Join community activity aligned with interests (club, class, volunteer)',
            'Schedule regular social activities to maintain consistency',
            'Practice active listening and emotional vulnerability to strengthen bonds'
          ],
          quickWin: 'Reach out to one person you value but have not connected with recently'
        },
        fair: {
          impact: 'Limited social connection is accelerating aging by 3-5 years—equivalent health impact to smoking 15 cigarettes daily.',
          recommendations: [
            'Join structured social activity: class, group, club, volunteer role',
            'Reconnect with old friends or family members you have drifted from',
            'Consider therapy to address social anxiety or relationship patterns',
            'Build routine social touchpoints: coffee dates, phone calls, activities'
          ],
          quickWin: 'Sign up for one social activity or class starting this month'
        },
        poor: {
          impact: 'CRITICAL: Social isolation is aging you 6-10 years faster and dramatically increasing mortality risk.',
          recommendations: [
            'PRIORITY: Address social isolation with professional support if needed',
            'Start small: one social interaction weekly (call, coffee, class)',
            'Join supportive community: support group, religious community, club',
            'Consider pet companionship as bridge to social connection',
            'Address underlying issues: anxiety, depression, past trauma with therapy'
          ],
          quickWin: 'Call one friend or family member today for 10-minute check-in'
        }
      },
      'Brain': {
        excellent: {
          impact: 'Your cognitive engagement is building robust cognitive reserve, reducing dementia risk by 40%, and maintaining neuroplasticity.',
          recommendations: [
            'Continue challenging brain with novel activities and learning',
            'Add meditation or mindfulness to enhance focus and brain structure',
            'Ensure adequate aerobic exercise for cerebral blood flow'
          ],
          quickWin: 'Add 10 minutes daily of brain training or learning new skill'
        },
        good: {
          impact: 'Your cognitive activities provide protection, but increased challenge could further reduce dementia risk.',
          recommendations: [
            'Learn new complex skill: instrument, language, dance, craft',
            'Increase reading diversity: non-fiction, complex subjects, varied topics',
            'Add daily brain training: puzzles, strategy games, memory exercises',
            'Combine physical and cognitive: dancing, martial arts, coordination activities'
          ],
          quickWin: 'Download language learning app and practice 15 minutes daily'
        },
        fair: {
          impact: 'Limited cognitive engagement is increasing dementia risk and allowing age-related cognitive decline.',
          recommendations: [
            'Engage in daily cognitively stimulating activities: reading, puzzles, learning',
            'Take up challenging new hobby requiring sustained focus and skill',
            'Increase social-cognitive activities: discussions, debates, teaching',
            'Address brain health foundations: sleep, exercise, nutrition, stress'
          ],
          quickWin: 'Commit to 30 minutes daily reading of challenging material'
        },
        poor: {
          impact: 'URGENT: Low cognitive engagement significantly increases dementia risk and accelerates brain aging.',
          recommendations: [
            'PRIORITY: Implement daily cognitive stimulation program immediately',
            'Learn complex new skill requiring sustained effort and practice',
            'Join cognitive activities with social component: book club, classes',
            'Screen for and address cognitive decline with medical evaluation',
            'Optimize brain health: sleep, exercise, Mediterranean diet, stress management'
          ],
          quickWin: 'Start daily crossword puzzle or sudoku with morning coffee'
        }
      }
    };

    return analyses[pillarAnalysisName]?.[scoreBand] || {
      impact: `Your ${pillarDisplayName} score indicates this area is impacting your biological aging trajectory.`,
      recommendations: [
        'Focus on foundational health habits in this domain',
        'Consider working with specialist for personalized guidance',
        'Track metrics to monitor progress and adjust approach'
      ],
      quickWin: 'Identify one small improvement you can make this week'
    };
  };

  const analysis = getAnalysis();
  const scoreLabel = getScoreLabel(pillarScore);

  return (
    <Card className="border-l-4" style={{ borderLeftColor: color }}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{pillarDisplayName}</h3>
              <Badge variant={getBadgeVariant(pillarScore)} className="mt-1">
                {scoreLabel}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(pillarScore)}`}>
              {pillarScore}
            </div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={pillarScore} className="mb-4 h-2" />

        {/* Impact Statement */}
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Impact:</strong> {analysis.impact}
            </p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            Key Actions
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.slice(0, 3).map((rec, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary font-bold flex-shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Win */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="font-semibold text-sm mb-1 text-primary">Quick Win</h4>
          <p className="text-sm text-muted-foreground">{analysis.quickWin}</p>
        </div>
      </CardContent>
    </Card>
  );
};
