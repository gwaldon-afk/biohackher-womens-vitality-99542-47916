import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { researchEvidence } from '../../../src/data/researchEvidence.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Flatten research data into individual study records
    const studyRecords = [];
    
    for (const intervention of researchEvidence) {
      for (const study of intervention.studies) {
        studyRecords.push({
          title: study.title,
          authors: study.journal, // Using journal as authors placeholder since we don't have separate authors
          journal: study.journal,
          year: study.year,
          doi: study.doi || null,
          url: study.url,
          abstract: study.keyFindings || null,
          study_type: study.studyType.toLowerCase().replace('-', '_'),
          evidence_level: study.evidenceLevel.toLowerCase(),
          sample_size: study.sampleSize || null,
          key_findings: study.keyFindings ? [study.keyFindings] : null,
          related_pillars: [intervention.pillar],
          target_symptoms: null,
          target_assessment_types: null,
          is_active: true,
          display_order: null
        });
      }
    }
    
    console.log(`Importing ${studyRecords.length} research studies...`);
    
    // Insert in batches of 50
    const batchSize = 50;
    let imported = 0;
    
    for (let i = 0; i < studyRecords.length; i += batchSize) {
      const batch = studyRecords.slice(i, i + batchSize);
      const { error } = await supabase
        .from('research_studies')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      }
      imported += batch.length;
      console.log(`Imported ${imported}/${studyRecords.length} studies`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${studyRecords.length} research studies`,
        count: studyRecords.length
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
