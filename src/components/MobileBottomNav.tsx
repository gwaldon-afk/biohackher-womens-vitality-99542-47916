import { Link, useLocation } from "react-router-dom";
import { Home, LineChart, Sparkles, User, Utensils } from "lucide-react";
import { getRouteMeta, type TabKey } from "@/navigation/routeMeta";

export const MobileBottomNav = () => {
  const location = useLocation();
  const meta = getRouteMeta(location);

  // Only show on AppShell routes (Shell also guards this, but keep it safe).
  if (meta.shell !== "app") return null;

  const navItems: Array<{ key: TabKey; path: string; icon: any; label: string }> = [
    { key: "today", path: "/today", icon: Home, label: "Today" },
    { key: "toolkit", path: "/biohacking-toolkit", icon: Sparkles, label: "Toolkit" },
    { key: "nutrition", path: "/nutrition", icon: Utensils, label: "Nutrition" },
    { key: "progress", path: "/progress", icon: LineChart, label: "Progress" },
    { key: "profile", path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (key: TabKey) => meta.tabKey === key;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-50">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map(({ key, path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive(key) ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive(key) ? "scale-110" : ""} transition-transform`} />
            <span className={`text-xs ${isActive(key) ? "font-semibold" : ""}`}>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
