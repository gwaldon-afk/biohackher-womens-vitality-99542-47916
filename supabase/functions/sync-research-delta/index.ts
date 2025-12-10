import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function searchPubMedSinceDate(query: string, minDate: string, maxResults: number = 5): Promise<string[]> {
  const baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  // Format date as YYYY/MM/DD for PubMed
  const formattedDate = minDate.replace(/-/g, '/');
  const searchUrl = `${baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&mindate=${formattedDate}&datetype=pdat&retmax=${maxResults}&retmode=json&sort=date`;
  
  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    return data.esearchresult?.idlist || [];
  } catch (error) {
    console.error(`Error searching PubMed for "${query}":`, error);
    return [];
  }
}

async function fetchPubMedDetails(pmids: string[]): Promise<any[]> {
  if (pmids.length === 0) return [];
  
  const baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  const fetchUrl = `${baseUrl}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
  
  try {
    const response = await fetch(fetchUrl);
    const xmlText = await response.text();
    
    const articles: any[] = [];
    const articleMatches = xmlText.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];
    
    for (const articleXml of articleMatches) {
      const pmidMatch = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/);
      const titleMatch = articleXml.match(/<ArticleTitle>([^<]+)<\/ArticleTitle>/);
      const abstractMatch = articleXml.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/);
      const journalMatch = articleXml.match(/<Title>([^<]+)<\/Title>/);
      const yearMatch = articleXml.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/);
      const doiMatch = articleXml.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/);
      
      const authorMatches = articleXml.match(/<LastName>([^<]+)<\/LastName>/g) || [];
      const authors = authorMatches.slice(0, 3).map(a => a.replace(/<\/?LastName>/g, '')).join(', ');
      
      if (pmidMatch && titleMatch) {
        articles.push({
          pmid: pmidMatch[1],
          title: titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
          abstract: abstractMatch ? abstractMatch[1].replace(/<[^>]+>/g, '').trim() : '',
          authors: authors || 'Various Authors',
          journal: journalMatch ? journalMatch[1] : 'PubMed',
          year: yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear(),
          doi: doiMatch ? doiMatch[1] : undefined,
        });
      }
    }
    
    return articles;
  } catch (error) {
    console.error('Error fetching PubMed details:', error);
    return [];
  }
}

async function generateAISummary(article: any, intervention: string): Promise<string> {
  const gatewayUrl = Deno.env.get('LOVABLE_API_URL') || 'https://api.lovable.dev';
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!apiKey) {
    const abstract = article.abstract || '';
    return abstract.length > 200 ? abstract.substring(0, 250) + '...' : abstract || `Study examining ${intervention}.`;
  }
  
  try {
    const response = await fetch(`${gatewayUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Generate a 2-3 sentence plain-language summary highlighting the key finding and relevance to women\'s health.'
          },
          {
            role: 'user',
            content: `Summarize: ${article.title}\n\n${article.abstract}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || article.abstract?.substring(0, 250) + '...' || '';
  } catch (error) {
    return article.abstract?.substring(0, 250) + '...' || `Study examining ${intervention}.`;
  }
}

function determineEvidenceLevel(article: any): string {
  const text = (article.title + ' ' + (article.abstract || '')).toLowerCase();
  if (text.includes('meta-analysis') || text.includes('systematic review') || text.includes('randomized controlled')) return 'gold';
  if (text.includes('cohort') || text.includes('clinical trial')) return 'silver';
  return 'bronze';
}

function determineStudyType(article: any): string {
  const text = (article.title + ' ' + (article.abstract || '')).toLowerCase();
  if (text.includes('meta-analysis')) return 'meta-analysis';
  if (text.includes('systematic review')) return 'review';
  if (text.includes('randomized')) return 'rct';
  if (text.includes('cohort')) return 'cohort';
  return 'other';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get unique interventions from existing studies
    const { data: interventions, error: fetchError } = await supabase
      .from('research_studies')
      .select('intervention_name, pillar, category, last_synced_at')
      .not('intervention_name', 'is', null)
      .order('last_synced_at', { ascending: true });
    
    if (fetchError) throw fetchError;
    
    // Group by intervention and get oldest sync date
    const interventionMap = new Map<string, { pillar: string; category: string; lastSync: string }>();
    for (const row of interventions || []) {
      if (row.intervention_name && !interventionMap.has(row.intervention_name)) {
        interventionMap.set(row.intervention_name, {
          pillar: row.pillar || 'body',
          category: row.category || 'supplements',
          lastSync: row.last_synced_at || '2020-01-01',
        });
      }
    }
    
    const results = { processed: 0, newStudies: 0, errors: [] as string[] };
    
    console.log(`Delta sync starting for ${interventionMap.size} interventions...`);
    
    for (const [interventionName, info] of interventionMap) {
      try {
        // Get last sync date for this intervention
        const lastSyncDate = info.lastSync.split('T')[0];
        
        // Search for new studies since last sync
        const pmids = await searchPubMedSinceDate(interventionName, lastSyncDate, 3);
        await delay(400);
        
        if (pmids.length === 0) {
          results.processed++;
          continue;
        }
        
        // Check which PMIDs are new
        const { data: existingStudies } = await supabase
          .from('research_studies')
          .select('pmid')
          .in('pmid', pmids);
        
        const existingPmids = new Set((existingStudies || []).map(s => s.pmid));
        const newPmids = pmids.filter(p => !existingPmids.has(p));
        
        if (newPmids.length === 0) {
          results.processed++;
          continue;
        }
        
        // Fetch and insert new studies
        const articles = await fetchPubMedDetails(newPmids);
        await delay(400);
        
        for (const article of articles) {
          const aiSummary = await generateAISummary(article, interventionName);
          await delay(200);
          
          const { error } = await supabase
            .from('research_studies')
            .insert({
              pmid: article.pmid,
              title: article.title,
              authors: article.authors,
              journal: article.journal,
              year: article.year,
              doi: article.doi,
              url: `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
              abstract: article.abstract,
              raw_abstract: article.abstract,
              ai_summary: aiSummary,
              intervention_name: interventionName,
              pillar: info.pillar,
              category: info.category,
              evidence_level: determineEvidenceLevel(article),
              study_type: determineStudyType(article),
              source: 'pubmed_delta',
              last_synced_at: new Date().toISOString(),
              is_active: true,
              related_pillars: [info.pillar],
            });
          
          if (!error) results.newStudies++;
        }
        
        // Update last_synced_at for all studies of this intervention
        await supabase
          .from('research_studies')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('intervention_name', interventionName);
        
        results.processed++;
        
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`${interventionName}: ${errorMessage}`);
        results.processed++;
      }
    }
    
    console.log(`Delta sync complete:`, results);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${results.processed} interventions, found ${results.newStudies} new studies`,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in sync-research-delta:', error);
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
