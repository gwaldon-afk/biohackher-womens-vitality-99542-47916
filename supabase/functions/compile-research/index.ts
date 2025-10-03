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
    const { interventionType, interventionName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log(`Searching research for: ${interventionType} - ${interventionName}`);

    const prompt = `Search PubMed for peer-reviewed research on "${interventionName}" related to longevity, health optimization, and evidence-based interventions.

Focus on:
1. Meta-analyses and systematic reviews (highest priority)
2. Randomized controlled trials (RCTs) from 2015 onwards
3. Large cohort studies with robust methodology
4. Most highly-cited papers in the field

For each study found, extract:
- Full title
- Journal name
- Publication year
- DOI (Digital Object Identifier)
- PubMed ID (PMID) if available
- Study type (Meta-analysis, RCT, Cohort Study, Systematic Review, Observational)
- Sample size (number of participants)
- Key findings relevant to longevity/health outcomes
- Evidence level classification (Gold: Multiple RCTs/Meta-analyses, Silver: Multiple observational studies/some RCTs, Bronze: Preliminary research/mechanistic studies)

Return ONLY the 5 most relevant, highest-quality studies. Prioritize studies with DOI links and PMID numbers.

Format as JSON array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are a medical research expert specializing in longevity science. Extract accurate, verifiable research data from PubMed. Always provide DOI and PMID when available. Format responses as valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from the AI
    let studies;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      studies = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse research data");
    }

    console.log(`Found ${studies.length} studies for ${interventionName}`);

    return new Response(
      JSON.stringify({
        intervention: interventionName,
        interventionType,
        studies,
        compiledAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in compile-research:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
