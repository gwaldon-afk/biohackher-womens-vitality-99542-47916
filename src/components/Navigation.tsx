import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Activity, User, Settings, Crown, ChevronDown, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShoppingCartIcon } from "@/components/ShoppingCart";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const mainNavItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "My Data" },
    { href: "/symptoms", label: "Symptom Assessment" },
  ];

  const biohackingItems = [
    { href: "/therapies", label: "Therapies" },
    { href: "/sleep", label: "Sleep" },
    { href: "/nutrition", label: "Nutrition" },
    { href: "/coaching", label: "Coaching" },
    { href: "/supplements", label: "Supplements" },
  ];

  const isActive = (href: string) => location.pathname === href;
  const isBiohackingActive = () => biohackingItems.some(item => isActive(item.href));

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
          <div className="hidden md:flex items-center space-x-4">
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
                ) : (
                  item.label
                )}
              </Link>
            ))}
            
            {/* Biohacking Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 whitespace-nowrap",
                isBiohackingActive()
                  ? "text-primary"
                  : "text-muted-foreground"
              )}>
                <div className="text-center leading-tight">
                  <div>Biohacking</div>
                  <div>Toolkit</div>
                </div>
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-background border border-border">
                {biohackingItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "w-full cursor-pointer",
                        isActive(item.href) ? "text-primary bg-primary/10" : ""
                      )}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

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
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <ShoppingCartIcon />
            <Link to="/upgrade">
              <Button variant="outline" size="sm" className="text-secondary border-secondary hover:bg-secondary/10">
                <Crown className="h-4 w-4 mr-1" />
                Upgrade
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
          <div className="md:hidden flex items-center space-x-2">
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
          <div className="md:hidden py-4 border-t border-border">
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
                  ) : (
                    item.label
                  )}
                </Link>
              ))}
              
              {/* Biohacking Section in Mobile */}
              <div className="px-2 py-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <div>Biohacking</div>
                  <div>Toolkit</div>
                </p>
                <div className="flex flex-col space-y-2 ml-2">
                  {biohackingItems.map((item) => (
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
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

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