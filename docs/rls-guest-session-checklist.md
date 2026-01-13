## RLS guest/session checklist (prevent data leakage)

Use this whenever you add or change any table that stores **guest** or **session-based** data (anything with `session_id`, `expires_at`, `claimed_by_user_id`, etc.).

- **Never “authorize” via `session_id IS NOT NULL`**
  - Any RLS `USING (...)` condition like `(user_id IS NULL AND session_id IS NOT NULL)` makes *all* guest rows readable to everyone.
  - Replace with **no public SELECT**, and use a session-bound RPC (below) if guests need access.

- **Guest reads: avoid direct table `SELECT`**
  - **Do not** allow `SELECT` on guest tables to `public`.
  - Prefer a **SECURITY DEFINER RPC** that requires the caller to present the exact `session_id` (treat it like a bearer secret) and enforces `expires_at`.

- **Session IDs must be high entropy**
  - Treat `session_id` like a password. Generate with `crypto.randomUUID()` (or equivalent), not timestamp+short-random.
  - Don’t log or expose session IDs unnecessarily (URLs, analytics, error logs).

- **Enforce expiry**
  - Add `expires_at` for guest rows and enforce `expires_at > now()` in guest-view RPCs and claim RPCs.
  - Add indexes on `expires_at` and `session_id` for cleanup and lookups.

- **Claim operations: authenticated-only, idempotent, and safe**
  - Claim should require `auth.uid()` and should only succeed if:
    - row is unclaimed (or already claimed by that same user)
    - row is not expired
  - Prevent “claim someone else’s session” (fail if claimed by another user).
  - Prefer a **SECURITY DEFINER claim RPC** and `REVOKE EXECUTE FROM PUBLIC`.

- **RLS rules of thumb**
  - `SELECT`: authenticated users only, `auth.uid() = user_id` (or `claimed_by_user_id = auth.uid()`).
  - `INSERT` guest rows: allow minimal columns only; validate in application/edge function.
  - `UPDATE` on guest tables: avoid broad authenticated updates; use a claim RPC instead.

- **Tests / verification**
  - Verify with an anon client that guest tables are **not selectable** directly.
  - Verify guest view works only via RPC and only with correct `session_id`.
  - Verify claim works only when authenticated and is idempotent.

