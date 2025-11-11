import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  recipientEmail: string;
  score: number;
  pillarScores: Record<string, number>;
  bioAge?: number;
  chronologicalAge?: number;
  isGuest: boolean;
  shareMessage?: string;
  userId?: string;
}

const getScoreCategory = (score: number): string => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Attention";
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case "Excellent": return "#10b981";
    case "Good": return "#3b82f6";
    case "Fair": return "#f59e0b";
    default: return "#ef4444";
  }
};

const generateEmailHTML = ({
  score,
  pillarScores,
  bioAge,
  chronologicalAge,
  shareLink,
  isGuest,
  shareMessage,
}: Omit<EmailRequest, "recipientEmail" | "userId"> & { shareLink: string }) => {
  const category = getScoreCategory(score);
  const categoryColor = getCategoryColor(category);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .header p { margin: 16px 0 0 0; font-size: 14px; opacity: 0.95; }
          .score-card { background: white; padding: 30px 20px; margin: 0; }
          .score-display { text-align: center; margin-bottom: 30px; }
          .score-number { font-size: 72px; font-weight: bold; color: ${categoryColor}; margin: 0; line-height: 1; }
          .category-badge { background: ${categoryColor}; color: white; display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin-top: 10px; font-size: 14px; }
          .bio-age-box { text-align: center; margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px; }
          .bio-age-label { margin: 0; font-size: 14px; color: #6b7280; }
          .bio-age-number { margin: 8px 0 0 0; font-size: 36px; font-weight: bold; color: #111827; }
          .bio-age-compare { margin: 4px 0 0 0; font-size: 14px; color: #6b7280; }
          .pillars-section h3 { margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #111827; }
          .pillar-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
          .pillar-row:last-child { border-bottom: none; }
          .pillar-name { text-transform: capitalize; font-weight: 500; color: #374151; }
          .pillar-score { font-weight: 600; }
          .cta-section { text-align: center; margin: 40px 20px; }
          .cta-button { background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; }
          .info-box { text-align: center; margin: 30px 20px; padding: 20px; background: #f9fafb; border-radius: 8px; }
          .info-box p { margin: 0 0 10px 0; font-size: 14px; color: #6b7280; line-height: 1.6; }
          .info-box a { color: #667eea; text-decoration: none; font-weight: 600; }
          .footer { text-align: center; margin: 40px 20px 20px 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          .footer p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Longevity Impact Score Results</h1>
            ${shareMessage ? `<p>"${shareMessage}"</p>` : ''}
          </div>
          
          <div class="score-card">
            <div class="score-display">
              <p class="score-number">${score}</p>
              <span class="category-badge">${category}</span>
            </div>
            
            ${bioAge ? `
            <div class="bio-age-box">
              <p class="bio-age-label">Biological Age</p>
              <p class="bio-age-number">${bioAge}</p>
              <p class="bio-age-compare">vs ${chronologicalAge} chronological years</p>
            </div>
            ` : ''}
            
            <div class="pillars-section">
              <h3>Your Health Pillars</h3>
              ${Object.entries(pillarScores).map(([pillar, value]) => {
                const pillarCategory = getScoreCategory(value);
                const pillarColor = getCategoryColor(pillarCategory);
                return `
                  <div class="pillar-row">
                    <span class="pillar-name">${pillar}</span>
                    <span class="pillar-score" style="color: ${pillarColor};">${value}/100</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          <div class="cta-section">
            <a href="${shareLink}" class="cta-button">
              ${isGuest ? 'Create Free Account & Unlock Your Protocol' : 'View Full Results & Personalized Protocol'}
            </a>
          </div>
          
          <div class="info-box">
            <p>
              Want to improve your longevity score? Get your personalized protocol, track daily progress, and access AI-powered health insights.
            </p>
            <a href="${shareLink}">Learn more →</a>
          </div>
          
          <div class="footer">
            <p>This report was generated by your Women's Longevity Optimization Platform</p>
            <p>Hormone Health at Every Stage</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      recipientEmail,
      score,
      pillarScores,
      bioAge,
      chronologicalAge,
      isGuest,
      shareMessage,
      userId,
    }: EmailRequest = await req.json();

    // Validate required fields
    if (!recipientEmail || score === undefined || !pillarScores) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate share link
    const baseUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "") || "";
    const appUrl = baseUrl.replace("https://", "https://").replace("ictdgxsynjnmsevcegvu", "lovable.app");
    const pillarScoresParam = encodeURIComponent(JSON.stringify(pillarScores));
    const shareLink = `${appUrl}/lis-results?score=${score}&pillarScores=${pillarScoresParam}${chronologicalAge ? `&age=${chronologicalAge}` : ''}${userId ? `&referrer=${userId}` : ''}&shared=true`;

    // Generate email HTML
    const html = generateEmailHTML({
      score,
      pillarScores,
      bioAge,
      chronologicalAge,
      shareLink,
      isGuest,
      shareMessage,
    });

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Longevity Platform <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Your Longevity Impact Score Results - ${score}/100`,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log to database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("email_shares").insert({
      user_id: userId || null,
      recipient_email: recipientEmail,
      share_type: "self",
      assessment_type: "lis",
      score,
      share_source: isGuest ? "guest_results" : "authenticated_results",
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-lis-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
