export const normalizeActivityLevel = (value?: string | null) => {
  if (!value) return value ?? null;

  const normalized = value.toLowerCase().trim().replace(/\s+/g, "_");

  if (normalized === "sedentary") return "sedentary";
  if (normalized === "light" || normalized === "lightly_active") return "lightly_active";
  if (normalized === "moderate" || normalized === "moderately_active") return "moderately_active";
  if (normalized === "active" || normalized === "very_active") return "very_active";
  if (normalized === "athlete" || normalized === "extremely_active") return "extremely_active";

  return normalized;
};
