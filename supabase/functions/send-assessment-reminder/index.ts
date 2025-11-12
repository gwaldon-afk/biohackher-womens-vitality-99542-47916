import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UserWithAssessments {
  user_id: string;
  email: string;
  preferred_name: string;
  last_lis_date: string | null;
  last_hc_date: string | null;
  lis_overdue: boolean;
  hc_overdue: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Starting assessment reminder check...");

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch users who have email_assessment_reminders enabled
    const { data: preferences, error: prefsError } = await supabase
      .from("user_notification_preferences")
      .select("user_id")
      .eq("email_assessment_reminders", true);

    if (prefsError) {
      console.error("Error fetching preferences:", prefsError);
      throw prefsError;
    }

    if (!preferences || preferences.length === 0) {
      console.log("No users with assessment reminders enabled");
      return new Response(
        JSON.stringify({ message: "No users to notify" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userIds = preferences.map((p) => p.user_id);
    console.log(`Found ${userIds.length} users with reminders enabled`);

    // Fetch user profiles and assessment data
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, preferred_name, email")
      .in("user_id", userIds);

    if (profilesError) throw profilesError;

    const remindersSent: string[] = [];
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    for (const profile of profiles || []) {
      try {
        // Check last LIS assessment
        const { data: lisData } = await supabase
          .from("daily_scores")
          .select("created_at")
          .eq("user_id", profile.user_id)
          .eq("is_baseline", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Check last Hormone Compass assessment
        const { data: hcData } = await supabase
          .from("hormone_compass_stages")
          .select("calculated_at")
          .eq("user_id", profile.user_id)
          .order("calculated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const lisOverdue = !lisData || new Date(lisData.created_at) < threeMonthsAgo;
        const hcOverdue = !hcData || new Date(hcData.calculated_at) < sixMonthsAgo;

        // Send reminders for overdue assessments
        if (lisOverdue) {
          const lastDate = lisData ? new Date(lisData.created_at) : null;
          const monthsAgo = lastDate
            ? Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
            : null;

          await resend.emails.send({
            from: "BiohackHer <reminders@biohackher.com>",
            to: [profile.email],
            subject: "Time for Your LIS Reassessment",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                <div style="background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h2 style="color: #7c3aed; margin-bottom: 16px;">Hi ${profile.preferred_name || "there"},</h2>
                  
                  <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
                    It's time for your <strong>Longevity Impact Score (LIS)</strong> reassessment!
                  </p>
                  
                  ${lastDate ? `<p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                    You last completed this assessment ${monthsAgo} month${monthsAgo !== 1 ? 's' : ''} ago.
                  </p>` : ''}
                  
                  <div style="background-color: #f3f4f6; border-left: 4px solid #7c3aed; padding: 16px; margin: 24px 0;">
                    <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">Why reassess?</h3>
                    <ul style="color: #4b5563; margin: 8px 0; padding-left: 20px;">
                      <li style="margin-bottom: 8px;">Track your health progress over time</li>
                      <li style="margin-bottom: 8px;">Identify new areas of improvement</li>
                      <li style="margin-bottom: 8px;">Adjust your protocol based on changes</li>
                      <li>Measure the impact of your longevity efforts</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${supabaseUrl.replace('https://', 'https://app.')}/guest-lis-assessment" 
                       style="display: inline-block; background-color: #7c3aed; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Take Assessment Now
                    </a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    Don't want these reminders? 
                    <a href="${supabaseUrl.replace('https://', 'https://app.')}/settings?tab=notifications" style="color: #7c3aed; text-decoration: none;">
                      Update your preferences
                    </a>
                  </p>
                </div>
              </div>
            `,
          });

          remindersSent.push(`LIS: ${profile.email}`);
          
          // Log notification
          await supabase.from("notification_log").insert({
            user_id: profile.user_id,
            notification_type: "lis_assessment_reminder",
            channel: "email",
            status: "sent",
            metadata: { months_overdue: monthsAgo },
          });

          console.log(`Sent LIS reminder to ${profile.email}`);
        }

        if (hcOverdue) {
          const lastDate = hcData ? new Date(hcData.calculated_at) : null;
          const monthsAgo = lastDate
            ? Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
            : null;

          await resend.emails.send({
            from: "BiohackHer <reminders@biohackher.com>",
            to: [profile.email],
            subject: "Time for Your Hormone Compass Reassessment",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                <div style="background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h2 style="color: #9333ea; margin-bottom: 16px;">Hi ${profile.preferred_name || "there"},</h2>
                  
                  <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
                    It's time for your <strong>Hormone Compass</strong> reassessment!
                  </p>
                  
                  ${lastDate ? `<p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                    You last completed this assessment ${monthsAgo} month${monthsAgo !== 1 ? 's' : ''} ago.
                  </p>` : ''}
                  
                  <div style="background-color: #faf5ff; border-left: 4px solid #9333ea; padding: 16px; margin: 24px 0;">
                    <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">Why reassess?</h3>
                    <ul style="color: #4b5563; margin: 8px 0; padding-left: 20px;">
                      <li style="margin-bottom: 8px;">Monitor hormone health changes</li>
                      <li style="margin-bottom: 8px;">Track symptom patterns over time</li>
                      <li style="margin-bottom: 8px;">Update your personalized recommendations</li>
                      <li>Stay proactive about your health</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${supabaseUrl.replace('https://', 'https://app.')}/hormone-compass/assessment" 
                       style="display: inline-block; background-color: #9333ea; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Take Assessment Now
                    </a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    Don't want these reminders? 
                    <a href="${supabaseUrl.replace('https://', 'https://app.')}/settings?tab=notifications" style="color: #9333ea; text-decoration: none;">
                      Update your preferences
                    </a>
                  </p>
                </div>
              </div>
            `,
          });

          remindersSent.push(`HC: ${profile.email}`);
          
          // Log notification
          await supabase.from("notification_log").insert({
            user_id: profile.user_id,
            notification_type: "hormone_compass_assessment_reminder",
            channel: "email",
            status: "sent",
            metadata: { months_overdue: monthsAgo },
          });

          console.log(`Sent Hormone Compass reminder to ${profile.email}`);
        }
      } catch (error) {
        console.error(`Error processing user ${profile.user_id}:`, error);
      }
    }

    console.log(`Assessment reminders sent: ${remindersSent.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: remindersSent.length,
        details: remindersSent,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-assessment-reminder function:", error);
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
