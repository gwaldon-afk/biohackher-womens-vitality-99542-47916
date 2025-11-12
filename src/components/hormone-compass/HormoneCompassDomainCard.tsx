import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/hooks/useLocale';

interface DomainCardProps {
  domainName: string;
  domainIcon: string;
  domainScore: number;
  userAge?: number;
  hideHeader?: boolean;
}

export const HormoneCompassDomainCard = ({ 
  domainName,
  domainIcon,
  domainScore,
  userAge,
  hideHeader = false
}: DomainCardProps) => {
  const { isMetric } = useLocale();
  
  const getLocalizedText = (text: string) => {
    if (text === 'LOCALIZED:TEMP_BEDROOM') {
      return isMetric 
        ? 'Keep bedroom temperature cool (18-20°C) for better sleep'
        : 'Keep bedroom temperature cool (65-68°F) for better sleep';
    }
    return text;
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Thriving';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Challenges';
    if (score >= 1.5) return 'Struggling';
    return 'Critical';
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-blue-600';
    if (score >= 2.5) return 'text-yellow-600';
    if (score >= 1.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 4.5) return 'default';
    if (score >= 3.5) return 'secondary';
    if (score >= 2.5) return 'outline';
    return 'destructive';
  };

  const getAnalysis = () => {
    const scoreBand = domainScore >= 4.5 ? 'thriving' : 
                      domainScore >= 3.5 ? 'good' : 
                      domainScore >= 2.5 ? 'challenges' : 
                      domainScore >= 1.5 ? 'struggling' : 'critical';

    const analyses: Record<string, Record<string, { impact: string; recommendations: string[]; quickWin: string }>> = {
      'Cycle & Period Patterns': {
        thriving: {
          impact: 'Your cycle is healthy and regular, indicating balanced hormone production. This is a strong foundation for overall hormone health.',
          recommendations: [
            'Continue tracking your cycle to maintain awareness of your baseline',
            'Support hormones with whole foods, healthy fats, and adequate protein',
            'Manage stress to preserve cycle regularity'
          ],
          quickWin: 'Track one new cycle metric (cervical fluid, basal temp) to deepen body awareness'
        },
        good: {
          impact: 'Your cycle is generally regular with minor fluctuations. Small optimizations can enhance hormone balance.',
          recommendations: [
            'Track cycle patterns to identify subtle shifts or triggers',
            'Optimize nutrition with cycle-supportive foods (leafy greens, seeds)',
            'Consider seed cycling to support hormone balance naturally'
          ],
          quickWin: 'Add flax and pumpkin seeds to follicular phase, sesame and sunflower to luteal'
        },
        challenges: {
          impact: 'Irregular cycles indicate hormone imbalance affecting ovulation, estrogen, or progesterone levels. This impacts fertility and long-term health.',
          recommendations: [
            'Work with provider to investigate root causes (PCOS, thyroid, stress)',
            'Implement cycle-supportive nutrition and eliminate inflammatory foods',
            'Consider targeted supplements: magnesium, evening primrose oil',
            'Track symptoms daily to identify patterns and triggers'
          ],
          quickWin: 'Eliminate refined sugar for 2 weeks and track cycle changes'
        },
        struggling: {
          impact: 'Significant cycle disruption indicates hormonal imbalance requiring attention. This may affect fertility, mood, energy, and long-term health risks.',
          recommendations: [
            'Schedule appointment with healthcare provider for hormone testing',
            'Rule out PCOS, thyroid disorders, or perimenopause transition',
            'Implement anti-inflammatory diet and stress management protocol',
            'Consider functional medicine approach for root cause resolution',
            'Supplement with cycle-supporting nutrients under guidance'
          ],
          quickWin: 'Start daily symptom tracking in app to provide data for provider visit'
        },
        critical: {
          impact: 'URGENT: Severe cycle disruption or absence indicates significant hormone dysfunction requiring immediate medical evaluation.',
          recommendations: [
            'PRIORITY: Schedule immediate appointment with gynecologist or endocrinologist',
            'Request comprehensive hormone panel and metabolic testing',
            'Rule out serious conditions: PCOS, POI, hypothalamic amenorrhea',
            'Address underlying factors: extreme stress, under-eating, over-exercise',
            'Work with medical team to restore healthy hormone production'
          ],
          quickWin: 'Call provider today to schedule comprehensive hormone evaluation'
        }
      },
      'Sleep & Thermoregulation': {
        thriving: {
          impact: 'Your sleep quality and temperature regulation are excellent, supporting optimal hormone production and repair.',
          recommendations: [
            'Maintain consistent sleep schedule to preserve circadian health',
            'Continue optimizing sleep environment (dark, cool, quiet)',
            'Prioritize stress management to protect sleep quality'
          ],
          quickWin: 'Add 10-minute evening wind-down routine to enhance sleep quality'
        },
        good: {
          impact: 'Your sleep is generally good with occasional disruptions. Optimization can further support hormone balance.',
          recommendations: [
            'Establish consistent bedtime and wake time (even weekends)',
            'Reduce blue light exposure 2 hours before bed',
            'LOCALIZED:TEMP_BEDROOM'
          ],
          quickWin: 'Block blue light after 8pm with glasses or device settings'
        },
        challenges: {
          impact: 'Sleep disruption and temperature issues are affecting your hormone production, repair processes, and daily quality of life.',
          recommendations: [
            'Implement strict sleep hygiene: consistent schedule, dark room, cool temp',
            'Consider magnesium glycinate (300mg) 1 hour before bed',
            'Address night sweats with targeted supplements (sage, black cohosh)',
            'Practice stress reduction techniques before bed'
          ],
          quickWin: 'Set bedroom temperature to 65-68°F and use breathable bedding'
        },
        struggling: {
          impact: 'Poor sleep and severe temperature dysregulation are significantly impacting your hormone health, cognitive function, and wellbeing.',
          recommendations: [
            'Consult healthcare provider to rule out sleep disorders or severe vasomotor symptoms',
            'Consider hormone testing if experiencing night sweats or hot flashes',
            'Implement comprehensive sleep protocol with supplements and lifestyle changes',
            'Explore HRT or other medical interventions if appropriate',
            'Address underlying causes: stress, hormones, medical conditions'
          ],
          quickWin: 'Start magnesium glycinate tonight (300mg 1hr before bed)'
        },
        critical: {
          impact: 'URGENT: Severe sleep deprivation and temperature dysregulation are critically impacting your health and require immediate intervention.',
          recommendations: [
            'PRIORITY: Schedule sleep study to rule out sleep apnea or disorders',
            'Consult hormone specialist for severe vasomotor symptoms',
            'Implement immediate interventions: blackout shades, cooling devices',
            'Consider medical treatments: CBT-I, hormone therapy, prescription sleep aids',
            'Address emergency situations affecting sleep (crisis support if needed)'
          ],
          quickWin: 'Schedule sleep study or hormone specialist appointment this week'
        }
      },
      'Mood & Focus': {
        thriving: {
          impact: 'Your mood stability and mental clarity indicate balanced neurotransmitters and hormone levels supporting cognitive health.',
          recommendations: [
            'Continue stress management practices to maintain resilience',
            'Support brain health with omega-3s, B vitamins, and quality sleep',
            'Engage in cognitively stimulating activities for continued sharpness'
          ],
          quickWin: 'Add 5-minute daily gratitude practice to amplify positive mood'
        },
        good: {
          impact: 'Your mood and focus are generally stable with occasional challenges. Targeted support can enhance mental wellbeing.',
          recommendations: [
            'Establish daily stress-reduction practice (meditation, breathwork)',
            'Support neurotransmitters with omega-3s and B-complex vitamins',
            'Prioritize sleep quality for cognitive restoration',
            'Consider adaptogenic herbs for stress resilience'
          ],
          quickWin: 'Practice 4-7-8 breathing twice daily (4sec in, 7sec hold, 8sec out)'
        },
        challenges: {
          impact: 'Mood instability and brain fog are affecting your daily life and may indicate hormone imbalance, neurotransmitter dysfunction, or chronic stress.',
          recommendations: [
            'Work with provider to investigate root causes (hormones, thyroid, deficiencies)',
            'Implement mood-supporting supplements: omega-3, B-complex, rhodiola',
            'Prioritize sleep, exercise, and stress management for mental health',
            'Consider therapy or counseling for additional support',
            'Eliminate inflammatory foods that can affect mood'
          ],
          quickWin: 'Start omega-3 supplement (2000mg EPA/DHA daily with meals)'
        },
        struggling: {
          impact: 'Significant mood disruption and cognitive issues are interfering with quality of life and may indicate serious hormone imbalance or mental health concerns.',
          recommendations: [
            'PRIORITY: Consult mental health professional or psychiatrist for evaluation',
            'Request hormone testing (thyroid, sex hormones, cortisol)',
            'Discuss treatment options: therapy, medication, hormone support',
            'Implement comprehensive lifestyle protocol under professional guidance',
            'Build support system and consider support groups'
          ],
          quickWin: 'Schedule appointment with therapist or psychiatrist this week'
        },
        critical: {
          impact: 'URGENT: Severe mood instability, anxiety, or depression require immediate professional support. This is a priority health concern.',
          recommendations: [
            'PRIORITY: Seek immediate mental health evaluation (crisis line if needed)',
            'Schedule urgent appointment with psychiatrist or mental health provider',
            'Request comprehensive testing to identify underlying causes',
            'Discuss all treatment options including medication and hormone therapy',
            'Build crisis safety plan and establish support network',
            'Consider intensive outpatient programs if appropriate'
          ],
          quickWin: 'Call mental health crisis line or schedule urgent appointment today'
        }
      },
      'Energy & Weight': {
        thriving: {
          impact: 'Your energy levels and weight are stable, indicating healthy metabolism, mitochondrial function, and hormone balance.',
          recommendations: [
            'Maintain balanced nutrition with adequate protein and healthy fats',
            'Continue regular physical activity for metabolic health',
            'Support mitochondria with CoQ10 and quality sleep'
          ],
          quickWin: 'Add one serving of colorful vegetables to each meal for metabolic support'
        },
        good: {
          impact: 'Your energy and weight are generally stable with room for optimization. Targeted support can enhance vitality.',
          recommendations: [
            'Optimize protein intake (25-30g per meal) for blood sugar stability',
            'Support mitochondria with CoQ10 and B vitamins',
            'Manage stress to reduce cortisol-driven weight gain',
            'Prioritize sleep for metabolic hormone regulation'
          ],
          quickWin: 'Add protein-rich breakfast within 1 hour of waking'
        },
        challenges: {
          impact: 'Fatigue and weight changes indicate metabolic or hormone disruption affecting energy production, insulin sensitivity, or thyroid function.',
          recommendations: [
            'Work with provider to rule out thyroid dysfunction, insulin resistance',
            'Implement blood sugar balancing nutrition: protein, fiber, healthy fats',
            'Support energy with CoQ10, ashwagandha, B vitamins',
            'Address stress and sleep to restore metabolic health',
            'Consider strength training to build metabolically active muscle'
          ],
          quickWin: 'Eliminate refined carbs and add 25g protein to every meal'
        },
        struggling: {
          impact: 'Severe fatigue and significant weight changes indicate serious metabolic or endocrine disruption requiring medical evaluation.',
          recommendations: [
            'PRIORITY: Schedule comprehensive metabolic panel (thyroid, insulin, cortisol)',
            'Rule out conditions: hypothyroidism, diabetes, adrenal dysfunction, PCOS',
            'Implement therapeutic nutrition protocol under professional guidance',
            'Consider medications or hormone therapy if appropriate',
            'Address underlying causes: chronic stress, poor sleep, inflammation'
          ],
          quickWin: 'Schedule appointment with endocrinologist for metabolic evaluation'
        },
        critical: {
          impact: 'URGENT: Extreme fatigue or rapid weight changes require immediate medical attention to rule out serious conditions.',
          recommendations: [
            'PRIORITY: Schedule urgent medical evaluation with PCP or endocrinologist',
            'Request comprehensive testing: thyroid panel, metabolic panel, hormone levels',
            'Rule out emergencies: adrenal crisis, severe thyroid dysfunction, diabetes',
            'Address severe deficiencies or electrolyte imbalances immediately',
            'Work with medical team for diagnosis and treatment plan'
          ],
          quickWin: 'Schedule urgent medical appointment today—do not delay'
        }
      },
      'Libido & Sexual Health': {
        thriving: {
          impact: 'Your sexual health and libido are strong, indicating healthy sex hormone levels and overall wellbeing.',
          recommendations: [
            'Continue prioritizing sleep, stress management, and relationship health',
            'Support hormone production with adequate healthy fats and nutrients',
            'Maintain open communication with partner about needs and desires'
          ],
          quickWin: 'Schedule quality time with partner to nurture intimacy'
        },
        good: {
          impact: 'Your sexual health is generally good with minor concerns. Small adjustments can enhance libido and comfort.',
          recommendations: [
            'Prioritize sleep and stress reduction to support sex hormones',
            'Support libido with maca root and adequate vitamin D',
            'Address relationship factors affecting intimacy',
            'Use high-quality lubricants if experiencing minor dryness'
          ],
          quickWin: 'Add maca root supplement (1500-3000mg daily)'
        },
        challenges: {
          impact: 'Reduced libido and sexual discomfort are affecting intimacy and quality of life. This may indicate hormone changes or other factors.',
          recommendations: [
            'Consult healthcare provider to discuss hormone levels and options',
            'Address contributing factors: stress, medication side effects, relationship issues',
            'Support sexual health with targeted supplements: maca, omega-3s, DHEA',
            'Use vaginal moisturizers or lubricants for comfort',
            'Consider pelvic floor therapy if experiencing pain'
          ],
          quickWin: 'Start using high-quality lubricant and vaginal moisturizer'
        },
        struggling: {
          impact: 'Significant loss of libido and sexual discomfort are impacting intimacy and wellbeing. Medical evaluation is recommended.',
          recommendations: [
            'PRIORITY: Schedule appointment with gynecologist or sexual health specialist',
            'Discuss hormone testing and treatment options (local or systemic estrogen)',
            'Rule out medical causes: vaginal atrophy, pelvic issues, medication effects',
            'Consider HRT or local estrogen therapy if appropriate',
            'Work with pelvic floor therapist and/or sex therapist for comprehensive support'
          ],
          quickWin: 'Schedule gynecology appointment to discuss hormone therapy options'
        },
        critical: {
          impact: 'URGENT: Severe pain, complete loss of libido, or significant distress require immediate medical evaluation and support.',
          recommendations: [
            'PRIORITY: Schedule urgent appointment with gynecologist for evaluation',
            'Rule out serious conditions: severe atrophy, infections, pelvic disorders',
            'Discuss all treatment options including hormone therapy and interventions',
            'Consider referrals: pelvic pain specialist, sexual medicine physician',
            'Seek mental health support for relationship and emotional impacts',
            'Communicate openly with partner about challenges and needs'
          ],
          quickWin: 'Schedule urgent gynecology appointment—explain severity of symptoms'
        }
      },
      'Skin, Hair & Nails': {
        thriving: {
          impact: 'Your skin, hair, and nails are healthy, indicating good hormone balance, hydration, and nutrient status.',
          recommendations: [
            'Continue healthy habits: hydration, nutrition, stress management',
            'Support collagen production with vitamin C and protein',
            'Protect skin from sun damage for long-term health'
          ],
          quickWin: 'Add collagen peptides to morning coffee or smoothie (10-20g)'
        },
        good: {
          impact: 'Your skin, hair, and nails are generally healthy with minor concerns. Targeted support can enhance appearance.',
          recommendations: [
            'Increase water intake for hydration (2-3L daily)',
            'Support with collagen peptides and biotin',
            'Ensure adequate healthy fats in diet (avocado, nuts, fish)',
            'Protect from environmental damage (sun, pollution)'
          ],
          quickWin: 'Add collagen peptides daily and increase healthy fat intake'
        },
        challenges: {
          impact: 'Skin dryness, hair changes, or nail brittleness indicate potential nutrient deficiencies, hormone changes, or dehydration.',
          recommendations: [
            'Increase water intake and dietary healthy fats significantly',
            'Support with targeted supplements: collagen, biotin, omega-3s',
            'Rule out thyroid dysfunction or nutrient deficiencies with provider',
            'Use high-quality skincare with hyaluronic acid and ceramides',
            'Consider hormone effects if postmenopausal or perimenopausal'
          ],
          quickWin: 'Start collagen (10-20g), biotin (5000mcg), omega-3 daily'
        },
        struggling: {
          impact: 'Significant changes in skin, hair, or nails may indicate hormone imbalance, thyroid dysfunction, or nutritional deficiencies requiring evaluation.',
          recommendations: [
            'PRIORITY: Consult provider for thyroid testing and nutrient panel',
            'Rule out medical causes: thyroid disorders, iron deficiency, hormone imbalance',
            'Implement comprehensive supplement protocol under guidance',
            'Consider dermatologist referral for severe skin changes or hair loss',
            'Optimize nutrition with focus on protein, healthy fats, micronutrients'
          ],
          quickWin: 'Schedule appointment with provider for thyroid and nutrient testing'
        },
        critical: {
          impact: 'URGENT: Severe or rapid changes in skin, hair, or nails require immediate medical evaluation to rule out serious conditions.',
          recommendations: [
            'PRIORITY: Schedule urgent appointment with dermatologist or endocrinologist',
            'Request comprehensive testing: thyroid panel, nutrient levels, hormone panel',
            'Rule out serious conditions: alopecia, severe thyroid disease, autoimmune disorders',
            'Discuss treatment options including prescription interventions',
            'Address underlying causes with medical supervision'
          ],
          quickWin: 'Schedule urgent medical appointment—document changes with photos'
        }
      }
    };

    return analyses[domainName]?.[scoreBand] || {
      impact: `Your ${domainName} score indicates this area may need attention for optimal hormone health.`,
      recommendations: [
        'Focus on foundational health habits in this domain',
        'Consider working with specialist for personalized guidance',
        'Track symptoms to monitor progress and adjust approach'
      ],
      quickWin: 'Identify one small improvement you can make this week'
    };
  };

  const analysis = getAnalysis();
  const scoreLabel = getScoreLabel(domainScore);
  const scorePercentage = (domainScore / 5) * 100;

  return (
    <Card className="border-l-4 border-l-primary/40">
      <CardContent className="p-6">
        {!hideHeader && (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{domainIcon}</div>
                <div>
                  <h3 className="font-semibold text-lg">{domainName}</h3>
                  <Badge variant={getBadgeVariant(domainScore)} className="mt-1">
                    {scoreLabel}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getScoreColor(domainScore)}`}>
                  {domainScore.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">/ 5.0</div>
              </div>
            </div>

            <Progress value={scorePercentage} className="mb-4" />
          </>
        )}

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm leading-relaxed">{analysis.impact}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-primary">💡</span>
              Quick Win
            </h4>
            <p className="text-sm bg-primary/5 rounded-lg p-3 border border-primary/20">
              {analysis.quickWin}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Recommended Actions</h4>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 text-xs">▸</span>
                  <span className="text-sm">{getLocalizedText(rec)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
