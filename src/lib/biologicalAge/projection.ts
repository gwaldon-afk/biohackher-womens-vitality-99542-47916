import { BiologicalAgeProjection } from "./types";

const roundAge = (value: number) => Math.round(value);

export const getExpectedImprovement90 = (
  biologicalAge: number,
  chronologicalAge?: number | null
) => {
  if (chronologicalAge === null || chronologicalAge === undefined) {
    return 1;
  }

  const gap = biologicalAge - chronologicalAge;

  if (gap >= 8) return 3;
  if (gap >= 3) return 2;
  if (gap <= -2) return 0;
  return 1;
};

export const buildBiologicalAgeProjection = (
  biologicalAge: number,
  chronologicalAge?: number | null
): BiologicalAgeProjection => {
  const currentAge = roundAge(biologicalAge);
  const expectedImprovement = getExpectedImprovement90(biologicalAge, chronologicalAge);
  const projectedAge = currentAge - expectedImprovement;

  const points = [0, 30, 60, 90].map((day) => {
    const progress = day / 90;
    const expected = currentAge - expectedImprovement * progress;
    const chronological =
      chronologicalAge === null || chronologicalAge === undefined
        ? undefined
        : chronologicalAge + day / 365;

    return {
      day,
      label: String(day),
      expected,
      upper: expected + 1,
      lower: expected - 1,
      chronological,
    };
  });

  return {
    currentAge,
    projectedAge,
    expectedImprovement,
    points,
  };
};
