import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { score } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert women's health and energy coach. Analyze the Energy Loop scores and provide actionable insights.

The Energy Loop tracks 5 interconnected dimensions:
- Sleep Recovery (0-100): Quality of rest and restoration
- Stress Load (0-100): Stress management and resilience
- Fuel & Nutrition (0-100): Nutritional quality and blood sugar balance
- Movement Quality (0-100): Physical activity and recovery balance
- Hormonal Rhythm (0-100): Hormonal balance and cycle awareness

Provide a concise analysis in 3 sections:
1. **Current State** (2-3 sentences): What the scores reveal about their energy patterns
2. **Key Insights** (3-4 bullet points): Specific observations and connections between dimensions
3. **Priority Actions** (3 specific recommendations): What to focus on today/this week

Keep it encouraging, specific, and actionable. Focus on the lowest-scoring areas and how they connect.`;

    const userPrompt = `Analyze these Energy Loop scores:
- Composite Score: ${score.composite_score}/100
- Sleep Recovery: ${score.sleep_recovery_score}/100
- Stress Load: ${score.stress_load_score}/100
- Fuel & Nutrition: ${score.nutrition_score}/100
- Movement Quality: ${score.movement_quality_score}/100
- Hormonal Rhythm: ${score.hormonal_rhythm_score}/100
- Loop Completion: ${score.loop_completion_percent}%`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
