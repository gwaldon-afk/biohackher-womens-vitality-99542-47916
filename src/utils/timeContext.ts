// Time context detection utilities

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeContext {
  period: TimeOfDay;
  greeting: string;
  emoji: string;
  color: string;
  message: string;
}

export const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

export const getTimeContext = (): TimeContext => {
  const period = getTimeOfDay();
  
  const contexts: Record<TimeOfDay, TimeContext> = {
    morning: {
      period: 'morning',
      greeting: 'Good morning',
      emoji: '☀️',
      color: 'from-orange-400 to-yellow-400',
      message: 'Start your day with intention'
    },
    afternoon: {
      period: 'afternoon',
      greeting: 'Good afternoon',
      emoji: '🌤️',
      color: 'from-blue-400 to-cyan-400',
      message: 'Keep your energy flowing'
    },
    evening: {
      period: 'evening',
      greeting: 'Good evening',
      emoji: '🌅',
      color: 'from-purple-400 to-pink-400',
      message: 'Wind down and reflect'
    },
    night: {
      period: 'night',
      greeting: 'Good night',
      emoji: '🌙',
      color: 'from-indigo-500 to-purple-600',
      message: 'Rest and restore'
    }
  };
  
  return contexts[period];
};

export const matchesTimeOfDay = (itemTimeSlots: string[] | null): boolean => {
  if (!itemTimeSlots || itemTimeSlots.length === 0) return true;
  
  const currentPeriod = getTimeOfDay();
  
  // Map time slots to periods
  const periodMap: Record<string, TimeOfDay[]> = {
    'morning': ['morning'],
    'afternoon': ['afternoon'],
    'evening': ['evening'],
    'night': ['night'],
    'any': ['morning', 'afternoon', 'evening', 'night']
  };
  
  return itemTimeSlots.some(slot => {
    const periods = periodMap[slot.toLowerCase()] || [];
    return periods.includes(currentPeriod);
  });
};
