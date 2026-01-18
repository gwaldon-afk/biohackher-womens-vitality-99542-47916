import type { Location } from "react-router-dom";

export type ShellKind = "none" | "app" | "flow" | "admin";
export type TabKey = "today" | "toolkit" | "nutrition" | "progress" | "profile";

export type RouteMeta = {
  title: string;
  shell: ShellKind;
  tabKey?: TabKey;
  /**
   * Used when the user lands directly on a page (no SPA history).
   * If omitted, callers should fall back to a safe default (usually `/today` or `/`).
   */
  parentRoute?: string;
  /**
   * If true, show a back affordance in the shell.
   */
  showBack?: boolean;
};

function getSearchParam(search: string, key: string) {
  try {
    return new URLSearchParams(search).get(key);
  } catch {
    return null;
  }
}

// Keep this small and opinionated: broad matchers first, then more specific.
const MATCHERS: Array<{
  test: (pathname: string) => boolean;
  meta: (loc: Pick<Location, "pathname" | "search">) => RouteMeta;
}> = [
  // Admin area
  {
    test: (p) => p === "/admin" || p.startsWith("/admin/"),
    meta: () => ({ title: "Admin", shell: "admin", showBack: true, parentRoute: "/today" }),
  },

  // Auth + gates
  {
    test: (p) => p === "/auth",
    meta: (loc) => {
      const returnTo = getSearchParam(loc.search, "returnTo");
      return {
        title: "Sign in",
        shell: "flow",
        showBack: true,
        parentRoute: returnTo || "/",
      };
    },
  },
  {
    test: (p) => p === "/complete-profile",
    meta: (loc) => {
      const returnTo = getSearchParam(loc.search, "returnTo");
      return {
        title: "Complete profile",
        shell: "flow",
        showBack: true,
        parentRoute: returnTo || "/today",
      };
    },
  },

  // Onboarding (focused flow)
  {
    test: (p) => p === "/onboarding" || p.startsWith("/onboarding/"),
    meta: (loc) => {
      const p = loc.pathname;
      if (p === "/onboarding/intro-3step") return { title: "Welcome", shell: "flow", showBack: true, parentRoute: "/" };
      if (p === "/onboarding/permission-setup")
        return { title: "Permissions", shell: "flow", showBack: true, parentRoute: "/onboarding/intro-3step" };
      if (p === "/onboarding/hormone-compass-menopause")
        return { title: "Menopause", shell: "flow", showBack: true, parentRoute: "/onboarding/permission-setup" };
      if (p === "/onboarding/goal-setup-chat") return { title: "Goals", shell: "flow", showBack: true, parentRoute: "/today" };
      if (p === "/onboarding/goal-affirmation")
        return { title: "Affirmation", shell: "flow", showBack: true, parentRoute: "/onboarding/goal-setup-chat" };
      if (p === "/onboarding/hormone-compass-results")
        return { title: "Results", shell: "flow", showBack: true, parentRoute: "/hormone-compass/assessment" };
      return { title: "Onboarding", shell: "flow", showBack: true, parentRoute: "/" };
    },
  },

  // Assessments + results (focused)
  {
    test: (p) => p === "/guest-lis-assessment",
    meta: () => ({ title: "Assessment", shell: "flow", showBack: true, parentRoute: "/" }),
  },
  {
    test: (p) => p.startsWith("/assessment/") && !p.endsWith("/results"),
    meta: () => ({ title: "Assessment", shell: "flow", showBack: true, parentRoute: "/pillars" }),
  },
  {
    test: (p) => p.startsWith("/assessment/") && p.endsWith("/results"),
    meta: (loc) => {
      const parent = loc.pathname.replace(/\/results$/, "");
      return { title: "Results", shell: "flow", showBack: true, parentRoute: parent };
    },
  },
  {
    test: (p) => p === "/brain-assessment",
    meta: () => ({ title: "Assessment", shell: "flow", showBack: true, parentRoute: "/pillars" }),
  },
  {
    test: (p) => p.startsWith("/7-day-plan/"),
    meta: () => ({ title: "Plan", shell: "flow", showBack: true, parentRoute: "/pillars" }),
  },
  {
    test: (p) => p === "/longevity-nutrition",
    meta: () => ({ title: "Nutrition assessment", shell: "flow", showBack: true, parentRoute: "/biohacking-toolkit" }),
  },
  {
    test: (p) => p === "/longevity-nutrition/results",
    meta: () => ({ title: "Nutrition results", shell: "flow", showBack: true, parentRoute: "/longevity-nutrition" }),
  },
  {
    test: (p) => p === "/longevity-mindset-quiz",
    meta: () => ({ title: "Mindset", shell: "flow", showBack: true, parentRoute: "/biohacking-toolkit" }),
  },
  {
    test: (p) => p === "/lis2-setup",
    meta: () => ({ title: "Setup", shell: "flow", showBack: true, parentRoute: "/biohacking-toolkit" }),
  },
  {
    test: (p) => p === "/lis-results",
    meta: () => ({ title: "Your results", shell: "flow", showBack: true, parentRoute: "/biohacking-toolkit" }),
  },
  {
    test: (p) => p === "/daily-score-results",
    meta: () => ({ title: "Your score", shell: "flow", showBack: true, parentRoute: "/daily-check-in" }),
  },
  {
    test: (p) => p === "/lis2-research",
    meta: () => ({ title: "Research", shell: "flow", showBack: true, parentRoute: "/lis-results" }),
  },
  {
    test: (p) => p === "/hormone-compass/assessment",
    meta: () => ({ title: "HormoneCompass™", shell: "flow", showBack: true, parentRoute: "/profile" }),
  },
  {
    test: (p) => p === "/hormone-compass/results",
    meta: () => ({ title: "Results", shell: "flow", showBack: true, parentRoute: "/hormone-compass/assessment" }),
  },

  // Energy loop: treat as focused subflow except dashboard
  {
    test: (p) => p === "/energy-loop",
    meta: () => ({ title: "Energy loop", shell: "app", tabKey: "progress", showBack: true, parentRoute: "/progress" }),
  },
  {
    test: (p) => p.startsWith("/energy-loop/"),
    meta: () => ({ title: "Energy loop", shell: "flow", showBack: true, parentRoute: "/energy-loop" }),
  },

  // App tabs and in-app pages
  { test: (p) => p === "/today", meta: () => ({ title: "Today", shell: "app", tabKey: "today", showBack: false }) },
  { test: (p) => p === "/progress", meta: () => ({ title: "Progress", shell: "app", tabKey: "progress", showBack: false }) },
  { test: (p) => p === "/nutrition", meta: () => ({ title: "Nutrition", shell: "app", tabKey: "nutrition", showBack: false }) },
  { test: (p) => p === "/profile", meta: () => ({ title: "Profile", shell: "app", tabKey: "profile", showBack: false }) },
  { test: (p) => p === "/biohacking-toolkit", meta: () => ({ title: "Toolkit", shell: "app", tabKey: "toolkit", showBack: false }) },

  // Tab-adjacent pages (still AppShell, keep bottom nav)
  { test: (p) => p === "/plans/28-day", meta: () => ({ title: "28‑day cycle", shell: "app", tabKey: "today", showBack: true, parentRoute: "/today" }) },
  { test: (p) => p === "/plans/90-day", meta: () => ({ title: "90‑day plan", shell: "app", tabKey: "today", showBack: true, parentRoute: "/today" }) },
  { test: (p) => p === "/plans/weekly", meta: () => ({ title: "Weekly plan", shell: "app", tabKey: "today", showBack: true, parentRoute: "/today" }) },
  { test: (p) => p === "/plan-home", meta: () => ({ title: "Plans", shell: "app", tabKey: "today", showBack: true, parentRoute: "/today" }) },

  { test: (p) => p === "/nutrition/meal-plan", meta: () => ({ title: "Meal plan", shell: "app", tabKey: "nutrition", showBack: true, parentRoute: "/nutrition" }) },
  { test: (p) => p === "/nutrition-scan", meta: () => ({ title: "Nutrition scan", shell: "app", tabKey: "nutrition", showBack: true, parentRoute: "/nutrition" }) },

  { test: (p) => p === "/pillars", meta: () => ({ title: "Pillars", shell: "app", tabKey: "toolkit", showBack: true, parentRoute: "/biohacking-toolkit" }) },
  { test: (p) => p === "/pillars-display", meta: () => ({ title: "Pillars", shell: "app", tabKey: "toolkit", showBack: true, parentRoute: "/pillars" }) },
  { test: (p) => p === "/health-assistant", meta: () => ({ title: "Assistant", shell: "app", tabKey: "toolkit", showBack: true, parentRoute: "/biohacking-toolkit" }) },
  { test: (p) => p === "/sleep", meta: () => ({ title: "Sleep", shell: "app", tabKey: "toolkit", showBack: true, parentRoute: "/biohacking-toolkit" }) },
  { test: (p) => p === "/wearables", meta: () => ({ title: "Wearables", shell: "app", tabKey: "toolkit", showBack: true, parentRoute: "/biohacking-toolkit" }) },
  { test: (p) => p === "/symptom-trends", meta: () => ({ title: "Trends", shell: "app", tabKey: "toolkit", showBack: true, parentRoute: "/pillars" }) },
  { test: (p) => p === "/assessment-history", meta: () => ({ title: "History", shell: "app", tabKey: "toolkit", showBack: true, parentRoute: "/biohacking-toolkit" }) },
  { test: (p) => p === "/my-protocol", meta: () => ({ title: "My protocol", shell: "app", tabKey: "toolkit", showBack: true, parentRoute: "/today" }) },
  { test: (p) => p === "/protocol-library", meta: () => ({ title: "Protocol library", shell: "app", tabKey: "toolkit", showBack: true, parentRoute: "/my-protocol" }) },
  { test: (p) => p === "/exercise/setup", meta: () => ({ title: "Exercise", shell: "app", tabKey: "toolkit", showBack: true, parentRoute: "/today" }) },

  { test: (p) => p === "/reports", meta: () => ({ title: "Reports", shell: "app", tabKey: "progress", showBack: true, parentRoute: "/progress" }) },
  { test: (p) => p === "/analytics", meta: () => ({ title: "Analytics", shell: "app", tabKey: "progress", showBack: true, parentRoute: "/progress" }) },

  { test: (p) => p === "/settings", meta: () => ({ title: "Settings", shell: "app", tabKey: "profile", showBack: true, parentRoute: "/profile" }) },
  { test: (p) => p === "/profile-settings", meta: () => ({ title: "Profile settings", shell: "app", tabKey: "profile", showBack: true, parentRoute: "/profile" }) },
  { test: (p) => p === "/achievements", meta: () => ({ title: "Achievements", shell: "app", tabKey: "profile", showBack: true, parentRoute: "/profile" }) },
  { test: (p) => p === "/upgrade", meta: () => ({ title: "Upgrade", shell: "app", tabKey: "profile", showBack: true, parentRoute: "/profile" }) },

  // Experts / shop / misc in-app pages
  { test: (p) => p === "/experts", meta: () => ({ title: "Experts", shell: "app", tabKey: "profile", showBack: true, parentRoute: "/today" }) },
  { test: (p) => p.startsWith("/expert/"), meta: () => ({ title: "Expert", shell: "app", tabKey: "profile", showBack: true, parentRoute: "/experts" }) },
  { test: (p) => p === "/shop", meta: () => ({ title: "Shop", shell: "app", tabKey: "profile", showBack: true, parentRoute: "/today" }) },
  { test: (p) => p === "/coaching", meta: () => ({ title: "Coaching", shell: "app", tabKey: "profile", showBack: true, parentRoute: "/today" }) },
  { test: (p) => p === "/import-research", meta: () => ({ title: "Import research", shell: "app", tabKey: "toolkit", showBack: true, parentRoute: "/biohacking-toolkit" }) },
  { test: (p) => p === "/research-evidence", meta: () => ({ title: "Research", shell: "app", tabKey: "toolkit", showBack: true, parentRoute: "/biohacking-toolkit" }) },
  { test: (p) => p === "/master-dashboard", meta: () => ({ title: "Dashboard", shell: "app", tabKey: "today", showBack: true, parentRoute: "/today" }) },
  { test: (p) => p === "/dashboard-main", meta: () => ({ title: "Dashboard", shell: "app", tabKey: "today", showBack: true, parentRoute: "/today" }) },
  { test: (p) => p === "/insights-detail", meta: () => ({ title: "Insight", shell: "app", tabKey: "today", showBack: true, parentRoute: "/today" }) },
  { test: (p) => p === "/mood-checkin", meta: () => ({ title: "Mood check-in", shell: "app", tabKey: "today", showBack: true, parentRoute: "/today" }) },
  { test: (p) => p === "/quick-log", meta: () => ({ title: "Quick log", shell: "app", tabKey: "today", showBack: true, parentRoute: "/today" }) },

  // Guest preview flows
  { test: (p) => p === "/goals-preview", meta: () => ({ title: "Goals preview", shell: "flow", showBack: true, parentRoute: "/" }) },

  // Static informational pages (keep in app shell so users have consistent navigation)
  { test: (p) => p === "/about", meta: () => ({ title: "About", shell: "app", tabKey: "profile", showBack: true, parentRoute: "/today" }) },

  // Toolkit category dynamic route (must remain app shell, but not steal root pages)
  {
    test: (p) => /^\/[a-z0-9-]+$/i.test(p) && p !== "/" && !p.startsWith("/admin"),
    meta: () => ({ title: "Toolkit", shell: "app", tabKey: "toolkit", showBack: true, parentRoute: "/biohacking-toolkit" }),
  },
];

export function getRouteMeta(location: Pick<Location, "pathname" | "search">): RouteMeta {
  const pathname = location.pathname !== "/" && location.pathname.endsWith("/")
    ? location.pathname.slice(0, -1)
    : location.pathname;
  for (const m of MATCHERS) {
    if (m.test(pathname)) return m.meta(location);
  }
  // Default: marketing-ish or unknown.
  if (pathname === "/") return { title: "Home", shell: "none" };
  return { title: "Page", shell: "none", showBack: true, parentRoute: "/" };
}

