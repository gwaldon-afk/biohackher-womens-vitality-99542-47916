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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    console.log('Fetching assessment data for user:', user.id);

    // Fetch all three assessment data
    const [lisResult, nutritionResult, hormoneResult] = await Promise.all([
      supabase
        .from('daily_scores')
        .select('longevity_impact_score, biological_age_impact, date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('longevity_nutrition_assessments')
        .select('longevity_nutrition_score, protein_score, fiber_score, inflammation_score, completed_at')
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
    ]);

    const lisData = lisResult.data;
    const nutritionData = nutritionResult.data;
    const hormoneData = hormoneResult.data;

    console.log('Assessment data:', { 
      lis: !!lisData, 
      nutrition: !!nutritionData, 
      hormone: !!hormoneData 
    });

    // If no AI key, return basic analysis
    if (!openAIApiKey) {
      console.log('No OpenAI key, returning basic analysis');
      return new Response(JSON.stringify({
        insights: generateBasicInsights(lisData, nutritionData, hormoneData),
        connections: generateBasicConnections(lisData, nutritionData, hormoneData),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate AI-powered consolidated analysis
    const prompt = `You are a women's health and longevity expert. Analyze these three assessment results and provide consolidated insights:

LIS Assessment: ${lisData ? `Score ${lisData.longevity_impact_score}, Biological Age Impact ${lisData.biological_age_impact}` : 'Not completed'}

Longevity Nutrition: ${nutritionData ? `Score ${nutritionData.longevity_nutrition_score}, Protein ${nutritionData.protein_score}/5, Fiber ${nutritionData.fiber_score}/5, Inflammation ${nutritionData.inflammation_score}/5` : 'Not completed'}

Hormone Compass: ${hormoneData ? `Stage: ${hormoneData.stage}, Confidence ${hormoneData.confidence_score}%` : 'Not completed'}

Provide:
1. Three key cross-assessment insights showing how these dimensions interact
2. Top priority recommendations that address multiple areas simultaneously
3. Expected synergistic benefits when all protocols are followed

Format as JSON: { "insights": ["insight1", "insight2", "insight3"], "priorities": ["priority1", "priority2"], "synergies": "explanation" }`;

    console.log('Calling OpenAI API...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a women\'s health and longevity expert providing cross-assessment insights.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const aiData = await openAIResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI response received');
    
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(aiContent);
    } catch (e) {
      console.error('Failed to parse AI response, using basic insights');
      parsedAnalysis = {
        insights: generateBasicInsights(lisData, nutritionData, hormoneData),
        priorities: generateBasicConnections(lisData, nutritionData, hormoneData),
        synergies: "Your combined protocols work together to optimize longevity, nutrition, and hormonal health."
      };
    }

    return new Response(JSON.stringify(parsedAnalysis), {
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

function generateBasicInsights(lisData: any, nutritionData: any, hormoneData: any): string[] {
  const insights = [
    "Your nutrition choices directly impact your LIS score and biological aging",
    "Hormonal balance influences your energy levels and recovery capacity",
    "Combined protocols address root causes across all three health dimensions"
  ];

  if (nutritionData && nutritionData.protein_score < 3) {
    insights.push("Low protein intake may be affecting both muscle health (LIS) and hormone balance");
  }

  if (nutritionData && nutritionData.inflammation_score > 3) {
    insights.push("Inflammation markers suggest gut-hormone-aging connection requiring integrated approach");
  }

  return insights;
}

function generateBasicConnections(lisData: any, nutritionData: any, hormoneData: any): string[] {
  return [
    "Prioritize protein intake (30g+ per meal) to support muscle health, hormone production, and longevity",
    "Address inflammation through nutrition to improve both gut health and hormone balance",
    "Optimize sleep quality and stress management as they impact all three assessment areas"
  ];
}