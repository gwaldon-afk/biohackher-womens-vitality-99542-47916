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

    // Get last 30 days of data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Fetch all relevant data
    const [adherenceResult, measurementsResult, assessmentsResult, protocolsResult] = await Promise.all([
      supabaseClient
        .from("protocol_adherence")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate.toISOString().split("T")[0]),
      
      supabaseClient
        .from("progress_measurements")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: false }),
      
      supabaseClient
        .from("symptom_assessments")
        .select("*")
        .eq("user_id", user.id)
        .gte("completed_at", startDate.toISOString())
        .order("completed_at", { ascending: false }),
      
      supabaseClient
        .from("user_protocols")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
    ]);

    const adherenceData = adherenceResult.data || [];
    const measurements = measurementsResult.data || [];
    const assessments = assessmentsResult.data || [];
    const protocols = protocolsResult.data || [];

    // Calculate comprehensive stats
    const adherenceRate = adherenceData.length > 0
      ? Math.round((adherenceData.filter(a => a.completed).length / adherenceData.length) * 100)
      : 0;

    const latestMeasurement = measurements[0];
    const firstMeasurement = measurements[measurements.length - 1];

    const weightChange = latestMeasurement && firstMeasurement && latestMeasurement.weight && firstMeasurement.weight
      ? (latestMeasurement.weight - firstMeasurement.weight).toFixed(1)
      : null;

    // Build comprehensive report context
    const reportContext = `
Generate a comprehensive monthly wellness report for the user based on this data:

PROTOCOL ADHERENCE:
- Overall adherence rate: ${adherenceRate}%
- Days tracked: ${adherenceData.length}
- Items completed: ${adherenceData.filter(a => a.completed).length}
- Active protocols: ${protocols.length}

PROGRESS MEASUREMENTS (30 days):
${measurements.length > 0 ? `
- Weight change: ${weightChange ? weightChange + " kg" : "N/A"}
- Latest weight: ${latestMeasurement?.weight || "N/A"} kg
- Latest body fat: ${latestMeasurement?.body_fat_percentage || "N/A"}%
- Total measurements: ${measurements.length}
` : "- No measurements recorded this month"}

ASSESSMENTS:
- Total assessments completed: ${assessments.length}
${assessments.length > 0 ? `
- Latest assessment: ${assessments[0].symptom_type} (Score: ${assessments[0].overall_score}/100)
- Score trend: ${assessments.length > 1 ? 
  (assessments[0].overall_score - assessments[assessments.length - 1].overall_score > 0 ? "Improving" : "Declining") 
  : "N/A"}
` : ""}

Please generate a structured monthly report with:

1. EXECUTIVE SUMMARY (2-3 sentences)
   - Overall progress this month
   - Key achievement

2. ADHERENCE ANALYSIS
   - Commentary on ${adherenceRate}% adherence rate
   - What's working well
   - Areas for improvement

3. PHYSICAL PROGRESS
   - Analysis of measurement trends
   - Celebrate wins (even small ones)
   - Set realistic expectations

4. WELLNESS INSIGHTS
   - Assessment score analysis
   - Patterns observed
   - Health improvements noted

5. ACTIONABLE RECOMMENDATIONS (3-5 items)
   - Specific, achievable goals for next month
   - Protocol adjustments if needed
   - Motivation and encouragement

6. NEXT MONTH'S FOCUS
   - One primary goal
   - Why it matters
   - How to achieve it

Use encouraging language, be specific with numbers, and provide actionable advice. Format with clear sections and bullet points.
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
            content: "You are an expert wellness coach creating comprehensive monthly progress reports. Be encouraging, data-driven, and provide specific actionable advice."
          },
          {
            role: "user",
            content: reportContext
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
    const report = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({
        report,
        generatedAt: new Date().toISOString(),
        period: {
          start: startDate.toISOString().split("T")[0],
          end: new Date().toISOString().split("T")[0]
        },
        stats: {
          adherenceRate,
          measurementCount: measurements.length,
          assessmentCount: assessments.length,
          activeProtocols: protocols.length,
          weightChange
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating monthly report:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
