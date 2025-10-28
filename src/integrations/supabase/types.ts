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
      achievements: {
        Row: {
          achievement_id: string
          category: string
          created_at: string | null
          description: string
          display_order: number | null
          icon_name: string
          id: string
          is_active: boolean
          name: string
          points: number
          requirements: Json
          tier: string
        }
        Insert: {
          achievement_id: string
          category: string
          created_at?: string | null
          description: string
          display_order?: number | null
          icon_name: string
          id?: string
          is_active?: boolean
          name: string
          points?: number
          requirements: Json
          tier?: string
        }
        Update: {
          achievement_id?: string
          category?: string
          created_at?: string | null
          description?: string
          display_order?: number | null
          icon_name?: string
          id?: string
          is_active?: boolean
          name?: string
          points?: number
          requirements?: Json
          tier?: string
        }
        Relationships: []
      }
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
      baseline_assessment_schedule: {
        Row: {
          created_at: string | null
          id: string
          last_baseline_date: string
          next_prompt_date: string
          prompt_dismissed: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_baseline_date: string
          next_prompt_date: string
          prompt_dismissed?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_baseline_date?: string
          next_prompt_date?: string
          prompt_dismissed?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "baseline_assessment_schedule_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      calmness_baselines: {
        Row: {
          baseline_calmness_30day: number
          created_at: string | null
          date: string
          id: string
          user_id: string
        }
        Insert: {
          baseline_calmness_30day: number
          created_at?: string | null
          date: string
          id?: string
          user_id: string
        }
        Update: {
          baseline_calmness_30day?: number
          created_at?: string | null
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      content_translations: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          description: string | null
          detailed_description: string | null
          id: string
          locale: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          description?: string | null
          detailed_description?: string | null
          id?: string
          locale: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          detailed_description?: string | null
          id?: string
          locale?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_essentials_completions: {
        Row: {
          created_at: string | null
          date: string
          essential_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          essential_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          essential_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_scores: {
        Row: {
          active_minutes: number | null
          activity_intensity: number | null
          activity_type: string | null
          assessment_type: string | null
          biological_age_impact: number
          cognitive_engagement_score: number | null
          color_code: string
          created_at: string
          daily_delta_ba_lis: number | null
          date: string
          deep_sleep_hours: number | null
          fatigue_score: number | null
          hrv: number | null
          id: string
          input_mode: string | null
          is_baseline: boolean | null
          learning_minutes: number | null
          lis_version: string | null
          longevity_impact_score: number
          meal_quality: number | null
          meditation_minutes: number | null
          nutrition_score: number | null
          nutritional_detailed_score: number | null
          nutritional_grade: string | null
          physical_activity_score: number | null
          questionnaire_data: Json | null
          related_goal_ids: string[] | null
          rem_hours: number | null
          self_perceived_age: number | null
          self_reported_stress: number | null
          sleep_score: number | null
          social_connections_score: number | null
          social_interaction_quality: number | null
          social_time_minutes: number | null
          source_type: string | null
          steps: number | null
          stress_score: number | null
          subjective_calmness_rating: number | null
          total_sleep_hours: number | null
          updated_at: string
          user_chronological_age: number | null
          user_id: string
        }
        Insert: {
          active_minutes?: number | null
          activity_intensity?: number | null
          activity_type?: string | null
          assessment_type?: string | null
          biological_age_impact: number
          cognitive_engagement_score?: number | null
          color_code: string
          created_at?: string
          daily_delta_ba_lis?: number | null
          date: string
          deep_sleep_hours?: number | null
          fatigue_score?: number | null
          hrv?: number | null
          id?: string
          input_mode?: string | null
          is_baseline?: boolean | null
          learning_minutes?: number | null
          lis_version?: string | null
          longevity_impact_score: number
          meal_quality?: number | null
          meditation_minutes?: number | null
          nutrition_score?: number | null
          nutritional_detailed_score?: number | null
          nutritional_grade?: string | null
          physical_activity_score?: number | null
          questionnaire_data?: Json | null
          related_goal_ids?: string[] | null
          rem_hours?: number | null
          self_perceived_age?: number | null
          self_reported_stress?: number | null
          sleep_score?: number | null
          social_connections_score?: number | null
          social_interaction_quality?: number | null
          social_time_minutes?: number | null
          source_type?: string | null
          steps?: number | null
          stress_score?: number | null
          subjective_calmness_rating?: number | null
          total_sleep_hours?: number | null
          updated_at?: string
          user_chronological_age?: number | null
          user_id: string
        }
        Update: {
          active_minutes?: number | null
          activity_intensity?: number | null
          activity_type?: string | null
          assessment_type?: string | null
          biological_age_impact?: number
          cognitive_engagement_score?: number | null
          color_code?: string
          created_at?: string
          daily_delta_ba_lis?: number | null
          date?: string
          deep_sleep_hours?: number | null
          fatigue_score?: number | null
          hrv?: number | null
          id?: string
          input_mode?: string | null
          is_baseline?: boolean | null
          learning_minutes?: number | null
          lis_version?: string | null
          longevity_impact_score?: number
          meal_quality?: number | null
          meditation_minutes?: number | null
          nutrition_score?: number | null
          nutritional_detailed_score?: number | null
          nutritional_grade?: string | null
          physical_activity_score?: number | null
          questionnaire_data?: Json | null
          related_goal_ids?: string[] | null
          rem_hours?: number | null
          self_perceived_age?: number | null
          self_reported_stress?: number | null
          sleep_score?: number | null
          social_connections_score?: number | null
          social_interaction_quality?: number | null
          social_time_minutes?: number | null
          source_type?: string | null
          steps?: number | null
          stress_score?: number | null
          subjective_calmness_rating?: number | null
          total_sleep_hours?: number | null
          updated_at?: string
          user_chronological_age?: number | null
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
      discount_rules: {
        Row: {
          applies_to: string | null
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          promo_code: string | null
          rule_name: string
          rule_type: string | null
          specific_item_ids: string[] | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applies_to?: string | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          discount_type?: string | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          promo_code?: string | null
          rule_name: string
          rule_type?: string | null
          specific_item_ids?: string[] | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applies_to?: string | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          promo_code?: string | null
          rule_name?: string
          rule_type?: string | null
          specific_item_ids?: string[] | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      energy_actions: {
        Row: {
          action_name: string
          action_type: string
          added_to_protocol: boolean | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          protocol_id: string | null
          user_id: string
        }
        Insert: {
          action_name: string
          action_type: string
          added_to_protocol?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          protocol_id?: string | null
          user_id: string
        }
        Update: {
          action_name?: string
          action_type?: string
          added_to_protocol?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          protocol_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_actions_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_check_ins: {
        Row: {
          check_in_date: string | null
          created_at: string | null
          cycle_day: number | null
          energy_rating: number | null
          hydrated: boolean | null
          id: string
          movement_completed: boolean | null
          movement_quality: number | null
          notes: string | null
          nutrition_quality: number | null
          sleep_quality: number | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          check_in_date?: string | null
          created_at?: string | null
          cycle_day?: number | null
          energy_rating?: number | null
          hydrated?: boolean | null
          id?: string
          movement_completed?: boolean | null
          movement_quality?: number | null
          notes?: string | null
          nutrition_quality?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          check_in_date?: string | null
          created_at?: string | null
          cycle_day?: number | null
          energy_rating?: number | null
          hydrated?: boolean | null
          id?: string
          movement_completed?: boolean | null
          movement_quality?: number | null
          notes?: string | null
          nutrition_quality?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id?: string
        }
        Relationships: []
      }
      energy_insights: {
        Row: {
          acknowledged: boolean | null
          action_suggestions: Json | null
          ai_generated: boolean | null
          created_at: string | null
          description: string
          dismissed_at: string | null
          id: string
          insight_type: string
          severity: string | null
          title: string
          trigger_data: Json | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          action_suggestions?: Json | null
          ai_generated?: boolean | null
          created_at?: string | null
          description: string
          dismissed_at?: string | null
          id?: string
          insight_type: string
          severity?: string | null
          title: string
          trigger_data?: Json | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          action_suggestions?: Json | null
          ai_generated?: boolean | null
          created_at?: string | null
          description?: string
          dismissed_at?: string | null
          id?: string
          insight_type?: string
          severity?: string | null
          title?: string
          trigger_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      energy_loop_scores: {
        Row: {
          active_goal_count: number | null
          composite_score: number | null
          created_at: string | null
          data_sources: Json | null
          date: string | null
          energy_variability_index: number | null
          goal_alignment_score: number | null
          hormonal_rhythm_score: number | null
          id: string
          loop_completion_percent: number | null
          movement_quality_score: number | null
          nutrition_score: number | null
          sleep_recovery_score: number | null
          stress_load_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_goal_count?: number | null
          composite_score?: number | null
          created_at?: string | null
          data_sources?: Json | null
          date?: string | null
          energy_variability_index?: number | null
          goal_alignment_score?: number | null
          hormonal_rhythm_score?: number | null
          id?: string
          loop_completion_percent?: number | null
          movement_quality_score?: number | null
          nutrition_score?: number | null
          sleep_recovery_score?: number | null
          stress_load_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_goal_count?: number | null
          composite_score?: number | null
          created_at?: string | null
          data_sources?: Json | null
          date?: string | null
          energy_variability_index?: number | null
          goal_alignment_score?: number | null
          hormonal_rhythm_score?: number | null
          id?: string
          loop_completion_percent?: number | null
          movement_quality_score?: number | null
          nutrition_score?: number | null
          sleep_recovery_score?: number | null
          stress_load_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      energy_milestones: {
        Row: {
          achieved_at: string | null
          badge_name: string
          created_at: string | null
          id: string
          metadata: Json | null
          milestone_type: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          badge_name: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_type: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          badge_name?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_type?: string
          user_id?: string
        }
        Relationships: []
      }
      expert_availability: {
        Row: {
          available: boolean | null
          created_at: string | null
          day_of_week: number
          end_time: string
          expert_id: string
          id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          available?: boolean | null
          created_at?: string | null
          day_of_week: number
          end_time: string
          expert_id: string
          id?: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          available?: boolean | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          expert_id?: string
          id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_availability_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_complaints: {
        Row: {
          assigned_to: string | null
          complaint_type: string
          created_at: string | null
          description: string
          expert_id: string
          id: string
          priority: string | null
          reported_by: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          complaint_type: string
          created_at?: string | null
          description: string
          expert_id: string
          id?: string
          priority?: string | null
          reported_by: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          complaint_type?: string
          created_at?: string | null
          description?: string
          expert_id?: string
          id?: string
          priority?: string | null
          reported_by?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_complaints_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_credentials: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: string
          expert_id: string
          expires_at: string | null
          file_path: string
          file_url: string | null
          id: string
          notes: string | null
          updated_at: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type: string
          expert_id: string
          expires_at?: string | null
          file_path: string
          file_url?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: string
          expert_id?: string
          expires_at?: string | null
          file_path?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_credentials_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_profiles: {
        Row: {
          accepts_insurance: boolean | null
          address_line1: string | null
          address_line2: string | null
          auto_suspended: boolean | null
          average_rating: number | null
          bio: string | null
          certifications: string[] | null
          city: string | null
          complaints_count: number | null
          consultation_fee: number | null
          country: string | null
          cover_photo_url: string | null
          created_at: string | null
          education: string | null
          email: string | null
          expert_id: string
          featured: boolean | null
          gallery_photos: Json | null
          id: string
          insurance_number: string | null
          insurance_verified: boolean | null
          intro_video_url: string | null
          last_credential_check: string | null
          latitude: number | null
          license_number: string | null
          listing_status: Database["public"]["Enums"]["listing_status"] | null
          location: string | null
          longitude: number | null
          offers_in_person: boolean | null
          offers_virtual_messaging: boolean | null
          offers_virtual_phone: boolean | null
          offers_virtual_video: boolean | null
          phone: string | null
          postal_code: string | null
          practice_name: string | null
          professional_tagline: string | null
          profile_photo_url: string | null
          referral_rate: number | null
          referrals_count: number | null
          rejection_reason: string | null
          revenue_total: number | null
          specialties: string[] | null
          state_province: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_ends_at: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          tier: Database["public"]["Enums"]["expert_tier"] | null
          timezone: string | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          verified_by: string | null
          website: string | null
          years_of_practice: number | null
        }
        Insert: {
          accepts_insurance?: boolean | null
          address_line1?: string | null
          address_line2?: string | null
          auto_suspended?: boolean | null
          average_rating?: number | null
          bio?: string | null
          certifications?: string[] | null
          city?: string | null
          complaints_count?: number | null
          consultation_fee?: number | null
          country?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          education?: string | null
          email?: string | null
          expert_id: string
          featured?: boolean | null
          gallery_photos?: Json | null
          id?: string
          insurance_number?: string | null
          insurance_verified?: boolean | null
          intro_video_url?: string | null
          last_credential_check?: string | null
          latitude?: number | null
          license_number?: string | null
          listing_status?: Database["public"]["Enums"]["listing_status"] | null
          location?: string | null
          longitude?: number | null
          offers_in_person?: boolean | null
          offers_virtual_messaging?: boolean | null
          offers_virtual_phone?: boolean | null
          offers_virtual_video?: boolean | null
          phone?: string | null
          postal_code?: string | null
          practice_name?: string | null
          professional_tagline?: string | null
          profile_photo_url?: string | null
          referral_rate?: number | null
          referrals_count?: number | null
          rejection_reason?: string | null
          revenue_total?: number | null
          specialties?: string[] | null
          state_province?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          tier?: Database["public"]["Enums"]["expert_tier"] | null
          timezone?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
          years_of_practice?: number | null
        }
        Update: {
          accepts_insurance?: boolean | null
          address_line1?: string | null
          address_line2?: string | null
          auto_suspended?: boolean | null
          average_rating?: number | null
          bio?: string | null
          certifications?: string[] | null
          city?: string | null
          complaints_count?: number | null
          consultation_fee?: number | null
          country?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          education?: string | null
          email?: string | null
          expert_id?: string
          featured?: boolean | null
          gallery_photos?: Json | null
          id?: string
          insurance_number?: string | null
          insurance_verified?: boolean | null
          intro_video_url?: string | null
          last_credential_check?: string | null
          latitude?: number | null
          license_number?: string | null
          listing_status?: Database["public"]["Enums"]["listing_status"] | null
          location?: string | null
          longitude?: number | null
          offers_in_person?: boolean | null
          offers_virtual_messaging?: boolean | null
          offers_virtual_phone?: boolean | null
          offers_virtual_video?: boolean | null
          phone?: string | null
          postal_code?: string | null
          practice_name?: string | null
          professional_tagline?: string | null
          profile_photo_url?: string | null
          referral_rate?: number | null
          referrals_count?: number | null
          rejection_reason?: string | null
          revenue_total?: number | null
          specialties?: string[] | null
          state_province?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          tier?: Database["public"]["Enums"]["expert_tier"] | null
          timezone?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
          years_of_practice?: number | null
        }
        Relationships: []
      }
      expert_referrals: {
        Row: {
          amount: number
          commission_amount: number
          commission_rate: number
          completed_at: string | null
          created_at: string | null
          expert_id: string
          id: string
          referral_type: string
          status: string | null
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          commission_amount: number
          commission_rate: number
          completed_at?: string | null
          created_at?: string | null
          expert_id: string
          id?: string
          referral_type: string
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          commission_amount?: number
          commission_rate?: number
          completed_at?: string | null
          created_at?: string | null
          expert_id?: string
          id?: string
          referral_type?: string
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_referrals_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_reviews: {
        Row: {
          created_at: string | null
          expert_id: string
          flagged: boolean | null
          flagged_at: string | null
          flagged_reason: string | null
          id: string
          rating: number
          responded_at: string | null
          response_text: string | null
          review_text: string | null
          updated_at: string | null
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          created_at?: string | null
          expert_id: string
          flagged?: boolean | null
          flagged_at?: string | null
          flagged_reason?: string | null
          id?: string
          rating: number
          responded_at?: string | null
          response_text?: string | null
          review_text?: string | null
          updated_at?: string | null
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          created_at?: string | null
          expert_id?: string
          flagged?: boolean | null
          flagged_at?: string | null
          flagged_reason?: string | null
          id?: string
          rating?: number
          responded_at?: string | null
          response_text?: string | null
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_reviews_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_services: {
        Row: {
          available: boolean | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          expert_id: string
          id: string
          is_virtual: boolean | null
          price: number | null
          service_name: string
          service_type: string | null
          updated_at: string | null
        }
        Insert: {
          available?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          expert_id: string
          id?: string
          is_virtual?: boolean | null
          price?: number | null
          service_name: string
          service_type?: string | null
          updated_at?: string | null
        }
        Update: {
          available?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          expert_id?: string
          id?: string
          is_virtual?: boolean | null
          price?: number | null
          service_name?: string
          service_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_services_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_verification_log: {
        Row: {
          action: string
          created_at: string | null
          expert_id: string
          id: string
          new_status: Database["public"]["Enums"]["verification_status"] | null
          notes: string | null
          performed_by: string
          previous_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          reason: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          expert_id: string
          id?: string
          new_status?: Database["public"]["Enums"]["verification_status"] | null
          notes?: string | null
          performed_by: string
          previous_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          reason?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          expert_id?: string
          id?: string
          new_status?: Database["public"]["Enums"]["verification_status"] | null
          notes?: string | null
          performed_by?: string
          previous_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_verification_log_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
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
      goal_metric_tracking: {
        Row: {
          created_at: string | null
          goal_id: string
          id: string
          metric_name: string
          metric_unit: string | null
          metric_value: number | null
          notes: string | null
          tracked_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          goal_id: string
          id?: string
          metric_name: string
          metric_unit?: string | null
          metric_value?: number | null
          notes?: string | null
          tracked_date?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          goal_id?: string
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
          notes?: string | null
          tracked_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_metric_tracking_goal_id_fkey"
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
      guest_lis_assessments: {
        Row: {
          assessment_data: Json
          brief_results: Json
          claimed_at: string | null
          claimed_by_user_id: string | null
          created_at: string | null
          id: string
          session_id: string
        }
        Insert: {
          assessment_data: Json
          brief_results: Json
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          created_at?: string | null
          id?: string
          session_id: string
        }
        Update: {
          assessment_data?: Json
          brief_results?: Json
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          created_at?: string | null
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      guest_symptom_assessments: {
        Row: {
          answers: Json
          assessment_data: Json
          claimed_at: string | null
          claimed_by_user_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          score: number
          score_category: string
          session_id: string
          symptom_id: string
        }
        Insert: {
          answers: Json
          assessment_data: Json
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          score: number
          score_category: string
          session_id: string
          symptom_id: string
        }
        Update: {
          answers?: Json
          assessment_data?: Json
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          score?: number
          score_category?: string
          session_id?: string
          symptom_id?: string
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
      health_questions: {
        Row: {
          ai_answer: string
          created_at: string | null
          extracted_concerns: Json | null
          id: string
          question: string
          recommended_assessments: Json | null
          recommended_tools: Json | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          ai_answer: string
          created_at?: string | null
          extracted_concerns?: Json | null
          id?: string
          question: string
          recommended_assessments?: Json | null
          recommended_tools?: Json | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          ai_answer?: string
          created_at?: string | null
          extracted_concerns?: Json | null
          id?: string
          question?: string
          recommended_assessments?: Json | null
          recommended_tools?: Json | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hormone_compass_insights: {
        Row: {
          acknowledged: boolean | null
          action_items: Json | null
          ai_generated: boolean | null
          created_at: string | null
          description: string
          dismissed_at: string | null
          id: string
          insight_type: string
          title: string
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          action_items?: Json | null
          ai_generated?: boolean | null
          created_at?: string | null
          description: string
          dismissed_at?: string | null
          id?: string
          insight_type: string
          title: string
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          action_items?: Json | null
          ai_generated?: boolean | null
          created_at?: string | null
          description?: string
          dismissed_at?: string | null
          id?: string
          insight_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      hormone_compass_stages: {
        Row: {
          assessment_id: string | null
          calculated_at: string | null
          confidence_score: number | null
          created_at: string | null
          hormone_indicators: Json | null
          id: string
          stage: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assessment_id?: string | null
          calculated_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          hormone_indicators?: Json | null
          id?: string
          stage: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assessment_id?: string | null
          calculated_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          hormone_indicators?: Json | null
          id?: string
          stage?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hormone_compass_symptom_tracking: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          severity: number
          symptom_category: string
          symptom_name: string
          tracked_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          severity: number
          symptom_category: string
          symptom_name: string
          tracked_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          severity?: number
          symptom_category?: string
          symptom_name?: string
          tracked_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      menomap_assessments: {
        Row: {
          answers: Json
          assessment_type: string
          bio_score: number | null
          completed_at: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          answers?: Json
          assessment_type?: string
          bio_score?: number | null
          completed_at?: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          answers?: Json
          assessment_type?: string
          bio_score?: number | null
          completed_at?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      menopause_progress_milestones: {
        Row: {
          achieved_at: string | null
          badge_name: string
          created_at: string | null
          id: string
          metadata: Json | null
          milestone_type: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          badge_name: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_type: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          badge_name?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_type?: string
          user_id?: string
        }
        Relationships: []
      }
      mindset_quiz_leads: {
        Row: {
          answers: Json
          completed_at: string
          created_at: string
          email: string | null
          habit_score: number | null
          id: string
          mindset_score: number | null
          mindset_type: string
          user_id: string | null
        }
        Insert: {
          answers: Json
          completed_at?: string
          created_at?: string
          email?: string | null
          habit_score?: number | null
          id?: string
          mindset_score?: number | null
          mindset_type: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          completed_at?: string
          created_at?: string
          email?: string | null
          habit_score?: number | null
          id?: string
          mindset_score?: number | null
          mindset_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      nutrition_preferences: {
        Row: {
          activity_level: string | null
          allergies: string[] | null
          created_at: string
          disliked_foods: string[] | null
          dislikes: string[] | null
          fitness_goal: string | null
          has_ibs: boolean | null
          id: string
          is_low_fodmap: boolean | null
          liked_foods: string[] | null
          selected_breakfast_recipe: string | null
          selected_dinner_recipe: string | null
          selected_lunch_recipe: string | null
          selected_recipe_style: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          allergies?: string[] | null
          created_at?: string
          disliked_foods?: string[] | null
          dislikes?: string[] | null
          fitness_goal?: string | null
          has_ibs?: boolean | null
          id?: string
          is_low_fodmap?: boolean | null
          liked_foods?: string[] | null
          selected_breakfast_recipe?: string | null
          selected_dinner_recipe?: string | null
          selected_lunch_recipe?: string | null
          selected_recipe_style?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          allergies?: string[] | null
          created_at?: string
          disliked_foods?: string[] | null
          dislikes?: string[] | null
          fitness_goal?: string | null
          has_ibs?: boolean | null
          id?: string
          is_low_fodmap?: boolean | null
          liked_foods?: string[] | null
          selected_breakfast_recipe?: string | null
          selected_dinner_recipe?: string | null
          selected_lunch_recipe?: string | null
          selected_recipe_style?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      package_protocol_items: {
        Row: {
          created_at: string | null
          id: string
          is_customizable: boolean | null
          item_position: number
          package_id: string
          product_id: string | null
          protocol_item_id: string
          replacement_options: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_customizable?: boolean | null
          item_position: number
          package_id: string
          product_id?: string | null
          protocol_item_id: string
          replacement_options?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_customizable?: boolean | null
          item_position?: number
          package_id?: string
          product_id?: string | null
          protocol_item_id?: string
          replacement_options?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "package_protocol_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "protocol_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_protocol_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_protocol_items_protocol_item_id_fkey"
            columns: ["protocol_item_id"]
            isOneToOne: false
            referencedRelation: "protocol_items"
            referencedColumns: ["id"]
          },
        ]
      }
      package_purchases: {
        Row: {
          delivered_at: string | null
          discount_applied: number | null
          discount_code: string | null
          id: string
          metadata: Json | null
          package_id: string
          payment_plan_current_installment: number | null
          payment_plan_installment_count: number | null
          payment_status: string | null
          purchase_type: string | null
          purchased_at: string | null
          shipment_status: string | null
          shipped_at: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          total_amount: number
          tracking_number: string | null
          user_id: string
        }
        Insert: {
          delivered_at?: string | null
          discount_applied?: number | null
          discount_code?: string | null
          id?: string
          metadata?: Json | null
          package_id: string
          payment_plan_current_installment?: number | null
          payment_plan_installment_count?: number | null
          payment_status?: string | null
          purchase_type?: string | null
          purchased_at?: string | null
          shipment_status?: string | null
          shipped_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          total_amount: number
          tracking_number?: string | null
          user_id: string
        }
        Update: {
          delivered_at?: string | null
          discount_applied?: number | null
          discount_code?: string | null
          id?: string
          metadata?: Json | null
          package_id?: string
          payment_plan_current_installment?: number | null
          payment_plan_installment_count?: number | null
          payment_status?: string | null
          purchase_type?: string | null
          purchased_at?: string | null
          shipment_status?: string | null
          shipped_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          total_amount?: number
          tracking_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "protocol_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_symptoms: {
        Row: {
          created_at: string | null
          effectiveness_score: number | null
          id: string
          product_id: string | null
          symptom_type: string
        }
        Insert: {
          created_at?: string | null
          effectiveness_score?: number | null
          id?: string
          product_id?: string | null
          symptom_type: string
        }
        Update: {
          created_at?: string | null
          effectiveness_score?: number | null
          id?: string
          product_id?: string | null
          symptom_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_symptoms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          affiliate_link: string | null
          benefits: Json | null
          brand: string | null
          category: string
          contraindications: Json | null
          created_at: string | null
          description: string
          detailed_description: string | null
          display_order: number | null
          evidence_level: string | null
          id: string
          image_url: string | null
          ingredients: Json | null
          is_active: boolean | null
          name: string
          price_aud: number | null
          price_cad: number | null
          price_gbp: number | null
          price_usd: number | null
          research_citations: Json | null
          target_pillars: Json | null
          target_symptoms: Json | null
          updated_at: string | null
          usage_instructions: string | null
        }
        Insert: {
          affiliate_link?: string | null
          benefits?: Json | null
          brand?: string | null
          category: string
          contraindications?: Json | null
          created_at?: string | null
          description: string
          detailed_description?: string | null
          display_order?: number | null
          evidence_level?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          is_active?: boolean | null
          name: string
          price_aud?: number | null
          price_cad?: number | null
          price_gbp?: number | null
          price_usd?: number | null
          research_citations?: Json | null
          target_pillars?: Json | null
          target_symptoms?: Json | null
          updated_at?: string | null
          usage_instructions?: string | null
        }
        Update: {
          affiliate_link?: string | null
          benefits?: Json | null
          brand?: string | null
          category?: string
          contraindications?: Json | null
          created_at?: string | null
          description?: string
          detailed_description?: string | null
          display_order?: number | null
          evidence_level?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          is_active?: boolean | null
          name?: string
          price_aud?: number | null
          price_cad?: number | null
          price_gbp?: number | null
          price_usd?: number | null
          research_citations?: Json | null
          target_pillars?: Json | null
          target_symptoms?: Json | null
          updated_at?: string | null
          usage_instructions?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          currency: string | null
          current_menopause_stage: string | null
          device_permissions: Json | null
          email: string | null
          energy_loop_enabled: boolean | null
          energy_loop_onboarding_completed: boolean | null
          hormone_compass_enabled: boolean | null
          hormone_compass_onboarding_completed: boolean | null
          id: string
          language: string | null
          measurement_system: string | null
          menomap_onboarding_completed: boolean | null
          onboarding_completed: boolean | null
          preferred_name: string
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          currency?: string | null
          current_menopause_stage?: string | null
          device_permissions?: Json | null
          email?: string | null
          energy_loop_enabled?: boolean | null
          energy_loop_onboarding_completed?: boolean | null
          hormone_compass_enabled?: boolean | null
          hormone_compass_onboarding_completed?: boolean | null
          id?: string
          language?: string | null
          measurement_system?: string | null
          menomap_onboarding_completed?: boolean | null
          onboarding_completed?: boolean | null
          preferred_name: string
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string | null
          created_at?: string
          currency?: string | null
          current_menopause_stage?: string | null
          device_permissions?: Json | null
          email?: string | null
          energy_loop_enabled?: boolean | null
          energy_loop_onboarding_completed?: boolean | null
          hormone_compass_enabled?: boolean | null
          hormone_compass_onboarding_completed?: boolean | null
          id?: string
          language?: string | null
          measurement_system?: string | null
          menomap_onboarding_completed?: boolean | null
          onboarding_completed?: boolean | null
          preferred_name?: string
          timezone?: string | null
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
      protocol_item_completions: {
        Row: {
          completed_at: string
          completed_date: string
          created_at: string | null
          id: string
          notes: string | null
          protocol_item_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completed_date?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          protocol_item_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completed_date?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          protocol_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocol_item_completions_protocol_item_id_fkey"
            columns: ["protocol_item_id"]
            isOneToOne: false
            referencedRelation: "protocol_items"
            referencedColumns: ["id"]
          },
        ]
      }
      protocol_items: {
        Row: {
          contributes_to_metrics: string[] | null
          created_at: string
          description: string | null
          dosage: string | null
          frequency: Database["public"]["Enums"]["protocol_frequency"]
          goal_id: string | null
          goal_ids: string[] | null
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
          contributes_to_metrics?: string[] | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          frequency?: Database["public"]["Enums"]["protocol_frequency"]
          goal_id?: string | null
          goal_ids?: string[] | null
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
          contributes_to_metrics?: string[] | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          frequency?: Database["public"]["Enums"]["protocol_frequency"]
          goal_id?: string | null
          goal_ids?: string[] | null
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
            foreignKeyName: "protocol_items_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_health_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocol_items_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      protocol_packages: {
        Row: {
          base_price: number
          bronze_items_count: number
          created_at: string | null
          discount_amount: number
          discount_type: string | null
          duration_days: number
          expires_at: string | null
          final_price: number
          gold_items_count: number
          id: string
          is_active: boolean | null
          package_name: string
          protocol_id: string
          silver_items_count: number
          tier: string | null
          total_items_count: number
          user_id: string
        }
        Insert: {
          base_price: number
          bronze_items_count?: number
          created_at?: string | null
          discount_amount?: number
          discount_type?: string | null
          duration_days?: number
          expires_at?: string | null
          final_price: number
          gold_items_count?: number
          id?: string
          is_active?: boolean | null
          package_name: string
          protocol_id: string
          silver_items_count?: number
          tier?: string | null
          total_items_count: number
          user_id: string
        }
        Update: {
          base_price?: number
          bronze_items_count?: number
          created_at?: string | null
          discount_amount?: number
          discount_type?: string | null
          duration_days?: number
          expires_at?: string | null
          final_price?: number
          gold_items_count?: number
          id?: string
          is_active?: boolean | null
          package_name?: string
          protocol_id?: string
          silver_items_count?: number
          tier?: string | null
          total_items_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocol_packages_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      protocols: {
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
      research_studies: {
        Row: {
          abstract: string | null
          authors: string
          created_at: string | null
          display_order: number | null
          doi: string | null
          evidence_level: string | null
          id: string
          is_active: boolean | null
          is_women_specific: boolean | null
          journal: string | null
          key_findings: Json | null
          related_pillars: Json | null
          related_products: string[] | null
          related_symptoms: Json | null
          related_toolkit_items: string[] | null
          sample_size: number | null
          study_type: string | null
          title: string
          updated_at: string | null
          url: string | null
          year: number | null
        }
        Insert: {
          abstract?: string | null
          authors: string
          created_at?: string | null
          display_order?: number | null
          doi?: string | null
          evidence_level?: string | null
          id?: string
          is_active?: boolean | null
          is_women_specific?: boolean | null
          journal?: string | null
          key_findings?: Json | null
          related_pillars?: Json | null
          related_products?: string[] | null
          related_symptoms?: Json | null
          related_toolkit_items?: string[] | null
          sample_size?: number | null
          study_type?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
          year?: number | null
        }
        Update: {
          abstract?: string | null
          authors?: string
          created_at?: string | null
          display_order?: number | null
          doi?: string | null
          evidence_level?: string | null
          id?: string
          is_active?: boolean | null
          is_women_specific?: boolean | null
          journal?: string | null
          key_findings?: Json | null
          related_pillars?: Json | null
          related_products?: string[] | null
          related_symptoms?: Json | null
          related_toolkit_items?: string[] | null
          sample_size?: number | null
          study_type?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
          year?: number | null
        }
        Relationships: []
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
          answers: Json
          completed_at: string
          created_at: string
          detail_scores: Json | null
          id: string
          overall_score: number
          primary_issues: string[] | null
          recommendations: Json
          score_category: string
          symptom_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers: Json
          completed_at?: string
          created_at?: string
          detail_scores?: Json | null
          id?: string
          overall_score: number
          primary_issues?: string[] | null
          recommendations: Json
          score_category: string
          symptom_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          created_at?: string
          detail_scores?: Json | null
          id?: string
          overall_score?: number
          primary_issues?: string[] | null
          recommendations?: Json
          score_category?: string
          symptom_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      symptom_tracking: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          severity: number
          symptom_id: string
          tracked_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          severity: number
          symptom_id: string
          tracked_date?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          severity?: number
          symptom_id?: string
          tracked_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      toolkit_categories: {
        Row: {
          created_at: string | null
          description: string
          display_order: number
          icon_name: string
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          display_order: number
          icon_name: string
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          display_order?: number
          icon_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      toolkit_items: {
        Row: {
          benefits: Json | null
          category_id: string | null
          contraindications: Json | null
          created_at: string | null
          description: string
          detailed_description: string | null
          display_order: number | null
          evidence_level: string | null
          id: string
          is_active: boolean | null
          name: string
          protocols: Json | null
          research_citations: Json | null
          slug: string
          target_assessment_types: Json | null
          target_symptoms: Json | null
          updated_at: string | null
        }
        Insert: {
          benefits?: Json | null
          category_id?: string | null
          contraindications?: Json | null
          created_at?: string | null
          description: string
          detailed_description?: string | null
          display_order?: number | null
          evidence_level?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          protocols?: Json | null
          research_citations?: Json | null
          slug: string
          target_assessment_types?: Json | null
          target_symptoms?: Json | null
          updated_at?: string | null
        }
        Update: {
          benefits?: Json | null
          category_id?: string | null
          contraindications?: Json | null
          created_at?: string | null
          description?: string
          detailed_description?: string | null
          display_order?: number | null
          evidence_level?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          protocols?: Json | null
          research_citations?: Json | null
          slug?: string
          target_assessment_types?: Json | null
          target_symptoms?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "toolkit_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "toolkit_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          id: string
          progress: Json | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          id?: string
          progress?: Json | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          id?: string
          progress?: Json | null
          unlocked_at?: string
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
          linked_protocol_id: string | null
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
          linked_protocol_id?: string | null
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
          linked_protocol_id?: string | null
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
            foreignKeyName: "user_health_goals_linked_protocol_id_fkey"
            columns: ["linked_protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_health_goals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "goal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_health_profile: {
        Row: {
          chronic_fatigue_risk: boolean | null
          created_at: string | null
          current_bmi: number | null
          date_of_birth: string
          date_quit_smoking: string | null
          energy_assessment_date: string | null
          height_cm: number | null
          id: string
          initial_subjective_age_delta: number | null
          is_current_smoker: boolean | null
          is_former_smoker: boolean | null
          latest_energy_category: string | null
          latest_energy_score: number | null
          social_engagement_baseline: number | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          chronic_fatigue_risk?: boolean | null
          created_at?: string | null
          current_bmi?: number | null
          date_of_birth: string
          date_quit_smoking?: string | null
          energy_assessment_date?: string | null
          height_cm?: number | null
          id?: string
          initial_subjective_age_delta?: number | null
          is_current_smoker?: boolean | null
          is_former_smoker?: boolean | null
          latest_energy_category?: string | null
          latest_energy_score?: number | null
          social_engagement_baseline?: number | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          chronic_fatigue_risk?: boolean | null
          created_at?: string | null
          current_bmi?: number | null
          date_of_birth?: string
          date_quit_smoking?: string | null
          energy_assessment_date?: string | null
          height_cm?: number | null
          id?: string
          initial_subjective_age_delta?: number | null
          is_current_smoker?: boolean | null
          is_former_smoker?: boolean | null
          latest_energy_category?: string | null
          latest_energy_score?: number | null
          social_engagement_baseline?: number | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      user_insights: {
        Row: {
          category: string
          created_at: string
          data_points: Json | null
          description: string
          generated_at: string
          id: string
          insight_type: string
          is_dismissed: boolean | null
          is_viewed: boolean | null
          priority: string
          recommendations: Json | null
          title: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          category: string
          created_at?: string
          data_points?: Json | null
          description: string
          generated_at?: string
          id?: string
          insight_type: string
          is_dismissed?: boolean | null
          is_viewed?: boolean | null
          priority?: string
          recommendations?: Json | null
          title: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          data_points?: Json | null
          description?: string
          generated_at?: string
          id?: string
          insight_type?: string
          is_dismissed?: boolean | null
          is_viewed?: boolean | null
          priority?: string
          recommendations?: Json | null
          title?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      user_points: {
        Row: {
          created_at: string | null
          id: string
          level: number
          points_to_next_level: number
          total_points: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number
          points_to_next_level?: number
          total_points?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number
          points_to_next_level?: number
          total_points?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_subscriptions: {
        Row: {
          created_at: string | null
          daily_submissions_count: number | null
          id: string
          last_submission_date: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_submissions_count?: number | null
          id?: string
          last_submission_date?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_submissions_count?: number | null
          id?: string
          last_submission_date?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
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
      user_toolkit_recommendations: {
        Row: {
          applicability_score: number | null
          completed_count: number | null
          contraindication_flags: Json | null
          created_at: string | null
          id: string
          last_used_at: string | null
          matched_assessments: Json | null
          matched_symptoms: Json | null
          priority_rank: number | null
          started_at: string | null
          suitability_score: number | null
          toolkit_item_id: string | null
          updated_at: string | null
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          applicability_score?: number | null
          completed_count?: number | null
          contraindication_flags?: Json | null
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          matched_assessments?: Json | null
          matched_symptoms?: Json | null
          priority_rank?: number | null
          started_at?: string | null
          suitability_score?: number | null
          toolkit_item_id?: string | null
          updated_at?: string | null
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          applicability_score?: number | null
          completed_count?: number | null
          contraindication_flags?: Json | null
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          matched_assessments?: Json | null
          matched_symptoms?: Json | null
          priority_rank?: number | null
          started_at?: string | null
          suitability_score?: number | null
          toolkit_item_id?: string | null
          updated_at?: string | null
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_toolkit_recommendations_toolkit_item_id_fkey"
            columns: ["toolkit_item_id"]
            isOneToOne: false
            referencedRelation: "toolkit_items"
            referencedColumns: ["id"]
          },
        ]
      }
      wearable_connections: {
        Row: {
          access_token: string | null
          created_at: string | null
          id: string
          is_active: boolean
          last_sync_at: string | null
          provider: string
          provider_user_id: string | null
          refresh_token: string | null
          sync_settings: Json | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          provider: string
          provider_user_id?: string | null
          refresh_token?: string | null
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          provider?: string
          provider_user_id?: string | null
          refresh_token?: string | null
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
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
      unified_assessments: {
        Row: {
          assessment_id: string | null
          completed_at: string | null
          pillar: string | null
          score: number | null
          source: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_expert_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_contraindications: { Args: { data: Json }; Returns: boolean }
      validate_target_symptoms: { Args: { data: Json }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "expert"
      expert_tier: "free" | "premium" | "elite"
      listing_status: "active" | "inactive" | "suspended"
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
      subscription_status: "active" | "trialing" | "canceled" | "expired"
      subscription_tier: "guest" | "registered" | "subscribed" | "premium"
      verification_status: "pending" | "approved" | "rejected" | "suspended"
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
      app_role: ["admin", "moderator", "user", "expert"],
      expert_tier: ["free", "premium", "elite"],
      listing_status: ["active", "inactive", "suspended"],
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
      subscription_status: ["active", "trialing", "canceled", "expired"],
      subscription_tier: ["guest", "registered", "subscribed", "premium"],
      verification_status: ["pending", "approved", "rejected", "suspended"],
    },
  },
} as const
