import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/integrations/supabase/client", async () => {
  const { createSupabaseMock } = await import("@/test/mocks/supabase");
  return { supabase: createSupabaseMock() };
});

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
      signUp: vi.fn(async () => ({ error: null })),
      signIn: vi.fn(async () => ({ error: null })),
    }),
  };
});

import Auth from "./Auth";

describe("Auth page smoke", () => {
  it("renders sign in / sign up UI", () => {
    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <Auth />
      </MemoryRouter>,
    );

    expect(screen.getByRole("tab", { name: /sign in/i })).toBeInTheDocument();
  });
});

