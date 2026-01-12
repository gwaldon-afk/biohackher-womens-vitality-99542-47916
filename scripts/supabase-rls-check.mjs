import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function readDotEnv(path = ".env") {
  const env = {};
  const raw = fs.readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([A-Z0-9_]+)=("?)(.*)\2$/);
    if (!m) continue;
    env[m[1]] = m[3];
  }
  return env;
}

function randomSessionId() {
  return `test_session_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function randomUuidV4() {
  // Not crypto-strong; sufficient for a "nonexistent row" probe.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isMissingFunctionError(message) {
  return String(message || "").toLowerCase().includes("could not find the function");
}

async function main() {
  const env = readDotEnv(".env");
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in .env");
    process.exit(2);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const failures = [];
  const report = [];

  async function expectAnonNoRows(table) {
    const { data, error } = await supabase.from(table).select("id").limit(1);
    const rows = Array.isArray(data) ? data.length : null;

    report.push({ check: "anon_select", table, rows, ok: !error && rows === 0, error: error?.message ?? null });

    if (error) failures.push(`${table}: anon select errored (${error.message})`);
    if (rows && rows > 0) failures.push(`${table}: anon select returned ${rows} row(s) (PII leak risk)`);
  }

  async function expectPublicRpcExistsAndReturns(fn, args) {
    const { data, error } = await supabase.rpc(fn, args);
    report.push({ check: "rpc_public", fn, ok: !error, error: error?.message ?? null, hasData: data != null });
    if (error) {
      if (isMissingFunctionError(error.message)) failures.push(`${fn}: missing (migrations not applied)`);
      else failures.push(`${fn}: unexpected error for PUBLIC call (${error.message})`);
    }
  }

  async function expectProtectedRpcExists(fn, args) {
    const { error } = await supabase.rpc(fn, args);
    report.push({ check: "rpc_protected", fn, ok: !!error && !isMissingFunctionError(error.message), error: error?.message ?? null });
    if (!error) failures.push(`${fn}: unexpectedly succeeded as anon (should be authenticated-only)`);
    else if (isMissingFunctionError(error.message)) failures.push(`${fn}: missing (migrations not applied)`);
  }

  // Tables that should NOT be readable by anon (guest/session PII risk).
  await expectAnonNoRows("guest_lis_assessments");
  await expectAnonNoRows("guest_symptom_assessments");
  await expectAnonNoRows("longevity_nutrition_assessments");
  await expectAnonNoRows("health_questions");

  // RPCs that should exist after Phase C migrations.
  const sid = randomSessionId();
  const fakeNutritionId = randomUuidV4();

  await expectPublicRpcExistsAndReturns("get_guest_lis_assessment", { p_session_id: sid });
  await expectProtectedRpcExists("claim_guest_lis_assessment", { p_session_id: sid });

  await expectPublicRpcExistsAndReturns("get_guest_nutrition_assessment", { p_id: fakeNutritionId, p_session_id: sid });
  await expectProtectedRpcExists("claim_guest_nutrition_assessment", { p_session_id: sid });

  await expectPublicRpcExistsAndReturns("get_health_questions_by_session", { p_session_id: sid, p_limit: 1 });
  await expectProtectedRpcExists("claim_health_questions_session", { p_session_id: sid });

  if (failures.length) {
    console.error("Supabase RLS/RPC checks FAILED:");
    for (const f of failures) console.error(`- ${f}`);
    process.exit(1);
  }

  console.log("Supabase RLS/RPC checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

