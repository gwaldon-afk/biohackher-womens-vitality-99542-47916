export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assessment_question_options: {
        Row: {
          created_at: string | null
          id: string
          option_order: number
          option_text: string
          question_id: string
          score_value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_order: number
          option_text: string
          question_id: string
          score_value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          option_order?: number
          option_text?: string
          question_id?: string
          score_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessment_question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          assessment_id: string
          category: string | null
          created_at: string | null
          id: string
          question_order: number
          question_text: string
        }
        Insert: {
          assessment_id: string
          category?: string | null
          created_at?: string | null
          id?: string
          question_order: number
          question_text: string
        }
        Update: {
          assessment_id?: string
          category?: string | null
          created_at?: string | null
          id?: string
          question_order?: number
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          created_at: string | null
          description: string
          id: string
          journey_path: string | null
          name: string
          pillar: string
          scoring_guidance: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id: string
          journey_path?: string | null
          name: string
          pillar: string
          scoring_guidance: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          journey_path?: string | null
          name?: string
          pillar?: string
          scoring_guidance?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_scores: {
        Row: {
          biological_age_impact: number
          cognitive_engagement_score: number | null
          color_code: string
          created_at: string
          date: string
          id: string
          longevity_impact_score: number
          nutrition_score: number | null
          physical_activity_score: number | null
          sleep_score: number | null
          social_connections_score: number | null
          stress_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          biological_age_impact: number
          cognitive_engagement_score?: number | null
          color_code: string
          created_at?: string
          date: string
          id?: string
          longevity_impact_score: number
          nutrition_score?: number | null
          physical_activity_score?: number | null
          sleep_score?: number | null
          social_connections_score?: number | null
          stress_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          biological_age_impact?: number
          cognitive_engagement_score?: number | null
          color_code?: string
          created_at?: string
          date?: string
          id?: string
          longevity_impact_score?: number
          nutrition_score?: number | null
          physical_activity_score?: number | null
          sleep_score?: number | null
          social_connections_score?: number | null
          stress_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      goal_check_ins: {
        Row: {
          adjustments_needed: string | null
          ai_coaching_suggestions: string | null
          barriers_encountered: string[] | null
          check_in_date: string
          confidence_level: number | null
          created_at: string | null
          external_biomarkers: Json | null
          goal_id: string
          id: string
          lis_impact: Json | null
          metrics_achieved: number
          motivation_level: number | null
          progress_percentage: number | null
          self_reported_metrics: Json | null
          total_metrics: number
          updated_at: string | null
          user_id: string
          whats_not_working: string | null
          whats_working: string | null
        }
        Insert: {
          adjustments_needed?: string | null
          ai_coaching_suggestions?: string | null
          barriers_encountered?: string[] | null
          check_in_date?: string
          confidence_level?: number | null
          created_at?: string | null
          external_biomarkers?: Json | null
          goal_id: string
          id?: string
          lis_impact?: Json | null
          metrics_achieved?: number
          motivation_level?: number | null
          progress_percentage?: number | null
          self_reported_metrics?: Json | null
          total_metrics: number
          updated_at?: string | null
          user_id: string
          whats_not_working?: string | null
          whats_working?: string | null
        }
        Update: {
          adjustments_needed?: string | null
          ai_coaching_suggestions?: string | null
          barriers_encountered?: string[] | null
          check_in_date?: string
          confidence_level?: number | null
          created_at?: string | null
          external_biomarkers?: Json | null
          goal_id?: string
          id?: string
          lis_impact?: Json | null
          metrics_achieved?: number
          motivation_level?: number | null
          progress_percentage?: number | null
          self_reported_metrics?: Json | null
          total_metrics?: number
          updated_at?: string | null
          user_id?: string
          whats_not_working?: string | null
          whats_working?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_check_ins_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_health_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_insights: {
        Row: {
          acknowledged: boolean | null
          action_suggestions: Json | null
          created_at: string | null
          description: string
          dismissed_at: string | null
          goal_id: string | null
          id: string
          insight_type: string
          severity: string | null
          title: string
          trigger_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          action_suggestions?: Json | null
          created_at?: string | null
          description: string
          dismissed_at?: string | null
          goal_id?: string | null
          id?: string
          insight_type: string
          severity?: string | null
          title: string
          trigger_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          action_suggestions?: Json | null
          created_at?: string | null
          description?: string
          dismissed_at?: string | null
          goal_id?: string | null
          id?: string
          insight_type?: string
          severity?: string | null
          title?: string
          trigger_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_insights_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_health_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_templates: {
        Row: {
          common_barriers: Json | null
          created_at: string | null
          default_healthspan_target: Json | null
          default_interventions: Json | null
          default_metrics: Json | null
          description: string
          detailed_description: string | null
          display_order: number
          icon_name: string
          id: string
          is_active: boolean
          is_premium_only: boolean
          name: string
          pillar_category: string
          target_assessment_types: string[] | null
          template_key: string
          updated_at: string | null
        }
        Insert: {
          common_barriers?: Json | null
          created_at?: string | null
          default_healthspan_target?: Json | null
          default_interventions?: Json | null
          default_metrics?: Json | null
          description: string
          detailed_description?: string | null
          display_order?: number
          icon_name: string
          id?: string
          is_active?: boolean
          is_premium_only?: boolean
          name: string
          pillar_category: string
          target_assessment_types?: string[] | null
          template_key: string
          updated_at?: string | null
        }
        Update: {
          common_barriers?: Json | null
          created_at?: string | null
          default_healthspan_target?: Json | null
          default_interventions?: Json | null
          default_metrics?: Json | null
          description?: string
          detailed_description?: string | null
          display_order?: number
          icon_name?: string
          id?: string
          is_active?: boolean
          is_premium_only?: boolean
          name?: string
          pillar_category?: string
          target_assessment_types?: string[] | null
          template_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      habit_tracking: {
        Row: {
          created_at: string
          date: string
          duration_minutes: number | null
          habit_type: string
          id: string
          intensity_level: number | null
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          duration_minutes?: number | null
          habit_type: string
          id?: string
          intensity_level?: number | null
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          duration_minutes?: number | null
          habit_type?: string
          id?: string
          intensity_level?: number | null
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      nutrition_preferences: {
        Row: {
          allergies: string[] | null
          created_at: string
          dietary_restrictions: string[] | null
          food_preferences: string[] | null
          health_goals: string[] | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string[] | null
          created_at?: string
          dietary_restrictions?: string[] | null
          food_preferences?: string[] | null
          health_goals?: string[] | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string[] | null
          created_at?: string
          dietary_restrictions?: string[] | null
          food_preferences?: string[] | null
          health_goals?: string[] | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          preferred_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          preferred_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          preferred_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progress_measurements: {
        Row: {
          body_fat_percentage: number | null
          chest_circumference: number | null
          created_at: string
          custom_measurements: Json | null
          date: string
          hip_circumference: number | null
          id: string
          muscle_mass: number | null
          notes: string | null
          updated_at: string
          user_id: string
          waist_circumference: number | null
          weight: number | null
        }
        Insert: {
          body_fat_percentage?: number | null
          chest_circumference?: number | null
          created_at?: string
          custom_measurements?: Json | null
          date?: string
          hip_circumference?: number | null
          id?: string
          muscle_mass?: number | null
          notes?: string | null
          updated_at?: string
          user_id: string
          waist_circumference?: number | null
          weight?: number | null
        }
        Update: {
          body_fat_percentage?: number | null
          chest_circumference?: number | null
          created_at?: string
          custom_measurements?: Json | null
          date?: string
          hip_circumference?: number | null
          id?: string
          muscle_mass?: number | null
          notes?: string | null
          updated_at?: string
          user_id?: string
          waist_circumference?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          photo_type: string
          photo_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          photo_type?: string
          photo_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          photo_type?: string
          photo_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      protocol_adherence: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          id: string
          notes: string | null
          protocol_item_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          protocol_item_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          protocol_item_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocol_adherence_protocol_item_id_fkey"
            columns: ["protocol_item_id"]
            isOneToOne: false
            referencedRelation: "protocol_items"
            referencedColumns: ["id"]
          },
        ]
      }
      protocol_items: {
        Row: {
          created_at: string
          description: string | null
          dosage: string | null
          frequency: Database["public"]["Enums"]["protocol_frequency"]
          id: string
          is_active: boolean
          item_type: Database["public"]["Enums"]["protocol_item_type"]
          name: string
          notes: string | null
          product_link: string | null
          protocol_id: string
          time_of_day: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dosage?: string | null
          frequency?: Database["public"]["Enums"]["protocol_frequency"]
          id?: string
          is_active?: boolean
          item_type: Database["public"]["Enums"]["protocol_item_type"]
          name: string
          notes?: string | null
          product_link?: string | null
          protocol_id: string
          time_of_day?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dosage?: string | null
          frequency?: Database["public"]["Enums"]["protocol_frequency"]
          id?: string
          is_active?: boolean
          item_type?: Database["public"]["Enums"]["protocol_item_type"]
          name?: string
          notes?: string | null
          product_link?: string | null
          protocol_id?: string
          time_of_day?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocol_items_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "user_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      self_reported_metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          journal_entry: string | null
          loveable_score: number | null
          social_interaction_quality: number | null
          stress_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          journal_entry?: string | null
          loveable_score?: number | null
          social_interaction_quality?: number | null
          stress_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          journal_entry?: string | null
          loveable_score?: number | null
          social_interaction_quality?: number | null
          stress_level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "self_reported_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      streak_tracking: {
        Row: {
          activity_type: string
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_tier_limits: {
        Row: {
          available_check_in_frequencies: string[] | null
          can_access_advanced_analytics: boolean
          can_track_biological_age_impact: boolean
          can_use_adaptive_recommendations: boolean
          can_use_ai_optimization: boolean
          created_at: string | null
          display_name: string
          id: string
          marketing_description: string | null
          max_active_goals: number | null
          max_check_ins_per_month: number | null
          max_total_goals: number | null
          restricted_template_keys: string[] | null
          tier_name: string
          updated_at: string | null
        }
        Insert: {
          available_check_in_frequencies?: string[] | null
          can_access_advanced_analytics?: boolean
          can_track_biological_age_impact?: boolean
          can_use_adaptive_recommendations?: boolean
          can_use_ai_optimization?: boolean
          created_at?: string | null
          display_name: string
          id?: string
          marketing_description?: string | null
          max_active_goals?: number | null
          max_check_ins_per_month?: number | null
          max_total_goals?: number | null
          restricted_template_keys?: string[] | null
          tier_name: string
          updated_at?: string | null
        }
        Update: {
          available_check_in_frequencies?: string[] | null
          can_access_advanced_analytics?: boolean
          can_track_biological_age_impact?: boolean
          can_use_adaptive_recommendations?: boolean
          can_use_ai_optimization?: boolean
          created_at?: string | null
          display_name?: string
          id?: string
          marketing_description?: string | null
          max_active_goals?: number | null
          max_check_ins_per_month?: number | null
          max_total_goals?: number | null
          restricted_template_keys?: string[] | null
          tier_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      symptom_assessments: {
        Row: {
          created_at: string
          frequency: string
          id: string
          notes: string | null
          severity: string
          symptom_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency: string
          id?: string
          notes?: string | null
          severity: string
          symptom_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          notes?: string | null
          severity?: string
          symptom_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      symptom_tracking: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          severity: number | null
          symptom_id: string
          triggers: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          severity?: number | null
          symptom_id: string
          triggers?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          severity?: number | null
          symptom_id?: string
          triggers?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_assessment_completions: {
        Row: {
          assessment_id: string
          completed_at: string
          created_at: string
          id: string
          pillar: string | null
          score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_id: string
          completed_at?: string
          created_at?: string
          id?: string
          pillar?: string | null
          score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_id?: string
          completed_at?: string
          created_at?: string
          id?: string
          pillar?: string | null
          score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_health_goals: {
        Row: {
          adaptive_recommendations: Json | null
          aging_blueprint: Json
          ai_generated_at: string | null
          ai_optimization_plan: string | null
          archived_at: string | null
          barriers_plan: Json
          biological_age_impact_actual: number | null
          biological_age_impact_predicted: number | null
          check_in_frequency: string | null
          completed_at: string | null
          created_at: string | null
          current_progress: number | null
          healthspan_target: Json
          id: string
          last_check_in_date: string | null
          longevity_metrics: Json
          next_check_in_due: string | null
          pillar_category: string
          related_assessment_ids: string[] | null
          status: string
          template_id: string | null
          title: string
          triggered_by_assessment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          adaptive_recommendations?: Json | null
          aging_blueprint: Json
          ai_generated_at?: string | null
          ai_optimization_plan?: string | null
          archived_at?: string | null
          barriers_plan?: Json
          biological_age_impact_actual?: number | null
          biological_age_impact_predicted?: number | null
          check_in_frequency?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          healthspan_target: Json
          id?: string
          last_check_in_date?: string | null
          longevity_metrics: Json
          next_check_in_due?: string | null
          pillar_category: string
          related_assessment_ids?: string[] | null
          status?: string
          template_id?: string | null
          title: string
          triggered_by_assessment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          adaptive_recommendations?: Json | null
          aging_blueprint?: Json
          ai_generated_at?: string | null
          ai_optimization_plan?: string | null
          archived_at?: string | null
          barriers_plan?: Json
          biological_age_impact_actual?: number | null
          biological_age_impact_predicted?: number | null
          check_in_frequency?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          healthspan_target?: Json
          id?: string
          last_check_in_date?: string | null
          longevity_metrics?: Json
          next_check_in_due?: string | null
          pillar_category?: string
          related_assessment_ids?: string[] | null
          status?: string
          template_id?: string | null
          title?: string
          triggered_by_assessment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_health_goals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "goal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string
          id: string
          onboarding_completed: boolean
          onboarding_step: number | null
          pillars_visited: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          onboarding_completed?: boolean
          onboarding_step?: number | null
          pillars_visited?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          onboarding_completed?: boolean
          onboarding_step?: number | null
          pillars_visited?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_protocols: {
        Row: {
          created_at: string
          created_from_pillar: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_from_pillar?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_from_pillar?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_symptoms: {
        Row: {
          created_at: string
          frequency: string
          id: string
          is_active: boolean
          notes: string | null
          severity: string
          symptom_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          severity?: string
          symptom_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          severity?: string
          symptom_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wearable_data: {
        Row: {
          active_minutes: number | null
          created_at: string
          date: string
          device_type: string
          exercise_intensity_zones: Json | null
          heart_rate_variability: number | null
          id: string
          raw_data: Json | null
          rem_sleep_percentage: number | null
          resting_heart_rate: number | null
          steps: number | null
          total_sleep_hours: number | null
          user_id: string
        }
        Insert: {
          active_minutes?: number | null
          created_at?: string
          date: string
          device_type: string
          exercise_intensity_zones?: Json | null
          heart_rate_variability?: number | null
          id?: string
          raw_data?: Json | null
          rem_sleep_percentage?: number | null
          resting_heart_rate?: number | null
          steps?: number | null
          total_sleep_hours?: number | null
          user_id: string
        }
        Update: {
          active_minutes?: number | null
          created_at?: string
          date?: string
          device_type?: string
          exercise_intensity_zones?: Json | null
          heart_rate_variability?: number | null
          id?: string
          raw_data?: Json | null
          rem_sleep_percentage?: number | null
          resting_heart_rate?: number | null
          steps?: number | null
          total_sleep_hours?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wearable_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      protocol_frequency:
        | "daily"
        | "twice_daily"
        | "three_times_daily"
        | "weekly"
        | "as_needed"
      protocol_item_type:
        | "supplement"
        | "therapy"
        | "habit"
        | "exercise"
        | "diet"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      protocol_frequency: [
        "daily",
        "twice_daily",
        "three_times_daily",
        "weekly",
        "as_needed",
      ],
      protocol_item_type: [
        "supplement",
        "therapy",
        "habit",
        "exercise",
        "diet",
      ],
    },
  },
} as const
