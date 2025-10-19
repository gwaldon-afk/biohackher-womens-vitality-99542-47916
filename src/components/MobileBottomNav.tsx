import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Lightbulb, User } from 'lucide-react';

export const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/today', icon: Home, label: 'Today' },
    { path: '/progress', icon: TrendingUp, label: 'Progress' },
    { path: '/goals/insights', icon: Lightbulb, label: 'Insights' },
    { path: '/settings', icon: User, label: 'Profile' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-50">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive(path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive(path) ? 'scale-110' : ''} transition-transform`} />
            <span className={`text-xs ${isActive(path) ? 'font-semibold' : ''}`}>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
