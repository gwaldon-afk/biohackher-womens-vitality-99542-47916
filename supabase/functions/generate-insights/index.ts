import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error("User not authenticated");

    const { timeframe = "week" } = await req.json();

    // Fetch user's data for the timeframe
    const startDate = new Date();
    if (timeframe === "week") startDate.setDate(startDate.getDate() - 7);
    else if (timeframe === "month") startDate.setMonth(startDate.getMonth() - 1);
    else if (timeframe === "quarter") startDate.setMonth(startDate.getMonth() - 3);

    // Get adherence data
    const { data: adherenceData } = await supabaseClient
      .from("protocol_adherence")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate.toISOString().split("T")[0]);

    // Get measurements
    const { data: measurements } = await supabaseClient
      .from("progress_measurements")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: false });

    // Get assessments
    const { data: assessments } = await supabaseClient
      .from("symptom_assessments")
      .select("*")
      .eq("user_id", user.id)
      .gte("completed_at", startDate.toISOString())
      .order("completed_at", { ascending: false });

    // Calculate stats
    const adherenceRate = adherenceData && adherenceData.length > 0
      ? Math.round((adherenceData.filter(a => a.completed).length / adherenceData.length) * 100)
      : 0;

    const latestMeasurement = measurements && measurements[0];
    const previousMeasurement = measurements && measurements[1];

    // Build context for AI
    const context = `
User Wellness Data (${timeframe}):

Protocol Adherence:
- Completion rate: ${adherenceRate}%
- Total tracked items: ${adherenceData?.length || 0}
- Completed: ${adherenceData?.filter(a => a.completed).length || 0}

Progress Measurements:
${latestMeasurement ? `
- Latest weight: ${latestMeasurement.weight || "N/A"} kg
- Body fat: ${latestMeasurement.body_fat_percentage || "N/A"}%
- Weight change: ${previousMeasurement && latestMeasurement.weight && previousMeasurement.weight 
  ? (latestMeasurement.weight - previousMeasurement.weight).toFixed(1) 
  : "N/A"} kg
` : "- No measurements recorded"}

Assessments:
- Total assessments: ${assessments?.length || 0}
${assessments && assessments.length > 0 ? `
- Latest score: ${assessments[0].overall_score}/100 (${assessments[0].symptom_type})
` : ""}

Based on this data, provide:
1. A brief analysis of their progress (2-3 sentences)
2. Three specific, actionable recommendations for improvement
3. One encouraging insight about their wellness journey

Be supportive, specific, and evidence-based.
`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a supportive wellness coach analyzing health data. Be encouraging, specific, and actionable."
          },
          {
            role: "user",
            content: context
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const insight = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({
        insight,
        stats: {
          adherenceRate,
          measurementCount: measurements?.length || 0,
          assessmentCount: assessments?.length || 0,
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
