import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthContext {
  lisScore?: number;
  priorityAreas?: string[];
  activeGoals?: string[];
  hormoneHealthLevel?: string;
  nutritionScore?: number;
  age?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      studyTitle, 
      studyAbstract, 
      interventionName, 
      pillar,
      healthContext 
    } = await req.json() as {
      studyTitle: string;
      studyAbstract?: string;
      interventionName: string;
      pillar?: string;
      healthContext: HealthContext;
    };

    const gatewayUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
    const apiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!apiKey) {
      // Fallback to static personalization
      return new Response(JSON.stringify({
        personalization: generateStaticPersonalization(healthContext, interventionName, pillar),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build context-aware prompt
    const contextParts: string[] = [];
    
    if (healthContext.lisScore) {
      contextParts.push(`User's LIS (Longevity Impact Score): ${Math.round(healthContext.lisScore)}/100`);
    }
    if (healthContext.priorityAreas?.length) {
      contextParts.push(`Priority health areas needing attention: ${healthContext.priorityAreas.join(', ')}`);
    }
    if (healthContext.activeGoals?.length) {
      contextParts.push(`Active health goals: ${healthContext.activeGoals.join(', ')}`);
    }
    if (healthContext.hormoneHealthLevel) {
      contextParts.push(`Hormone health status: ${healthContext.hormoneHealthLevel}`);
    }
    if (healthContext.nutritionScore) {
      contextParts.push(`Nutrition score: ${Math.round(healthContext.nutritionScore)}/100`);
    }
    if (healthContext.age) {
      contextParts.push(`Age: ${healthContext.age} years`);
    }

    const prompt = `You are a women's health expert explaining why a research study matters for a specific user.

USER HEALTH CONTEXT:
${contextParts.length > 0 ? contextParts.join('\n') : 'Limited profile data available'}

RESEARCH STUDY:
Title: ${studyTitle}
Intervention: ${interventionName}
${pillar ? `Health Pillar: ${pillar}` : ''}
${studyAbstract ? `Abstract: ${studyAbstract.substring(0, 500)}...` : ''}

Write a personalized 2-3 sentence explanation of why this research matters specifically for THIS user based on their health context. 
- Be warm and direct, addressing them in second person ("you", "your")
- Connect the study findings to their specific priority areas or goals
- If the study aligns with areas they're working on, highlight that connection
- Keep it actionable and encouraging
- Do NOT use clinical jargon
- Do NOT give medical advice or dosing recommendations

Example tone: "Given your focus on improving sleep quality, this study is particularly relevant for you. The research shows that [intervention] may support the exact area you're prioritizing in your health journey."`;

    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded, please try again later.",
          personalization: generateStaticPersonalization(healthContext, interventionName, pillar),
        }), {
          status: 200, // Return 200 with fallback content
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI credits exhausted",
          personalization: generateStaticPersonalization(healthContext, interventionName, pillar),
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const personalization = data.choices?.[0]?.message?.content?.trim();

    return new Response(JSON.stringify({
      personalization: personalization || generateStaticPersonalization(healthContext, interventionName, pillar),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in personalize-research:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      personalization: null,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateStaticPersonalization(
  context: HealthContext,
  interventionName: string,
  pillar?: string
): string {
  const parts: string[] = [];

  // Priority area match
  const matchedArea = context.priorityAreas?.find(area =>
    pillar?.toLowerCase().includes(area) || interventionName.toLowerCase().includes(area)
  );
  if (matchedArea) {
    parts.push(`Based on your assessment results, ${matchedArea} is one of your focus areas, making this research on ${interventionName} particularly relevant for you.`);
  }

  // Goal match
  if (context.activeGoals?.length) {
    parts.push(`This research may support your current health goals.`);
  }

  // LIS context
  if (context.lisScore && context.lisScore < 70) {
    parts.push(`Given your current health scores, evidence-based interventions like this could contribute to meaningful improvement.`);
  }

  if (parts.length === 0) {
    parts.push(`This research on ${interventionName} provides evidence-based insights that may support your health journey.`);
  }

  return parts.join(' ');
}
