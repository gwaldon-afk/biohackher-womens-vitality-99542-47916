export type TrajectoryPoint = {
  day: number;
  label: string;
  expected: number;
  upper: number;
  lower: number;
  chronological?: number;
};

export type BiologicalAgeProjection = {
  currentAge: number;
  projectedAge: number;
  expectedImprovement: number;
  points: TrajectoryPoint[];
};
