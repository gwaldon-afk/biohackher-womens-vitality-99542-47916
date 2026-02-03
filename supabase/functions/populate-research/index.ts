import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Known interventions organized by pillar
const INTERVENTIONS = [
  // BRAIN
  { name: "Omega-3 fatty acids", pillar: "brain", category: "supplements" },
  { name: "Lion's Mane mushroom", pillar: "brain", category: "supplements" },
  { name: "Bacopa monnieri", pillar: "brain", category: "supplements" },
  { name: "Phosphatidylserine", pillar: "brain", category: "supplements" },
  { name: "Meditation cognitive function", pillar: "brain", category: "lifestyle" },
  { name: "Aerobic exercise brain health", pillar: "brain", category: "lifestyle" },
  
  // BODY
  { name: "Creatine women", pillar: "body", category: "supplements" },
  { name: "Vitamin D3 women health", pillar: "body", category: "supplements" },
  { name: "Magnesium glycinate", pillar: "body", category: "supplements" },
  { name: "Collagen peptides", pillar: "body", category: "supplements" },
  { name: "Resistance training women", pillar: "body", category: "lifestyle" },
  { name: "Protein intake women muscle", pillar: "body", category: "nutrition" },
  
  // BEAUTY
  { name: "Hyaluronic acid skin", pillar: "beauty", category: "supplements" },
  { name: "Vitamin C collagen synthesis", pillar: "beauty", category: "supplements" },
  { name: "Astaxanthin skin", pillar: "beauty", category: "supplements" },
  { name: "Biotin hair growth", pillar: "beauty", category: "supplements" },
  { name: "Red light therapy skin", pillar: "beauty", category: "lifestyle" },
  
  // BALANCE
  { name: "Ashwagandha cortisol women", pillar: "balance", category: "supplements" },
  { name: "Rhodiola rosea stress", pillar: "balance", category: "supplements" },
  { name: "Maca root hormone balance", pillar: "balance", category: "supplements" },
  { name: "Magnesium sleep quality", pillar: "balance", category: "supplements" },
  { name: "L-theanine anxiety", pillar: "balance", category: "supplements" },
  { name: "Melatonin sleep women", pillar: "balance", category: "supplements" },
  { name: "Black cohosh menopause", pillar: "balance", category: "supplements" },
  { name: "Evening primrose oil", pillar: "balance", category: "supplements" },
  { name: "Vitex agnus-castus hormone", pillar: "balance", category: "supplements" },
  
  // Additional women's health specific
  { name: "Iron supplementation women", pillar: "body", category: "supplements" },
  { name: "Folate women health", pillar: "body", category: "supplements" },
  { name: "Probiotics gut health women", pillar: "body", category: "supplements" },
  { name: "Turmeric curcumin inflammation", pillar: "body", category: "supplements" },
  { name: "CoQ10 energy mitochondria", pillar: "body", category: "supplements" },
  { name: "NAD+ longevity", pillar: "body", category: "supplements" },
  { name: "Resveratrol longevity", pillar: "body", category: "supplements" },
  { name: "Intermittent fasting women", pillar: "body", category: "lifestyle" },
  { name: "Cold exposure therapy", pillar: "body", category: "lifestyle" },
  { name: "Sauna cardiovascular health", pillar: "body", category: "lifestyle" },
];

// Rate limiter for NCBI API (3 requests per second)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
}

async function searchPubMed(query: string, maxResults: number = 5): Promise<string[]> {
  const baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  const searchUrl = `${baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=relevance`;
  
  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    return data.esearchresult?.idlist || [];
  } catch (error) {
    console.error(`Error searching PubMed for "${query}":`, error);
    return [];
  }
}

async function fetchPubMedDetails(pmids: string[]): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];
  
  const baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  const fetchUrl = `${baseUrl}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
  
  try {
    const response = await fetch(fetchUrl);
    const xmlText = await response.text();
    
    // Parse XML to extract article details
    const articles: PubMedArticle[] = [];
    
    // Simple XML parsing for PubMed data
    const articleMatches = xmlText.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];
    
    for (const articleXml of articleMatches) {
      const pmidMatch = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/);
      const titleMatch = articleXml.match(/<ArticleTitle>([^<]+)<\/ArticleTitle>/);
      const abstractMatch = articleXml.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/);
      const journalMatch = articleXml.match(/<Title>([^<]+)<\/Title>/);
      const yearMatch = articleXml.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/);
      const doiMatch = articleXml.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/);
      
      // Extract authors
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

async function generateAISummary(article: PubMedArticle, intervention: string): Promise<string> {
  // Use BiohackHer AI gateway for summaries
  const gatewayUrl = Deno.env.get('LOVABLE_API_URL') || 'https://api.lovable.dev';
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!apiKey) {
    // Fallback: generate a simple summary from abstract
    const abstract = article.abstract || '';
    if (abstract.length > 200) {
      return abstract.substring(0, 250) + '...';
    }
    return abstract || `Study examining ${intervention} published in ${article.journal}.`;
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
            content: 'You are a research summarizer. Generate a 2-3 sentence plain-language summary of this study that highlights the key finding and its relevance to women\'s health. Be concise and actionable.'
          },
          {
            role: 'user',
            content: `Summarize this study about ${intervention}:\n\nTitle: ${article.title}\n\nAbstract: ${article.abstract}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || article.abstract?.substring(0, 250) + '...' || '';
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return article.abstract?.substring(0, 250) + '...' || `Study examining ${intervention}.`;
  }
}

function determineEvidenceLevel(article: PubMedArticle): string {
  const title = article.title.toLowerCase();
  const abstract = (article.abstract || '').toLowerCase();
  
  if (title.includes('meta-analysis') || abstract.includes('meta-analysis')) return 'gold';
  if (title.includes('systematic review') || abstract.includes('systematic review')) return 'gold';
  if (title.includes('randomized') || abstract.includes('randomized controlled trial')) return 'gold';
  if (title.includes('double-blind') || abstract.includes('double-blind')) return 'gold';
  if (title.includes('cohort') || abstract.includes('cohort study')) return 'silver';
  if (title.includes('clinical trial') || abstract.includes('clinical trial')) return 'silver';
  return 'bronze';
}

function determineStudyType(article: PubMedArticle): string {
  const title = article.title.toLowerCase();
  const abstract = (article.abstract || '').toLowerCase();
  
  if (title.includes('meta-analysis') || abstract.includes('meta-analysis')) return 'meta-analysis';
  if (title.includes('systematic review')) return 'review';
  if (title.includes('randomized') || abstract.includes('randomized controlled')) return 'rct';
  if (title.includes('cohort')) return 'cohort';
  if (title.includes('case-control')) return 'case-control';
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
    
    const { interventions: customInterventions, limit = 5 } = await req.json().catch(() => ({}));
    
    const interventionsToProcess = customInterventions || INTERVENTIONS;
    const results = {
      processed: 0,
      inserted: 0,
      skipped: 0,
      errors: [] as string[],
    };
    
    console.log(`Starting batch import for ${interventionsToProcess.length} interventions...`);
    
    for (const intervention of interventionsToProcess) {
      try {
        console.log(`Processing: ${intervention.name}`);
        
        // Search PubMed for this intervention
        const pmids = await searchPubMed(intervention.name, limit);
        await delay(400); // Rate limiting
        
        if (pmids.length === 0) {
          console.log(`No results found for: ${intervention.name}`);
          results.processed++;
          continue;
        }
        
        // Fetch article details
        const articles = await fetchPubMedDetails(pmids);
        await delay(400); // Rate limiting
        
        for (const article of articles) {
          // Check if already exists
          const { data: existing } = await supabase
            .from('research_studies')
            .select('id')
            .eq('pmid', article.pmid)
            .single();
          
          if (existing) {
            results.skipped++;
            continue;
          }
          
          // Generate AI summary
          const aiSummary = await generateAISummary(article, intervention.name);
          await delay(200); // Rate limiting for AI calls
          
          // Insert into database
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
              intervention_name: intervention.name,
              pillar: intervention.pillar,
              category: intervention.category,
              evidence_level: determineEvidenceLevel(article),
              study_type: determineStudyType(article),
              source: 'pubmed_batch',
              last_synced_at: new Date().toISOString(),
              is_active: true,
              related_pillars: [intervention.pillar],
            });
          
          if (error) {
            console.error(`Error inserting study ${article.pmid}:`, error);
            results.errors.push(`${article.pmid}: ${error.message}`);
          } else {
            results.inserted++;
          }
        }
        
        results.processed++;
        
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing ${intervention.name}:`, error);
        results.errors.push(`${intervention.name}: ${errorMessage}`);
        results.processed++;
      }
    }
    
    console.log(`Batch import complete:`, results);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${results.processed} interventions, inserted ${results.inserted} studies, skipped ${results.skipped} duplicates`,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in populate-research:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
