/**
 * Demo Wearable Data Generator
 * Generates realistic wearable data patterns for UX validation
 */

interface DemoWearableData {
  date: string;
  device_type: string;
  total_sleep_hours: number;
  rem_sleep_percentage: number;
  heart_rate_variability: number;
  resting_heart_rate: number;
  active_minutes: number;
  steps: number;
  exercise_intensity_zones: {
    light: number;
    moderate: number;
    vigorous: number;
  };
}

/**
 * Generates a random number with natural variation around a base value
 */
const varyValue = (base: number, variance: number): number => {
  return base + (Math.random() - 0.5) * 2 * variance;
};

/**
 * Generates a single day of realistic wearable data
 */
export const generateDemoDataForDay = (date: Date, dayIndex: number): DemoWearableData => {
  // Add weekly patterns (weekends tend to have different patterns)
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Sleep patterns: slightly more on weekends
  const baseSleep = isWeekend ? 7.8 : 7.2;
  const totalSleep = Math.max(5.5, Math.min(9.5, varyValue(baseSleep, 1.2)));
  
  // REM percentage: typically 20-25%
  const remPercentage = Math.max(15, Math.min(30, varyValue(22, 5)));
  
  // HRV: varies with recovery, higher = better
  const baseHrv = 55;
  const hrv = Math.max(30, Math.min(85, varyValue(baseHrv, 15)));
  
  // Resting heart rate: lower is generally better
  const baseRhr = 62;
  const rhr = Math.max(48, Math.min(78, varyValue(baseRhr, 8)));
  
  // Activity: more on weekdays typically, but varied
  const baseActiveMinutes = isWeekend ? 45 : 35;
  const activeMinutes = Math.max(10, Math.min(120, Math.floor(varyValue(baseActiveMinutes, 25))));
  
  // Steps: realistic daily range
  const baseSteps = isWeekend ? 8500 : 7200;
  const steps = Math.max(3000, Math.min(18000, Math.floor(varyValue(baseSteps, 3500))));
  
  // Exercise intensity zones
  const lightMinutes = Math.floor(activeMinutes * 0.5);
  const moderateMinutes = Math.floor(activeMinutes * 0.35);
  const vigorousMinutes = Math.floor(activeMinutes * 0.15);

  return {
    date: date.toISOString().split('T')[0],
    device_type: 'demo',
    total_sleep_hours: Math.round(totalSleep * 10) / 10,
    rem_sleep_percentage: Math.round(remPercentage * 10) / 10,
    heart_rate_variability: Math.round(hrv),
    resting_heart_rate: Math.round(rhr),
    active_minutes: activeMinutes,
    steps,
    exercise_intensity_zones: {
      light: lightMinutes,
      moderate: moderateMinutes,
      vigorous: vigorousMinutes
    }
  };
};

/**
 * Generates historical demo data for a specified number of days
 */
export const generateDemoHistoricalData = (days: number = 14): DemoWearableData[] => {
  const data: DemoWearableData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push(generateDemoDataForDay(date, i));
  }
  
  return data;
};

/**
 * Generates data for today with improved values (simulating progress)
 */
export const generateDemoTodayData = (): DemoWearableData => {
  const today = new Date();
  const data = generateDemoDataForDay(today, 0);
  
  // Slightly boost today's values to show "improvement"
  data.heart_rate_variability = Math.min(85, data.heart_rate_variability + 5);
  data.total_sleep_hours = Math.min(9, data.total_sleep_hours + 0.3);
  
  return data;
};
