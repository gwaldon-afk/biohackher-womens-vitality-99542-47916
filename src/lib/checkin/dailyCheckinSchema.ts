export type CheckinOption = {
  id: string;
  score?: number;
};

export type CheckinQuestion = {
  id: string;
  order: number;
  enabled: boolean;
  required: boolean;
  type: "single_select" | "scale" | "free_text" | "multi_select";
  prompt_key: string;
  response: {
    presentation?: string;
    options?: CheckinOption[] | string[];
    min?: number;
    max?: number;
    step?: number;
    max_chars?: number;
    max_selected?: number;
  };
  subquestion?: {
    id: string;
    enabled: boolean;
    required: boolean;
    type: "slider";
    prompt_key: string;
    response: {
      min: number;
      max: number;
      step: number;
    };
  };
};

export type DailyCheckinSchema = {
  schema_version: string;
  feature: string;
  defaults: {
    enabled: boolean;
    allow_skip: boolean;
    allow_disable: boolean;
    max_duration_seconds: number;
  };
  ui: {
    entry_point: string;
    style: string;
    progress: string;
    max_free_text_chars: number;
  };
  questions: CheckinQuestion[];
  normalization: {
    output_shape: Record<string, string>;
  };
  plan_modifiers_contract: {
    version: string;
    output_shape: Record<string, string>;
  };
};

export const dailyCheckinSchema: DailyCheckinSchema = {
  schema_version: "1.0.0",
  feature: "daily_checkin",
  defaults: {
    enabled: true,
    allow_skip: true,
    allow_disable: true,
    max_duration_seconds: 45,
  },
  ui: {
    entry_point: "today_page_modal",
    style: "warm_supportive",
    progress: "dots",
    max_free_text_chars: 140,
  },
  questions: [
    {
      id: "mood",
      order: 10,
      enabled: true,
      required: true,
      type: "single_select",
      prompt_key: "checkin.q1.prompt",
      response: {
        presentation: "chips",
        options: [
          { id: "great", score: 5 },
          { id: "good", score: 4 },
          { id: "okay", score: 3 },
          { id: "flat", score: 2 },
          { id: "rough", score: 1 },
        ],
      },
    },
    {
      id: "sleep_quality",
      order: 20,
      enabled: true,
      required: true,
      type: "single_select",
      prompt_key: "checkin.q2.prompt",
      response: {
        presentation: "chips",
        options: [
          { id: "great", score: 3 },
          { id: "ok", score: 2 },
          { id: "poor", score: 1 },
        ],
      },
      subquestion: {
        id: "sleep_hours",
        enabled: true,
        required: false,
        type: "slider",
        prompt_key: "checkin.q2.subprompt",
        response: {
          min: 0,
          max: 10,
          step: 0.5,
        },
      },
    },
    {
      id: "stress",
      order: 30,
      enabled: true,
      required: true,
      type: "scale",
      prompt_key: "checkin.q3.prompt",
      response: {
        presentation: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
    },
    {
      id: "energy",
      order: 40,
      enabled: true,
      required: true,
      type: "scale",
      prompt_key: "checkin.q4.prompt",
      response: {
        presentation: "slider",
        min: 1,
        max: 5,
        step: 1,
      },
    },
    {
      id: "notes",
      order: 50,
      enabled: true,
      required: false,
      type: "free_text",
      prompt_key: "checkin.q5.prompt",
      response: {
        max_chars: 140,
      },
    },
    {
      id: "context_tags",
      order: 60,
      enabled: true,
      required: false,
      type: "multi_select",
      prompt_key: "checkin.q6.prompt",
      response: {
        max_selected: 3,
        options: [
          "period",
          "headache",
          "injury",
          "travel",
          "late_night",
          "big_work_day",
          "bloat",
        ],
      },
    },
  ],
  normalization: {
    output_shape: {
      date: "YYYY-MM-DD",
      mood_score: "int",
      sleep_quality_score: "int",
      sleep_hours: "float|null",
      stress_level: "int",
      energy_level: "int",
      context_tags: "string[]",
      user_note: "string|null",
    },
  },
  plan_modifiers_contract: {
    version: "1.0.0",
    output_shape: {
      intensity_modifier: "int(-2..+2)",
      focus: "string|null",
      time_budget_modifier_minutes: "int|null",
      exercise_constraint: "string|null",
      add_micro_actions: "string[]",
      reasoning_short: "string",
    },
  },
};
