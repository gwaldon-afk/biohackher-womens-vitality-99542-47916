import { 
  Brain, 
  Moon, 
  UtensilsCrossed, 
  Pill, 
  Activity, 
  Heart, 
  Dumbbell,
  Flame,
  Droplets,
  Sun,
  Snowflake,
  Wind,
  Sparkles,
  Apple,
  Coffee,
  Fish,
  Leaf,
  type LucideIcon
} from "lucide-react";

// Map icon name strings to actual Lucide React components
const iconMap: Record<string, LucideIcon> = {
  'Brain': Brain,
  'Moon': Moon,
  'UtensilsCrossed': UtensilsCrossed,
  'Pill': Pill,
  'Activity': Activity,
  'Heart': Heart,
  'Dumbbell': Dumbbell,
  'Flame': Flame,
  'Droplets': Droplets,
  'Sun': Sun,
  'Snowflake': Snowflake,
  'Wind': Wind,
  'Sparkles': Sparkles,
  'Apple': Apple,
  'Coffee': Coffee,
  'Fish': Fish,
  'Leaf': Leaf,
};

// Get icon component from string name, with fallback
export const getIconComponent = (iconName?: string): LucideIcon => {
  if (!iconName) return Sparkles;
  
  const IconComponent = iconMap[iconName];
  return IconComponent || Sparkles;
};

// Category display names
export const categoryLabels: Record<string, string> = {
  'therapy': 'Therapy',
  'exercise': 'Exercise',
  'nutrition': 'Nutrition',
  'supplement': 'Supplement',
  'sleep': 'Sleep',
  'complete': 'Complete Program',
  'habit': 'Habit',
  'biohacking': 'Biohacking',
  'movement': 'Movement',
  'recovery': 'Recovery',
};

// Get category display name
export const getCategoryLabel = (category?: string): string => {
  if (!category) return 'Protocol';
  return categoryLabels[category.toLowerCase()] || category;
};
