import { getTimeContext } from '@/utils/timeContext';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export const TimeBasedGreeting = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const context = getTimeContext();
  
  return (
    <div className="mb-8">
      <div className={`bg-gradient-to-r ${context.color} p-8 rounded-2xl text-white shadow-lg`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{context.emoji}</span>
          <h1 className="text-3xl font-bold">
            {t(context.greetingKey)}
            {user?.email && `, ${user.email.split('@')[0]}`}!
          </h1>
        </div>
        <p className="text-white/90 text-lg">{t(context.messageKey)}</p>
      </div>
    </div>
  );
};
