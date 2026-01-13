## Phase C extension — Supabase security deploy + verification

### Why this matters (current state)
The Phase C RLS/RPC hardening migrations exist locally in `supabase/migrations/`, but **they are not deployed** to your Supabase project yet. A quick anon probe against the configured project ref in `.env` indicates:

- **Anon can currently read from `guest_lis_assessments`** (returned rows)
- **Anon can currently read from `longevity_nutrition_assessments`** (returned rows)
- The new RPC helpers (e.g. `get_guest_lis_assessment`, `claim_guest_lis_assessment`, `claim_health_questions_session`) are **missing** remotely.

That combination implies a **PII leakage risk** for guest/session data until migrations are applied.

### Deploy the migrations to Supabase
This repo is already configured with your project ref in `supabase/config.toml`:

- `project_id = "tcjqdtlqhbmyjckbfokz"`

From the repo root:

1) **Link the project** (requires your **database password** from the Supabase dashboard):

```bash
npx supabase link --project-ref tcjqdtlqhbmyjckbfokz --password "<YOUR_DB_PASSWORD>"
```

2) **Push migrations**:

```bash
npx supabase db push
```

### Verify (RLS + RPC behavior)
This repo includes a smoke-check script:

```bash
npm run supabase:rls:check
```

It validates:
- anon cannot directly `SELECT` from guest/session tables
- PUBLIC guest-read RPCs exist and are callable
- authenticated-only claim RPCs exist and reject anon callers

### If you need an immediate “stop the bleeding” mitigation
If you cannot deploy right away:
- In Supabase dashboard, temporarily **disable/lock down** any public SELECT policies on:
  - `guest_lis_assessments`
  - `longevity_nutrition_assessments`
  - any other guest/session tables
- Then deploy the migrations as soon as possible to restore the intended guest-read + authenticated-claim behavior via RPCs.

