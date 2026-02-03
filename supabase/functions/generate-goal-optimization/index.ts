import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { user_id, goal_id, goal_data } = await req.json();

    // Verify premium tier
    const { data: subscription } = await supabaseClient
      .from("user_subscriptions")
      .select("subscription_tier")
      .eq("user_id", user_id)
      .single();

    if (!subscription || !["subscribed", "premium"].includes(subscription.subscription_tier)) {
      return new Response(
        JSON.stringify({ error: "Premium subscription required for AI optimization" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch user's LIS history for context
    const { data: lisHistory } = await supabaseClient
      .from("daily_scores")
      .select("*")
      .eq("user_id", user_id)
      .order("date", { ascending: false })
      .limit(30);

    // Fetch user's health profile
    const { data: healthProfile } = await supabaseClient
      .from("user_health_profile")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    // Generate AI optimization plan using BiohackHer AI
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompt = `You are an expert longevity coach. Generate a personalized optimization plan for this health goal:

Goal: ${goal_data.title}
Pillar: ${goal_data.pillar_category}
Target: ${JSON.stringify(goal_data.healthspan_target)}
Current Interventions: ${JSON.stringify(goal_data.aging_blueprint)}

User Context:
- Age: ${healthProfile?.date_of_birth ? new Date().getFullYear() - new Date(healthProfile.date_of_birth).getFullYear() : 'Unknown'}
- Recent LIS Scores: ${lisHistory?.slice(0, 7).map((s: any) => s.longevity_impact_score).join(', ') || 'None'}

Generate a comprehensive optimization plan with:
1. Daily action steps (specific, measurable)
2. Weekly milestones with target metrics
3. Predicted biological age impact over 12 weeks
4. Risk factors and mitigation strategies
5. Adaptive recommendations based on progress

Format as detailed markdown.`;

    const aiResponse = await fetch("https://api.lovable.app/v1/ai/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const aiResult = await aiResponse.json();
    const optimizationPlan = aiResult.text || "AI optimization plan generated.";

    // Calculate predicted biological age impact (simplified model)
    const predictedImpact = calculatePredictedImpact(goal_data, lisHistory || [], healthProfile);

    // Generate milestones
    const milestones = generateMilestones(goal_data);

    // Update goal with AI optimization
    await supabaseClient
      .from("user_health_goals")
      .update({
        ai_optimization_plan: optimizationPlan,
        ai_generated_at: new Date().toISOString(),
        biological_age_impact_predicted: predictedImpact,
      })
      .eq("id", goal_id)
      .eq("user_id", user_id);

    return new Response(
      JSON.stringify({
        optimization_plan: optimizationPlan,
        predicted_ba_impact: predictedImpact,
        milestones,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating optimization:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function calculatePredictedImpact(goalData: any, lisHistory: any[], healthProfile: any): number {
  // Simplified model: base impact on pillar and current LIS
  const pillarImpacts = {
    brain: 0.8,
    body: 1.2,
    balance: 0.6,
    beauty: 0.4,
  };

  const baseImpact = pillarImpacts[goalData.pillar_category as keyof typeof pillarImpacts] || 0.5;
  
  // Adjust based on current LIS (lower scores = higher potential impact)
  const avgLIS = lisHistory?.length 
    ? lisHistory.reduce((sum: number, s: any) => sum + (s.longevity_impact_score || 0), 0) / lisHistory.length
    : 50;
  
  const adjustmentFactor = Math.max(0, (100 - avgLIS) / 100);
  
  return baseImpact + (adjustmentFactor * 2);
}

function generateMilestones(goalData: any) {
  const today = new Date();
  return [
    {
      week: 2,
      date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      target: "Establish baseline and habits",
      metrics: ["Daily adherence >70%", "First biomarker check"],
    },
    {
      week: 4,
      date: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      target: "Initial progress visible",
      metrics: ["10% improvement in target metrics", "Weekly adherence >80%"],
    },
    {
      week: 8,
      date: new Date(today.getTime() + 56 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      target: "Significant gains",
      metrics: ["25% improvement in target metrics", "Sustained habits"],
    },
    {
      week: 12,
      date: new Date(today.getTime() + 84 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      target: "Goal optimization complete",
      metrics: ["40%+ improvement", "New habits integrated"],
    },
  ];
}
