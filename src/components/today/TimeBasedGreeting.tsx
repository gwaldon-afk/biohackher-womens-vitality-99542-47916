import { getTimeContext } from '@/utils/timeContext';
import { useAuth } from '@/hooks/useAuth';

export const TimeBasedGreeting = () => {
  const { user } = useAuth();
  const context = getTimeContext();
  
  return (
    <div className="mb-8">
      <div className={`bg-gradient-to-r ${context.color} p-8 rounded-2xl text-white shadow-lg`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{context.emoji}</span>
          <h1 className="text-3xl font-bold">
            {context.greeting}
            {user?.email && `, ${user.email.split('@')[0]}`}!
          </h1>
        </div>
        <p className="text-white/90 text-lg">{context.message}</p>
      </div>
    </div>
  );
};
