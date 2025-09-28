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
      daily_scores: {
        Row: {
          active_minutes: number | null
          activity_intensity: number | null
          activity_type: string | null
          biological_age_impact: number
          cognitive_engagement_score: number | null
          color_code: string
          created_at: string
          date: string
          deep_sleep_hours: number | null
          hrv: number | null
          id: string
          input_mode: string | null
          learning_minutes: number | null
          longevity_impact_score: number
          meal_quality: number | null
          meditation_minutes: number | null
          nutrition_score: number | null
          nutritional_detailed_score: number | null
          nutritional_grade: string | null
          physical_activity_score: number | null
          rem_hours: number | null
          self_reported_stress: number | null
          sleep_score: number | null
          social_connections_score: number | null
          social_interaction_quality: number | null
          social_time_minutes: number | null
          steps: number | null
          stress_score: number | null
          total_sleep_hours: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_minutes?: number | null
          activity_intensity?: number | null
          activity_type?: string | null
          biological_age_impact: number
          cognitive_engagement_score?: number | null
          color_code: string
          created_at?: string
          date: string
          deep_sleep_hours?: number | null
          hrv?: number | null
          id?: string
          input_mode?: string | null
          learning_minutes?: number | null
          longevity_impact_score: number
          meal_quality?: number | null
          meditation_minutes?: number | null
          nutrition_score?: number | null
          nutritional_detailed_score?: number | null
          nutritional_grade?: string | null
          physical_activity_score?: number | null
          rem_hours?: number | null
          self_reported_stress?: number | null
          sleep_score?: number | null
          social_connections_score?: number | null
          social_interaction_quality?: number | null
          social_time_minutes?: number | null
          steps?: number | null
          stress_score?: number | null
          total_sleep_hours?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_minutes?: number | null
          activity_intensity?: number | null
          activity_type?: string | null
          biological_age_impact?: number
          cognitive_engagement_score?: number | null
          color_code?: string
          created_at?: string
          date?: string
          deep_sleep_hours?: number | null
          hrv?: number | null
          id?: string
          input_mode?: string | null
          learning_minutes?: number | null
          longevity_impact_score?: number
          meal_quality?: number | null
          meditation_minutes?: number | null
          nutrition_score?: number | null
          nutritional_detailed_score?: number | null
          nutritional_grade?: string | null
          physical_activity_score?: number | null
          rem_hours?: number | null
          self_reported_stress?: number | null
          sleep_score?: number | null
          social_connections_score?: number | null
          social_interaction_quality?: number | null
          social_time_minutes?: number | null
          steps?: number | null
          stress_score?: number | null
          total_sleep_hours?: number | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
