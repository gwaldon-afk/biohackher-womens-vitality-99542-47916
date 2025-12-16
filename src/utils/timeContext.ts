// Time context detection utilities

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeContext {
  period: TimeOfDay;
  greetingKey: string;
  emoji: string;
  color: string;
  messageKey: string;
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
      greetingKey: 'today.greeting.morning',
      emoji: '☀️',
      color: 'from-orange-400 to-yellow-400',
      messageKey: 'today.greeting.messageMorning'
    },
    afternoon: {
      period: 'afternoon',
      greetingKey: 'today.greeting.afternoon',
      emoji: '🌤️',
      color: 'from-blue-400 to-cyan-400',
      messageKey: 'today.greeting.messageAfternoon'
    },
    evening: {
      period: 'evening',
      greetingKey: 'today.greeting.evening',
      emoji: '🌅',
      color: 'from-purple-400 to-pink-400',
      messageKey: 'today.greeting.messageEvening'
    },
    night: {
      period: 'night',
      greetingKey: 'today.greeting.night',
      emoji: '🌙',
      color: 'from-indigo-500 to-purple-600',
      messageKey: 'today.greeting.messageNight'
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

export const getCurrentTimePeriod = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  return getTimeOfDay();
};

export const isPastDue = (itemTimeSlot: string): boolean => {
  const currentPeriod = getTimeOfDay();
  const periodOrder = ['morning', 'afternoon', 'evening', 'night'];
  const currentIndex = periodOrder.indexOf(currentPeriod);
  const itemIndex = periodOrder.indexOf(itemTimeSlot);
  
  return itemIndex < currentIndex && itemIndex !== -1;
};
