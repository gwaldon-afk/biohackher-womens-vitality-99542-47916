import { vi } from "vitest";

export function createSupabaseMock() {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    is: vi.fn(() => query),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    insert: vi.fn(async () => ({ data: null, error: null })),
    update: vi.fn(async () => ({ data: null, error: null })),
    upsert: vi.fn(async () => ({ data: null, error: null })),
  };

  return {
    from: vi.fn(() => query),
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signUp: vi.fn(async () => ({ error: null })),
      signInWithPassword: vi.fn(async () => ({ error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      getUser: vi.fn(async () => ({ data: { user: null } })),
    },
  };
}

