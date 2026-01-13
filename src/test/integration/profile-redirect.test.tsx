import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    promise: vi.fn(),
  },
}));

// Mock auth + health profile for predictable redirects.
const authState: { user: any; loading: boolean } = { user: { id: "u1" }, loading: false };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

const healthProfileState: {
  profile: any;
  loading: boolean;
  createOrUpdateProfile: any;
} = {
  profile: null,
  loading: false,
  createOrUpdateProfile: vi.fn(async () => ({})),
};

vi.mock("@/hooks/useHealthProfile", () => ({
  useHealthProfile: () => ({
    profile: healthProfileState.profile,
    loading: healthProfileState.loading,
    createOrUpdateProfile: healthProfileState.createOrUpdateProfile,
  }),
}));

import ProtectedRoute from "@/components/ProtectedRoute";
import { RequireHealthProfile } from "@/components/RequireHealthProfile";
import CompleteHealthProfile from "@/pages/CompleteHealthProfile";

function LocationLabel() {
  const loc = useLocation();
  return <div data-testid="loc">{loc.pathname + loc.search}</div>;
}

describe("Profile completion integration", () => {
  it("redirects /today -> /complete-profile with returnTo preserved", async () => {
    healthProfileState.profile = null;
    healthProfileState.loading = false;
    authState.user = { id: "u1" };
    authState.loading = false;

    render(
      <MemoryRouter initialEntries={["/today?x=1"]}>
        <Routes>
          <Route
            path="/today"
            element={
              <ProtectedRoute>
                <RequireHealthProfile>
                  <div>today-page</div>
                </RequireHealthProfile>
              </ProtectedRoute>
            }
          />
          <Route path="/complete-profile" element={<LocationLabel />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByTestId("loc")).toHaveTextContent("/complete-profile?returnTo=%2Ftoday%3Fx%3D1");
  });

  it("submitting CompleteHealthProfile returns to returnTo path", async () => {
    healthProfileState.profile = null;
    healthProfileState.loading = false;
    healthProfileState.createOrUpdateProfile = vi.fn(async () => ({}));

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/complete-profile?returnTo=%2Ftoday"]}>
        <Routes>
          <Route path="/complete-profile" element={<CompleteHealthProfile />} />
          <Route path="/today" element={<div>today-page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // Fill required fields via IDs (labels are translated).
    const dob = document.getElementById("dob") as HTMLInputElement;
    const weight = document.getElementById("weight") as HTMLInputElement;
    const height = document.getElementById("height") as HTMLInputElement;
    expect(dob).toBeTruthy();
    expect(weight).toBeTruthy();
    expect(height).toBeTruthy();

    await user.type(dob, "1990-01-01");
    await user.type(weight, "65");
    await user.type(height, "170");

    // Select activity level (Radix Select)
    await user.click(screen.getByRole("combobox"));
    const sedentary = screen
      .getAllByText(/sedentary/i)
      .find((el) => el.tagName.toLowerCase() !== "option");
    expect(sedentary).toBeTruthy();
    await user.click(sedentary!);

    // Submit
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByText("today-page")).toBeInTheDocument();
    expect(healthProfileState.createOrUpdateProfile).toHaveBeenCalled();
  });
});

