import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  FileText, 
  BarChart3, 
  ShoppingBag, 
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Overview', exact: true },
  { path: '/admin/content', icon: FileText, label: 'Content' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/experts', icon: GraduationCap, label: 'Expert Partners' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/admin/shop', icon: ShoppingBag, label: 'Shop' },
  { path: '/admin/product-linking', icon: ShoppingBag, label: 'Product Linking' },
  { path: '/admin/system', icon: Settings, label: 'System' },
];

export const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-destructive/20 bg-destructive/5 flex flex-col">
        <div className="p-6 border-b border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <Settings className="h-4 w-4 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-destructive">Admin Panel</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit Admin Mode
            </Link>
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map(({ path, icon: Icon, label, exact }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(path, exact)
                  ? "bg-destructive text-destructive-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
