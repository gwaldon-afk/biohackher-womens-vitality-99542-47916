import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TEST_PERSONAS } from "@/config/mockTestPersonas";
import { createSupabaseMock } from "@/test/mocks/supabase";
import { ConsolidatedInsightsCard } from "@/components/profile/ConsolidatedInsightsCard";
import { AssessmentAIAnalysisCard } from "@/components/AssessmentAIAnalysisCard";
import {
  GOLDEN_PERSONA_IDS,
  buildAssessmentAnalysisFixture,
  buildCrossAssessmentFixture,
} from "@/test/fixtures/personaGoldenSnapshots";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    promise: vi.fn(),
  },
}));

// Use `var` to avoid TDZ issues with hoisted vi.mock factories.
// eslint-disable-next-line no-var
var supabaseCurrent: any;
vi.mock("@/integrations/supabase/client", () => ({
  get supabase() {
    return supabaseCurrent;
  },
}));

// eslint-disable-next-line no-var
var currentUserId: string | null = null;
vi.mock("@/hooks/useAuth", async () => {
  const React = (await import("react")).default;
  return {
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useAuth: () => ({
      user: currentUserId ? { id: currentUserId } : null,
      session: currentUserId ? ({ user: { id: currentUserId } } as any) : null,
      loading: false,
    }),
  };
});

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe.sequential("Personas: 3-assessment consolidation + AI analysis (contract)", () => {
  it.each(TEST_PERSONAS.map((p) => [p.id, p] as const))(
    "persona %s: can generate cross-assessment consolidation and render insights",
    async (_id, persona) => {
      currentUserId = persona.testUserId;
      localStorage.clear();

      // Mutable store to emulate "generate" then "refetch".
      let insightsRows: any[] = [];

      supabaseCurrent = createSupabaseMock({
        assessment_progress: {
          single: async () => ({
            data: {
              user_id: persona.testUserId,
              lis_completed: true,
              nutrition_completed: true,
              hormone_completed: true,
            },
            error: null,
          }),
        },
        user_insights: {
          // ConsolidatedInsightsCard uses `.select(...).eq(...).order(...)` and awaits it (no terminal call),
          // so our supabase mock resolves via the `single` handler even though it returns an array.
          single: async () => ({ data: insightsRows, error: null }),
        },
      });

      // Needed for "loginRequired" guard in handleRefreshAnalysis.
      supabaseCurrent.auth.getSession = vi.fn(async () => ({
        data: { session: { access_token: "t", user: { id: persona.testUserId } } },
      }));

      supabaseCurrent.functions = {
        invoke: vi.fn(async (fn: string, args?: any) => {
          if (fn === "analyze-cross-assessments") {
            // Emulate server-side creation of user_insights rows.
            const fixture = buildCrossAssessmentFixture(persona);
            insightsRows = [
              {
                id: `ins_${persona.id}_consolidated`,
                insight_type: "cross_assessment",
                category: "consolidated",
                title: `Consolidated graduation report (${persona.id})`,
                description: `Cross-assessment synthesis for ${persona.name}`,
                recommendations: fixture.recommendations,
                priority: "high",
                generated_at: fixture.recommendations.generated_at,
              },
              {
                id: `ins_${persona.id}_body`,
                insight_type: "cross_assessment",
                category: "BODY",
                title: "Body pillar focus",
                description: "Movement + recovery priorities",
                recommendations: {},
                priority: "medium",
                generated_at: fixture.recommendations.generated_at,
              },
            ];
            return { data: { ok: true }, error: null };
          }
          return { data: null, error: null };
        }),
      };

      const user = userEvent.setup();
      renderWithQuery(<ConsolidatedInsightsCard />);

      // When there are completed assessments but no insights, card prompts generation.
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /generate/i }));

      await waitFor(() => {
        expect(supabaseCurrent.functions.invoke).toHaveBeenCalledWith(
          "analyze-cross-assessments",
          expect.objectContaining({ body: expect.objectContaining({ trigger_assessment: "manual_refresh" }) }),
        );
      });

      // After refetch, we should see our consolidated content rendered (the component surfaces description).
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`Cross-assessment synthesis for\\s+${persona.name}`, "i"))).toBeInTheDocument();
      });
    },
    30000,
  );

  it.each(GOLDEN_PERSONA_IDS)(
    "golden persona %s: analyze-cross-assessments payload + consolidated recommendations snapshot",
    async (personaId) => {
      const persona = TEST_PERSONAS.find((p) => p.id === personaId)!;
      currentUserId = persona.testUserId;
      localStorage.clear();

      const fixture = buildCrossAssessmentFixture(persona);
      let insightsRows: any[] = [];

      supabaseCurrent = createSupabaseMock({
        assessment_progress: {
          single: async () => ({
            data: {
              user_id: persona.testUserId,
              lis_completed: true,
              nutrition_completed: true,
              hormone_completed: true,
            },
            error: null,
          }),
        },
        user_insights: {
          single: async () => ({ data: insightsRows, error: null }),
        },
      });

      supabaseCurrent.auth.getSession = vi.fn(async () => ({
        data: { session: { access_token: "t", user: { id: persona.testUserId } } },
      }));

      const invoke = vi.fn(async (_fn: string, args?: any) => {
        // Snapshot the request contract.
        expect(args).toMatchSnapshot();
        insightsRows = [
          {
            id: `ins_${persona.id}_consolidated`,
            insight_type: "cross_assessment",
            category: "consolidated",
            title: `Consolidated graduation report (${persona.id})`,
            description: `Cross-assessment synthesis for ${persona.name}`,
            recommendations: fixture.recommendations,
            priority: "high",
            generated_at: fixture.recommendations.generated_at,
          },
        ];
        return { data: { ok: true }, error: null };
      });

      supabaseCurrent.functions = { invoke };

      const user = userEvent.setup();
      renderWithQuery(<ConsolidatedInsightsCard />);

      await user.click(await screen.findByRole("button", { name: /generate/i }));

      await waitFor(() => {
        expect(invoke).toHaveBeenCalledWith("analyze-cross-assessments", expect.anything());
      });

      // Snapshot the recommendations (golden output contract)
      expect(fixture.recommendations).toMatchSnapshot();
    },
    30000,
  );

  it.each(GOLDEN_PERSONA_IDS)(
    "golden persona %s: per-assessment AI analysis contract (LIS)",
    async (personaId) => {
      const persona = TEST_PERSONAS.find((p) => p.id === personaId)!;
      currentUserId = persona.testUserId;

      const analysis = buildAssessmentAnalysisFixture(persona);

      supabaseCurrent = createSupabaseMock();
      supabaseCurrent.functions = {
        invoke: vi.fn(async (_fn: string, args?: any) => {
          // Snapshot the request payload contract (no prose assertions).
          expect(args).toMatchSnapshot();
          return { data: analysis, error: null };
        }),
      };

      renderWithQuery(
        <AssessmentAIAnalysisCard
          assessmentType="lis"
          assessmentId="lis"
          score={persona.lisData.overallScore}
          scoreCategory="test"
          answers={persona.lisData.answers}
          metadata={{ _persona: persona.id }}
          autoGenerate={true}
        />,
      );

      // The analysis renders an "Overall Analysis" section when present.
      await waitFor(() => {
        expect(screen.getByText(/overall analysis/i)).toBeInTheDocument();
      });
      expect(screen.getByText(new RegExp(`Analysis for ${persona.name}`, "i"))).toBeInTheDocument();
    },
    30000,
  );
});

