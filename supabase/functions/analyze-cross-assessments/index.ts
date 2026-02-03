import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse optional trigger_assessment from body
    let triggerAssessment = null;
    try {
      const body = await req.json();
      triggerAssessment = body?.trigger_assessment || null;
    } catch {
      // No body provided, that's fine
    }

    console.log('Fetching assessment data for user:', user.id, 'Trigger:', triggerAssessment);

    // Fetch all assessment data including targeted assessments AND assessment_progress for accurate count
    // IMPORTANT: Fetch baseline LIS record (is_baseline = true) instead of most recent daily entry
    const [lisResult, nutritionResult, hormoneResult, symptomResult, pillarResult, progressResult] = await Promise.all([
      supabase
        .from('daily_scores')
        .select('longevity_impact_score, biological_age_impact, date, questionnaire_data, is_baseline')
        .eq('user_id', user.id)
        .eq('is_baseline', true)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('longevity_nutrition_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('hormone_compass_stages')
        .select('stage, confidence_score, hormone_indicators, calculated_at')
        .eq('user_id', user.id)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('symptom_assessments')
        .select('symptom_type, overall_score, score_category, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5),
      supabase
        .from('user_assessment_completions')
        .select('pillar, score, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10),
      // Also fetch assessment_progress for accurate completed count (handles guest assessments that were claimed)
      supabase
        .from('assessment_progress')
        .select('lis_completed, nutrition_completed, hormone_completed')
        .eq('user_id', user.id)
        .single(),
    ]);

    const lisData = lisResult.data;
    const nutritionData = nutritionResult.data;
    const hormoneData = hormoneResult.data;
    const symptomData = symptomResult.data || [];
    const pillarData = pillarResult.data || [];
    const progressData = progressResult.data;

    // Count completed assessments - use assessment_progress as source of truth (handles guest claims)
    // Fall back to checking actual data if progress record doesn't exist
    const completedAssessments = {
      lis: progressData?.lis_completed || !!lisData,
      nutrition: progressData?.nutrition_completed || !!nutritionData,
      hormone: progressData?.hormone_completed || !!hormoneData,
      symptoms: symptomData.length,
      pillars: pillarData.length
    };

    console.log('Assessment data:', completedAssessments, 'Progress record:', progressData);

    // Build pillar assessment summary
    const pillarSummary = pillarData.length > 0
      ? pillarData.map((p: any) => `${p.pillar}: ${p.score}/100`).join(', ')
      : 'None completed';

    // Build symptom assessment summary
    const symptomSummary = symptomData.length > 0
      ? symptomData.map((s: any) => `${s.symptom_type}: ${s.overall_score}/100 (${s.score_category})`).join(', ')
      : 'None completed';

    // Generate insights (AI-powered if available, otherwise basic)
    let parsedAnalysis;
    
    if (lovableApiKey) {
      // Use BiohackHer AI for evidence-based analysis
      const prompt = buildEvidenceBasedPrompt(
        lisData, 
        nutritionData, 
        hormoneData, 
        symptomData, 
        pillarData, 
        pillarSummary, 
        symptomSummary,
        triggerAssessment
      );

      console.log('Calling BiohackHer AI Gateway...');
      
      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { 
                role: 'system', 
                content: `You are a women's health and longevity expert with deep knowledge of peer-reviewed research. 
You analyze health assessment data and provide evidence-based insights referencing established longevity science.
Always organize findings by the 4 pillars: BEAUTY (skin, hair, anti-aging), BRAIN (cognitive, focus, mood), 
BODY (physical performance, recovery, structure), and BALANCE (hormones, stress, sleep).
Provide actionable, empathetic guidance that empowers women to optimize their healthspan.` 
              },
              { role: 'user', content: prompt }
            ],
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error('BiohackHer AI error:', aiResponse.status, errorText);
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const aiContent = aiData.choices[0].message.content;
        
        console.log('AI response received, parsing...');
        
        // Try to parse JSON from AI response
        try {
          // Extract JSON from response (it might be wrapped in markdown code blocks)
          const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                           aiContent.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent;
          parsedAnalysis = JSON.parse(jsonStr);
        } catch (parseError) {
          console.error('Failed to parse AI response as JSON, using structured extraction');
          // Fallback: create structured response from text
          parsedAnalysis = {
            insights: [aiContent.substring(0, 500)],
            priorities: generateBasicConnections(lisData, nutritionData, hormoneData, symptomData, pillarData),
            synergies: "Your combined health data reveals interconnected patterns across your assessments.",
            pillar_breakdown: generatePillarBreakdown(lisData, nutritionData, hormoneData),
            completed_count: Object.values(completedAssessments).filter(v => v === true || (typeof v === 'number' && v > 0)).length
          };
        }
      } catch (aiError) {
        console.error('AI call failed, falling back to basic insights:', aiError);
        parsedAnalysis = {
          insights: generateBasicInsights(lisData, nutritionData, hormoneData, symptomData, pillarData),
          priorities: generateBasicConnections(lisData, nutritionData, hormoneData, symptomData, pillarData),
          synergies: "Your combined protocols work together to optimize longevity, nutrition, and hormonal health.",
          pillar_breakdown: generatePillarBreakdown(lisData, nutritionData, hormoneData),
          completed_count: Object.values(completedAssessments).filter(v => v === true || (typeof v === 'number' && v > 0)).length
        };
      }
    } else {
      console.log('No BiohackHer API key, returning basic analysis');
      parsedAnalysis = {
        insights: generateBasicInsights(lisData, nutritionData, hormoneData, symptomData, pillarData),
        priorities: generateBasicConnections(lisData, nutritionData, hormoneData, symptomData, pillarData),
        synergies: "Your combined protocols work together to optimize longevity, nutrition, and hormonal health.",
        pillar_breakdown: generatePillarBreakdown(lisData, nutritionData, hormoneData),
        completed_count: Object.values(completedAssessments).filter(v => v === true || (typeof v === 'number' && v > 0)).length
      };
    }

    // Save insights to user_insights table for persistence
    try {
      // Delete existing cross_assessment insights for this user
      await supabase
        .from('user_insights')
        .delete()
        .eq('user_id', user.id)
        .eq('insight_type', 'cross_assessment');

      // Insert new consolidated insights
      const insightsToInsert: any[] = [
        {
          user_id: user.id,
          insight_type: 'cross_assessment',
          category: 'consolidated',
          title: 'Consolidated Health Analysis',
          description: parsedAnalysis.synergies || 'Your health assessments reveal interconnected patterns.',
          recommendations: {
            insights: parsedAnalysis.insights || [],
            priorities: parsedAnalysis.priorities || [],
            pillar_breakdown: parsedAnalysis.pillar_breakdown || {},
            completed_count: parsedAnalysis.completed_count || 0,
            trigger_assessment: triggerAssessment,
            generated_at: new Date().toISOString()
          },
          priority: 'high',
          generated_at: new Date().toISOString()
        }
      ];

      // Add pillar-specific insights if available
      if (parsedAnalysis.pillar_breakdown) {
        const pillars = ['BEAUTY', 'BRAIN', 'BODY', 'BALANCE'];
        for (const pillar of pillars) {
          const pillarInsightData = parsedAnalysis.pillar_breakdown[pillar];
          if (pillarInsightData) {
            insightsToInsert.push({
              user_id: user.id,
              insight_type: 'cross_assessment',
              category: pillar,
              title: `${pillar} Pillar Insights`,
              description: pillarInsightData.summary || `Your ${pillar.toLowerCase()} health based on completed assessments.`,
              recommendations: {
                findings: pillarInsightData.findings || [],
                actions: pillarInsightData.actions || [],
                score: pillarInsightData.score || null
              },
              priority: pillarInsightData.priority || 'medium',
              generated_at: new Date().toISOString()
            });
          }
        }
      }

      const { error: insertError } = await supabase
        .from('user_insights')
        .insert(insightsToInsert);

      if (insertError) {
        console.error('Error saving insights:', insertError);
      } else {
        console.log('Saved', insightsToInsert.length, 'insights to user_insights table');
      }
    } catch (saveError) {
      console.error('Error saving insights to database:', saveError);
      // Continue - don't fail the request if save fails
    }

    return new Response(JSON.stringify({
      ...parsedAnalysis,
      completedAssessments,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in analyze-cross-assessments:', error);
    return new Response(JSON.stringify({ 
      error: error?.message || 'Unknown error occurred',
      insights: [
        "Your nutrition choices directly impact your LIS score and biological aging",
        "Hormonal balance influences your energy levels and recovery capacity",
        "Combined protocols address root causes across all three health dimensions"
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildEvidenceBasedPrompt(
  lisData: any, 
  nutritionData: any, 
  hormoneData: any, 
  symptomData: any[], 
  pillarData: any[],
  pillarSummary: string,
  symptomSummary: string,
  triggerAssessment: string | null
): string {
  const completedList = [];
  const missingList = [];
  
  if (lisData) {
    completedList.push(`LIS Assessment: Score ${lisData.longevity_impact_score}/100, Biological Age Impact ${lisData.biological_age_impact > 0 ? '+' : ''}${lisData.biological_age_impact} years`);
  } else {
    missingList.push('LIS Assessment');
  }
  
  if (nutritionData) {
    completedList.push(`Longevity Nutrition: Score ${nutritionData.longevity_nutrition_score}/100, Protein ${nutritionData.protein_score}/5, Fiber ${nutritionData.fiber_score}/5, Inflammation ${nutritionData.inflammation_score}/5`);
  } else {
    missingList.push('Longevity Nutrition Assessment');
  }
  
  if (hormoneData) {
    completedList.push(`Hormone Compass: Stage "${hormoneData.stage}", Health Level ${hormoneData.confidence_score}%`);
  } else {
    missingList.push('Hormone Compass Assessment');
  }

  return `Analyze these women's health assessment results and provide consolidated, evidence-based insights.

${triggerAssessment ? `This analysis was triggered by completing the ${triggerAssessment} assessment.` : ''}

COMPLETED ASSESSMENTS:
${completedList.length > 0 ? completedList.join('\n') : 'None completed yet'}

${missingList.length > 0 ? `ASSESSMENTS NOT YET COMPLETED:\n${missingList.join('\n')}` : ''}

${pillarSummary !== 'None completed' ? `PILLAR ASSESSMENTS: ${pillarSummary}` : ''}
${symptomSummary !== 'None completed' ? `SYMPTOM ASSESSMENTS: ${symptomSummary}` : ''}

Based on available data, provide:
1. Three to five key cross-assessment insights showing how these health dimensions interact
2. Top 3 priority recommendations that address multiple areas simultaneously  
3. A synergy statement explaining how addressing these together creates compounding benefits
4. A pillar_breakdown object with findings for each pillar (BEAUTY, BRAIN, BODY, BALANCE)

If some assessments are incomplete, still provide valuable insights from available data and explain what additional assessments would reveal.

Format your response as valid JSON:
{
  "insights": ["insight1", "insight2", "insight3"],
  "priorities": ["priority1", "priority2", "priority3"],
  "synergies": "explanation of how combined protocols work together",
  "pillar_breakdown": {
    "BEAUTY": { "summary": "...", "findings": ["..."], "actions": ["..."], "score": null, "priority": "medium" },
    "BRAIN": { "summary": "...", "findings": ["..."], "actions": ["..."], "score": null, "priority": "medium" },
    "BODY": { "summary": "...", "findings": ["..."], "actions": ["..."], "score": null, "priority": "medium" },
    "BALANCE": { "summary": "...", "findings": ["..."], "actions": ["..."], "score": null, "priority": "medium" }
  }
}`;
}

function generatePillarBreakdown(lisData: any, nutritionData: any, hormoneData: any): Record<string, any> {
  const breakdown: Record<string, any> = {};
  
  // BEAUTY pillar
  breakdown.BEAUTY = {
    summary: "Skin, hair, and anti-aging health indicators",
    findings: [],
    actions: ["Focus on hydration and antioxidant-rich foods", "Consider collagen-supporting nutrients"],
    score: null,
    priority: "medium"
  };
  
  if (nutritionData?.hydration_score < 3) {
    breakdown.BEAUTY.findings.push("Low hydration may affect skin elasticity and appearance");
    breakdown.BEAUTY.priority = "high";
  }
  
  // BRAIN pillar
  breakdown.BRAIN = {
    summary: "Cognitive function, focus, and mood indicators",
    findings: [],
    actions: ["Prioritize omega-3 fatty acids", "Maintain consistent sleep schedule"],
    score: null,
    priority: "medium"
  };
  
  if (nutritionData?.inflammation_score > 3) {
    breakdown.BRAIN.findings.push("Elevated inflammation may impact cognitive clarity");
    breakdown.BRAIN.priority = "high";
  }
  
  // BODY pillar
  breakdown.BODY = {
    summary: "Physical performance, recovery, and structural health",
    findings: [],
    actions: ["Ensure adequate protein intake", "Include resistance training"],
    score: null,
    priority: "medium"
  };
  
  if (nutritionData?.protein_score < 3) {
    breakdown.BODY.findings.push("Low protein intake may affect muscle maintenance and recovery");
    breakdown.BODY.priority = "high";
  }
  
  if (lisData?.longevity_impact_score < 60) {
    breakdown.BODY.findings.push("LIS score suggests room for improvement in overall physical health markers");
  }
  
  // BALANCE pillar
  breakdown.BALANCE = {
    summary: "Hormonal health, stress management, and sleep quality",
    findings: [],
    actions: ["Practice stress-reduction techniques", "Optimize sleep environment"],
    score: null,
    priority: "medium"
  };
  
  if (hormoneData) {
    breakdown.BALANCE.findings.push(`Hormone Compass indicates "${hormoneData.stage}" stage`);
    if (hormoneData.confidence_score < 60) {
      breakdown.BALANCE.priority = "high";
      breakdown.BALANCE.findings.push("Hormone health may benefit from targeted support");
    }
  }
  
  return breakdown;
}

function generateBasicInsights(lisData: any, nutritionData: any, hormoneData: any, symptomData: any[], pillarData: any[]): string[] {
  const insights = [
    "Your nutrition choices directly impact your LIS score and biological aging",
    "Hormonal balance influences your energy levels and recovery capacity",
    "Combined protocols address root causes across all health dimensions"
  ];

  if (nutritionData && nutritionData.protein_score < 3) {
    insights.push("Low protein intake may be affecting both muscle health (LIS) and hormone balance");
  }

  if (nutritionData && nutritionData.inflammation_score > 3) {
    insights.push("Inflammation markers suggest gut-hormone-aging connection requiring integrated approach");
  }

  // Add pillar-specific insights
  const lowPillars = pillarData.filter((p: any) => p.score < 50);
  if (lowPillars.length > 0) {
    insights.push(`Your ${lowPillars[0].pillar} pillar needs attention and may be impacting your overall longevity score`);
  }

  // Add symptom-specific insights
  const highSeveritySymptoms = symptomData.filter((s: any) => s.overall_score < 40);
  if (highSeveritySymptoms.length > 0) {
    insights.push(`${highSeveritySymptoms[0].symptom_type} symptoms are affecting multiple health dimensions`);
  }

  return insights;
}

function generateBasicConnections(lisData: any, nutritionData: any, hormoneData: any, symptomData: any[], pillarData: any[]): string[] {
  const priorities = [
    "Prioritize protein intake (30g+ per meal) to support muscle health, hormone production, and longevity",
    "Address inflammation through nutrition to improve both gut health and hormone balance",
    "Optimize sleep quality and stress management as they impact all assessment areas"
  ];

  // Add pillar-specific priorities
  const lowestPillar = pillarData.sort((a: any, b: any) => a.score - b.score)[0];
  if (lowestPillar && lowestPillar.score < 60) {
    priorities.unshift(`Focus on ${lowestPillar.pillar} pillar improvements to boost overall health`);
  }

  return priorities;
}
