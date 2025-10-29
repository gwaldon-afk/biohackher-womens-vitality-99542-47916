import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const {
      userId,
      assessmentType,
      assessmentId,
      score,
      scoreCategory,
      answers,
      metadata,
      forceRegenerate = false
    } = await req.json();

    // Generate cache key
    const cacheKey = generateCacheKey(assessmentId, answers);
    const answersHash = generateAnswersHash(answers);

    // Check cache (unless forced regeneration)
    if (!forceRegenerate) {
      const cached = await checkCache(supabase, cacheKey, userId, assessmentId, score);
      if (cached) {
        return new Response(
          JSON.stringify({ ...cached, fromCache: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch user health context
    const userContext = await fetchUserHealthContext(supabase, userId);
    
    // Fetch previous analyses for comparison
    const previousAnalyses = await fetchPreviousAnalyses(supabase, userId, assessmentId);

    // Build AI prompt
    const systemPrompt = buildSystemPrompt(assessmentType, assessmentId);
    const userPrompt = buildUserPrompt({
      assessmentType,
      assessmentId,
      score,
      scoreCategory,
      answers,
      metadata,
      userContext,
      previousAnalyses
    });

    // Determine token budget
    const tokenBudget = getTokenBudget(scoreCategory);

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [buildAnalysisSchema()],
        tool_choice: { type: 'function', function: { name: 'generate_assessment_analysis' } },
        max_tokens: tokenBudget
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${JSON.stringify(errorData)}`);
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(
      aiData.choices[0].message.tool_calls[0].function.arguments
    );

    const processingTime = Date.now() - startTime;

    // Calculate expiration
    const expirationDays = scoreCategory === 'poor' || scoreCategory === 'fair' ? 14 :
                           scoreCategory === 'good' ? 30 : 60;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // Store analysis in database
    const { data: savedInsight, error: saveError } = await supabase
      .from('assessment_ai_insights')
      .insert({
        user_id: userId,
        assessment_type: assessmentType,
        assessment_id: assessmentId,
        score,
        score_category: scoreCategory,
        answers,
        metadata,
        overall_analysis: analysis.overall_analysis,
        key_findings: analysis.key_findings,
        pattern_detections: analysis.pattern_detections || null,
        personalized_insights: analysis.personalized_insights,
        protocol_recommendations: analysis.protocol_recommendations,
        priority_actions: analysis.priority_actions,
        next_steps: analysis.next_steps || null,
        ai_model: 'google/gemini-2.5-flash',
        confidence_score: analysis.confidence_score,
        tokens_used: aiData.usage?.total_tokens,
        processing_time_ms: processingTime,
        cache_key: cacheKey,
        answers_hash: answersHash,
        expires_at: expiresAt.toISOString(),
        version: 1
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving AI insight:', saveError);
    }

    return new Response(
      JSON.stringify({ ...analysis, insightId: savedInsight?.id, fromCache: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-assessment-results:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateCacheKey(assessmentId: string, answers: Record<string, number>): string {
  const sortedAnswers = Object.keys(answers).sort().map(k => `${k}:${answers[k]}`).join('|');
  const hash = hashString(sortedAnswers);
  return `ai-analysis-${assessmentId}-${hash}`;
}

function generateAnswersHash(answers: Record<string, number>): string {
  const sortedAnswers = Object.keys(answers).sort().map(k => `${k}:${answers[k]}`).join('|');
  return hashString(sortedAnswers);
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

async function checkCache(supabase: any, cacheKey: string, userId: string, assessmentId: string, score: number) {
  // Check for exact cached match
  const { data: cached } = await supabase
    .from('assessment_ai_insights')
    .select('*')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (cached) {
    await supabase
      .from('assessment_ai_insights')
      .update({ viewed_at: new Date().toISOString() })
      .eq('id', cached.id);
    
    return cached;
  }

  // Check for similar cached analysis (score within ±5 points)
  const { data: similarCached } = await supabase
    .from('assessment_ai_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('assessment_id', assessmentId)
    .gte('score', score - 5)
    .lte('score', score + 5)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (similarCached) {
    return {
      ...similarCached,
      isSimilar: true,
      scoreGap: Math.abs(similarCached.score - score)
    };
  }

  return null;
}

async function fetchUserHealthContext(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('biological_age, chronological_age')
    .eq('user_id', userId)
    .single();

  const { data: goals } = await supabase
    .from('user_health_goals')
    .select('goal_name, pillar_category')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(5);

  const { data: assessments } = await supabase
    .from('symptom_assessments')
    .select('symptom_type')
    .eq('user_id', userId)
    .order('assessment_date', { ascending: false })
    .limit(10);

  return {
    age: profile?.chronological_age,
    biologicalAge: profile?.biological_age,
    assessmentCount: assessments?.length || 0,
    activeGoals: goals?.map((g: any) => g.goal_name) || []
  };
}

async function fetchPreviousAnalyses(supabase: any, userId: string, assessmentId: string) {
  const { data } = await supabase
    .from('assessment_ai_insights')
    .select('score, score_category, created_at')
    .eq('user_id', userId)
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: false })
    .limit(1);

  return data || [];
}

function buildSystemPrompt(assessmentType: string, assessmentId: string): string {
  const basePrompt = `You are an expert health analyst specializing in personalized health assessment interpretation. 
Your role is to analyze assessment results and provide evidence-based, actionable insights.

Key principles:
- Connect specific user answers to recommendations (explain WHY)
- Provide concrete, measurable action steps
- Explain biological mechanisms when relevant
- Prioritize interventions by impact and feasibility
- Reference evidence levels when making claims
- Be encouraging but realistic about timelines
- Consider interactions between different health domains`;

  const typeSpecificPrompts: Record<string, string> = {
    symptom: `This is a symptom-specific assessment for ${assessmentId}.
Focus on: Root causes, symptom patterns, targeted interventions, expected timelines for improvement.`,
    lis: `This is a Longevity Impact Score (LIS) assessment across 6 pillars.
Focus on: Pillar interactions, prioritization strategy, compounding effects, biological age implications.`,
    'hormone-compass': `This is a hormone stage assessment.
Focus on: Hormonal patterns, stage-specific symptoms, transition timeline, evidence-based interventions for this stage.`,
  };

  return `${basePrompt}\n\n${typeSpecificPrompts[assessmentType] || ''}`;
}

function buildUserPrompt(data: any): string {
  const {
    assessmentId,
    score,
    scoreCategory,
    answers,
    metadata,
    userContext,
    previousAnalyses
  } = data;

  let prompt = `Assessment: ${assessmentId}
Score: ${score}/100 (${scoreCategory})

Detailed Answers:
${Object.entries(answers).map(([q, a]) => `  ${q}: ${a}`).join('\n')}
`;

  if (metadata) {
    prompt += `\nAdditional Context:
${JSON.stringify(metadata, null, 2)}`;
  }

  if (userContext) {
    prompt += `\nUser Health Context:
- Age: ${userContext.age || 'unknown'}
- Previous assessments: ${userContext.assessmentCount}
- Current goals: ${userContext.activeGoals?.join(', ') || 'none set'}`;
  }

  if (previousAnalyses && previousAnalyses.length > 0) {
    const prev = previousAnalyses[0];
    const scoreChange = score - prev.score;
    prompt += `\n\nPrevious Assessment Comparison:
- Previous score: ${prev.score} (${prev.score_category})
- Score change: ${scoreChange > 0 ? '+' : ''}${scoreChange} points
- Days since last: ${Math.floor((Date.now() - new Date(prev.created_at).getTime()) / (1000 * 60 * 60 * 24))}

Focus on what changed and why.`;
  }

  return prompt;
}

function buildAnalysisSchema() {
  return {
    type: "function",
    function: {
      name: "generate_assessment_analysis",
      description: "Generate structured health assessment analysis with personalized insights",
      parameters: {
        type: "object",
        properties: {
          overall_analysis: {
            type: "string",
            description: "Comprehensive analysis in markdown format (200-400 words). Explain score meaning, key patterns, and overall health implications."
          },
          key_findings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                finding: { type: "string" },
                severity: { type: "string", enum: ["high", "medium", "low"] },
                category: { type: "string" }
              },
              required: ["finding", "severity", "category"]
            },
            description: "3-5 most important findings from the assessment"
          },
          pattern_detections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern: { type: "string" },
                affected_areas: { type: "array", items: { type: "string" } },
                significance: { type: "string" }
              }
            },
            description: "Identified patterns across multiple answer domains"
          },
          personalized_insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                insight: { type: "string" },
                reasoning: { type: "string" },
                evidence_level: { type: "string", enum: ["high", "moderate", "emerging"] }
              },
              required: ["insight", "reasoning", "evidence_level"]
            },
            description: "4-6 personalized insights based on specific answers"
          },
          protocol_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                intervention: { type: "string" },
                type: { type: "string", enum: ["supplement", "lifestyle", "exercise", "therapy", "diet"] },
                rationale: { type: "string" },
                priority: { type: "string", enum: ["critical", "high", "medium"] },
                impact: { type: "string", enum: ["high", "medium", "low"] }
              },
              required: ["intervention", "type", "rationale", "priority", "impact"]
            },
            description: "Specific protocol interventions with reasoning"
          },
          priority_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                rationale: { type: "string" },
                timeline: { type: "string" },
                expected_outcome: { type: "string" }
              },
              required: ["action", "rationale", "timeline", "expected_outcome"]
            },
            description: "3-5 immediate action steps prioritized by impact"
          },
          next_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step: { type: "string" },
                timeline: { type: "string" },
                tracking_method: { type: "string" }
              }
            },
            description: "Recommended follow-up actions and tracking"
          },
          confidence_score: {
            type: "number",
            description: "AI confidence in analysis (0-100)"
          }
        },
        required: ["overall_analysis", "key_findings", "personalized_insights", "protocol_recommendations", "priority_actions", "confidence_score"]
      }
    }
  };
}

function getTokenBudget(category: string): number {
  const budgets: Record<string, number> = {
    poor: 1500,
    fair: 1200,
    good: 800,
    excellent: 500
  };
  return budgets[category] || 1000;
}
