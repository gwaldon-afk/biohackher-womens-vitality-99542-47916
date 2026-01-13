import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/hooks/useProtocolRecommendations", () => ({
  useProtocolRecommendations: () => ({ pendingCount: 0 }),
}));

vi.mock("@/hooks/useCart", async () => {
  const React = (await import("react")).default;
  return {
    CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useCart: () => ({
      items: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      getTotalItems: () => 0,
      getTotalPrice: () => 0,
      isCartOpen: false,
      setIsCartOpen: vi.fn(),
    }),
  };
});

vi.mock("@/hooks/useAuth", async () => {
  const React = (await import("react")).default;
  return {
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useAuth: () => ({
      user: null,
      session: null,
      profile: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    }),
  };
});

import Index from "./Index";

describe("Index page smoke", () => {
  it("renders the landing page hero", () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>,
    );

    expect(screen.getByAltText(/biohackher logo/i)).toBeInTheDocument();
  });
});

