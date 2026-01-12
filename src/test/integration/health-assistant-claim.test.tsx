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

let supabaseCurrent: any;
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

describe("Auth integration: claim health assistant session on sign-in", () => {
  it("calls claim_health_questions_session and clears localStorage key", async () => {
    localStorage.clear();
    localStorage.setItem("health_questions_session_id", "ha_session_1");

    supabaseCurrent = createSupabaseMock();
    supabaseCurrent.auth.getUser = vi.fn(async () => ({ data: { user: { id: "u1" } } }));
    supabaseCurrent.rpc = vi.fn(async (fn: string) => {
      if (fn === "claim_health_questions_session") return { data: 2, error: null };
      return { data: null, error: null };
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/auth?source=health-assistant&returnTo=%2Fhealth-assistant"]}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/health-assistant" element={<div>health-assistant</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText("your@email.com"), "a@b.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(supabaseCurrent.rpc).toHaveBeenCalledWith("claim_health_questions_session", { p_session_id: "ha_session_1" });
      expect(localStorage.getItem("health_questions_session_id")).toBeNull();
    });
  });
});

