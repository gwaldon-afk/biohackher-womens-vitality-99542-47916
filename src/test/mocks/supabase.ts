import { vi } from "vitest";

type SupabaseResult<T> = { data: T; error: any };

type TableHandlers = Record<
  string,
  Partial<{
    maybeSingle: () => Promise<SupabaseResult<any>>;
    insert: (...args: any[]) => Promise<SupabaseResult<any>>;
    update: (...args: any[]) => Promise<SupabaseResult<any>>;
    upsert: (...args: any[]) => Promise<SupabaseResult<any>>;
    single: () => Promise<SupabaseResult<any>>;
  }>
>;

export function createSupabaseMock(handlers: TableHandlers = {}) {
  const makeBuilder = (table: string) => {
    const state: { op: null | "insert" | "update" | "upsert" | "select"; opArgs: any[] } = {
      op: null,
      opArgs: [],
    };

    const resolve = async (): Promise<SupabaseResult<any>> => {
      const h = handlers[table] || {};
      if (state.op === "insert" && h.insert) return await h.insert(...state.opArgs);
      if (state.op === "update" && h.update) return await h.update(...state.opArgs);
      if (state.op === "upsert" && h.upsert) return await h.upsert(...state.opArgs);
      if (state.op === "select" && h.single) return await h.single();
      return { data: null, error: null };
    };

    const builder: any = {
      __table: table,

      // Filter/build methods
      select: vi.fn(() => {
        state.op = "select";
        return builder;
      }),
      eq: vi.fn(() => builder),
      is: vi.fn(() => builder),
      in: vi.fn(() => builder),
      order: vi.fn(() => builder),
      limit: vi.fn(() => builder),

      // Mutations (chainable)
      insert: vi.fn((...args: any[]) => {
        state.op = "insert";
        state.opArgs = args;
        return builder;
      }),
      update: vi.fn((...args: any[]) => {
        state.op = "update";
        state.opArgs = args;
        return builder;
      }),
      upsert: vi.fn((...args: any[]) => {
        state.op = "upsert";
        state.opArgs = args;
        return builder;
      }),

      // Terminal methods
      maybeSingle: vi.fn(async () => {
        const fn = handlers[table]?.maybeSingle;
        return fn ? await fn() : { data: null, error: null };
      }),
      single: vi.fn(async () => {
        const fn = handlers[table]?.single;
        return fn ? await fn() : { data: null, error: null };
      }),

      // Allow `await builder` (e.g. await supabase.from().update().eq())
      then: (onFulfilled: any, onRejected: any) => resolve().then(onFulfilled, onRejected),
    };

    return builder;
  };

  return {
    from: vi.fn((table: string) => makeBuilder(table)),
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

