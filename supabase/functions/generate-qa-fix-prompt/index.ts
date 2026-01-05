import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BugItem {
  category: string;
  item: string;
  path?: string;
  notes: string;
  status: 'fail' | 'review';
  lastTested: string | null;
}

interface RequestBody {
  bugs: BugItem[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bugs }: RequestBody = await req.json();

    if (!bugs || bugs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No bugs provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating fix prompt for ${bugs.length} issues`);

    const failures = bugs.filter(b => b.status === 'fail');
    const reviews = bugs.filter(b => b.status === 'review');

    // Group by category
    const groupByCategory = (items: BugItem[]) => {
      const grouped: Record<string, BugItem[]> = {};
      items.forEach(item => {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }
        grouped[item.category].push(item);
      });
      return grouped;
    };

    const failuresByCategory = groupByCategory(failures);
    const reviewsByCategory = groupByCategory(reviews);

    // Generate the structured prompt
    let prompt = `## Bug Fix Request for Biohackher

The following issues were identified during QA testing and need to be fixed:

---

`;

    if (failures.length > 0) {
      prompt += `### 🔴 Critical Failures (${failures.length})\n\n`;
      prompt += `These items are marked as FAILED and require immediate attention:\n\n`;

      Object.entries(failuresByCategory).forEach(([category, items]) => {
        prompt += `#### ${category}\n\n`;
        items.forEach(item => {
          prompt += `**${item.item}**\n`;
          if (item.path) prompt += `- Path/Name: \`${item.path}\`\n`;
          if (item.notes) prompt += `- Issue Description: ${item.notes}\n`;
          if (item.lastTested) {
            prompt += `- Last Tested: ${new Date(item.lastTested).toLocaleString()}\n`;
          }
          prompt += '\n';
        });
      });
    }

    if (reviews.length > 0) {
      prompt += `### 🟡 Items Needing Review (${reviews.length})\n\n`;
      prompt += `These items need investigation and may require fixes:\n\n`;

      Object.entries(reviewsByCategory).forEach(([category, items]) => {
        prompt += `#### ${category}\n\n`;
        items.forEach(item => {
          prompt += `**${item.item}**\n`;
          if (item.path) prompt += `- Path/Name: \`${item.path}\`\n`;
          if (item.notes) prompt += `- Concern: ${item.notes}\n`;
          if (item.lastTested) {
            prompt += `- Last Tested: ${new Date(item.lastTested).toLocaleString()}\n`;
          }
          prompt += '\n';
        });
      });
    }

    prompt += `---

## Instructions for Fixing

For each issue above, please:

1. **Investigate the root cause** - Look at the relevant code and identify what's causing the problem
2. **Implement the fix** - Make the necessary code changes to resolve the issue
3. **Verify the fix** - Explain what was changed and how it resolves the problem

### Priority Order

1. Fix all Critical Failures first (marked with 🔴)
2. Then address Review items (marked with 🟡)

### Additional Context

- This is a React/TypeScript application using Vite, Tailwind CSS, and shadcn/ui
- Backend uses Supabase with Edge Functions
- The app uses react-i18next for internationalization (all 4 locale files must be updated)
- Follow existing code patterns and design system

Please start fixing these issues one by one, starting with the most critical.`;

    console.log('Generated fix prompt successfully');

    return new Response(
      JSON.stringify({ prompt }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error generating fix prompt:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
