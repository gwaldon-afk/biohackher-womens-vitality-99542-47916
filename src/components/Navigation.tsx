import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Activity, User, Settings, Crown, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "@/components/ShoppingCart";
import { LocaleSelector } from "@/components/LocaleSelector";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const mainNavItems = [
    { href: "/", label: "Home" },
    { href: "/pillars", label: "Pillars" },
    { href: "/dashboard", label: t('navigation.dashboard') },
    { href: "/symptoms", label: "Symptom Assessment" },
    { href: "/biohacking-toolkit", label: "Biohacking Toolkit" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-xl font-albra font-bold">
                <span className="text-foreground">Biohack</span>
                <span className="text-primary italic">her</span>
                <sup className="text-xs font-normal ml-1">®</sup>
              </span>
              <span className="text-xs text-muted-foreground -mt-1 font-light tracking-wider">LIVE WELL LONGER</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.label === "Symptom Assessment" ? (
                  <div className="text-center leading-tight">
                    <div>Symptom</div>
                    <div>Assessment</div>
                  </div>
                ) : item.label === "Pillars" ? (
                  <div className="text-center leading-tight">
                    <div>BiohackHer</div>
                    <div>Pillars</div>
                  </div>
                ) : item.label === "Biohacking Toolkit" ? (
                  <div className="text-center leading-tight">
                    <div>Biohacking</div>
                    <div>Toolkit</div>
                  </div>
                ) : (
                  item.label
                )}
              </Link>
            ))}

            <Link
              to="/shop"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                isActive("/shop")
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              Shop
            </Link>

            <Link
              to="/faq"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                isActive("/faq")
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              FAQ
            </Link>

            <Link
              to="/reports"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                isActive("/reports")
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              Reports
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <LocaleSelector />
            <ShoppingCartIcon />
            <Link to="/upgrade">
              <Button variant="outline" size="sm" className="text-secondary border-secondary hover:bg-secondary/10">
                <Crown className="h-4 w-4 mr-1" />
                {t('navigation.upgrade')}
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile actions */}
          <div className="lg:hidden flex items-center space-x-2">
            <ShoppingCartIcon />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary px-2 py-1",
                    isActive(item.href)
                      ? "text-primary bg-primary/10 rounded"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label === "Symptom Assessment" ? (
                    <div className="text-center leading-tight">
                      <div>Symptom</div>
                      <div>Assessment</div>
                    </div>
                  ) : item.label === "Pillars" ? (
                    <div className="text-center leading-tight">
                      <div>BiohackHer</div>
                      <div>Pillars</div>
                    </div>
                  ) : item.label === "Biohacking Toolkit" ? (
                    <div className="text-center leading-tight">
                      <div>Biohacking</div>
                      <div>Toolkit</div>
                    </div>
                  ) : (
                    item.label
                  )}
                </Link>
              ))}

              <Link
                to="/shop"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary px-2 py-1",
                  isActive("/shop")
                    ? "text-primary bg-primary/10 rounded"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                Shop
              </Link>

              <Link
                to="/faq"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary px-2 py-1",
                  isActive("/faq")
                    ? "text-primary bg-primary/10 rounded"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>

              <Link
                to="/reports"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary px-2 py-1",
                  isActive("/reports")
                    ? "text-primary bg-primary/10 rounded"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                Reports
              </Link>

              <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-border">
                <Link to="/upgrade" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full text-secondary border-secondary">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </Link>
                <Link to="/settings" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;