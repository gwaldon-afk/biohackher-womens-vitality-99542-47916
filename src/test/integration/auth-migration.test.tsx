import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createSupabaseMock } from "@/test/mocks/supabase";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    promise: vi.fn(),
  },
}));

vi.mock("@/services/nutritionActionService", () => ({
  generateAndSaveNutritionActions: vi.fn(async () => {}),
}));

// Use `var` to avoid TDZ issues with hoisted vi.mock factories.
// eslint-disable-next-line no-var
var supabaseCurrent: any;
vi.mock("@/integrations/supabase/client", () => ({
  get supabase() {
    return supabaseCurrent;
  },
}));

const signIn = vi.fn(async () => ({ error: null }));

vi.mock("@/hooks/useAuth", async () => {
  const React = (await import("react")).default;
  return {
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useAuth: () => ({
      user: null,
      signUp: vi.fn(async () => ({ error: null })),
      signIn,
    }),
  };
});

import Auth from "@/pages/Auth";

describe("Auth integration: guest migration on sign-in", () => {
  it("claims/migrates guest LIS on sign-in when source=lis-results", async () => {
    localStorage.clear();
    localStorage.setItem("lis_guest_session_id", "guest_lis_123");

    supabaseCurrent = createSupabaseMock({
      guest_lis_assessments: {
        maybeSingle: async () => ({
          data: {
            assessment_data: { baselineData: { dateOfBirth: "1990-01-01", heightCm: 170, weightKg: 65, bmi: 22.5 } },
            brief_results: {
              finalScore: 72,
              pillarScores: { Sleep: 70, Stress: 60, Body: 50, Nutrition: 80, Social: 55, Brain: 65 },
            },
            claimed_by_user_id: null,
          },
          error: null,
        }),
      },
      user_health_profile: {
        upsert: async () => ({ data: null, error: null }),
      },
      daily_scores: {
        upsert: async () => ({ data: null, error: null }),
      },
    });
    supabaseCurrent.auth.getUser = vi.fn(async () => ({ data: { user: { id: "u1" } } }));

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/auth?source=lis-results&returnTo=%2Flis-results"]}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/lis-results" element={<div>lis-results</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText("your@email.com"), "a@b.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem("lis_guest_session_id")).toBeNull();
    });
  });

  it("claims/migrates guest Nutrition on sign-in when source=nutrition", async () => {
    localStorage.clear();
    localStorage.setItem("nutrition_guest_session", "guest_nutrition_123");

    supabaseCurrent = createSupabaseMock({
      longevity_nutrition_assessments: {
        maybeSingle: async () => ({
          data: {
            id: "n1",
            session_id: "guest_nutrition_123",
            user_id: null,
            claimed_by_user_id: null,
            craving_details: { sweet: 3, salty: 3, crunchy: 3, creamy: 3 },
            age: 40,
            height_cm: 170,
            weight_kg: 65,
            goal_primary: "maintenance",
            activity_level: "moderate",
            nutrition_identity_type: "balanced",
            protein_score: 3,
            protein_sources: [],
            plant_diversity_score: 3,
            fiber_score: 3,
            gut_symptom_score: 0,
            gut_symptoms: [],
            inflammation_score: 0,
            inflammation_symptoms: [],
            first_meal_hour: 9,
            last_meal_hour: 19,
            eats_after_8pm: false,
            chrononutrition_type: "early",
            meal_timing_window: 10,
            menopause_stage: null,
            craving_pattern: 3,
            hydration_score: 3,
            caffeine_score: 3,
            alcohol_intake: 0,
            allergies: [],
            values_dietary: [],
            confidence_in_cooking: 3,
            food_preference_type: "omnivore",
            metabolic_symptom_flags: [],
            longevity_nutrition_score: 11,
            completed_at: new Date().toISOString(),
          },
          error: null,
        }),
        update: async () => ({ data: null, error: null }),
      },
      nutrition_preferences: {
        upsert: async () => ({ data: null, error: null }),
      },
    });
    supabaseCurrent.auth.getUser = vi.fn(async () => ({ data: { user: { id: "u1" } } }));

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/auth?source=nutrition&returnTo=%2Flongevity-nutrition%2Fresults"]}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/longevity-nutrition/results" element={<div>nutrition-results</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText("your@email.com"), "a@b.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem("nutrition_guest_session")).toBeNull();
    });
  });
});

