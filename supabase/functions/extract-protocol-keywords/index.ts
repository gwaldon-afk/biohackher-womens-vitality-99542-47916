import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a health keyword extractor. Extract relevant health-related keywords from user queries.

RULES:
1. Extract symptoms (e.g., "can't sleep" → "sleep", "insomnia", "sleep_disruption")
2. Extract goals (e.g., "lose weight" → "weight", "metabolism", "body_composition")
3. Extract conditions (e.g., "perimenopause" → "perimenopause", "menopause", "hormones")
4. Extract therapies (e.g., "magnesium" → "magnesium", "supplement")
5. Return 3-8 keywords maximum
6. Include both specific terms and broader categories
7. Use underscores for compound terms (e.g., "sleep_disruption", "brain_fog")

Examples:
- "I can't sleep at night and wake up tired" → ["sleep", "insomnia", "sleep_disruption", "energy", "fatigue"]
- "Brain fog and trouble focusing" → ["brain_fog", "focus", "cognition", "mental_clarity"]
- "Hot flashes during perimenopause" → ["hot_flashes", "perimenopause", "menopause", "hormones", "temperature_regulation"]
- "Feeling stressed and anxious" → ["stress", "anxiety", "mental_health", "stress_management"]`;

    console.log("Extracting keywords from query:", query);

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
          { role: "user", content: query }
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_keywords",
            description: "Extract health-related keywords from user query",
            parameters: {
              type: "object",
              properties: {
                keywords: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of extracted keywords (3-8 items)"
                },
                primary_intent: {
                  type: "string",
                  description: "Primary health goal or symptom",
                  enum: ["sleep", "energy", "cognition", "stress", "hormones", "weight", "gut", "pain", "mood", "beauty", "general"]
                }
              },
              required: ["keywords", "primary_intent"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_keywords" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded", keywords: [query], primary_intent: "general" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required", keywords: [query], primary_intent: "general" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || !toolCall.function?.arguments) {
      console.error("No tool call in response:", data);
      // Fallback to simple keyword extraction
      return new Response(
        JSON.stringify({ keywords: [query], primary_intent: "general" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const extracted = JSON.parse(toolCall.function.arguments);
    console.log("Extracted keywords:", extracted);

    return new Response(
      JSON.stringify(extracted),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("extract-protocol-keywords error:", e);
    return new Response(
      JSON.stringify({ 
        error: e instanceof Error ? e.message : "Unknown error",
        keywords: [],
        primary_intent: "general"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
