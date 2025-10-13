import { supabase } from "@/integrations/supabase/client";
import { researchEvidence } from "@/data/researchEvidence";

export const importResearchToDatabase = async () => {
  try {
    console.log("Starting research import...");
    
    // Flatten research data into individual study records
    const studyRecords = [];
    
    // Map study types to database-allowed values
    const studyTypeMap: Record<string, string> = {
      'rct': 'rct',
      'meta-analysis': 'meta-analysis',
      'cohort': 'cohort',
      'case-control': 'case-control',
      'review': 'review',
      'systematic review': 'review',
      'observational': 'other'
    };

    for (const intervention of researchEvidence) {
      for (const study of intervention.studies) {
        const studyTypeLower = study.studyType.toLowerCase();
        const mappedStudyType = studyTypeMap[studyTypeLower] || 'other';
        
        studyRecords.push({
          title: study.title,
          authors: `Study from ${intervention.intervention}`, // Placeholder since we don't have separate authors field
          journal: study.journal,
          year: study.year,
          doi: study.doi || null,
          url: study.url,
          abstract: study.keyFindings || null,
          study_type: mappedStudyType,
          evidence_level: study.evidenceLevel.toLowerCase(),
          sample_size: study.sampleSize || null,
          key_findings: study.keyFindings ? [study.keyFindings] : null,
          related_pillars: [intervention.pillar],
          is_active: true,
        });
      }
    }
    
    console.log(`Preparing to import ${studyRecords.length} research studies...`);
    
    // Check if studies already exist
    const { count } = await supabase
      .from('research_studies')
      .select('*', { count: 'exact', head: true });
    
    if (count && count > 0) {
      console.log(`Database already contains ${count} studies. Skipping import.`);
      return {
        success: true,
        message: `Database already contains ${count} studies`,
        skipped: true,
        count: count
      };
    }
    
    // Insert in batches of 50 to avoid timeout
    const batchSize = 50;
    let imported = 0;
    const errors = [];
    
    for (let i = 0; i < studyRecords.length; i += batchSize) {
      const batch = studyRecords.slice(i, i + batchSize);
      const { error } = await supabase
        .from('research_studies')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
        errors.push(error);
      } else {
        imported += batch.length;
        console.log(`Imported ${imported}/${studyRecords.length} studies`);
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Failed to import some studies: ${errors.map(e => e.message).join(', ')}`);
    }
    
    return {
      success: true,
      message: `Successfully imported ${studyRecords.length} research studies`,
      count: studyRecords.length
    };
    
  } catch (error) {
    console.error('Error importing research:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      count: 0
    };
  }
};
