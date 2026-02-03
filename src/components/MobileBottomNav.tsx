import { Link, useLocation } from "react-router-dom";
import { Calendar, Home, User, Utensils } from "lucide-react";
import { getRouteMeta } from "@/navigation/routeMeta";
import { useAuth } from "@/hooks/useAuth";

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const meta = getRouteMeta(location);

  // Only show on AppShell routes (Shell also guards this, but keep it safe).
  if (meta.shell !== "app") return null;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: user ? "/today" : "/plans-preview", icon: Calendar, label: "My Plan" },
    { path: "/nutrition", icon: Utensils, label: "My Nutrition" },
    { path: "/profile", icon: User, label: "My Profile" },
  ];

  const isActive = (path: string) => {
    const pathname = location.pathname;
    if (path === "/profile") return pathname === "/profile" || pathname.startsWith("/profile/");
    if (path === "/nutrition") return pathname === "/nutrition" || pathname.startsWith("/nutrition/");
    return pathname === path;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive(path) ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive(path) ? "scale-110" : ""} transition-transform`} />
            <span className={`text-xs ${isActive(path) ? "font-semibold" : ""}`}>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
