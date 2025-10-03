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
          dislikes: string[] | null
          fitness_goal: string | null
          has_ibs: boolean | null
          id: string
          is_low_fodmap: boolean | null
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
          dislikes?: string[] | null
          fitness_goal?: string | null
          has_ibs?: boolean | null
          id?: string
          is_low_fodmap?: boolean | null
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
          dislikes?: string[] | null
          fitness_goal?: string | null
          has_ibs?: boolean | null
          id?: string
          is_low_fodmap?: boolean | null
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
      profiles: {
        Row: {
          country: string | null
          created_at: string
          currency: string | null
          email: string | null
          id: string
          language: string | null
          measurement_system: string | null
          preferred_name: string
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          language?: string | null
          measurement_system?: string | null
          preferred_name: string
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          language?: string | null
          measurement_system?: string | null
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
      user_health_profile: {
        Row: {
          created_at: string | null
          current_bmi: number | null
          date_of_birth: string
          date_quit_smoking: string | null
          height_cm: number | null
          id: string
          initial_subjective_age_delta: number | null
          is_current_smoker: boolean | null
          is_former_smoker: boolean | null
          social_engagement_baseline: number | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          current_bmi?: number | null
          date_of_birth: string
          date_quit_smoking?: string | null
          height_cm?: number | null
          id?: string
          initial_subjective_age_delta?: number | null
          is_current_smoker?: boolean | null
          is_former_smoker?: boolean | null
          social_engagement_baseline?: number | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          current_bmi?: number | null
          date_of_birth?: string
          date_quit_smoking?: string | null
          height_cm?: number | null
          id?: string
          initial_subjective_age_delta?: number | null
          is_current_smoker?: boolean | null
          is_former_smoker?: boolean | null
          social_engagement_baseline?: number | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
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
      [_ in never]: never
    }
    Enums: {
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
    },
  },
} as const
